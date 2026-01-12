/**
 * Google reCAPTCHA Enterprise Validation Utility
 *
 * Validates reCAPTCHA tokens from the frontend to prevent bot submissions.
 * Supports both reCAPTCHA v3 (legacy) and reCAPTCHA Enterprise.
 *
 * Environment variables:
 * - RECAPTCHA_PROJECT_ID: Google Cloud project ID (for Enterprise)
 * - RECAPTCHA_API_KEY: Google Cloud API key (for Enterprise)
 * - RECAPTCHA_SITE_KEY: reCAPTCHA site key (for Enterprise)
 * - RECAPTCHA_SECRET_KEY: Secret key (for v3 legacy, optional)
 */

const https = require('https');

/**
 * Verify a reCAPTCHA Enterprise token
 * @param {string} token - The reCAPTCHA token from the frontend
 * @param {string} remoteip - Optional IP address of the user
 * @returns {Promise<Object>} Validation result with success status and score
 */
async function verifyRecaptchaEnterprise(token, remoteip = null) {
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const siteKey = process.env.RECAPTCHA_SITE_KEY;

  // If no token provided, return failure
  if (!token) {
    console.warn('⚠️ No reCAPTCHA token provided');
    return {
      success: false,
      score: 0,
      message: 'No reCAPTCHA token provided'
    };
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

    const requestBody = {
      event: {
        token: token,
        siteKey: siteKey,
        expectedAction: 'registration',
        ...(remoteip && { userIpAddress: remoteip })
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error('❌ reCAPTCHA Enterprise API error:', data.error);
      return {
        success: false,
        score: 0,
        message: 'reCAPTCHA verification error',
        error: data.error.message
      };
    }

    // Extract score and validity
    const score = data.riskAnalysis?.score || 0;
    const tokenValid = data.tokenProperties?.valid || false;
    const action = data.tokenProperties?.action || '';

    if (!tokenValid) {
      console.error('❌ reCAPTCHA token invalid:', data.tokenProperties);
      return {
        success: false,
        score: 0,
        message: 'Invalid reCAPTCHA token',
        reason: data.tokenProperties?.invalidReason
      };
    }

    // Check if action matches
    if (action !== 'registration') {
      console.warn(`⚠️ reCAPTCHA action mismatch: expected "registration", got "${action}"`);
    }

    // reCAPTCHA Enterprise returns a score from 0.0 to 1.0
    // 0.0 is very likely a bot, 1.0 is very likely a human
    const threshold = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

    if (score < threshold) {
      console.warn(`⚠️ reCAPTCHA score too low: ${score} (threshold: ${threshold})`);
      return {
        success: false,
        score: score,
        message: `reCAPTCHA score too low: ${score}`,
        reasons: data.riskAnalysis?.reasons
      };
    }

    console.log(`✅ reCAPTCHA Enterprise verified successfully (score: ${score})`);
    return {
      success: true,
      score: score,
      action: action,
      reasons: data.riskAnalysis?.reasons,
      createTime: data.tokenProperties?.createTime
    };

  } catch (error) {
    console.error('❌ reCAPTCHA Enterprise verification error:', error);
    return {
      success: false,
      score: 0,
      message: 'reCAPTCHA verification error',
      error: error.message
    };
  }
}

/**
 * Main verification function that routes to appropriate validator
 */
async function verifyRecaptcha(token, remoteip = null) {
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY;

  // Check if Enterprise is configured
  if (projectId && apiKey) {
    return verifyRecaptchaEnterprise(token, remoteip);
  }

  // If no configuration, skip validation (allow request)
  console.warn('⚠️ reCAPTCHA not configured - skipping validation');
  return {
    success: true,
    skipped: true,
    message: 'reCAPTCHA validation skipped - not configured'
  };
}

/**
 * Express middleware to verify reCAPTCHA tokens
 * Expects token in req.body.recaptcha_token
 *
 * SOFT-FAIL MODE: If verification fails due to API/config issues,
 * allow the request but log the failure. Only block if score is too low.
 */
async function recaptchaMiddleware(req, res, next) {
  const token = req.body.recaptcha_token;
  const remoteip = req.ip || req.connection.remoteAddress;

  const result = await verifyRecaptcha(token, remoteip);

  // If validation was skipped (no secret key), allow request
  if (result.skipped) {
    req.recaptchaSkipped = true;
    return next();
  }

  // If validation failed, check if it's a low score or an API error
  if (!result.success) {
    // If we got a score and it's too low, block the request (likely bot)
    if (result.score !== undefined && result.score < 0.3) {
      console.error('❌ Blocking request - reCAPTCHA score too low:', result.score);
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.',
        recaptcha_error: result.message
      });
    }

    // Otherwise, it's likely an API/config error - soft fail (allow request)
    console.warn('⚠️ reCAPTCHA verification failed but allowing request (soft-fail):', result.message);
    req.recaptchaFailed = true;
    req.recaptchaError = result.message;
    return next();
  }

  // Store result for use in route handler
  req.recaptchaScore = result.score;
  req.recaptchaVerified = true;

  next();
}

module.exports = {
  verifyRecaptcha,
  recaptchaMiddleware
};
