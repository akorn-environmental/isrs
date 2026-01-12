/**
 * Payment Receipt Email Template
 * Sent after payment is confirmed
 */

function paymentReceiptTemplate(data) {
  const {
    firstName,
    lastName,
    email,
    registrationId,
    transactionId,
    paymentDate,
    paymentMethod,
    registrationType,
    conferenceName,
    registrationFee,
    discountAmount = 0,
    totalAmount,
    billingAddress = null
  } = data;

  return {
    subject: `Payment Receipt: ${conferenceName} Registration`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Payment Received</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your registration is confirmed</p>
            </td>
          </tr>

          <!-- Receipt Message -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear ${firstName} ${lastName},
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for your payment! This email serves as your official receipt for your ${conferenceName} registration. Your payment has been successfully processed and your registration is now confirmed.
              </p>
            </td>
          </tr>

          <!-- Receipt Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; border: 2px solid #28a745;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #28a745; font-size: 20px; font-weight: 600;">Receipt Details</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Receipt Date:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${paymentDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Transaction ID:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${transactionId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Registration ID:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${registrationId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Payment Method:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${paymentMethod === 'zeffy' ? 'Credit/Debit Card' : 'Bank Transfer'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Breakdown -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 6px; border: 2px solid #e9ecef;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">Payment Breakdown</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Registration Type:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${registrationType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Conference:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${conferenceName}</td>
                      </tr>
                      <tr style="border-top: 1px solid #dee2e6;">
                        <td style="padding: 12px 0 8px; color: #666666; font-size: 14px;">Registration Fee:</td>
                        <td style="padding: 12px 0 8px; color: #333333; font-size: 14px; text-align: right;">$${registrationFee.toFixed(2)}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 8px 0; color: #28a745; font-size: 14px;">Discount Applied:</td>
                        <td style="padding: 8px 0; color: #28a745; font-size: 14px; text-align: right;">-$${discountAmount.toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      <tr style="border-top: 2px solid #dee2e6;">
                        <td style="padding: 12px 0 0; color: #333333; font-size: 18px; font-weight: 700;">Total Paid:</td>
                        <td style="padding: 12px 0 0; color: #28a745; font-size: 18px; font-weight: 700; text-align: right;">$${totalAmount.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${billingAddress ? `
          <!-- Billing Address -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <h3 style="margin: 0 0 8px; color: #666666; font-size: 14px; font-weight: 600;">Billing Address:</h3>
                    <p style="margin: 0; color: #333333; font-size: 13px; line-height: 1.6;">
                      ${billingAddress}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Tax Information -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <h3 style="margin: 0 0 8px; color: #856404; font-size: 14px; font-weight: 600;">Tax Information</h3>
                    <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                      The International Shellfish Restoration Society is a registered 501(c)(3) non-profit organization.<br>
                      <strong>Tax ID (EIN):</strong> 39-2829151<br>
                      <br>
                      This payment may be tax-deductible. Please consult with your tax advisor to determine if any portion of this registration fee qualifies as a charitable contribution.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Note -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; padding: 16px; background-color: #f8f9fa; border-radius: 6px;">
                <strong>Important:</strong> Please save this email for your records. This receipt can be used for reimbursement purposes and tax documentation. A downloadable PDF receipt is also available in your registration portal.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://isrs.org/conference/my-registration?id=${registrationId}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);">
                Download Full Receipt (PDF)
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
                Questions about your payment? Contact us at <a href="mailto:treasurer@shellfish-restoration.org" style="color: #2E5A8A; text-decoration: none;">treasurer@shellfish-restoration.org</a>
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
PAYMENT RECEIPT

Dear ${firstName} ${lastName},

Thank you for your payment! This email serves as your official receipt for your ${conferenceName} registration.

RECEIPT DETAILS
Receipt Date: ${paymentDate}
Transaction ID: ${transactionId}
Registration ID: ${registrationId}
Payment Method: ${paymentMethod === 'zeffy' ? 'Credit/Debit Card' : 'Bank Transfer'}

PAYMENT BREAKDOWN
Registration Type: ${registrationType}
Conference: ${conferenceName}
Registration Fee: $${registrationFee.toFixed(2)}
${discountAmount > 0 ? `Discount Applied: -$${discountAmount.toFixed(2)}\n` : ''}Total Paid: $${totalAmount.toFixed(2)}

${billingAddress ? `BILLING ADDRESS:\n${billingAddress}\n\n` : ''}

TAX INFORMATION
The International Shellfish Restoration Society is a registered 501(c)(3) non-profit organization.
Tax ID (EIN): 39-2829151

This payment may be tax-deductible. Please consult with your tax advisor.

IMPORTANT: Please save this email for your records. This receipt can be used for reimbursement purposes and tax documentation.

Download full receipt: https://isrs.org/conference/my-registration?id=${registrationId}

Questions? Contact treasurer@shellfish-restoration.org

---
International Shellfish Restoration Society
© 2025 ISRS. Tax ID: 39-2829151
    `.trim()
  };
}

module.exports = { paymentReceiptTemplate };
