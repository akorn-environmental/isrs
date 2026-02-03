/**
 * Weekly Digest Scheduler
 * Sends weekly email digest of parsed emails
 */

const cron = require('node-cron');
const { query } = require('../config/database');
const emailService = require('./emailService');

// Schedule: Every Monday at 9:00 AM
const SCHEDULE = '0 9 * * 1'; // Cron format: minute hour day month weekday

let scheduledTask = null;

/**
 * Generate weekly digest email content
 * @returns {Promise<Object>} Email content with subject and HTML
 */
async function generateWeeklyDigest() {
  try {
    console.log('[Weekly Digest] Generating weekly digest...');

    // Get stats for the past 7 days
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_parsed,
        COUNT(*) FILTER (WHERE overall_confidence >= 70) as high_confidence,
        COUNT(*) FILTER (WHERE overall_confidence < 70) as low_confidence,
        AVG(overall_confidence) as avg_confidence,
        SUM((parsed_data->'contacts')::jsonb::text::int) FILTER (WHERE jsonb_typeof(parsed_data->'contacts') = 'number') as total_contacts_extracted
      FROM parsed_emails
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    const stats = statsResult.rows[0];

    // Get recent parsed emails
    const emailsResult = await query(`
      SELECT
        id,
        subject,
        from_email,
        from_name,
        overall_confidence,
        created_at,
        parsed_data,
        review_status
      FROM parsed_emails
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const emails = emailsResult.rows;

    // Get recent notifications
    const notificationsResult = await query(`
      SELECT type, COUNT(*) as count
      FROM notifications
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY type
    `);

    const notifications = notificationsResult.rows;

    // Generate HTML email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
          }
          .stat-label {
            color: #6c757d;
            font-size: 14px;
            margin: 5px 0 0 0;
          }
          .section {
            background: white;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          .section h2 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .email-item {
            padding: 15px;
            margin-bottom: 15px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #28a745;
          }
          .email-item.low-confidence {
            border-left-color: #ffc107;
          }
          .email-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .email-subject {
            font-weight: bold;
            color: #2c3e50;
            font-size: 16px;
          }
          .confidence-badge {
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .confidence-badge.low {
            background: #ffc107;
          }
          .email-from {
            color: #6c757d;
            font-size: 14px;
          }
          .email-meta {
            display: flex;
            gap: 20px;
            margin-top: 8px;
            font-size: 13px;
            color: #6c757d;
          }
          .button {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 20px;
          }
          .button:hover {
            background: #2980b9;
          }
          .footer {
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Weekly Email Parsing Digest</h1>
          <p>Summary of emails parsed this week</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.total_parsed || 0}</div>
            <div class="stat-label">Emails Parsed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.high_confidence || 0}</div>
            <div class="stat-label">High Confidence</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.low_confidence || 0}</div>
            <div class="stat-label">Need Review</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.round(stats.avg_confidence || 0)}%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>

        ${emails.length > 0 ? `
        <div class="section">
          <h2>Recent Parsed Emails</h2>
          ${emails.map(email => {
            const confidence = email.overall_confidence || 0;
            const isLowConfidence = confidence < 70;
            const contactsCount = email.parsed_data?.contacts?.length || 0;
            const actionItemsCount = email.parsed_data?.action_items?.length || 0;

            return `
              <div class="email-item ${isLowConfidence ? 'low-confidence' : ''}">
                <div class="email-header">
                  <div class="email-subject">${email.subject || '(No Subject)'}</div>
                  <div class="confidence-badge ${isLowConfidence ? 'low' : ''}">${confidence}%</div>
                </div>
                <div class="email-from">
                  From: ${email.from_name || email.from_email}
                </div>
                <div class="email-meta">
                  <span>📅 ${new Date(email.created_at).toLocaleDateString()}</span>
                  <span>👥 ${contactsCount} contacts</span>
                  <span>✅ ${actionItemsCount} action items</span>
                  ${email.review_status ? `<span>📋 ${email.review_status}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ` : `
        <div class="section">
          <h2>Recent Parsed Emails</h2>
          <p style="color: #6c757d;">No emails were parsed this week.</p>
        </div>
        `}

        ${notifications.length > 0 ? `
        <div class="section">
          <h2>Notification Summary</h2>
          <ul style="list-style: none; padding: 0;">
            ${notifications.map(n => `
              <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                <strong>${n.count}</strong> ${n.type.replace(/_/g, ' ')}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="section" style="text-align: center;">
          <p>View detailed reports and manage parsed emails in your dashboard.</p>
          <a href="${process.env.FRONTEND_URL || 'https://your-crm.com'}/parsed-emails" class="button">
            View Dashboard →
          </a>
        </div>

        <div class="footer">
          <p>
            This is your automated weekly digest from the ISRS Email Parsing System.
            <br>
            To modify digest preferences, visit your settings or contact the administrator.
          </p>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `📊 Weekly Email Parsing Digest - ${stats.total_parsed || 0} emails parsed`,
      html: html
    };

  } catch (error) {
    console.error('[Weekly Digest] Error generating digest:', error);
    throw error;
  }
}

/**
 * Send weekly digest to all enabled recipients
 * @returns {Promise<Object>} Send results
 */
async function sendWeeklyDigest() {
  try {
    console.log('[Weekly Digest] Starting weekly digest send...');

    // Get all users with digest enabled
    const recipientsResult = await query(`
      SELECT user_email, send_day, send_time
      FROM weekly_digest_preferences
      WHERE enabled = true
    `);

    const recipients = recipientsResult.rows;

    if (recipients.length === 0) {
      console.log('[Weekly Digest] No recipients with digest enabled');
      return { success: true, sent: 0, message: 'No recipients' };
    }

    // Generate digest content
    const { subject, html } = await generateWeeklyDigest();

    // Send to each recipient
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await emailService.sendEmail({
          to: recipient.user_email,
          subject: subject,
          html: html
        });

        // Update last_sent_at
        await query(
          `UPDATE weekly_digest_preferences
           SET last_sent_at = NOW()
           WHERE user_email = $1`,
          [recipient.user_email]
        );

        sent++;
        console.log(`[Weekly Digest] Sent to ${recipient.user_email}`);
      } catch (error) {
        console.error(`[Weekly Digest] Failed to send to ${recipient.user_email}:`, error);
        failed++;
      }
    }

    console.log(`[Weekly Digest] Complete - sent: ${sent}, failed: ${failed}`);

    return {
      success: true,
      sent: sent,
      failed: failed,
      total: recipients.length
    };

  } catch (error) {
    console.error('[Weekly Digest] Error sending digest:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Start the weekly digest scheduler
 */
function startScheduler() {
  if (scheduledTask) {
    console.log('[Weekly Digest] Scheduler already running');
    return;
  }

  // Schedule for every Monday at 9:00 AM
  scheduledTask = cron.schedule(SCHEDULE, async () => {
    console.log('[Weekly Digest] Scheduled task triggered');
    await sendWeeklyDigest();
  });

  console.log('[Weekly Digest] Scheduler started - runs every Monday at 9:00 AM');
}

/**
 * Stop the weekly digest scheduler
 */
function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Weekly Digest] Scheduler stopped');
  }
}

/**
 * Manually trigger digest (for testing)
 * @returns {Promise<Object>} Send results
 */
async function triggerManualDigest() {
  console.log('[Weekly Digest] Manual trigger requested');
  return await sendWeeklyDigest();
}

module.exports = {
  startScheduler,
  stopScheduler,
  sendWeeklyDigest,
  triggerManualDigest,
  generateWeeklyDigest
};
