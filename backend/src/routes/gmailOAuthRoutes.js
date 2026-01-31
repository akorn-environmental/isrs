const express = require('express');
const { google } = require('googleapis');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Store OAuth state tokens temporarily (CSRF protection)
const pendingOAuthStates = new Map();
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Get OAuth2 client
 */
function getOAuth2Client() {
  // Use backend URL for OAuth callback
  const backendUrl = process.env.BACKEND_URL ||
                     process.env.RENDER_EXTERNAL_URL ||
                     `http://localhost:${process.env.PORT || 3002}`;

  const redirectUri = `${backendUrl}/api/gmail-oauth/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

/**
 * GET /api/gmail-oauth/authorize
 * Redirect user to Google OAuth consent screen
 */
router.get('/authorize', requireAuth, (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();

    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');
    pendingOAuthStates.set(state, Date.now());

    // Clean up expired states
    for (const [key, timestamp] of pendingOAuthStates) {
      if (Date.now() - timestamp > OAUTH_STATE_TTL_MS) {
        pendingOAuthStates.delete(key);
      }
    }

    // Generate the url that will be used for the consent dialog
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get refresh token
      prompt: 'consent', // Force consent screen to get refresh token
      state, // CSRF protection
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
    });

    console.log('[Gmail OAuth] Authorization URL generated with CSRF state');

    // Return URL for user to visit
    res.json({
      success: true,
      authorizeUrl,
      message: 'Visit this URL to authorize Gmail access'
    });
  } catch (error) {
    console.error('[Gmail OAuth] Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL'
    });
  }
});

/**
 * GET /api/gmail-oauth/callback
 * Handle OAuth callback from Google
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code is required');
    }

    // Validate CSRF state token
    if (!state || !pendingOAuthStates.has(state)) {
      console.error('[Gmail OAuth] Invalid or missing OAuth state token - possible CSRF attack');
      return res.status(403).send('Invalid OAuth state token. Please try authorizing again.');
    }

    // Remove state token (one-time use)
    pendingOAuthStates.delete(state);

    const oauth2Client = getOAuth2Client();

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[Gmail OAuth] Successfully obtained tokens');

    // Get user email from tokens
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    // Store tokens in database
    await query(`
      INSERT INTO gmail_oauth_tokens (
        user_email, access_token, refresh_token, token_type, expiry_date, scope
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_email)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_type = EXCLUDED.token_type,
        expiry_date = EXCLUDED.expiry_date,
        scope = EXCLUDED.scope,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userEmail,
      tokens.access_token,
      tokens.refresh_token,
      tokens.token_type || 'Bearer',
      tokens.expiry_date,
      tokens.scope
    ]);

    console.log(`[Gmail OAuth] Stored tokens for ${userEmail}`);

    // Send success HTML page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gmail Authorization Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .success {
            color: #4CAF50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .info {
            color: #666;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="success">✓ Gmail Authorization Successful!</div>
        <p>Email: <strong>${userEmail}</strong></p>
        <p class="info">You can now close this window and return to the admin portal.</p>
        <p class="info">The Gmail poller will automatically start fetching emails.</p>
        <script>
          // Auto-close after 3 seconds
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('[Gmail OAuth] Callback error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Failed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .error {
            color: #f44336;
            font-size: 24px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error">✗ Authorization Failed</div>
        <p>${error.message}</p>
        <p>Please try again or contact support.</p>
      </body>
      </html>
    `);
  }
});

/**
 * GET /api/gmail-oauth/status
 * Check Gmail authorization status
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT user_email, expiry_date, scope, updated_at FROM gmail_oauth_tokens LIMIT 1');

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        authorized: false,
        message: 'No Gmail authorization found'
      });
    }

    const token = result.rows[0];
    const isExpired = token.expiry_date < Date.now();

    res.json({
      success: true,
      authorized: true,
      userEmail: token.user_email,
      isExpired,
      lastUpdated: token.updated_at,
      scope: token.scope
    });
  } catch (error) {
    console.error('[Gmail OAuth] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authorization status'
    });
  }
});

/**
 * POST /api/gmail-oauth/revoke
 * Revoke Gmail access and delete tokens
 */
router.post('/revoke', requireAuth, async (req, res) => {
  try {
    // Get tokens from database
    const result = await query('SELECT access_token FROM gmail_oauth_tokens LIMIT 1');

    if (result.rows.length > 0) {
      // Revoke token with Google
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({ access_token: result.rows[0].access_token });
      await oauth2Client.revokeCredentials();
    }

    // Delete from database
    await query('DELETE FROM gmail_oauth_tokens');

    console.log('[Gmail OAuth] Tokens revoked and deleted');

    res.json({
      success: true,
      message: 'Gmail authorization revoked successfully'
    });
  } catch (error) {
    console.error('[Gmail OAuth] Revoke error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke authorization'
    });
  }
});

/**
 * GET /api/gmail-oauth/test-token
 * Test token validity by making a simple Gmail API call
 */
router.get('/test-token', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM gmail_oauth_tokens LIMIT 1');

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: 'No tokens found'
      });
    }

    const tokens = result.rows[0];
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    // Try to get Gmail profile
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    res.json({
      success: true,
      valid: true,
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });
  } catch (error) {
    console.error('[Gmail OAuth] Token test failed:', error);
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

module.exports = router;
