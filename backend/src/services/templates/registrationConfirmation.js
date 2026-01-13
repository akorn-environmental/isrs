/**
 * Registration Confirmation Email Template
 * Sent immediately after successful registration
 */

const { t } = require('../emailTranslations');

function registrationConfirmationTemplate(data) {
  const {
    firstName,
    lastName,
    email,
    registrationId,
    registrationType,
    conferenceName,
    conferenceDate,
    registrationFee,
    paymentStatus,
    paymentMethod,
    selectedSessions = [],
    discountCode = null,
    discountAmount = 0,
    language = 'en'  // NEW: Language parameter
  } = data;

  const finalAmount = registrationFee - discountAmount;

  return {
    subject: `${t('regConfirmSubject', language)}: ${conferenceName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Registration Confirmed!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You're all set for ${conferenceName}</p>
            </td>
          </tr>

          <!-- Confirmation Message -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear ${firstName} ${lastName},
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for registering for <strong>${conferenceName}</strong>! We're excited to have you join us for this premier gathering of shellfish restoration professionals from around the world.
              </p>
            </td>
          </tr>

          <!-- Registration Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; border: 2px solid #e9ecef;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">Registration Details</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Registration ID:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${registrationId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Registration Type:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${registrationType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Conference Date:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${conferenceDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${email}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${discountCode ? `
          <!-- Discount Applied -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #d4edda; border-radius: 6px; border: 2px solid #c3e6cb;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="margin: 0; color: #155724; font-size: 14px;">
                      <strong>💰 Discount Applied:</strong> ${discountCode.toUpperCase()}<br>
                      <span style="font-size: 13px;">You saved $${discountAmount.toFixed(2)}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${selectedSessions.length > 0 ? `
          <!-- Selected Sessions -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">Your Selected Sessions</h2>
              ${selectedSessions.map(session => `
                <div style="margin-bottom: 12px; padding: 16px; background-color: #f0f8ff; border-radius: 6px; border-left: 4px solid #2E5A8A;">
                  <p style="margin: 0 0 4px; color: #2E5A8A; font-size: 15px; font-weight: 600;">${session.name}</p>
                  <p style="margin: 0; color: #666666; font-size: 13px;">${session.date} • ${session.time} • ${session.room || 'TBD'}</p>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Payment Summary -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 6px; border: 2px solid #ffc107;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #856404; font-size: 20px; font-weight: 600;">Payment Summary</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Registration Fee:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">$${registrationFee.toFixed(2)}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #28a745; font-size: 14px;">Discount:</td>
                        <td style="padding: 8px 0; color: #28a745; font-size: 14px; text-align: right;">-$${discountAmount.toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      <tr style="border-top: 2px solid #dee2e6;">
                        <td style="padding: 12px 0 0; color: #333333; font-size: 18px; font-weight: 700;">Total:</td>
                        <td style="padding: 12px 0 0; color: #2E5A8A; font-size: 18px; font-weight: 700; text-align: right;">$${finalAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 12px 0 0;">
                          <p style="margin: 0; color: #666666; font-size: 13px;">
                            <strong>Payment Status:</strong> ${paymentStatus === 'confirmed' ? '✅ Confirmed' : '⏳ Pending'}
                          </p>
                          <p style="margin: 4px 0 0; color: #666666; font-size: 13px;">
                            <strong>Payment Method:</strong> ${paymentMethod === 'zeffy' ? 'Credit/Debit Card (Zeffy)' : 'Bank Transfer'}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${paymentStatus !== 'confirmed' ? `
          <!-- Payment Pending Notice -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="margin: 0 0 8px; color: #856404; font-size: 14px; font-weight: 600;">⏳ Payment Pending</p>
                    <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                      ${paymentMethod === 'bank_transfer'
                        ? 'Please complete your bank transfer and send proof to treasurer@shellfish-restoration.org. Your registration will be confirmed once payment is received (typically 3-5 business days).'
                        : 'Please complete your payment to confirm your registration. You should have received payment instructions separately.'
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">Next Steps</h2>
              <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                <li>Save this email for your records</li>
                <li>Book your accommodation (hotel block details coming soon)</li>
                <li>Plan your travel arrangements</li>
                <li>Submit an abstract if you'd like to present (deadline TBA)</li>
                <li>Join us on social media for updates</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://isrs.org/conference/my-registration?id=${registrationId}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);">
                View My Registration
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
                <strong>International Shellfish Restoration Society</strong>
              </p>
              <p style="margin: 0 0 8px; color: #666666; font-size: 12px;">
                Questions? Contact us at <a href="mailto:info@shellfish-restoration.org" style="color: #2E5A8A; text-decoration: none;">info@shellfish-restoration.org</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 11px;">
                © 2025 International Shellfish Restoration Society. Tax ID: 39-2829151
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
REGISTRATION CONFIRMED

Dear ${firstName} ${lastName},

Thank you for registering for ${conferenceName}! We're excited to have you join us.

REGISTRATION DETAILS
Registration ID: ${registrationId}
Registration Type: ${registrationType}
Conference Date: ${conferenceDate}
Email: ${email}

${discountCode ? `DISCOUNT APPLIED: ${discountCode.toUpperCase()} - You saved $${discountAmount.toFixed(2)}` : ''}

${selectedSessions.length > 0 ? `
YOUR SELECTED SESSIONS:
${selectedSessions.map(s => `- ${s.name} (${s.date} • ${s.time})`).join('\n')}
` : ''}

PAYMENT SUMMARY
Registration Fee: $${registrationFee.toFixed(2)}
${discountAmount > 0 ? `Discount: -$${discountAmount.toFixed(2)}\n` : ''}Total: $${finalAmount.toFixed(2)}
Payment Status: ${paymentStatus === 'confirmed' ? 'Confirmed' : 'Pending'}
Payment Method: ${paymentMethod === 'zeffy' ? 'Credit/Debit Card (Zeffy)' : 'Bank Transfer'}

NEXT STEPS:
- Save this email for your records
- Book your accommodation
- Plan your travel arrangements
- Submit an abstract if you'd like to present
- Join us on social media for updates

View your registration: https://isrs.org/conference/my-registration?id=${registrationId}

Questions? Contact us at info@shellfish-restoration.org

---
International Shellfish Restoration Society
© 2025 ISRS. Tax ID: 39-2829151
    `.trim()
  };
}

module.exports = { registrationConfirmationTemplate };
