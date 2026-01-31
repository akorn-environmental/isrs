const { SESClient, SendRawEmailCommand, SendEmailCommand } = require('@aws-sdk/client-ses');
const { query } = require('../config/database');
const { getEmailLogos } = require('../utils/emailAssets');
const fs = require('fs');
const path = require('path');

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

async function sendEmail({ to, subject, body, campaignId, recipientId, cc }) {
  const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@isrs.org';
  const fromName = process.env.SES_FROM_NAME || 'ISRS';

  if (process.env.NODE_ENV !== 'production' || !process.env.AWS_ACCESS_KEY_ID) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body preview: ${body.substring(0, 100)}...`);
    return { MessageId: 'mock-' + Date.now() };
  }

  // Build MIME email with inline attachments
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36)}`;
  const htmlBody = wrapEmailTemplate(body);
  const textBody = stripHtml(body);

  // Load logo images - use absolute paths from project root
  const projectRoot = path.join(__dirname, '../../..');
  const isrsLogoPath = path.join(projectRoot, 'frontend/public/images/logos/LOGO - ISRS - wide - green.png');
  const icsr2026LogoPath = path.join(projectRoot, 'frontend/public/images/logos/LOGO - ICSR2026.png');

  let isrsLogoData = '';
  let icsr2026LogoData = '';

  try {
    isrsLogoData = fs.readFileSync(isrsLogoPath).toString('base64');
  } catch (err) {
    console.warn('Could not load ISRS logo:', err.message);
  }

  try {
    icsr2026LogoData = fs.readFileSync(icsr2026LogoPath).toString('base64');
  } catch (err) {
    console.warn('Could not load ICSR2026 logo:', err.message);
  }

  const ccHeader = cc ? `Cc: ${Array.isArray(cc) ? cc.join(', ') : cc}\r\n` : '';

  const rawMessage = `From: ${fromName} <${fromEmail}>
To: ${to}
${ccHeader}Subject: ${subject}
MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: multipart/alternative; boundary="${boundary}_alt"

--${boundary}_alt
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

${textBody}

--${boundary}_alt
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

${htmlBody}

--${boundary}_alt--

--${boundary}
Content-Type: image/png; name="isrs-logo.png"
Content-Transfer-Encoding: base64
Content-ID: <isrsLogo>
Content-Disposition: inline; filename="isrs-logo.png"

${isrsLogoData.match(/.{1,76}/g).join('\r\n')}

--${boundary}
Content-Type: image/png; name="icsr2026-logo.png"
Content-Transfer-Encoding: base64
Content-ID: <icsr2026Logo>
Content-Disposition: inline; filename="icsr2026-logo.png"

${icsr2026LogoData.match(/.{1,76}/g).join('\r\n')}

--${boundary}--`;

  const params = {
    RawMessage: {
      Data: Buffer.from(rawMessage)
    },
    ...(process.env.SES_CONFIGURATION_SET && {
      ConfigurationSetName: process.env.SES_CONFIGURATION_SET
    })
  };

  const command = new SendRawEmailCommand(params);
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

  // Load logos for email
  const logos = getEmailLogos();

  // Handle presentation titles array
  const presentationTitles = recipient.icsr2024_presentation_titles || [];
  const presentationTitlesText = Array.isArray(presentationTitles) && presentationTitles.length > 0
    ? presentationTitles.join(', ')
    : '';
  const presentationCount = Array.isArray(presentationTitles) ? presentationTitles.length : 0;

  // Remove conditional sections based on recipient data
  // Remove ICSR2024 attendee section if they didn't attend
  if (!recipient.icsr2024_attended) {
    personalized = personalized.replace(/<div class="icsr2024-attendee-section">[\s\S]*?<\/div>\s*(?=<div class="icsr2024-non-attendee-section">|<h2|$)/i, '');
  }

  // Remove non-attendee section if they DID attend
  if (recipient.icsr2024_attended) {
    personalized = personalized.replace(/<div class="icsr2024-non-attendee-section">[\s\S]*?<\/div>\s*(?=<!-- Main Announcement|<h2|$)/i, '');
  }

  // Remove presenter recognition if they didn't present or have no presentations
  if (!recipient.icsr2024_presented || presentationCount === 0) {
    personalized = personalized.replace(/<p style="background: #f0f8ff.*?<\/p>\s*(?=<\/div>)/is, '');
  }

  // Remove already-registered section if not registered
  if (!recipient.icsr2026_registered) {
    personalized = personalized.replace(/<!-- CONDITIONAL: Already registered -->[\s\S]*?<div class="already-registered-section[^"]*">[\s\S]*?<\/div>\s*\n*/i, '');
  }

  // Remove not-registered section if already registered
  if (recipient.icsr2026_registered) {
    personalized = personalized.replace(/<!-- CONDITIONAL: Not yet registered -->[\s\S]*?<div class="not-registered-section">[\s\S]*?<\/div>\s*\n*/i, '');
  }

  // Remove sponsor section if not a sponsor or funder
  if (!recipient.is_sponsor && !recipient.is_funder) {
    personalized = personalized.replace(/<div class="sponsor-funder-section"[\s\S]*?<\/div>\s*(?=<!-- About ISRS|<h2|$)/i, '');
  }

  const variables = {
    '{{firstName}}': recipient.first_name || '',
    '{{lastName}}': recipient.last_name || '',
    '{{fullName}}': `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
    '{{email}}': recipient.email || '',
    '{{organization}}': recipient.organization || '',
    '{{title}}': recipient.title || '',
    '{{country}}': recipient.country || '',
    '{{icsr2024Attended}}': recipient.icsr2024_attended ? 'Yes' : 'No',
    '{{icsr2024Presented}}': recipient.icsr2024_presented ? 'Yes' : 'No',
    '{{icsr2024PresentationTitles}}': presentationTitlesText,
    '{{icsr2024PresentationCount}}': presentationCount.toString(),
    '{{icsr2026Registered}}': recipient.icsr2026_registered ? 'Yes' : 'No',
    '{{icsr2026RegistrationType}}': recipient.icsr2026_registration_type || '',
    '{{isFunder}}': recipient.is_funder ? 'Yes' : 'No',
    '{{isSponsor}}': recipient.is_sponsor ? 'Yes' : 'No',
    '{{sponsorLevel}}': recipient.sponsor_level || '',
    '{{conferenceRole}}': recipient.conference_role || '',
    '{{icsr2026LogoSrc}}': 'cid:icsr2026Logo'
  };
  Object.entries(variables).forEach(([key, value]) => {
    personalized = personalized.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
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
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333333;
      background-color: #f5f5f5;
    }

    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }

    /* Header with logo */
    .header {
      text-align: center;
      padding: 30px 20px 15px;
      background-color: #ffffff;
    }

    .header img {
      max-width: 200px;
      height: auto;
    }

    .header h1 {
      margin: 15px 0 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c5f2d;
      letter-spacing: 0.5px;
    }

    /* Content area */
    .content {
      padding: 15px 30px;
      background-color: #ffffff;
    }

    .content p {
      margin: 0 0 12px;
      font-size: 15px;
      line-height: 1.5;
    }

    .content h2 {
      margin: 25px 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: #2c5f2d;
    }

    .content h3 {
      margin: 20px 0 10px;
      font-size: 17px;
      font-weight: 600;
      color: #333333;
    }

    .content ul {
      margin: 8px 0 15px;
      padding-left: 20px;
    }

    .content li {
      margin-bottom: 6px;
      font-size: 15px;
      line-height: 1.4;
    }

    .content strong {
      font-weight: 600;
      color: #2c5f2d;
    }

    /* Announcement box - minimal styling */
    .announcement {
      margin: 20px 0;
      padding: 25px;
      background-color: #f8fdf8;
      border: 2px solid #2c5f2d;
      border-radius: 8px;
      text-align: center;
    }

    .announcement img {
      max-width: 180px;
      height: auto;
      margin-bottom: 15px;
    }

    .announcement h3 {
      margin: 0 0 10px;
      font-size: 18px;
      font-weight: 600;
      color: #2c5f2d;
    }

    .announcement p {
      margin: 8px 0;
      font-size: 16px;
      color: #333333;
    }

    /* Buttons */
    .button {
      display: inline-block;
      margin: 10px 5px;
      padding: 12px 24px;
      background-color: #2c5f2d;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
    }

    .button:hover {
      background-color: #234d24;
      text-decoration: none;
    }

    /* Info box */
    .info-box {
      margin: 20px 0;
      padding: 20px;
      background-color: #f8fdf8;
      border-left: 4px solid #2c5f2d;
      border-radius: 4px;
    }

    .info-box p {
      margin: 0;
      font-size: 15px;
    }

    /* Footer */
    .footer {
      padding: 25px 30px;
      background-color: #f8f9fa;
      text-align: center;
      border-top: 2px solid #e0e0e0;
      margin-top: 30px;
    }

    .footer-box {
      background-color: #ffffff;
      border: 1px solid #d0d0d0;
      border-radius: 6px;
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
    }

    .footer-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c5f2d;
      margin: 0 0 12px 0;
    }

    .footer-links {
      margin: 10px 0;
      font-size: 14px;
      color: #333333;
    }

    .footer-links a {
      color: #2c5f2d;
      text-decoration: none;
      font-weight: 500;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    .footer-divider {
      border: 0;
      border-top: 1px solid #e0e0e0;
      margin: 15px 0;
    }

    .footer-small {
      font-size: 12px;
      color: #666666;
      margin: 8px 0;
      line-height: 1.5;
    }

    .footer-copyright {
      font-size: 11px;
      color: #999999;
      margin-top: 15px;
    }

    /* Links */
    a {
      color: #2c5f2d;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .header {
        padding: 30px 15px 15px;
      }

      .header h1 {
        font-size: 18px;
      }

      .content {
        padding: 15px 20px;
      }

      .content h2 {
        font-size: 18px;
      }

      .content h3 {
        font-size: 16px;
      }

      .content p,
      .content li {
        font-size: 14px;
      }

      .announcement {
        padding: 20px 15px;
        margin: 20px 0;
      }

      .announcement h3 {
        font-size: 16px;
      }

      .announcement p {
        font-size: 14px;
      }

      .button {
        display: block;
        margin: 10px 0;
        padding: 12px 20px;
        font-size: 14px;
      }

      .footer {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <img src='cid:isrsLogo' alt='ISRS Logo'>
      <h1>International Shellfish Restoration Society</h1>
    </div>
    <div class='content'>${body}</div>
    <div class='footer'>
      <div class='footer-box'>
        <p class='footer-title'>International Shellfish Restoration Society</p>
        <p class='footer-links'>
          <a href='https://www.shellfish-society.org'>www.shellfish-society.org</a> |
          <a href='mailto:info@shellfish-society.org'>info@shellfish-society.org</a>
        </p>
        <hr class='footer-divider'>
        <p class='footer-small'>
          EIN: 88-3755389<br>
          You're receiving this email because you're a contact in the ISRS database.<br>
          <a href='{{unsubscribeLink}}'>Unsubscribe from future communications</a>
        </p>
        <p class='footer-copyright'>
          © ${new Date().getFullYear()} International Shellfish Restoration Society. All rights reserved.
        </p>
      </div>
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
 * @param {string} language - User's preferred language (en, fr, es) - defaults to 'en'
 */
async function sendMagicLink(toEmail, userName, magicLink, language = 'en') {
  const { t } = require('./emailTranslations');

  const subject = t('magicLinkSubject', language);

  const body = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 48px;">🐚</span>
      <h1 style="color: #2c5f2d; font-size: 28px; margin: 15px 0 0 0; font-weight: 600;">
        ${t('magicLinkGreeting', language)} ${userName}!
      </h1>
      <p style="color: #6c757d; font-size: 15px; margin: 8px 0 0 0;">
        Your secure login link is ready
      </p>
    </div>

    <p style="color: #333333; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
      ${t('magicLinkIntro', language)}<br>
      <span style="color: #6c757d; font-size: 14px;">No password needed — it's that easy!</span>
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}"
         style="background-color: #2c5f2d;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                font-size: 16px;
                font-weight: 600;">
        ${t('magicLinkButton', language)}
      </a>
    </div>

    <div style="background-color: #fffbeb; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
      <p style="margin: 0; font-size: 13px; color: #92400e; text-align: center;">
        <strong>⏱️ ${t('magicLinkExpiry', language)}</strong><br>
        <span style="color: #b45309;">${t('magicLinkIgnore', language)}</span>
      </p>
    </div>

    <div style="margin-top: 30px; padding: 20px; background-color: #f8fdf8; border-left: 4px solid #2c5f2d; border-radius: 4px;">
      <p style="font-size: 13px; color: #2c5f2d; margin: 0;">
        <strong>${t('magicLinkSecurityTitle', language)}</strong> ${t('magicLinkSecurityText', language)}
      </p>
    </div>

    <p style="font-size: 12px; color: #6c757d; margin: 20px 0 0 0; text-align: center; line-height: 1.6;">
      <strong>${t('magicLinkTroubleTitle', language)}</strong><br>
      ${t('magicLinkTroubleCopy', language)}<br>
      <span style="word-break: break-all; color: #2c5f2d;">${magicLink}</span>
    </p>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    body
  });
}

module.exports = { sendCampaignEmails, sendEmail, sendMagicLink, personalizeContent, trackEmailOpen, trackEmailClick };
