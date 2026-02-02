const Anthropic = require('@anthropic-ai/sdk');
const { query } = require('../config/database');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `You are an intelligent email parser for the International Shellfish Restoration Society (ISRS).

Extract structured information with confidence scores. Return ONLY valid JSON with this structure:
{
  "contacts": [{"name": "", "email": "", "phone": "", "organization": "", "title": "", "confidence": 0, "source": "to|cc|body"}],
  "relationships": [{"person1": "", "person2": "", "relationship_type": "", "confidence": 0}],
  "engagement": {"level": "high|medium|low", "types": [], "indicators": [], "confidence": 0},
  "fundraising": {"signals": [], "capacity_indicators": [], "giving_interest": "", "confidence": 0},
  "action_items": [{"item": "", "owner": "", "deadline": "", "priority": "high|medium|low", "confidence": 0}],
  "scheduling": {"dates_mentioned": [], "availability": [], "timezone": "", "preferences": "", "confidence": 0},
  "topics": [{"topic": "", "sentiment": "positive|neutral|negative", "importance": "high|medium|low", "confidence": 0}],
  "stakeholder_profile": {"primary_role": "", "influence_level": "", "expertise_areas": [], "geographic_focus": "", "constituency": "", "confidence": 0},
  "metadata": {"urgency": "high|medium|low", "overall_sentiment": "", "formality": "", "response_needed_by": "", "confidence": 0, "document_versions": []},
  "summary": "",
  "recommended_next_steps": [],
  "flags": []
}

CONTACT EXTRACTION RULES:
1. Extract ALL email addresses from To/CC headers as high-confidence contacts (confidence: 90-95)
   - Parse name from "Name <email>" format in To/CC fields
   - Mark these contacts with source: "to" or "cc"
2. Extract contacts mentioned in email body with medium confidence (confidence: 50-80)
   - Mark these contacts with source: "body"
3. For header contacts, extract organization from email domain if not explicitly stated

DOCUMENT VERSIONING DETECTION:
In metadata.document_versions, identify versioning information from:
- Attachment filenames with "Updated", "Revised", "Final", "Draft", "v1", "v2", etc.
- Date indicators like "(as of Feb 2)", "2026-01-21", "Jan 15 version"
- Structure: [{"filename": "", "version_indicator": "", "date": ""}]

ATTACHMENT ANALYSIS:
When attachments are present, analyze their names and types to:
- Identify key documents (budgets, reports, presentations)
- Extract version/date information
- Note important file types (PDFs, spreadsheets, presentations)

Focus on shellfish restoration, oyster/clam/mussel conservation, habitat restoration, water quality, aquaculture, Indigenous partnerships, coastal ecosystem science, ICSR conference planning, sponsorships, and scientific collaboration.`;

