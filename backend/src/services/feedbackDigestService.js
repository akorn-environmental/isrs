/**
 * Feedback Digest Service
 * Sends daily email digest of user feedback to admin
 */

const { pool } = require('../config/database');
const { sendEmail } = require('./emailService');

const ADMIN_EMAIL = process.env.FEEDBACK_ADMIN_EMAIL || 'aaron.kornbluth@gmail.com';

/**
 * Generate and send daily feedback digest
 */
async function sendDailyDigest(targetDate = null) {
  try {
    // Use yesterday's date if no date provided
    const date = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    console.log(`\n📊 Generating feedback digest for ${dateStr}...`);

    // Check if digest already sent for this date
    const existingDigest = await pool.query(
      'SELECT id FROM feedback_digest_log WHERE digest_date = $1',
      [dateStr]
    );

    if (existingDigest.rows.length > 0) {
      console.log(`⏭️  Digest already sent for ${dateStr}`);
      return { success: true, message: 'Digest already sent for this date' };
    }

    // Get feedback for the date
    const feedbackResult = await pool.query(`
      SELECT
        id,
        user_email,
        user_name,
        page_url,
        page_title,
        component_name,
        feedback_type,
        rating,
        subject,
        message,
        is_admin_portal,
        created_at,
        browser_info,
        user_agent
      FROM feedback_submissions
      WHERE DATE(created_at) = $1
      ORDER BY created_at DESC
    `, [dateStr]);

    const feedbackItems = feedbackResult.rows;

    if (feedbackItems.length === 0) {
      console.log(`📭 No feedback received on ${dateStr}`);
      // Still log that we checked
      await pool.query(`
        INSERT INTO feedback_digest_log (digest_date, feedback_count, sent_to, feedback_ids)
        VALUES ($1, 0, $2, ARRAY[]::UUID[])
      `, [dateStr, ADMIN_EMAIL]);
      return { success: true, message: 'No feedback to digest' };
    }

    // Generate email content
    const emailContent = generateDigestEmail(feedbackItems, date);

    // Send email
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: emailContent.subject,
      body: emailContent.html
    });

    // Log digest
    const feedbackIds = feedbackItems.map(f => f.id);
    await pool.query(`
      INSERT INTO feedback_digest_log (digest_date, feedback_count, sent_to, feedback_ids)
      VALUES ($1, $2, $3, $4)
    `, [dateStr, feedbackItems.length, ADMIN_EMAIL, feedbackIds]);

    console.log(`✅ Digest sent to ${ADMIN_EMAIL} with ${feedbackItems.length} feedback items`);

    return {
      success: true,
      message: `Digest sent successfully`,
      count: feedbackItems.length
    };

  } catch (error) {
    console.error('Error sending feedback digest:', error);
    throw error;
  }
}

/**
 * Generate HTML email for digest
 */
