#!/usr/bin/env node

require('dotenv').config();
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const fs = require('fs');
const path = require('path');

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Sample attendee profiles
const attendees = [
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    organization: 'Chesapeake Bay Foundation',
    icsr2024_attended: true,
    icsr2024_presented: true,
    icsr2024_presentation_titles: ['Oyster Reef Restoration in the Chesapeake Bay', 'Community Engagement in Urban Restoration Projects'],
    icsr2024_poster: false,
    icsr2024_volunteer: false,
    icsr2024_planning_committee: false,
    icsr2024_sponsor_level: null,
    icsr2024_exhibitor: false,
    icsr2024_field_trip: true,
    icsr2026_registered: false
  },
  {
    firstName: 'Marcus',
    lastName: 'Thompson',
    organization: 'Pacific Shellfish Institute',
    icsr2024_attended: true,
    icsr2024_presented: false,
    icsr2024_poster: true,
    icsr2024_volunteer: true,
    icsr2024_planning_committee: true,
    icsr2024_sponsor_level: 'Gold',
    icsr2024_exhibitor: true,
    icsr2024_field_trip: true,
    icsr2026_registered: true
  }
];

function buildParticipationSection(attendee) {
  const activities = [];

  if (attendee.icsr2024_presented && attendee.icsr2024_presentation_titles && attendee.icsr2024_presentation_titles.length > 0) {
    const count = attendee.icsr2024_presentation_titles.length;
    const titles = attendee.icsr2024_presentation_titles.map(t => `<em>"${t}"</em>`).join(' and ');
    const plural = count > 1 ? 's' : '';
    activities.push(`<p style="background: #f0f8ff; padding: 15px; border-left: 4px solid #2e5a8a; margin: 20px 0;">
<strong>Scientific Contribution:</strong> Thank you for presenting ${count} talk${plural} at the conference: ${titles}. Your research enriched our scientific program and sparked important discussions in the field.</p>`);
  }

  if (attendee.icsr2024_poster) {
    activities.push(`<p style="background: #f0f8ff; padding: 15px; border-left: 4px solid #2e5a8a; margin: 20px 0;">
<strong>Poster Presentation:</strong> Your poster contribution helped showcase cutting-edge research and facilitated valuable scientific exchanges during the conference.</p>`);
  }

  if (attendee.icsr2024_volunteer) {
    activities.push(`<p style="background: #e8f5e9; padding: 15px; border-left: 4px solid #2c5f2d; margin: 20px 0;">
<strong>Volunteer Service:</strong> Your volunteer efforts were invaluable in making ICSR2024 run smoothly. Thank you for giving your time to support the conference!</p>`);
  }

  if (attendee.icsr2024_planning_committee) {
    activities.push(`<p style="background: #e8f5e9; padding: 15px; border-left: 4px solid #2c5f2d; margin: 20px 0;">
<strong>Planning Committee:</strong> As a member of the planning committee, your dedication and expertise were essential to the conference success. We are grateful for your leadership!</p>`);
  }

  if (attendee.icsr2024_sponsor_level) {
    activities.push(`<p style="background: #fff3e0; padding: 15px; border-left: 4px solid #f57c00; margin: 20px 0;">
<strong>${attendee.icsr2024_sponsor_level} Sponsor:</strong> Your generous sponsorship made ICSR2024 possible. We are deeply grateful for your continued support of the shellfish restoration community!</p>`);
  }

  if (attendee.icsr2024_exhibitor) {
    activities.push(`<p style="background: #e3f2fd; padding: 15px; border-left: 4px solid #1976d2; margin: 20px 0;">
<strong>Exhibitor:</strong> Thank you for showcasing your products and services at ICSR2024. Your booth helped connect practitioners with valuable tools and resources!</p>`);
  }

  if (attendee.icsr2024_field_trip) {
    activities.push(`<p style="background: #fce4ec; padding: 15px; border-left: 4px solid #c2185b; margin: 20px 0;">
<strong>Field Trip Participant:</strong> We hope you enjoyed exploring Jekyll Island coastal ecosystems and restoration projects during the field trip!</p>`);
  }

  if (activities.length === 0) {
    return '';
  }

  const summary = "Your participation—along with 300+ colleagues from around the world—made the conference a tremendous success, advancing shellfish restoration science and practice globally.";

  return `
<div class="info-box" style="margin: 20px 0; padding: 20px; background-color: #f8fdf8; border-left: 4px solid #2c5f2d; border-radius: 4px;">
<h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #2c5f2d;">Thank You for ICSR2024!</h2>

<p style="margin: 0 0 12px; font-size: 15px;">We want to extend our heartfelt gratitude for your participation in ICSR2024 at Jekyll Island, Georgia. ${summary}</p>

${activities.join('\n')}
</div>`;
}

