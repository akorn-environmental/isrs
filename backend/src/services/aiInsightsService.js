const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/database');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

async function generateFundingInsights() {
  const prospectsResult = await query(`
    SELECT fp.*, COUNT(fa.id) as activity_count,
    MAX(fa.created_at) as last_activity
    FROM funding_prospects fp
    LEFT JOIN funding_activities fa ON fp.id = fa.prospect_id
    WHERE fp.status != 'declined'
    GROUP BY fp.id
    ORDER BY fp.priority DESC, fp.estimated_amount DESC NULLS LAST
    LIMIT 20
  `);
  
  const prospects = prospectsResult.rows;
  
  const prompt = `Analyze this funding pipeline data and provide insights:

${JSON.stringify(prospects, null, 2)}

Provide:
1. Top 3 highest-priority opportunities with specific next steps
2. Prospects that need immediate attention (no recent activity, approaching deadlines)
3. Pipeline health assessment
4. Recommended focus areas
5. Risk factors to watch

Format as actionable insights.`;
  
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const insights = message.content[0].text;
  
  // Parse and store insights
  await query(`
    INSERT INTO ai_insights (
      insight_type, category, title, description,
      model_used, data_points
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    'funding_pipeline',
    'funding',
    'Funding Pipeline Analysis',
    insights,
    MODEL,
    JSON.stringify({ prospectCount: prospects.length })
  ]);
  
  return insights;
}

async function assessDataQuality(tableName, sampleSize = 100) {
  const result = await query(`
    SELECT * FROM ${tableName} ORDER BY RANDOM() LIMIT $1
  `, [sampleSize]);
  
  const records = result.rows;
  
  const prompt = `Assess the data quality of this sample from the ${tableName} table:

${JSON.stringify(records.slice(0, 10), null, 2)}

Analyze:
1. Completeness: What fields are frequently empty?
2. Consistency: Are there formatting issues?
3. Accuracy indicators: Any suspicious patterns?
4. Enrichment opportunities: What additional data would be valuable?

Provide scores (0-1) and specific recommendations.`;
  
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const assessment = message.content[0].text;
  
  await query(`
    INSERT INTO ai_data_quality (
      table_name, completeness_score, accuracy_score,
      consistency_score, overall_score, suggestions
    ) VALUES ($1, 0.8, 0.85, 0.9, 0.85, $2)
  `, [tableName, JSON.stringify({ assessment })]);
  
  return assessment;
}

async function generateTrendAnalysis(analysisType, timeframe = '6 months') {
  let data;
  
  switch (analysisType) {
    case 'membership_growth':
      const memberResult = await query(`
        SELECT DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
        FROM contacts
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month
      `);
      data = memberResult.rows;
      break;
      
    case 'funding_success':
      const fundingResult = await query(`
        SELECT pipeline_stage, COUNT(*) as count, SUM(estimated_amount) as total_amount
        FROM funding_prospects
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY pipeline_stage
      `);
      data = fundingResult.rows;
      break;
      
    default:
      throw new Error('Unknown analysis type');
  }
  
  const prompt = `Analyze this trend data for ${analysisType}:

${JSON.stringify(data, null, 2)}

Provide:
1. Trend direction and strength
2. Key patterns and anomalies
3. Predictions for next 3-6 months
4. Actionable recommendations
5. Risk factors

Be specific and data-driven.`;
  
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const analysis = message.content[0].text;
  
  await query(`
    INSERT INTO ai_trend_analysis (
      analysis_type, time_period, summary, key_metrics, model_used
    ) VALUES ($1, $2, $3, $4, $5)
  `, [analysisType, timeframe, analysis, JSON.stringify(data), MODEL]);
  
  return { analysis, data };
}

async function suggestActions() {
  // Get overdue follow-ups
  const overdueResult = await query(`
    SELECT * FROM funding_prospects
    WHERE next_follow_up_date < NOW() AND status NOT IN ('funded', 'declined')
    ORDER BY priority DESC, next_follow_up_date ASC
    LIMIT 10
  `);
  
  const overdueProspects = overdueResult.rows;
  
  for (const prospect of overdueProspects) {
    await query(`
      INSERT INTO ai_suggested_actions (
        action_type, related_to, related_id, title, description,
        priority, urgency, suggested_by_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '3 days')
    `, [
      'follow_up',
      'funding_prospect',
      prospect.id,
      `Follow up with ${prospect.organization_name}`,
      `This prospect has not been contacted since ${prospect.last_contact_date}. Priority: ${prospect.priority}`,
      prospect.priority,
      'high'
    ]);
  }
  
  return { actionsCreated: overdueProspects.length };
}

async function getActiveInsights(category = null, limit = 10) {
  let queryText = `
    SELECT * FROM ai_insights
    WHERE status = 'active'
  `;
  const params = [];
  
  if (category) {
    queryText += ' AND category = $1';
    params.push(category);
  }
  
  queryText += ` ORDER BY priority DESC, created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);
  
  const result = await query(queryText, params);
  return result.rows;
}

