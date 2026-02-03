/**
 * S3 Email Service
 * Downloads and manages emails stored in S3 by AWS SES
 */

const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { query } = require('../config/database');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined // Use IAM role if no explicit credentials
});

const BUCKET_NAME = process.env.INBOUND_EMAIL_BUCKET || 'isrs-inbound-emails';

/**
 * Download email from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<string>} Raw email content
 */
async function downloadEmailFromS3(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    const response = await s3Client.send(command);

    // Convert stream to string
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const rawEmail = Buffer.concat(chunks).toString('utf-8');

    console.log(`[S3 Email] Downloaded email from S3: ${s3Key} (${rawEmail.length} bytes)`);

    return rawEmail;
  } catch (error) {
    console.error(`[S3 Email] Error downloading from S3:`, error);
    throw new Error(`Failed to download email from S3: ${error.message}`);
  }
}

/**
 * Delete email from S3 after processing
 * @param {string} s3Key - S3 object key
 */
async function deleteEmailFromS3(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key
    });

    await s3Client.send(command);
    console.log(`[S3 Email] Deleted email from S3: ${s3Key}`);
  } catch (error) {
    console.error(`[S3 Email] Error deleting from S3:`, error);
    // Don't throw - deletion is not critical (lifecycle rule will clean up)
  }
}

/**
 * Check if email has already been processed (duplicate detection)
 * @param {string} messageId - Email message ID
 * @returns {Promise<boolean>} True if already processed
 */
async function isEmailProcessed(messageId) {
  const result = await query(
    'SELECT id FROM parsed_emails WHERE metadata->>\'message_id\' = $1',
    [messageId]
  );
  return result.rows.length > 0;
}

/**
 * Mark email as processed
 * @param {string} s3Key - S3 object key
 * @param {string} messageId - Email message ID
 * @param {number} parsedEmailId - Parsed email database ID
 */
async function markEmailAsProcessed(s3Key, messageId, parsedEmailId) {
  await query(
    `INSERT INTO processed_s3_emails (s3_key, message_id, parsed_email_id, processed_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (s3_key) DO NOTHING`,
    [s3Key, messageId, parsedEmailId]
  );
}

/**
 * Get S3 bucket configuration
 * @returns {Object} Bucket configuration
 */
function getS3Config() {
  return {
    bucket: BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
    hasCredentials: !!process.env.AWS_ACCESS_KEY_ID
  };
}

module.exports = {
  downloadEmailFromS3,
  deleteEmailFromS3,
  isEmailProcessed,
  markEmailAsProcessed,
  getS3Config
};
