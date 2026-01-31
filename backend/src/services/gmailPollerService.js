const { google } = require('googleapis');
const { query } = require('../config/database');
const emailParsingService = require('./emailParsingService');

/**
 * Gmail Poller Service
 * Automatically polls Gmail for new emails and processes them
 */
class GmailPollerService {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
    this.isPaused = false;
    this.oauth2Client = null;
    this.gmail = null;

    // Configuration from environment variables
    this.config = {
      impersonateUser: process.env.GMAIL_IMPERSONATE_USER,
      label: process.env.GMAIL_LABEL || 'ISRS-Leads',
      pollIntervalMinutes: parseInt(process.env.GMAIL_POLL_INTERVAL_MINUTES) || 5,
      maxResults: parseInt(process.env.GMAIL_MAX_RESULTS) || 100,
      processLimit: parseInt(process.env.GMAIL_PROCESS_LIMIT) || 50,
      markAsRead: process.env.GMAIL_MARK_AS_READ !== 'false',
      autoCreateContacts: process.env.GMAIL_AUTO_CREATE_CONTACTS === 'true',
      validateToField: process.env.GMAIL_VALIDATE_TO_FIELD === 'true'
    };
  }

  /**
   * Initialize OAuth client and Gmail API
   */
  async initialize() {
    try {
      // Check for OAuth credentials
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.log('[Gmail Poller] OAuth credentials not configured - Gmail polling disabled');
        return false;
      }

      // Get stored tokens from database
      const result = await query('SELECT * FROM gmail_oauth_tokens LIMIT 1');

      if (result.rows.length === 0) {
        console.log('[Gmail Poller] No OAuth tokens found - please authorize Gmail access first');
        return false;
      }

      const tokens = result.rows[0];

      // Set up OAuth client
      const backendUrl = process.env.BACKEND_URL ||
                         process.env.RENDER_EXTERNAL_URL ||
                         `http://localhost:${process.env.PORT || 3002}`;
      const redirectUri = `${backendUrl}/api/gmail-oauth/callback`;

      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

      this.oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      });

      // Handle token refresh
      this.oauth2Client.on('tokens', async (newTokens) => {
        console.log('[Gmail Poller] Refreshed access token');
        if (newTokens.refresh_token) {
          await query(`
            UPDATE gmail_oauth_tokens
            SET access_token = $1, refresh_token = $2, expiry_date = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
          `, [newTokens.access_token, newTokens.refresh_token, newTokens.expiry_date]);
        } else {
          await query(`
            UPDATE gmail_oauth_tokens
            SET access_token = $1, expiry_date = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
          `, [newTokens.access_token, newTokens.expiry_date]);
        }
      });

      // Initialize Gmail API
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      console.log('[Gmail Poller] Initialized successfully for user:', tokens.user_email);
      return true;
    } catch (error) {
      console.error('[Gmail Poller] Initialization error:', error);
      return false;
    }
  }

  /**
   * Start polling Gmail
   */
  async startPolling() {
    if (this.isPolling) {
      console.log('[Gmail Poller] Already polling');
      return { success: false, message: 'Already polling' };
    }

    const initialized = await this.initialize();
    if (!initialized) {
      return { success: false, message: 'Failed to initialize Gmail poller' };
    }

    this.isPolling = true;
    this.isPaused = false;

    console.log(`[Gmail Poller] Starting - polling every ${this.config.pollIntervalMinutes} minutes`);
    console.log(`[Gmail Poller] Label: ${this.config.label}`);
    console.log(`[Gmail Poller] Auto-create contacts: ${this.config.autoCreateContacts}`);

    // Initial poll
    this.poll();

    // Set up interval
    this.pollInterval = setInterval(() => {
      if (!this.isPaused) {
        this.poll();
      }
    }, this.config.pollIntervalMinutes * 60 * 1000);

    return { success: true, message: 'Gmail polling started' };
  }

  /**
   * Stop polling Gmail
   */
  stopPolling() {
    if (!this.isPolling) {
      return { success: false, message: 'Not currently polling' };
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isPolling = false;
    this.isPaused = false;

    console.log('[Gmail Poller] Stopped polling');
    return { success: true, message: 'Gmail polling stopped' };
  }

  /**
   * Pause polling (for maintenance)
   */
  pause() {
    if (!this.isPolling) {
      return { success: false, message: 'Not currently polling' };
    }

    this.isPaused = true;
    console.log('[Gmail Poller] Paused');
    return { success: true, message: 'Gmail polling paused' };
  }

  /**
   * Resume polling
   */
  resume() {
    if (!this.isPolling) {
      return { success: false, message: 'Not currently polling' };
    }

    this.isPaused = false;
    console.log('[Gmail Poller] Resumed');
    return { success: true, message: 'Gmail polling resumed' };
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isPolling: this.isPolling,
      isPaused: this.isPaused,
      config: this.config
    };
  }

  /**
   * Main polling function
   */
  async poll() {
    try {
      console.log('[Gmail Poller] Starting poll cycle...');

      // Build Gmail search query
      let searchQuery = `label:${this.config.label}`;

      // Optional: filter by date (last 7 days)
      // searchQuery += ' newer_than:7d';

      // Get messages
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: this.config.maxResults
      });

      const messages = response.data.messages || [];
      console.log(`[Gmail Poller] Found ${messages.length} messages with label "${this.config.label}"`);

      if (messages.length === 0) {
        return;
      }

      let processedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Process messages (respecting process limit)
      const messagesToProcess = messages.slice(0, this.config.processLimit);

      for (const message of messagesToProcess) {
        try {
          // Check if already processed (duplicate detection)
          const existing = await query(
            'SELECT id FROM parsed_emails WHERE gmail_message_id = $1',
            [message.id]
          );

          if (existing.rows.length > 0) {
            skippedCount++;
            continue;
          }

          // Get full message details
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });

          // Extract email data
          const emailData = this.extractEmailData(fullMessage.data);

          // Check for duplicate by subject (within 6 hours)
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
          const duplicateSubject = await query(
            'SELECT id FROM parsed_emails WHERE subject = $1 AND email_date > $2',
            [emailData.subject, sixHoursAgo]
          );

          if (duplicateSubject.rows.length > 0) {
            console.log(`[Gmail Poller] Skipping duplicate subject: ${emailData.subject}`);
            skippedCount++;
            continue;
          }

          // Parse email using AI
          const parsed = await emailParsingService.parseEmail({
            subject: emailData.subject,
            fromEmail: emailData.fromEmail,
            fromName: emailData.fromName,
            toEmails: emailData.toEmails,
            ccEmails: emailData.ccEmails,
            receivedDate: emailData.date,
            emailBody: emailData.body,
            context: { isKnownContact: false }
          });

          // Save to database
          await emailParsingService.saveParsedEmail({
            ...parsed,
            gmail_message_id: message.id,
            gmail_thread_id: fullMessage.data.threadId,
            source: 'gmail_api',
            email_date: emailData.date
          });

          // Mark as read if configured
          if (this.config.markAsRead) {
            await this.gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: {
                removeLabelIds: ['UNREAD']
              }
            });
          }

          processedCount++;
          console.log(`[Gmail Poller] Processed: ${emailData.subject} from ${emailData.fromEmail}`);

          // Auto-create contacts if high confidence
          if (this.config.autoCreateContacts && parsed.confidence_score > 0.6) {
            // TODO: Implement auto-create logic
            console.log(`[Gmail Poller] Auto-create contacts (confidence: ${parsed.confidence_score})`);
          }

        } catch (error) {
          console.error(`[Gmail Poller] Error processing message ${message.id}:`, error);
          errorCount++;
        }
      }

      console.log(`[Gmail Poller] Poll complete - Processed: ${processedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('[Gmail Poller] Poll error:', error);
    }
  }

  /**
   * Extract email data from Gmail API response
   */
  extractEmailData(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract email addresses from header
    const extractEmails = (headerValue) => {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
      return headerValue.match(emailRegex) || [];
    };

    const from = getHeader('From');
    const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];

    return {
      subject: getHeader('Subject'),
      fromName: fromMatch[1].trim() || fromMatch[2],
      fromEmail: fromMatch[2],
      toEmails: extractEmails(getHeader('To')),
      ccEmails: extractEmails(getHeader('Cc')),
      date: new Date(parseInt(message.internalDate)),
      body: this.getEmailBody(message.payload),
      snippet: message.snippet
    };
  }

  /**
   * Get email body from message payload
   */
  getEmailBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body.data && !body) {
          // Use HTML if no plain text
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          // Recursive for nested parts
          body += this.getEmailBody(part);
        }
      }
    }

    return body;
  }
}

// Create singleton instance
const gmailPoller = new GmailPollerService();

module.exports = gmailPoller;
