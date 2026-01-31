#!/usr/bin/env node

const { sendEmail } = require('../src/services/emailService');
const fs = require('fs');
const path = require('path');

// Read the email template from the markdown file
const templatePath = path.join(__dirname, '../../EMAIL_CAMPAIGN_DRAFT.md');
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Extract HTML from markdown (find content between ```html and ```)
const htmlMatch = templateContent.match(/```html\n([\s\S]*?)\n```/);
const emailBody = htmlMatch ? htmlMatch[1] : '';

// Personalize for Aaron
const personalizedBody = emailBody
  .replace(/{{firstName}}/g, 'Aaron')
  .replace(/{{lastName}}/g, 'Kornbluth')
  .replace(/{{icsr2024PresentationCount}}/g, '1')
  .replace(/{{icsr2024PresentationTitles}}/g, 'Shellfish Restoration Project');

console.log('📧 Sending ICSR2026 announcement email...\n');

sendEmail({
  to: 'aaron.kornbluth@gmail.com',
  subject: 'Aaron, Save the Date: ICSR2026 in Washington State',
  body: personalizedBody,
  campaignId: 'test-campaign',
  recipientId: null
})
.then(result => {
  console.log('✅ Email sent successfully!');
  console.log('Message ID:', result.MessageId);
  process.exit(0);
})
.catch(error => {
  console.error('❌ Failed to send email:');
  console.error(error);
  process.exit(1);
});
