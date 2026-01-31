// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Set to production mode to actually send via AWS SES
process.env.NODE_ENV = 'production';

const { sendEmail, personalizeContent } = require('../src/services/emailService');
const fs = require('fs');
const path = require('path');

// Read the email template
const emailDraftPath = path.join(__dirname, '../../EMAIL_CAMPAIGN_DRAFT.md');
const emailDraft = fs.readFileSync(emailDraftPath, 'utf8');

// Extract HTML body from markdown
const htmlMatch = emailDraft.match(/```html\n([\s\S]*?)\n```/);
if (!htmlMatch) {
  console.error('Could not find HTML template in EMAIL_CAMPAIGN_DRAFT.md');
  process.exit(1);
}
const emailBodyTemplate = htmlMatch[1];

async function sendTestEmail() {
  try {
    // Test recipient - aaron.kornbluth (ICSR2024 attendee, not registered for 2026)
    const recipient = {
      email: 'aaron.kornbluth@gmail.com',
      first_name: 'Aaron',
      last_name: 'Kornbluth',
      organization: 'ISRS',
      icsr2024_attended: true,
      icsr2024_presented: false,
      icsr2024_presentation_titles: [],
      icsr2026_registered: false,
      is_sponsor: false,
      is_funder: false
    };

    console.log(`📧 Sending test email to ${recipient.email}...`);

    const personalizedBody = personalizeContent(emailBodyTemplate, recipient);
    const subject = `TEST EMAIL: ${recipient.first_name}, Save the Date: ICSR2026 in Washington State`;

    await sendEmail({
      to: recipient.email,
      subject,
      body: personalizedBody
    });

    console.log(`✓ Test email sent successfully!`);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

sendTestEmail();
