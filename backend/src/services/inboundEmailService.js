/**
 * Inbound Email Service
 * Parses emails received via AWS SES and CC workflow
 */

const { simpleParser } = require('mailparser');
const emailParsingService = require('./emailParsingService');
const emailService = require('./emailService');
const { query } = require('../config/database');

/**
 * Parse inbound email from raw MIME content
 * @param {string} rawEmail - Raw MIME email content
 * @returns {Promise<Object>} Parsed email result
 */
async function parseInboundEmail(rawEmail) {
  try {
    console.log('[Inbound Email] Parsing raw MIME email...');

    // Parse MIME format using mailparser
    const parsed = await simpleParser(rawEmail);

    // Extract email data
    const emailData = {
      subject: parsed.subject || '(No Subject)',
      fromEmail: parsed.from?.value?.[0]?.address || 'unknown@example.com',
      fromName: parsed.from?.value?.[0]?.name || parsed.from?.value?.[0]?.address || 'Unknown',
      toEmails: parsed.to?.value?.map(t => t.address) || [],
      ccEmails: parsed.cc?.value?.map(c => c.address) || [],
      receivedDate: parsed.date || new Date(),
      emailBody: parsed.text || parsed.html || '',
      messageId: parsed.messageId,
      attachments: []
    };

    // Process attachments
    if (parsed.attachments && parsed.attachments.length > 0) {
      emailData.attachments = parsed.attachments.map(att => ({
        filename: att.filename || 'unnamed',
        content_type: att.contentType || 'application/octet-stream',
        size: att.size || 0,
        attachment_id: att.contentId || att.checksum || `att_${Date.now()}`,
        gmail_attachment_id: null // N/A for SES emails
        // Note: Not storing content to save database space
        // Content is available in S3 if needed
      }));

      console.log(`[Inbound Email] Found ${emailData.attachments.length} attachments`);
    }

    // Remove admin@shellfish-society.org from contacts to avoid self-reference
    emailData.toEmails = emailData.toEmails.filter(email =>
      !email.includes('admin@shellfish-society.org')
    );
    emailData.ccEmails = emailData.ccEmails.filter(email =>
      !email.includes('admin@shellfish-society.org')
    );

    console.log(`[Inbound Email] Extracted: From=${emailData.fromName}, To=${emailData.toEmails.length}, CC=${emailData.ccEmails.length}`);

    // Use existing AI parsing service
    const result = await emailParsingService.parseEmail({
      ...emailData,
      context: {
        isKnownContact: false,
        source: 'ses_inbound' // Mark as coming from CC workflow
      }
    });

    console.log(`[Inbound Email] AI parsing complete (confidence: ${result.overallConfidence}%)`);

    // Store additional metadata
    await query(
      `UPDATE parsed_emails
       SET metadata = jsonb_set(
         COALESCE(metadata, '{}'::jsonb),
         '{source}',
         '"ses_inbound"'
       ),
       metadata = jsonb_set(
         metadata,
         '{message_id}',
         $2
       )
       WHERE id = $1`,
      [result.parsedEmailId, JSON.stringify(emailData.messageId)]
    );

    // Check confidence and forward if low
    if (result.overallConfidence < 70) {
      console.log(`[Inbound Email] Low confidence (${result.overallConfidence}%), forwarding for review`);
      await forwardToHumanReview(emailData, result);
    }

    return {
      success: true,
      parsedEmailId: result.parsedEmailId,
      confidence: result.overallConfidence,
      requiresReview: result.overallConfidence < 70,
      contacts: result.parsed.contacts?.length || 0,
      attachments: emailData.attachments.length,
      actionItems: result.parsed.action_items?.length || 0
    };

  } catch (error) {
    console.error('[Inbound Email] Parse error:', error);
    throw error;
  }
}

/**
 * Forward low-confidence emails to admin for human review
 * @param {Object} emailData - Extracted email data
 * @param {Object} parseResult - AI parsing result
 */