function generateDigestEmail(feedbackItems, date) {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate statistics
  const stats = {
    total: feedbackItems.length,
    bugs: feedbackItems.filter(f => f.feedback_type === 'bug').length,
    features: feedbackItems.filter(f => f.feedback_type === 'feature_request').length,
    improvements: feedbackItems.filter(f => f.feedback_type === 'improvement').length,
    general: feedbackItems.filter(f => f.feedback_type === 'general').length,
    adminPortal: feedbackItems.filter(f => f.is_admin_portal).length,
    publicSite: feedbackItems.filter(f => !f.is_admin_portal).length,
    avgRating: feedbackItems.filter(f => f.rating).length > 0
      ? (feedbackItems.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackItems.filter(f => f.rating).length).toFixed(1)
      : 'N/A',
    uniqueUsers: new Set(feedbackItems.filter(f => f.user_email).map(f => f.user_email)).size
  };

  const subject = `📊 ISRS Feedback Digest: ${dateStr} (${stats.total} items)`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">📊 Daily Feedback Digest</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${dateStr}</p>
            </td>
          </tr>

          <!-- Statistics -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="margin: 0 0 20px; color: #2E5A8A; font-size: 20px;">Summary</h2>
              <table role="presentation" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; background: #f8f9fa; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Total Feedback</div>
                        <div style="font-size: 28px; font-weight: 700; color: #2E5A8A;">${stats.total}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Unique Users</div>
                        <div style="font-size: 24px; font-weight: 600; color: #5BC0BE;">${stats.uniqueUsers}</div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Avg Rating</div>
                        <div style="font-size: 24px; font-weight: 600; color: #ffc107;">${stats.avgRating}⭐</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px;">
                <div style="padding: 16px; background: #ffebee; border-radius: 6px; border-left: 4px solid #d32f2f;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 4px;">🐛 Bug Reports</div>
                  <div style="font-size: 24px; font-weight: 700; color: #d32f2f;">${stats.bugs}</div>
                </div>
                <div style="padding: 16px; background: #e3f2fd; border-radius: 6px; border-left: 4px solid #1976d2;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 4px;">✨ Feature Requests</div>
                  <div style="font-size: 24px; font-weight: 700; color: #1976d2;">${stats.features}</div>
                </div>
                <div style="padding: 16px; background: #e8f5e9; border-radius: 6px; border-left: 4px solid #388e3c;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 4px;">📈 Improvements</div>
                  <div style="font-size: 24px; font-weight: 700; color: #388e3c;">${stats.improvements}</div>
                </div>
                <div style="padding: 16px; background: #f3e5f5; border-radius: 6px; border-left: 4px solid #7b1fa2;">
                  <div style="font-size: 13px; color: #666; margin-bottom: 4px;">💬 General</div>
                  <div style="font-size: 24px; font-weight: 700; color: #7b1fa2;">${stats.general}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px;">
                <div style="padding: 12px; background: #fff3e0; border-radius: 6px;">
                  <div style="font-size: 13px; color: #666;">🌐 Public Site</div>
                  <div style="font-size: 20px; font-weight: 600; color: #f57c00;">${stats.publicSite}</div>
                </div>
                <div style="padding: 12px; background: #fce4ec; border-radius: 6px;">
                  <div style="font-size: 13px; color: #666;">🔐 Admin Portal</div>
                  <div style="font-size: 20px; font-weight: 600; color: #c2185b;">${stats.adminPortal}</div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Feedback Items -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #2E5A8A; font-size: 20px;">Feedback Details</h2>
              ${feedbackItems.map((item, index) => `
                <div style="margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid ${getTypeColor(item.feedback_type)};">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <div>
                      <span style="display: inline-block; padding: 4px 12px; background: ${getTypeBg(item.feedback_type)}; color: ${getTypeColor(item.feedback_type)}; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${item.feedback_type.replace('_', ' ')}
                      </span>
                      ${item.is_admin_portal ? '<span style="margin-left: 8px; display: inline-block; padding: 4px 12px; background: #fce4ec; color: #c2185b; border-radius: 12px; font-size: 12px; font-weight: 600;">ADMIN</span>' : ''}
                      ${item.rating ? `<span style="margin-left: 8px; font-size: 14px;">${'⭐'.repeat(item.rating)}</span>` : ''}
                    </div>
                    <div style="font-size: 13px; color: #666;">
                      ${new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  ${item.subject ? `<div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 8px;">${escapeHtml(item.subject)}</div>` : ''}

                  <div style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 12px; white-space: pre-wrap;">${escapeHtml(item.message)}</div>

                  <div style="font-size: 13px; color: #666; padding-top: 12px; border-top: 1px solid #dee2e6;">
                    ${item.user_name || item.user_email ? `<div style="margin-bottom: 4px;"><strong>User:</strong> ${item.user_name ? escapeHtml(item.user_name) : ''} ${item.user_email ? `&lt;${item.user_email}&gt;` : ''}</div>` : '<div style="margin-bottom: 4px;"><strong>User:</strong> Anonymous</div>'}
                    ${item.component_name ? `<div style="margin-bottom: 4px;"><strong>Component:</strong> ${escapeHtml(item.component_name)}</div>` : ''}
                    <div style="margin-bottom: 4px;"><strong>Page:</strong> ${item.page_title ? escapeHtml(item.page_title) : 'Untitled'}</div>
                    <div style="font-size: 12px; color: #999; margin-top: 8px; word-break: break-all;">${item.page_url}</div>
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 13px;">
                <strong>ISRS Feedback System</strong> | Daily Digest
              </p>
              <p style="margin: 8px 0 0; color: #999999; font-size: 12px;">
                View all feedback in your admin dashboard
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * Helper functions for email formatting
 */
function getTypeColor(type) {
  const colors = {
    bug: '#d32f2f',
    feature_request: '#1976d2',
    improvement: '#388e3c',
    general: '#7b1fa2'
  };
  return colors[type] || '#666666';
}

function getTypeBg(type) {
  const backgrounds = {
    bug: '#ffebee',
    feature_request: '#e3f2fd',
    improvement: '#e8f5e9',
    general: '#f3e5f5'
  };
  return backgrounds[type] || '#f5f5f5';
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  sendDailyDigest
};
