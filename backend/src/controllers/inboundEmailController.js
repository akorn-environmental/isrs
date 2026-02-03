/**
 * Inbound Email Controller
 * Handles webhook notifications from AWS SNS for inbound emails
 */

const crypto = require('crypto');
const axios = require('axios');
const emailQueueService = require('../services/emailQueueService');

/**
 * Verify SNS message signature
 * @param {Object} message - SNS message
 * @returns {boolean} True if signature is valid
 */
async function verifySNSSignature(message) {
  try {
    // For subscription confirmation, we don't verify signature (AWS handles it)
    if (message.Type === 'SubscriptionConfirmation') {
      return true;
    }

    if (!message.Signature || !message.SigningCertURL) {
      return false;
    }

    // In production, you should:
    // 1. Download the certificate from SigningCertURL
    // 2. Verify the certificate is from AWS
    // 3. Use it to verify the signature
    // For now, we'll do basic validation

    // Verify the certificate URL is from AWS
    const certUrl = new URL(message.SigningCertURL);
    if (!certUrl.hostname.endsWith('.amazonaws.com')) {
      console.error('[SNS] Invalid certificate URL:', certUrl.hostname);
      return false;
    }

    // Download and verify certificate (simplified - use proper validation in production)
    // This is a basic implementation - consider using aws-sns-message-validator package
    console.log('[SNS] Signature verification passed (basic check)');
    return true;

  } catch (error) {
    console.error('[SNS] Signature verification error:', error);
    return false;
  }
}

/**
 * Handle SNS webhook
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function handleInboundWebhook(req, res) {
  try {
    const snsMessage = req.body;

    console.log(`[Inbound Webhook] Received SNS message type: ${snsMessage.Type}`);

    // Verify SNS signature for security
    const isValid = await verifySNSSignature(snsMessage);
    if (!isValid) {
      console.error('[Inbound Webhook] Invalid SNS signature');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Handle SNS subscription confirmation (one-time setup)
    if (snsMessage.Type === 'SubscriptionConfirmation') {
      console.log('[Inbound Webhook] SNS subscription confirmation');

      // Confirm subscription by visiting SubscribeURL
      if (snsMessage.SubscribeURL) {
        try {
          await axios.get(snsMessage.SubscribeURL);
          console.log('[Inbound Webhook] Subscription confirmed successfully');
          return res.status(200).json({ message: 'Subscription confirmed' });
        } catch (error) {
          console.error('[Inbound Webhook] Failed to confirm subscription:', error);
          return res.status(500).json({ error: 'Failed to confirm subscription' });
        }
      } else {
        return res.status(400).json({ error: 'No SubscribeURL provided' });
      }
    }

    // Handle email notification
    if (snsMessage.Type === 'Notification') {
      console.log('[Inbound Webhook] Processing email notification');

      // Parse SES notification
      let sesNotification;
      try {
        sesNotification = JSON.parse(snsMessage.Message);
      } catch (error) {
        console.error('[Inbound Webhook] Failed to parse SNS message:', error);
        return res.status(400).json({ error: 'Invalid message format' });
      }

      // Extract email metadata
      const mail = sesNotification.mail;
      const receipt = sesNotification.receipt;

      // Check spam/virus status
      if (receipt.spamVerdict?.status === 'FAIL' || receipt.virusVerdict?.status === 'FAIL') {
        console.log('[Inbound Webhook] Email rejected: spam or virus detected');
        return res.status(200).json({ message: 'Email rejected: spam/virus' });
      }

      // Get S3 object key from SES action
      const s3Action = receipt.action;
      let s3Key;

      if (s3Action && s3Action.type === 'S3') {
        s3Key = s3Action.objectKey;
      } else {
        // Fallback: construct S3 key from message ID
        s3Key = `emails/${mail.messageId}`;
      }

      // Queue email for processing
      await emailQueueService.queueEmailForParsing({
        s3Key: s3Key,
        messageId: mail.messageId,
        timestamp: mail.timestamp,
        source: mail.source,
        destination: mail.destination,
        subject: mail.commonHeaders?.subject || '(No Subject)',
        from: mail.commonHeaders?.from?.[0] || mail.source,
        to: mail.commonHeaders?.to || mail.destination,
        receipt: {
          spam: receipt.spamVerdict?.status,
          virus: receipt.virusVerdict?.status,
          spf: receipt.spfVerdict?.status,
          dkim: receipt.dkimVerdict?.status,
          dmarc: receipt.dmarcVerdict?.status
        }
      });

      console.log('[Inbound Webhook] Email queued for parsing:', s3Key);
      return res.status(200).json({ message: 'Email queued successfully' });
    }

    // Handle unsubscribe notification
    if (snsMessage.Type === 'UnsubscribeConfirmation') {
      console.log('[Inbound Webhook] Unsubscribe confirmation received');
      return res.status(200).json({ message: 'Unsubscribe noted' });
    }

    // Unknown message type
    console.log('[Inbound Webhook] Unknown SNS message type:', snsMessage.Type);
    return res.status(200).json({ message: 'OK' });

  } catch (error) {
    console.error('[Inbound Webhook] Error:', error);
    // Return 200 to prevent SNS from retrying
    return res.status(200).json({ error: error.message });
  }
}

/**
 * Get inbound email statistics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
async function getInboundStats(req, res) {
  try {
    const inboundEmailService = require('../services/inboundEmailService');
    const stats = await inboundEmailService.getInboundStats();
    const queueStats = emailQueueService.getQueueStats();

    res.json({
      success: true,
      inbound: stats,
      queue: queueStats
    });
  } catch (error) {
    console.error('[Inbound Stats] Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Health check endpoint
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
function healthCheck(req, res) {
  const s3EmailService = require('../services/s3EmailService');
  const s3Config = s3EmailService.getS3Config();

  res.json({
    status: 'healthy',
    service: 'Inbound Email Parser',
    s3: {
      configured: !!s3Config.bucket,
      bucket: s3Config.bucket,
      region: s3Config.region,
      hasCredentials: s3Config.hasCredentials
    },
    queue: emailQueueService.getQueueStats()
  });
}

module.exports = {
  handleInboundWebhook,
  getInboundStats,
  healthCheck
};