async function forwardToHumanReview(emailData, parseResult) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'aaron@shellfish-society.org';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 5px; }
          .stat { display: inline-block; margin: 10px 20px 10px 0; }
          .label { font-weight: bold; color: #2c3e50; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { background: #3498db; color: white; padding: 12px 24px; text-decoration: none;
                    border-radius: 5px; display: inline-block; margin: 20px 0; }
          .email-preview { background: white; border: 1px solid #ddd; padding: 15px;
                           border-radius: 5px; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>⚠️ Email Parsing Review Required</h2>
          <p>Low confidence parsing detected - Please review</p>
        </div>

        <div class="warning">
          <strong>Confidence Score: ${parseResult.overallConfidence}%</strong>
          <br>
          This email was automatically parsed but has low confidence.
          Please review the extracted data and approve or correct as needed.
        </div>

        <div class="content">
          <h3>Email Details</h3>
          <div class="stat"><span class="label">From:</span> ${emailData.fromName} &lt;${emailData.fromEmail}&gt;</div><br>
          <div class="stat"><span class="label">To:</span> ${emailData.toEmails.slice(0, 5).join(', ')}${emailData.toEmails.length > 5 ? '...' : ''}</div><br>
          <div class="stat"><span class="label">Subject:</span> ${emailData.subject}</div><br>
          <div class="stat"><span class="label">Date:</span> ${emailData.receivedDate.toLocaleString()}</div>
        </div>

        <div class="content">
          <h3>Extracted Data</h3>
          <div class="stat"><span class="label">Contacts:</span> ${parseResult.parsed.contacts?.length || 0}</div>
          <div class="stat"><span class="label">Attachments:</span> ${emailData.attachments?.length || 0}</div>
          <div class="stat"><span class="label">Action Items:</span> ${parseResult.parsed.action_items?.length || 0}</div>
          <div class="stat"><span class="label">Topics:</span> ${parseResult.parsed.topics?.length || 0}</div>
        </div>

        ${parseResult.parsed.contacts && parseResult.parsed.contacts.length > 0 ? `
        <div class="content">
          <h3>Contacts Extracted</h3>
          <ul>
            ${parseResult.parsed.contacts.slice(0, 10).map(c => `
              <li>${c.name || 'N/A'} &lt;${c.email}&gt; - ${c.organization || 'N/A'} (${c.confidence}% confidence)</li>
            `).join('')}
            ${parseResult.parsed.contacts.length > 10 ? `<li><em>... and ${parseResult.parsed.contacts.length - 10} more</em></li>` : ''}
          </ul>
        </div>
        ` : ''}

        ${parseResult.parsed.action_items && parseResult.parsed.action_items.length > 0 ? `
        <div class="content">
          <h3>Action Items</h3>
          <ul>
            ${parseResult.parsed.action_items.map(a => `
              <li><strong>${a.item}</strong> - Owner: ${a.owner || 'Unassigned'}, Deadline: ${a.deadline || 'None'}</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="content">
          <a href="${process.env.FRONTEND_URL || 'https://your-crm.com'}/parsed-emails/${parseResult.parsedEmailId}" class="button">
            Review in CRM Dashboard →
          </a>
        </div>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">

        <div class="content">
          <h3>Original Email Content</h3>
          <div class="email-preview">${emailData.emailBody.substring(0, 2000)}${emailData.emailBody.length > 2000 ? '\n\n[Email truncated - view full email in CRM]' : ''}</div>
        </div>

        <p style="color: #777; font-size: 12px; margin-top: 40px;">
          This email was automatically generated by the ISRS Email Parsing System.
          <br>
          Email ID: ${parseResult.parsedEmailId} | Confidence: ${parseResult.overallConfidence}%
        </p>
      </body>
      </html>
    `;

    await emailService.sendEmail({
      to: adminEmail,
      subject: `[Review] Low Confidence Parse: ${emailData.subject}`,
      html: html
    });

    console.log(`[Inbound Email] Review email sent to ${adminEmail}`);

  } catch (error) {
    console.error('[Inbound Email] Error sending review email:', error);
    // Don't throw - review email is not critical
  }
}

/**
 * Get parsing statistics for dashboard
 * @returns {Promise<Object>} Statistics
 */
async function getInboundStats() {
  const result = await query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE overall_confidence >= 70) as high_confidence,
      COUNT(*) FILTER (WHERE overall_confidence < 70) as low_confidence,
      AVG(overall_confidence) as avg_confidence
    FROM parsed_emails
    WHERE metadata->>'source' = 'ses_inbound'
    AND created_at >= NOW() - INTERVAL '30 days'
  `);

  return result.rows[0];
}

module.exports = {
  parseInboundEmail,
  forwardToHumanReview,
  getInboundStats
};
