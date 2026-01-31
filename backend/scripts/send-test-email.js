#!/usr/bin/env node

/**
 * Send Test Campaign Email
 * Sends the ICSR2026 announcement email to a test recipient
 */

const emailService = require('../src/services/emailService');

async function sendTestEmail() {
  const recipient = {
    email: 'aaron.kornbluth@gmail.com',
    firstName: 'Aaron',
    lastName: 'Kornbluth',
    organization: 'ISRS',
    icsr2024_attended: true,
    icsr2024_role: 'Presenter',
    icsr2024_presentation_count: 1,
    icsr2026_registered: false
  };

  console.log('📧 Sending test email to:', recipient.email);
  console.log('📋 Recipient details:', {
    name: `${recipient.firstName} ${recipient.lastName}`,
    organization: recipient.organization,
    icsr2024_attended: recipient.icsr2024_attended,
    icsr2024_role: recipient.icsr2024_role,
    icsr2026_registered: recipient.icsr2026_registered
  });

  try {
    // Send email directly
    const result = await emailService.sendEmail({
      to: recipient.email,
      subject: `${recipient.firstName}, Save the Date: ICSR2026 in Washington State`,
      body: generateEmailBody(recipient),
      campaignId: 'test-campaign',
      recipientId: null
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error(error);
    process.exit(1);
  }
}

function generateEmailBody(recipient) {
  // This is a simplified version - the actual emailService.js has the full template
  return `
    <p>Dear ${recipient.firstName},</p>

    <p>We hope this message finds you well! We're writing to share exciting updates about the International Shellfish Restoration Society (ISRS) and the upcoming International Conference on Shellfish Restoration (ICSR2026).</p>

    ${recipient.icsr2024_attended ? `
    <h2>Thank You for ICSR2024!</h2>
    <p>We want to extend our heartfelt gratitude for your participation in ICSR2024 at Jekyll Island, Georgia.</p>
    ${recipient.icsr2024_role === 'Presenter' ? `
    <p style="background: #f0f8ff; padding: 15px; border-left: 4px solid #2e5a8a; margin: 20px 0;">
    <strong>Special Recognition:</strong> Thank you for contributing to the scientific program with your presentation(s).
    </p>
    ` : ''}
    ` : `
    <h2>We Missed You at ICSR2024</h2>
    <p>While we were sorry you couldn't join us for ICSR2024 in Jekyll Island, Georgia, we wanted to share that our community came together to discuss cutting-edge research and build partnerships.</p>
    `}

    <h2>🎉 Save the Date: ICSR2026 in Washington State</h2>

    <p><strong>📅 October 4-8, 2026</strong><br>
    <strong>📍 Little Creek Casino Resort, Shelton, Washington</strong></p>

    <p>More details coming soon!</p>

    <p>Best regards,<br>
    The ISRS and ICSR2026 Teams</p>
  `;
}

// Run the script
sendTestEmail();
