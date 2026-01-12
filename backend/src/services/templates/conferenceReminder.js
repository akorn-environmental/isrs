/**
 * Conference Reminder Email Template
 * Sent 1-2 weeks before the conference
 */

function conferenceReminderTemplate(data) {
  const {
    firstName,
    lastName,
    registrationId,
    conferenceName,
    conferenceDate,
    conferenceLocation,
    selectedSessions = [],
    hotelInfo = null,
    scheduleUrl,
    mapUrl
  } = data;

  return {
    subject: `Reminder: ${conferenceName} is Coming Up!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conference Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #5BC0BE 0%, #2E5A8A 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📅 Conference Reminder</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We're excited to see you soon!</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Dear ${firstName} ${lastName},
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>${conferenceName}</strong> is just around the corner! We're thrilled that you'll be joining us for this important gathering of shellfish restoration professionals from around the world.
              </p>
            </td>
          </tr>

          <!-- Conference Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); border-radius: 6px; border: 2px solid #2E5A8A;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">📍 Conference Details</h2>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">📅 Dates:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${conferenceDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">📍 Location:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${conferenceLocation}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">🎫 Registration ID:</td>
                        <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${registrationId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${selectedSessions.length > 0 ? `
          <!-- Your Schedule -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">📋 Your Registered Sessions</h2>
              ${selectedSessions.map(session => `
                <div style="margin-bottom: 12px; padding: 16px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #5BC0BE;">
                  <p style="margin: 0 0 4px; color: #2E5A8A; font-size: 15px; font-weight: 600;">${session.name}</p>
                  <p style="margin: 0; color: #666666; font-size: 13px;">${session.date} • ${session.time} • ${session.room || 'TBD'}</p>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          ${hotelInfo ? `
          <!-- Hotel Information -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <h3 style="margin: 0 0 8px; color: #856404; font-size: 16px; font-weight: 600;">🏨 Hotel Information</h3>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      ${hotelInfo}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Pre-Conference Checklist -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">✅ Pre-Conference Checklist</h2>
              <div style="padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Confirm your travel arrangements
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Book your accommodation (if not already done)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Review the full conference schedule
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Prepare business cards for networking
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Download the conference app (link in schedule)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                      ☐ Join the ISRS community on social media
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Important Links -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #2E5A8A; font-size: 20px; font-weight: 600;">🔗 Important Links</h2>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="${scheduleUrl}" style="color: #2E5A8A; text-decoration: none; font-size: 15px; font-weight: 600;">📅 View Full Schedule →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="https://isrs.org/conference/my-registration?id=${registrationId}" style="color: #2E5A8A; text-decoration: none; font-size: 15px; font-weight: 600;">🎫 My Registration →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="${mapUrl}" style="color: #2E5A8A; text-decoration: none; font-size: 15px; font-weight: 600;">🗺️ Venue Map & Directions →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="https://isrs.org/conference/travel-info" style="color: #2E5A8A; text-decoration: none; font-size: 15px; font-weight: 600;">✈️ Travel & Accommodation Info →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f8ff; border-radius: 6px; border-left: 4px solid #2E5A8A;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="margin: 0; color: #2E5A8A; font-size: 14px; line-height: 1.6;">
                      <strong>Need help or have questions?</strong><br>
                      Contact us at <a href="mailto:info@shellfish-restoration.org" style="color: #2E5A8A;">info@shellfish-restoration.org</a><br>
                      Or call: +1 (555) 123-4567
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="https://isrs.org/conference/my-registration?id=${registrationId}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(46, 90, 138, 0.3);">
                View My Registration
              </a>
              <p style="margin: 16px 0 0; color: #666666; font-size: 14px;">
                We can't wait to see you there!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
                <strong>International Shellfish Restoration Society</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 11px;">
                © 2025 International Shellfish Restoration Society
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
CONFERENCE REMINDER

Dear ${firstName} ${lastName},

${conferenceName} is just around the corner! We're thrilled that you'll be joining us.

CONFERENCE DETAILS
Dates: ${conferenceDate}
Location: ${conferenceLocation}
Registration ID: ${registrationId}

${selectedSessions.length > 0 ? `
YOUR REGISTERED SESSIONS:
${selectedSessions.map(s => `- ${s.name} (${s.date} • ${s.time})`).join('\n')}
` : ''}

${hotelInfo ? `HOTEL INFORMATION:\n${hotelInfo}\n\n` : ''}

PRE-CONFERENCE CHECKLIST:
☐ Confirm your travel arrangements
☐ Book your accommodation (if not already done)
☐ Review the full conference schedule
☐ Prepare business cards for networking
☐ Download the conference app
☐ Join the ISRS community on social media

IMPORTANT LINKS:
- View Full Schedule: ${scheduleUrl}
- My Registration: https://isrs.org/conference/my-registration?id=${registrationId}
- Venue Map & Directions: ${mapUrl}
- Travel & Accommodation Info: https://isrs.org/conference/travel-info

Need help or have questions?
Contact us at info@shellfish-restoration.org
Or call: +1 (555) 123-4567

We can't wait to see you there!

---
International Shellfish Restoration Society
© 2025 ISRS
    `.trim()
  };
}

module.exports = { conferenceReminderTemplate };