async function sendTestEmail(attendee) {
  const templatePath = path.join(__dirname, '../../EMAIL_CAMPAIGN_DRAFT.md');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const htmlMatch = templateContent.match(/```html\n([\s\S]*?)\n```/);
  let emailBody = htmlMatch ? htmlMatch[1] : '';

  // Build participation section
  const participationSection = buildParticipationSection(attendee);

  // Replace placeholders
  emailBody = emailBody
    .replace(/{{firstName}}/g, attendee.firstName)
    .replace(/{{lastName}}/g, attendee.lastName)
    .replace(/{{organization}}/g, attendee.organization)
    .replace(/{{icsr2026LogoSrc}}/g, 'cid:icsr2026Logo');

  // Replace participation section
  if (participationSection) {
    emailBody = emailBody.replace(
      /<!-- CONDITIONAL: ICSR2024 Participants[\s\S]*?<\/div>/i,
      participationSection
    );
  } else {
    emailBody = emailBody.replace(
      /<!-- CONDITIONAL: ICSR2024 Participants[\s\S]*?<\/div>/i,
      ''
    );
  }

  // Handle registration status
  if (attendee.icsr2026_registered) {
    emailBody = emailBody.replace(
      /<!-- CONDITIONAL: Not yet registered -->[\s\S]*?<\/div>\s*/i,
      ''
    );
  } else {
    emailBody = emailBody.replace(
      /<!-- CONDITIONAL: Already registered -->[\s\S]*?<\/div>\s*/i,
      ''
    );
  }

  // Remove standalone sponsor section if sponsor was already thanked in ICSR2024 section
  if (attendee.icsr2024_sponsor_level) {
    emailBody = emailBody.replace(
      /<!-- CONDITIONAL: Sponsors & Funders -->[\s\S]*?<\/div>\s*/i,
      ''
    );
  }

  // Wrap in template
  const htmlFull = `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.5; color: #333333; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { text-align: center; padding: 30px 20px 15px; background-color: #ffffff; }
    .header img { max-width: 200px; height: auto; }
    .header h1 { margin: 15px 0 0; font-size: 20px; font-weight: 600; color: #2c5f2d; letter-spacing: 0.5px; }
    .content { padding: 15px 30px; background-color: #ffffff; }
    .content p { margin: 0 0 12px; font-size: 15px; line-height: 1.5; }
    .content h2 { margin: 25px 0 12px; font-size: 20px; font-weight: 600; color: #2c5f2d; }
    .content h3 { margin: 20px 0 10px; font-size: 17px; font-weight: 600; color: #333333; }
    .content ul { margin: 8px 0 15px; padding-left: 20px; }
    .content li { margin-bottom: 6px; font-size: 15px; line-height: 1.4; }
    .content strong { font-weight: 600; color: #2c5f2d; }
    .announcement { margin: 20px 0; padding: 12px 15px; background-color: #f8fdf8; border: 2px solid #2c5f2d; border-radius: 8px; text-align: center; }
    .announcement img { max-width: 180px; height: auto; margin-bottom: 8px; }
    .announcement h3 { margin: 0 0 6px; font-size: 18px; line-height: 1.2; }
    .announcement p { margin: 3px 0; font-size: 16px; line-height: 1.3; }
    .button { display: inline-block; margin: 10px 5px; padding: 12px 24px; background-color: #2c5f2d; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 600; }
    .info-box { margin: 20px 0; padding: 20px; background-color: #f8fdf8; border-left: 4px solid #2c5f2d; border-radius: 4px; }
    .footer { padding: 25px 30px; background-color: #f8f9fa; text-align: center; border-top: 2px solid #e0e0e0; margin-top: 30px; }
    .footer-box { background-color: #ffffff; border: 1px solid #d0d0d0; border-radius: 6px; padding: 20px; max-width: 500px; margin: 0 auto; }
    .footer-title { font-size: 16px; font-weight: 600; color: #2c5f2d; margin: 0 0 12px 0; }
    .footer-links { margin: 10px 0; font-size: 14px; }
    .footer-links a { color: #2c5f2d; text-decoration: none; margin: 0 8px; }
    .footer-divider { border: 0; border-top: 1px solid #e0e0e0; margin: 15px 0; }
    .footer-small { font-size: 12px; color: #666; margin: 8px 0; line-height: 1.5; }
    .social-links { margin: 15px 0; }
    .social-links a { margin: 0 8px; display: inline-block; }
    a { color: #2c5f2d; text-decoration: none; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <img src='cid:isrsLogo' alt='ISRS Logo'>
      <h1>The International Shellfish Restoration Society</h1>
    </div>
    <div class='content'>${emailBody}</div>
    <div class='footer'>
      <div class='footer-box'>
        <p class='footer-title'>International Shellfish Restoration Society</p>
        <p class='footer-links'>
          <a href='https://www.shellfish-society.org'>www.shellfish-society.org</a> |
          <a href='mailto:info@shellfish-society.org'>info@shellfish-society.org</a>
        </p>
        <div class='social-links'>
          <a href='https://www.facebook.com/ISRSshellfish' target='_blank' rel='noopener' aria-label='Facebook'>
            <img src='https://img.icons8.com/ios-filled/24/2c5f2d/facebook-new.png' alt='Facebook' width='24' height='24'>
          </a>
          <a href='https://www.linkedin.com/company/isrs-shellfish' target='_blank' rel='noopener' aria-label='LinkedIn'>
            <img src='https://img.icons8.com/ios-filled/24/2c5f2d/linkedin.png' alt='LinkedIn' width='24' height='24'>
          </a>
        </div>
        <hr class='footer-divider'>
        <p class='footer-small'>
          Tax ID (EIN): 39-2829151 | 501(c)(3) Nonprofit<br>
          P.O. Box [TBD], [City], [State] [ZIP]<br>
          <br>
          You're receiving this email because you're a contact in the ISRS database.<br>
          <a href='https://www.shellfish-society.org/unsubscribe'>Unsubscribe</a>
        </p>
        <p style='font-size: 11px; color: #999; margin-top: 15px;'>
          © 2026 International Shellfish Restoration Society. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const textBody = emailBody.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  // Load logos
  const isrsLogoPath = path.join(__dirname, '../../frontend/public/images/logos/LOGO - ISRS - wide - green.png');
  const icsr2026LogoPath = path.join(__dirname, '../../frontend/public/images/logos/LOGO - ICSR2026.png');
  const isrsLogoData = fs.readFileSync(isrsLogoPath).toString('base64').match(/.{1,76}/g).join('\r\n');
  const icsr2026LogoData = fs.readFileSync(icsr2026LogoPath).toString('base64').match(/.{1,76}/g).join('\r\n');

  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36)}`;
  const rawEmail = [
    `From: ISRS <noreply@shellfish-society.org>`,
    `To: aaron.kornbluth@gmail.com`,
    `Subject: SAMPLE for ${attendee.firstName} ${attendee.lastName}: ICSR2026 Save the Date`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${boundary}_alt"`,
    ``,
    `--${boundary}_alt`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    textBody,
    `--${boundary}_alt`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlFull,
    `--${boundary}_alt--`,
    `--${boundary}`,
    `Content-Type: image/png; name="isrs-logo.png"`,
    `Content-Transfer-Encoding: base64`,
    `Content-ID: <isrsLogo>`,
    `Content-Disposition: inline; filename="isrs-logo.png"`,
    ``,
    isrsLogoData,
    `--${boundary}`,
    `Content-Type: image/png; name="icsr2026-logo.png"`,
    `Content-Transfer-Encoding: base64`,
    `Content-ID: <icsr2026Logo>`,
    `Content-Disposition: inline; filename="icsr2026-logo.png"`,
    ``,
    icsr2026LogoData,
    `--${boundary}--`
  ].join('\r\n');

  const command = new SendRawEmailCommand({
    RawMessage: { Data: Buffer.from(rawEmail) }
  });

  return await sesClient.send(command);
}

