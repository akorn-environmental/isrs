const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/database');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

async function generateGrantSection({ prospectId, section, customPrompt, context = {} }) {
  const startTime = Date.now();
  
  // Get prospect details
  const prospectResult = await query(`
    SELECT * FROM funding_prospects WHERE id = $1
  `, [prospectId]);
  
  if (prospectResult.rows.length === 0) {
    throw new Error('Funding prospect not found');
  }
  
  const prospect = prospectResult.rows[0];
  
  // Build context-aware prompt
  const systemPrompt = buildSystemPrompt(prospect, section);
  const userPrompt = customPrompt || buildDefaultPrompt(section, prospect, context);
  
  // Generate content with Claude
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: userPrompt
    }]
  });
  
  const generatedContent = message.content[0].text;
  const generationTime = Date.now() - startTime;
  
  // Log generation
  await query(`
    INSERT INTO ai_grant_generations (
      prospect_id, section, context_data, prompt, generated_content,
      model_used, tokens_used, generation_time_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [
    prospectId, section, JSON.stringify(context), userPrompt,
    generatedContent, MODEL, message.usage.input_tokens + message.usage.output_tokens,
    generationTime
  ]);
  
  return {
    content: generatedContent,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    generationTime
  };
}

function buildSystemPrompt(prospect, section) {
  return `You are an expert grant writer for the International Society for Reef Studies (ISRS).

About ISRS:
ISRS is the world's leading scientific society for coral reef researchers and conservation practitioners. Founded in 1980, we advance coral reef science and conservation through our global community, conferences, and publications.

Your task: Write a compelling ${section} section for a grant proposal targeting:
- Organization: ${prospect.organization_name || 'N/A'}
- Funding Type: ${prospect.funding_type || 'General funding'}
- Estimated Amount: ${prospect.estimated_amount ? '$' + prospect.estimated_amount : 'TBD'}
- Focus Areas: ${prospect.funding_focus?.join(', ') || 'Coral reef science'}

Writing guidelines:
- Professional, persuasive tone
- Evidence-based arguments
- Clear connection to funder's priorities
- Emphasize ISRS's unique position and impact
- Use concrete examples and data where appropriate
- Avoid jargon unless appropriate for technical funders`;
}

function buildDefaultPrompt(section, prospect, context) {
  const prompts = {
    executive_summary: `Write a compelling 250-word executive summary for this grant proposal. Highlight:
1. The urgent need for coral reef conservation
2. ISRS's unique qualifications and global reach
3. Specific outcomes this funding will achieve
4. Long-term impact on coral reef science and conservation

Make it compelling and action-oriented.`,
    
    project_description: `Write a detailed project description (500-750 words) that:
1. Clearly states the problem we're addressing
2. Explains our proposed solution and approach
3. Details specific activities and deliverables
4. Demonstrates feasibility and innovation
5. Connects to the funder's mission: ${prospect.notes || 'advancing reef science'}

Include specific examples of ISRS's past successes.`,
    
    methodology: `Describe our methodology (300-500 words) including:
1. Research/project approach
2. Data collection and analysis methods
3. Collaboration with partners
4. Quality assurance processes
5. Timeline and milestones

Be specific and demonstrate scientific rigor.`,
    
    impact_statement: `Write a powerful impact statement (200-300 words) that:
1. Quantifies expected outcomes
2. Describes transformative change
3. Addresses global reef conservation challenges
4. Shows sustainability beyond the grant period
5. Connects to broader reef conservation goals`,
    
    budget_narrative: `Write a budget narrative justifying a request for ${prospect.estimated_amount ? '$' + prospect.estimated_amount : ',000'}:
1. Major budget categories and allocations
2. Justification for each expense
3. Cost-effectiveness demonstration
4. Leveraging of existing resources
5. Value proposition for the funder`,
    
    organizational_background: `Describe ISRS's organizational background and qualifications (300-400 words):
1. 40+ year history since 1980
2. Global membership of scientists and practitioners
3. Major achievements (ICRS conferences, Journal of Coral Reef Studies)
4. Governance structure and financial stability
5. Track record with similar projects
6. Past funding from ${prospect.organization_name} if applicable: ${prospect.has_funded_icsr ? 'Yes, previously funded' : 'No previous funding'}`
  };
  
  return prompts[section] || `Generate content for the ${section} section of this grant proposal.`;
}

async function createGrantDraft({
  prospectId, title, grantType, fundingAmount, deadline, sections = {}, createdBy
}) {
  const result = await query(`
    INSERT INTO grant_drafts (
      prospect_id, title, grant_type, funding_amount, deadline,
      executive_summary, project_description, methodology, impact_statement,
      budget_narrative, organizational_background, created_by, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
    RETURNING *
  `, [
    prospectId, title, grantType, fundingAmount, deadline,
    sections.executive_summary || null,
    sections.project_description || null,
    sections.methodology || null,
    sections.impact_statement || null,
    sections.budget_narrative || null,
    sections.organizational_background || null,
    createdBy
  ]);
  
  return result.rows[0];
}

async function updateGrantDraft(draftId, updates, editedBy) {
  const setClauses = [];
  const values = [];
  let paramCount = 1;
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (setClauses.length === 0) return null;
  
  values.push(editedBy, draftId);
  
  const result = await query(`
    UPDATE grant_drafts
    SET ${setClauses.join(', ')}, last_edited_by = $${paramCount}, updated_at = NOW()
    WHERE id = $${paramCount + 1}
    RETURNING *
  `, values);
  
  return result.rows[0];
}

async function getGrantDrafts(prospectId) {
  const result = await query(`
    SELECT gd.*, fp.organization_name, fp.funding_type, fp.estimated_amount
    FROM grant_drafts gd
    LEFT JOIN funding_prospects fp ON gd.prospect_id = fp.id
    WHERE gd.prospect_id = $1
    ORDER BY gd.version DESC, gd.created_at DESC
  `, [prospectId]);
  
  return result.rows;
}

async function rateGeneration(generationId, rating, feedback, accepted) {
  await query(`
    UPDATE ai_grant_generations
    SET user_rating = $2, user_feedback = $3, accepted = $4
    WHERE id = $1
  `, [generationId, rating, feedback, accepted]);
}

module.exports = {
  generateGrantSection,
  createGrantDraft,
  updateGrantDraft,
  getGrantDrafts,
  rateGeneration
};
