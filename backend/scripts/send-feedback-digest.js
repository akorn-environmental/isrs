/**
 * Send Daily Feedback Digest
 * Run this script daily via cron to send feedback digest emails
 *
 * Usage:
 *   node scripts/send-feedback-digest.js
 *   node scripts/send-feedback-digest.js 2025-01-15  # Specific date
 *
 * Cron example (daily at 9 AM):
 *   0 9 * * * cd /path/to/isrs-database-backend && node scripts/send-feedback-digest.js
 */

require('dotenv').config();
const { sendDailyDigest } = require('../src/services/feedbackDigestService');

async function main() {
  try {
    // Get date from command line argument or use yesterday
    const targetDate = process.argv[2] ? new Date(process.argv[2]) : null;

    console.log('🚀 Starting feedback digest process...\n');

    const result = await sendDailyDigest(targetDate);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Feedback digest process completed!');
    console.log('='.repeat(60));
    console.log(`Status: ${result.message}`);
    if (result.count) {
      console.log(`Feedback items: ${result.count}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Feedback digest process failed!');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

main();