async function main() {
  console.log('📧 Sending 2 sample ICSR2024 attendee emails to aaron.kornbluth@gmail.com\n');

  for (const attendee of attendees) {
    console.log(`Sending sample for: ${attendee.firstName} ${attendee.lastName}`);
    console.log(`Organization: ${attendee.organization}`);
    console.log(`ICSR2024 Activities:`);
    if (attendee.icsr2024_presented) console.log(`  - Presented ${attendee.icsr2024_presentation_titles.length} talk(s)`);
    if (attendee.icsr2024_poster) console.log(`  - Poster presentation`);
    if (attendee.icsr2024_volunteer) console.log(`  - Volunteered`);
    if (attendee.icsr2024_planning_committee) console.log(`  - Planning committee member`);
    if (attendee.icsr2024_sponsor_level) console.log(`  - ${attendee.icsr2024_sponsor_level} sponsor`);
    if (attendee.icsr2024_exhibitor) console.log(`  - Exhibitor`);
    if (attendee.icsr2024_field_trip) console.log(`  - Field trip participant`);
    console.log(`ICSR2026 Registered: ${attendee.icsr2026_registered ? 'Yes' : 'No'}`);

    const result = await sendTestEmail(attendee);
    console.log(`✅ Sent! Message ID: ${result.MessageId}\n`);
  }

  console.log('💌 Check your inbox at aaron.kornbluth@gmail.com for both sample emails!\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
