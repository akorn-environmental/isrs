/**
 * Error Logging Routes
 * Receives frontend errors and logs them to backend for visibility in Render logs
 */

const express = require('express');
const router = express.Router();

/**
 * POST /api/errors/log
 * Log a frontend error
 */
router.post('/log', (req, res) => {
  try {
    const {
      type,
      message,
      stack,
      source,
      line,
      column,
      url,
      userAgent,
      context,
      level,
      timestamp
    } = req.body;

    // Choose appropriate log method based on type
    const logMethod = type?.startsWith('CONSOLE_') ? 'log' : 'error';
    const icon = type?.startsWith('CONSOLE_LOG') ? '📝' :
                 type?.startsWith('CONSOLE_WARN') ? '⚠️' :
                 type?.startsWith('CONSOLE_ERROR') ? '❌' :
                 type?.startsWith('CONSOLE_INFO') ? 'ℹ️' :
                 type?.startsWith('CONSOLE_DEBUG') ? '🔍' :
                 '🚨';

    // Structured logging for easy parsing in Render logs
    console[logMethod](`${icon} FRONTEND ${type || 'ERROR'}:`, JSON.stringify({
      type: type || 'UNKNOWN',
      message: message || 'No message provided',
      stack: stack?.substring(0, 1000), // Truncate long stacks
      source,
      line,
      column,
      url,
      userAgent: userAgent?.substring(0, 200), // Truncate long user agents
      context,
      level,
      timestamp: timestamp || new Date().toISOString(),
      environment: process.env.NODE_ENV,
      // Add user info if authenticated
      user: req.user?.id || req.user?.email
    }, null, 2));

    // Optionally, you could save to database here
    // await db.errors.insert({ ...req.body, source: 'frontend' });

    res.status(200).json({
      logged: true,
      message: 'Error logged successfully'
    });
  } catch (error) {
    // Don't throw errors while logging errors
    console.error('Error logging endpoint failed:', error.message);
    res.status(500).json({
      logged: false,
      error: 'Failed to log error'
    });
  }
});

/**
 * GET /api/errors/test
 * Test endpoint to verify error logging is working
 */
router.get('/test', (req, res) => {
  // Intentionally throw an error to test backend error logging
  if (req.query.trigger === 'backend') {
    throw new Error('Test backend error - this should appear in Render logs');
  }

  res.json({
    message: 'Error logging endpoints are working',
    endpoints: {
      log: 'POST /api/errors/log - Log a frontend error',
      test: 'GET /api/errors/test?trigger=backend - Test backend error'
    }
  });
});

module.exports = router;