async function parseEmail({ subject, fromEmail, fromName, toEmails, ccEmails, receivedDate, emailBody, attachments = [], context = {} }) {
  const attachmentList = attachments.length > 0
    ? attachments.map(a => `- ${a.filename} (${a.content_type}, ${a.size} bytes)`).join('\n')
    : 'None';

  // Pre-process To/CC contacts to ensure they're always extracted
  const headerContacts = [];

  // Extract from From field
  headerContacts.push({
    name: fromName || fromEmail.split('@')[0],
    email: fromEmail,
    organization: fromEmail.split('@')[1] || '',
    confidence: 95,
    source: 'from'
  });

  // Extract To recipients
  if (toEmails && Array.isArray(toEmails)) {
    toEmails.forEach(email => {
      if (email) {
        headerContacts.push({
          name: email.split('@')[0],
          email: email,
          organization: email.split('@')[1] || '',
          confidence: 90,
          source: 'to'
        });
      }
    });
  }

  // Extract CC recipients
  if (ccEmails && Array.isArray(ccEmails)) {
    ccEmails.forEach(email => {
      if (email) {
        headerContacts.push({
          name: email.split('@')[0],
          email: email,
          organization: email.split('@')[1] || '',
          confidence: 90,
          source: 'cc'
        });
      }
    });
  }

  const userPrompt = `EMAIL METADATA:
Subject: \${subject}
From: \${fromName} <\${fromEmail}>
To: \${toEmails ? toEmails.join(', ') : ''}
CC: \${ccEmails ? ccEmails.join(', ') : ''}
Date: \${receivedDate || new Date().toISOString()}
Attachments:
\${attachmentList}

EMAIL BODY:
\${emailBody}

ORGANIZATIONAL CONTEXT:
Organization: International Shellfish Restoration Society (ISRS)
Focus: Shellfish restoration, oyster/clam/mussel conservation, habitat restoration, aquaculture, ICSR conferences
Known contact: \${context.isKnownContact ? 'Yes' : 'No'}

IMPORTANT: Extract ALL contacts from To/CC headers with high confidence (90+), plus any additional contacts mentioned in the email body.

Parse and return JSON.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found');

    const parsed = JSON.parse(jsonMatch[0]);

    // Merge pre-processed header contacts with AI-extracted contacts
    // Remove duplicates based on email address
    const emailSet = new Set();
    const mergedContacts = [];

    // Add header contacts first (they have priority)
    headerContacts.forEach(contact => {
      if (!emailSet.has(contact.email)) {
        emailSet.add(contact.email);
        mergedContacts.push(contact);
      }
    });

    // Add AI-extracted contacts if not already present
    if (parsed.contacts && Array.isArray(parsed.contacts)) {
      parsed.contacts.forEach(contact => {
        if (contact.email && !emailSet.has(contact.email)) {
          emailSet.add(contact.email);
          mergedContacts.push(contact);
        }
      });
    }

    parsed.contacts = mergedContacts;

    // Calculate overall confidence
    const confidences = [
      parsed.engagement?.confidence || 0,
      parsed.metadata?.confidence || 0,
      ...(parsed.contacts || []).map(c => c.confidence || 0)
    ];
    const overallConfidence = confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 50;

    // Store in database
    const result = await query(`
      INSERT INTO parsed_emails (
        subject, from_email, from_name, to_emails, cc_emails, received_date,
        email_body, attachments, contacts, relationships, engagement, fundraising,
        action_items, scheduling, topics, stakeholder_profile, metadata,
        summary, recommended_next_steps, flags, overall_confidence, review_status
      ) VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16, \$17, \$18, \$19, \$20, \$21, \$22)
      RETURNING id
    `, [
      subject, fromEmail, fromName, toEmails, ccEmails, receivedDate,
      emailBody, JSON.stringify(attachments), JSON.stringify(parsed.contacts), JSON.stringify(parsed.relationships),
      JSON.stringify(parsed.engagement), JSON.stringify(parsed.fundraising),
      JSON.stringify(parsed.action_items), JSON.stringify(parsed.scheduling),
      JSON.stringify(parsed.topics), JSON.stringify(parsed.stakeholder_profile),
      JSON.stringify(parsed.metadata), parsed.summary, parsed.recommended_next_steps,
      parsed.flags, overallConfidence, overallConfidence >= 70 ? 'approved' : 'pending'
    ]);

    const parsedEmailId = result.rows[0].id;

    // Store contacts
    if (parsed.contacts) {
      for (const contact of parsed.contacts) {
        await query(`
          INSERT INTO email_extracted_contacts (parsed_email_id, name, email, phone, organization, title, confidence, needs_review)
          VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8)
        `, [parsedEmailId, contact.name, contact.email, contact.phone, contact.organization, contact.title, contact.confidence, contact.confidence < 70]);
      }
    }

    // Store action items
    if (parsed.action_items) {
      for (const action of parsed.action_items) {
        await query(`
          INSERT INTO email_action_items (parsed_email_id, item, owner, deadline, priority, confidence)
          VALUES (\$1, \$2, \$3, \$4, \$5, \$6)
        `, [parsedEmailId, action.item, action.owner, action.deadline, action.priority, action.confidence]);
      }
    }

    return { success: true, parsedEmailId, parsed, overallConfidence };
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  }
}

async function saveParsedEmail(data) {
  // Extract parsed data
  const {
    subject, from_email, from_name, to_emails, cc_emails, received_date, email_body,
    gmail_message_id, gmail_thread_id, source, email_date, confidence_score,
    attachments, contacts, relationships, engagement, fundraising, action_items, scheduling,
    topics, stakeholder_profile, metadata, summary, recommended_next_steps, flags
  } = data;

  // Save to database
  const result = await query(`
    INSERT INTO parsed_emails (
      subject, from_email, from_name, to_emails, cc_emails, received_date, email_body,
      gmail_message_id, gmail_thread_id, source, email_date, confidence_score,
      attachments, contacts, relationships, engagement, fundraising, action_items, scheduling,
      topics, stakeholder_profile, metadata, summary, recommended_next_steps, flags,
      review_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    RETURNING id
  `, [
    subject, from_email, from_name, to_emails, cc_emails, received_date, email_body,
    gmail_message_id, gmail_thread_id, source, email_date, confidence_score,
    JSON.stringify(attachments || []), JSON.stringify(contacts), JSON.stringify(relationships), JSON.stringify(engagement),
    JSON.stringify(fundraising), JSON.stringify(action_items), JSON.stringify(scheduling),
    JSON.stringify(topics), JSON.stringify(stakeholder_profile), JSON.stringify(metadata),
    summary, recommended_next_steps, flags,
    confidence_score > 0.7 ? 'approved' : 'pending'
  ]);

  return result.rows[0].id;
}

async function getParsedEmails(filters = {}) {
  let queryText = 'SELECT * FROM parsed_emails WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (filters.reviewStatus) {
    queryText += ` AND review_status = \$\${paramCount}`;
    params.push(filters.reviewStatus);
    paramCount++;
  }

  queryText += ' ORDER BY received_date DESC LIMIT 50';
  const result = await query(queryText, params);
  return result.rows;
}

async function importContactsFromEmail(parsedEmailId) {
  const extracted = await query(
    'SELECT * FROM email_extracted_contacts WHERE parsed_email_id = \$1 AND imported_to_contacts = false',
    [parsedEmailId]
  );

  let imported = 0;
  for (const contact of extracted.rows) {
    if (!contact.email || contact.confidence < 70) continue;

    const existing = await query('SELECT id FROM contacts WHERE email = \$1', [contact.email]);
    if (existing.rows.length === 0) {
      await query(`
        INSERT INTO contacts (email, first_name, last_name, organization, title, phone)
        VALUES (\$1, \$2, \$3, \$4, \$5, \$6)
      `, [
        contact.email,
        contact.name ? contact.name.split(' ')[0] : '',
        contact.name ? contact.name.split(' ').slice(1).join(' ') : '',
        contact.organization, contact.title, contact.phone
      ]);
      await query('UPDATE email_extracted_contacts SET imported_to_contacts = true WHERE id = \$1', [contact.id]);
      imported++;
    }
  }

  await query('UPDATE parsed_emails SET contacts_imported = true WHERE id = \$1', [parsedEmailId]);
  return { success: true, imported };
}

async function getAnalytics({ period = '30', status = 'all' }) {
  const daysBack = period === 'all' ? 3650 : parseInt(period);
  const dateFilter = `created_at >= NOW() - INTERVAL '${daysBack} days'`;
  const statusFilter = status === 'all' ? '1=1' : `review_status = '${status}'`;

  // Overview stats
  const overviewResult = await query(`
    SELECT
      COUNT(*) as total_emails,
      AVG(overall_confidence) as avg_confidence,
      SUM(CASE WHEN contacts_imported = true THEN 1 ELSE 0 END) as auto_imported
    FROM parsed_emails
    WHERE \${dateFilter} AND \${statusFilter}
  `);

  const contactsResult = await query(`
    SELECT COUNT(*) as count FROM email_extracted_contacts
    WHERE parsed_email_id IN (
      SELECT id FROM parsed_emails WHERE \${dateFilter} AND \${statusFilter}
    )
  `);

  const actionsResult = await query(`
    SELECT COUNT(*) as count FROM email_action_items
    WHERE parsed_email_id IN (
      SELECT id FROM parsed_emails WHERE \${dateFilter} AND \${statusFilter}
    )
  `);

  const fundraisingResult = await query(`
    SELECT COUNT(*) as count FROM parsed_emails
    WHERE \${dateFilter} AND \${statusFilter}
    AND fundraising IS NOT NULL
    AND fundraising::text != '{}'
  `);

  const overview = overviewResult.rows[0];

  // Volume data (last 30 days)
  const volumeResult = await query(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM parsed_emails
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `);

  const volumeData = {
    labels: volumeResult.rows.map(r => r.date.toISOString().split('T')[0]),
    values: volumeResult.rows.map(r => parseInt(r.count))
  };

  // Confidence distribution
  const confidenceResult = await query(`
    SELECT
      SUM(CASE WHEN overall_confidence >= 70 THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN overall_confidence >= 50 AND overall_confidence < 70 THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN overall_confidence < 50 THEN 1 ELSE 0 END) as low
    FROM parsed_emails
    WHERE \${dateFilter} AND \${statusFilter}
  `);

  // Review status breakdown
  const reviewResult = await query(`
    SELECT
      SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN review_status = 'approved' THEN 1 ELSE 0 END) as approved
    FROM parsed_emails
    WHERE \${dateFilter}
  `);

  // Top contacts
  const topContactsResult = await query(`
    SELECT
      eec.name, eec.email, eec.organization, eec.confidence,
      pe.subject as email_subject, eec.created_at as extracted_date,
      eec.imported_to_contacts as imported
    FROM email_extracted_contacts eec
    JOIN parsed_emails pe ON eec.parsed_email_id = pe.id
    WHERE pe.\${dateFilter.replace('created_at', 'pe.created_at')} AND \${statusFilter.replace('review_status', 'pe.review_status')}
    ORDER BY eec.confidence DESC, eec.created_at DESC
    LIMIT 10
  `);

  // Recent fundraising signals
  const fundraisingSignalsResult = await query(`
    SELECT
      subject as email_subject,
      fundraising::json->>'giving_interest' as signal_type,
      fundraising::json->>'capacity_indicators' as estimated_value,
      overall_confidence as confidence,
      created_at as date,
      review_status as status
    FROM parsed_emails
    WHERE \${dateFilter} AND fundraising IS NOT NULL AND fundraising::text != '{}'
    ORDER BY created_at DESC
    LIMIT 10
  `);

  // Category counts
  const categoriesResult = await query(`
    SELECT
      COUNT(CASE WHEN contacts IS NOT NULL AND contacts::text != '[]' THEN 1 END) as contacts,
      COUNT(CASE WHEN action_items IS NOT NULL AND action_items::text != '[]' THEN 1 END) as actions,
      COUNT(CASE WHEN fundraising IS NOT NULL AND fundraising::text != '{}' THEN 1 END) as fundraising,
      COUNT(CASE WHEN scheduling IS NOT NULL AND scheduling::text != '{}' THEN 1 END) as scheduling
    FROM parsed_emails
    WHERE \${dateFilter} AND \${statusFilter}
  `);

  const categories = categoriesResult.rows[0];

  return {
    overview: {
      totalEmails: parseInt(overview.total_emails) || 0,
      avgConfidence: Math.round(parseFloat(overview.avg_confidence) || 0),
      contactsExtracted: parseInt(contactsResult.rows[0].count) || 0,
      autoImported: parseInt(overview.auto_imported) || 0,
      actionItems: parseInt(actionsResult.rows[0].count) || 0,
      fundraisingSignals: parseInt(fundraisingResult.rows[0].count) || 0
    },
    volumeData,
    confidenceDistribution: {
      high: parseInt(confidenceResult.rows[0].high) || 0,
      medium: parseInt(confidenceResult.rows[0].medium) || 0,
      low: parseInt(confidenceResult.rows[0].low) || 0
    },
    reviewStatus: {
      pending: parseInt(reviewResult.rows[0].pending) || 0,
      approved: parseInt(reviewResult.rows[0].approved) || 0
    },
    categories: {
      labels: ['Contacts', 'Actions', 'Fundraising', 'Scheduling'],
      values: [
        parseInt(categories.contacts) || 0,
        parseInt(categories.actions) || 0,
        parseInt(categories.fundraising) || 0,
        parseInt(categories.scheduling) || 0
      ]
    },
    automation: {
      automated: parseInt(overview.auto_imported) || 0,
      manual: (parseInt(overview.total_emails) || 0) - (parseInt(overview.auto_imported) || 0)
    },
    topContacts: topContactsResult.rows,
    fundraisingSignals: fundraisingSignalsResult.rows.map(r => ({
      emailSubject: r.email_subject,
      signalType: r.signal_type,
      estimatedValue: r.estimated_value,
      confidence: r.confidence,
      date: r.date,
      status: r.status
    }))
  };
}

module.exports = { parseEmail, saveParsedEmail, getParsedEmails, importContactsFromEmail, getAnalytics };
