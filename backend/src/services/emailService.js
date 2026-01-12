const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { query } = require('../config/database');

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function sendCampaignEmails(campaign, recipients) {
  const results = { sent: 0, failed: 0, errors: [] };
  const batchSize = 50;
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (recipient) => {
      try {
        const personalizedBody = personalizeContent(campaign.body, recipient);
        const personalizedSubject = personalizeContent(campaign.subject, recipient);
        
        await sendEmail({
          to: recipient.email,
          subject: personalizedSubject,
          body: personalizedBody,
          campaignId: campaign.id,
          recipientId: recipient.id
        });
        
        await query(`
          UPDATE campaign_recipients
          SET status = 'sent', sent_at = NOW()
          WHERE campaign_id = $1 AND contact_id = $2
        `, [campaign.id, recipient.id]);
        
        results.sent++;
      } catch (error) {
        console.error(`Failed to send to ${recipient.email}:`, error);
        results.failed++;
        results.errors.push({ email: recipient.email, error: error.message });
        
        await query(`
          UPDATE campaign_recipients
          SET status = 'failed', error_message = $3
          WHERE campaign_id = $1 AND contact_id = $2
        `, [campaign.id, recipient.id, error.message]);
      }
    }));
    
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  await query(`
    UPDATE email_campaigns
    SET sent_count = $2, updated_at = NOW()
    WHERE id = $1
  `, [campaign.id, results.sent]);
  
  return results;
}

async function sendEmail({ to, subject, body, campaignId, recipientId }) {
  const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@isrs.org';
  const fromName = process.env.SES_FROM_NAME || 'ISRS';
  
  if (process.env.NODE_ENV !== 'production' || !process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body preview: ${body.substring(0, 100)}...`);
    return { MessageId: 'mock-' + Date.now() };
  }
  
  const params = {
    Source: `${fromName} <${fromEmail}>`,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: wrapEmailTemplate(body), Charset: 'UTF-8' },
        Text: { Data: stripHtml(body), Charset: 'UTF-8' }
      }
    },
    ConfigurationSetName: process.env.SES_CONFIGURATION_SET
  };
  
  const command = new SendEmailCommand(params);
  const result = await sesClient.send(command);
  
  if (campaignId) {
    await query(`
      INSERT INTO email_logs (campaign_id, recipient_id, recipient_email, message_id, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [campaignId, recipientId, to, result.MessageId]);
  }
  
  return result;
}

function personalizeContent(content, recipient) {
  let personalized = content;
  const variables = {
    '{{firstName}}': recipient.first_name || '',
    '{{lastName}}': recipient.last_name || '',
    '{{fullName}}': `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
    '{{email}}': recipient.email || '',
    '{{organization}}': recipient.organization || '',
    '{{title}}': recipient.title || '',
    '{{country}}': recipient.country || ''
  };
  Object.entries(variables).forEach(([key, value]) => {
    personalized = personalized.replace(new RegExp(key, 'g'), value);
  });
  return personalized;
}

function wrapEmailTemplate(body) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'PT Serif', Georgia, serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 30px 20px;
      background: linear-gradient(135deg, #2e5a8a 0%, #4a7ab5 100%);
    }
    .header img {
      max-width: 200px;
      height: auto;
    }
    .header h1 {
      color: #ffffff;
      font-family: 'Marcellus', Georgia, serif;
      font-size: 24px;
      margin: 15px 0 0 0;
      font-weight: 400;
    }
    .content {
      padding: 30px 25px;
      background-color: #ffffff;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
    a {
      color: #2e5a8a;
      text-decoration: none;
    }
    a:hover {
      color: #4a7ab5;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <img src='https://isrs-frontend.onrender.com/images/logo-wide-white.png' alt='ISRS Logo'>
      <h1>International Shellfish Restoration Society</h1>
    </div>
    <div class='content'>${body}</div>
    <div class='footer'>
      <p><strong>International Shellfish Restoration Society</strong></p>
      <p><a href='https://shellfish-society.org'>Visit Our Website</a> | <a href='mailto:info@shellfish-society.org'>Contact Us</a></p>
      <p style='font-size: 11px; color: #999; margin-top: 15px;'>
        © ${new Date().getFullYear()} International Shellfish Restoration Society. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

async function trackEmailOpen(campaignId, recipientId) {
  await query(`UPDATE campaign_recipients SET opened_at = NOW(), opened = true WHERE campaign_id = $1 AND contact_id = $2 AND opened_at IS NULL`, [campaignId, recipientId]);
  await query(`UPDATE email_campaigns SET opened_count = opened_count + 1 WHERE id = $1`, [campaignId]);
}

async function trackEmailClick(campaignId, recipientId, url) {
  await query(`INSERT INTO email_clicks (campaign_id, recipient_id, url, clicked_at) VALUES ($1, $2, $3, NOW())`, [campaignId, recipientId, url]);
  await query(`UPDATE email_campaigns SET clicked_count = clicked_count + 1 WHERE id = $1`, [campaignId]);
}

/**
 * Send magic link email for passwordless authentication
 * @param {string} toEmail - Recipient email address
 * @param {string} userName - User's first name
 * @param {string} magicLink - The magic link URL
 */
async function sendMagicLink(toEmail, userName, magicLink) {
  const subject = 'Your Secure Login Link - ISRS Member Portal';

  const body = `
    <h2 style="color: #2e5a8a; font-family: 'Marcellus', Georgia, serif; font-weight: 400; margin-top: 0;">
      Hello ${userName},
    </h2>
    <p style="font-size: 16px; line-height: 1.6;">
      You requested to log in to the <strong>International Shellfish Restoration Society</strong> member portal.
    </p>
    <p style="margin: 35px 0; text-align: center;">
      <a href="${magicLink}"
         style="background: linear-gradient(135deg, #2e5a8a 0%, #4a7ab5 100%);
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);">
        🔐 Log In to ISRS Portal
      </a>
    </p>
    <p style="font-size: 14px; color: #666;">
      This secure link will expire in <strong>15 minutes</strong> for your protection.
    </p>
    <p style="font-size: 14px; color: #666;">
      If you didn't request this login link, you can safely ignore this email.
    </p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e8f5e9; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
      <p style="font-size: 13px; color: #2e7d32; margin: 0;">
        <strong>🔒 Security Reminder:</strong> Never share this link with anyone. ISRS will never ask for your login credentials via email.
      </p>
    </div>
    <p style="font-size: 12px; color: #999; margin-top: 25px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
      <strong>Trouble clicking the button?</strong><br>
      Copy and paste this link into your browser:<br>
      <span style="word-break: break-all; color: #2e5a8a; font-family: monospace; font-size: 11px;">${magicLink}</span>
    </p>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    body
  });
}

module.exports = { sendCampaignEmails, sendEmail, sendMagicLink, personalizeContent, trackEmailOpen, trackEmailClick };
