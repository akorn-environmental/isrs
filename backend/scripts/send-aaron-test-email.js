#!/usr/bin/env node

/**
 * Send Test ICSR2026 Email to Aaron
 * Run this on Render or with proper AWS credentials
 */

const { sendEmail } = require('../src/services/emailService');
const fs = require('fs');
const path = require('path');

async function main() {
  // Read the email template
  const templatePath = path.join(__dirname, '../../EMAIL_CAMPAIGN_DRAFT.md');
  let emailBody = '';

  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const htmlMatch = templateContent.match(/```html\n([\s\S]*?)\n```/);
    emailBody = htmlMatch ? htmlMatch[1] : '';
  } catch (err) {
    console.error('Could not read email template:', err.message);
    // Fallback to simple template
    emailBody = `
      <p>Dear Aaron,</p>
      <p>This is a test of the ICSR2026 announcement email system.</p>
      <h2>🎉 Save the Date: ICSR2026</h2>
      <p><strong>📅 October 4-8, 2026</strong><br>
      <strong>📍 Little Creek Casino Resort, Shelton, Washington</strong></p>
      <p>More details coming soon!</p>
    `;
  }

  // Personalize for Aaron (ICSR2024 attendee, presenter)
  const personalizedBody = emailBody
    .replace(/{{firstName}}/g, 'Aaron')
    .replace(/{{lastName}}/g, 'Kornbluth')
    .replace(/{{organization}}/g, 'ISRS')
    .replace(/{{icsr2024PresentationCount}}/g, '1')
    .replace(/{{icsr2024PresentationTitles}}/g, 'Various shellfish restoration topics')
    // Remove conditional sections for non-attendees
    .replace(/<!-- CONDITIONAL: For those who missed ICSR2024 -->[\s\S]*?<\/div>\s*\n*/i, '')
    // Keep ICSR2024 attendee sections
    .replace(/<!-- CONDITIONAL: ICSR2024 Attendees -->/gi, '')
    .replace(/<!-- CONDITIONAL: For presenters -->/gi, '')
    // Remove registration sections (not registered yet)
    .replace(/<!-- CONDITIONAL: Already registered -->[\s\S]*?<div class="already-registered-section[^"]*">[\s\S]*?<\/div>\s*\n*/i, '')
    .replace(/<!-- CONDITIONAL: Not yet registered -->/gi, '');

  console.log('📧 Sending ICSR2026 email to aaron.kornbluth@gmail.com');
  console.log('📋 Recipient profile: ICSR2024 attendee & presenter, not yet registered for ICSR2026\n');

  try {
    const result = await sendEmail({
      to: 'aaron.kornbluth@gmail.com',
      subject: 'Aaron, Save the Date: ICSR2026 in Washington State',
      body: personalizedBody,
      campaignId: 'manual-test',
      recipientId: null
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', result.MessageId);
    console.log('\n💡 Check your inbox at aaron.kornbluth@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();