async function getSuggestedActions(status = 'suggested', limit = 10) {
  const result = await query(`
    SELECT * FROM ai_suggested_actions
    WHERE status = $1
    ORDER BY priority DESC, created_at DESC
    LIMIT $2
  `, [status, limit]);

  return result.rows;
}

async function queryDatabase(userQuery) {
  // Get database context
  const context = await gatherDatabaseContext();

  // Build system prompt
  const systemPrompt = buildAssistantSystemPrompt(context);

  // Query Claude
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `User query: ${userQuery}

Please analyze the data and provide a helpful response in JSON format:
{
  "type": "data-list" | "metrics" | "data-summary" | "analysis" | "info",
  "title": "Response title",
  "content": "Main summary",
  "items": [...] (optional),
  "metrics": {...} (optional),
  "insight": "Key recommendation" (optional)
}`
    }]
  });

  // Parse response
  let response;
  try {
    const text = message.content[0].text;
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      response = JSON.parse(jsonMatch[0]);
    } else {
      response = { type: 'info', title: 'Results', content: text };
    }
  } catch (e) {
    response = { type: 'info', title: 'Results', content: message.content[0].text };
  }

  return response;
}

async function gatherDatabaseContext() {
  const context = {};

  try {
    const contactStats = await query(`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE email IS NOT NULL) as with_email,
      COUNT(DISTINCT organization) as orgs, COUNT(DISTINCT country) as countries FROM contacts
    `);
    context.contacts = contactStats.rows[0];

    const fundingStats = await query(`
      SELECT COUNT(*) as total, SUM(estimated_amount) FILTER (WHERE status = 'funded') as funded_total
      FROM funding_prospects
    `);
    context.funding = fundingStats.rows[0];

    const emailStats = await query(`
      SELECT COUNT(*) as total, AVG(opened_count * 100.0 / NULLIF(sent_count, 0)) as avg_open_rate
      FROM email_campaigns WHERE status = 'sent'
    `);
    context.emails = emailStats.rows[0];
  } catch (error) {
    console.error('Context error:', error);
  }

  return context;
}

function buildAssistantSystemPrompt(context) {
  return `You are an AI assistant for ISRS database management.

Database Stats:
- Contacts: ${context.contacts?.total || 0} (${context.contacts?.with_email || 0} with email)
- Organizations: ${context.contacts?.orgs || 0}
- Funding Prospects: ${context.funding?.total || 0}
- Email Campaigns: ${context.emails?.total || 0} (Avg open rate: ${Math.round(context.emails?.avg_open_rate || 0)}%)

Provide data-driven insights, trends, and actionable recommendations for ISRS administrators.`;
}

module.exports = {
  generateFundingInsights,
  assessDataQuality,
  generateTrendAnalysis,
  suggestActions,
  getActiveInsights,
  getSuggestedActions,
  queryDatabase
};
