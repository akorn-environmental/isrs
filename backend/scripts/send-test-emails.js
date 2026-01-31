require('dotenv').config();

// Override NODE_ENV to production temporarily to send real emails
process.env.NODE_ENV = 'production';

const { sendEmail, personalizeContent } = require('../src/services/emailService');
const fs = require('fs');
const path = require('path');

// Read the email draft
const draftPath = '/Users/akorn/Desktop/ITERM PROJECTS/ISRS/EMAIL_CAMPAIGN_DRAFT.md';
const draftContent = fs.readFileSync(draftPath, 'utf8');

// Extract the HTML body from the markdown file
const bodyMatch = draftContent.match(/```html\n([\s\S]*?)\n```/);
if (!bodyMatch) {
  console.error('Could not find HTML body in draft');
  process.exit(1);
}

const emailBody = bodyMatch[1];

// Test recipients with different scenarios
const testRecipients = [
  {
    email: 'aaron.kornbluth@gmail.com',
    first_name: 'Aaron',
    last_name: 'Kornbluth',
    organization: 'ISRS',
    icsr2024_attended: true,
    icsr2024_presented: false,
    icsr2024_presentation_titles: null,
    icsr2026_registered: false,
    icsr2026_registration_type: null,
    is_sponsor: false,
    is_funder: false,
    sponsor_level: null,
    conference_role: 'organizer',
    scenario: 'ICSR2024 Attendee (non-presenter)',
    cc: null
  },
  {
    email: 'allgooddeeds@gmail.com',
    first_name: 'Aaron',
    last_name: 'Kornbluth',
    organization: 'Personal',
    icsr2024_attended: false,
    icsr2024_presented: false,
    icsr2024_presentation_titles: null,
    icsr2026_registered: false,
    icsr2026_registration_type: null,
    is_sponsor: false,
    is_funder: false,
    sponsor_level: null,
    conference_role: null,
    scenario: 'Non-attendee',
    cc: 'aaron.kornbluth@gmail.com'
  },
  {
    email: 'andylacatell@gmail.com',
    first_name: 'Andy',
    last_name: 'Lacatell',
    organization: null,
    icsr2024_attended: true,
    icsr2024_presented: true,
    icsr2024_presentation_titles: ['Oyster Restoration in Chesapeake Bay', 'Community Engagement Strategies'],
    icsr2026_registered: false,
    icsr2026_registration_type: null,
    is_sponsor: false,
    is_funder: false,
    sponsor_level: null,
    conference_role: 'presenter',
    scenario: 'ICSR2024 Presenter (2 presentations)',
    cc: 'aaron.kornbluth@gmail.com'
  },
  {
    email: 'Betsy@restorationfund.org',
    first_name: 'Betsy',
    last_name: 'Peabody',
    organization: 'Puget Sound Restoration Fund',
    icsr2024_attended: false,
    icsr2024_presented: false,
    icsr2024_presentation_titles: null,
    icsr2026_registered: false,
    icsr2026_registration_type: null,
    is_sponsor: true,
    is_funder: true,
    sponsor_level: 'Gold',
    conference_role: null,
    scenario: 'Gold Sponsor/Funder (non-attendee)',
    cc: 'aaron.kornbluth@gmail.com'
  }
];

async function sendTestEmails() {
  console.log('📧 Sending test emails for ISRS/ICSR2026 announcement...\n');

  for (const recipient of testRecipients) {
    try {
      console.log(`Sending to ${recipient.email} (${recipient.scenario})...`);

      const personalizedBody = personalizeContent(emailBody, recipient);
      const personalizedSubject = personalizeContent(
        `TEST EMAIL - {{firstName}}, Save the Date: ICSR2026 in Washington State`,
        recipient
      );

      const emailOptions = {
        to: recipient.email,
        subject: personalizedSubject,
        body: personalizedBody
      };

      // Add CC if specified
      if (recipient.cc) {
        emailOptions.cc = recipient.cc;
      }

      await sendEmail(emailOptions);

      console.log(`  ✓ Sent to ${recipient.email}`);

      if (recipient.cc) {
        console.log(`  ℹ Note: CC to ${recipient.cc} requires manual email client setup`);
      }

      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ✗ Failed to send to ${recipient.email}:`, error.message);
    }
  }

  console.log('\n✅ Test email campaign completed!');
  console.log('\nTest scenarios sent:');
  testRecipients.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.email} - ${r.scenario}`);
  });

  process.exit(0);
}

sendTestEmails();
