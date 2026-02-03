/**
 * Email Queue Service
 * Manages asynchronous processing of inbound emails
 */

const s3EmailService = require('./s3EmailService');
const inboundEmailService = require('./inboundEmailService');
const notificationService = require('./notificationService');

// Simple in-memory queue (consider Redis/Bull for production)
const emailQueue = [];
let isProcessing = false;
let processedCount = 0;
let failedCount = 0;

/**
 * Add email to processing queue
 * @param {Object} emailData - Email metadata from SNS
 */
async function queueEmailForParsing(emailData) {
  emailQueue.push({
    ...emailData,
    queuedAt: new Date(),
    attempts: 0
  });

  console.log(`[Email Queue] Email queued: ${emailData.s3Key} (queue size: ${emailQueue.length})`);

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }
}

/**
 * Process emails from queue
 */
async function processQueue() {
  if (isProcessing) {
    console.log('[Email Queue] Already processing');
    return;
  }

  isProcessing = true;
  console.log('[Email Queue] Starting queue processing...');

  while (emailQueue.length > 0) {
    const emailData = emailQueue.shift();

    try {
      await processEmail(emailData);
      processedCount++;
    } catch (error) {
      console.error('[Email Queue] Processing failed:', error);
      failedCount++;

      // Retry logic
      if (emailData.attempts < 3) {
        emailData.attempts++;
        emailQueue.push(emailData); // Re-queue for retry
        console.log(`[Email Queue] Re-queued for retry (attempt ${emailData.attempts}/3)`);
      } else {
        console.error(`[Email Queue] Max retries reached for ${emailData.s3Key}`);
        await handleProcessingError(emailData, error);
      }
    }

    // Small delay between emails to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessing = false;
  console.log(`[Email Queue] Queue processing complete (processed: ${processedCount}, failed: ${failedCount})`);
}

/**
 * Process a single email
 * @param {Object} emailData - Email metadata
 */
async function processEmail(emailData) {
  console.log(`[Email Queue] Processing email: ${emailData.s3Key}`);

  // Check if already processed (duplicate detection)
  if (emailData.messageId) {
    const alreadyProcessed = await s3EmailService.isEmailProcessed(emailData.messageId);
    if (alreadyProcessed) {
      console.log(`[Email Queue] Email already processed: ${emailData.messageId}`);
      return;
    }
  }

  // Download raw email from S3
  const rawEmail = await s3EmailService.downloadEmailFromS3(emailData.s3Key);

  // Parse email with AI
  const result = await inboundEmailService.parseInboundEmail(rawEmail);

  // Mark as processed
  if (emailData.messageId) {
    await s3EmailService.markEmailAsProcessed(
      emailData.s3Key,
      emailData.messageId,
      result.parsedEmailId
    );
  }

  // Create dashboard notification
  await notificationService.createNotification({
    type: result.requiresReview ? 'email_review_needed' : 'email_parsed',
    title: result.requiresReview
      ? `Review Needed: ${emailData.subject || 'Email'}`
      : `Email Parsed: ${emailData.subject || 'Email'}`,
    message: `Confidence: ${result.confidence}%, Contacts: ${result.contacts}, Attachments: ${result.attachments}`,
    data: {
      parsedEmailId: result.parsedEmailId,
      confidence: result.confidence,
      contacts: result.contacts,
      attachments: result.attachments,
      actionItems: result.actionItems,
      requiresReview: result.requiresReview
    }
  });

  console.log(`[Email Queue] Email processed successfully: ${result.parsedEmailId} (confidence: ${result.confidence}%)`);

  // Optional: Delete from S3 after successful processing
  // await s3EmailService.deleteEmailFromS3(emailData.s3Key);
}

/**
 * Handle processing error
 * @param {Object} emailData - Email metadata
 * @param {Error} error - Error that occurred
 */
async function handleProcessingError(emailData, error) {
  console.error(`[Email Queue] Failed to process email after ${emailData.attempts} attempts:`, error);

  // Create error notification
  await notificationService.createNotification({
    type: 'email_parse_error',
    title: 'Email Parsing Failed',
    message: `Failed to parse email: ${emailData.subject || 'Unknown'}. Error: ${error.message}`,
    data: {
      s3Key: emailData.s3Key,
      error: error.message,
      attempts: emailData.attempts
    }
  });

  // Could also send email alert to admin
}

/**
 * Get queue statistics
 * @returns {Object} Queue stats
 */
function getQueueStats() {
  return {
    queueSize: emailQueue.length,
    isProcessing,
    processedCount,
    failedCount,
    successRate: processedCount > 0 ? ((processedCount / (processedCount + failedCount)) * 100).toFixed(2) : 0
  };
}

/**
 * Clear queue (for testing/debugging)
 */
function clearQueue() {
  emailQueue.length = 0;
  isProcessing = false;
  console.log('[Email Queue] Queue cleared');
}

module.exports = {
  queueEmailForParsing,
  processQueue,
  getQueueStats,
  clearQueue
};
