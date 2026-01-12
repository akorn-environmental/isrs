/**
 * Error Reporter - Captures frontend errors and sends them to backend for logging
 * This allows Claude to see frontend errors via Render logs
 *
 * Usage: Include this script in your HTML before other scripts:
 * <script src="/js/errorReporter.js"></script>
 */

(function() {
  'use strict';

  const ErrorReporter = {
    API_ENDPOINT: '/api/errors/log',
    initialized: false,

    init: function() {
      if (this.initialized) return;
      this.initialized = true;

      console.log('✅ Error reporting initialized - Frontend errors will be logged to backend');

      // Catch all unhandled JavaScript errors
      window.onerror = (message, source, lineno, colno, error) => {
        this.logError({
          type: 'JS_ERROR',
          message: message?.toString() || 'Unknown error',
          source: source,
          line: lineno,
          column: colno,
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });

        // Don't suppress default error handling
        return false;
      };

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'PROMISE_REJECTION',
          message: event.reason?.message || event.reason?.toString() || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      });

      console.log('🔍 Error capture hooks installed');
    },

    logError: function(errorData) {
      // Log to console for development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('🚨 FRONTEND ERROR:', errorData);
      }

      // Send to backend (fire and forget - don't block on error logging)
      try {
        fetch(this.API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
          // Don't wait for response
          keepalive: true
        }).catch(err => {
          // Silently fail if logging endpoint is unavailable
          console.warn('Failed to send error to backend:', err.message);
        });
      } catch (err) {
        // Silently fail - don't throw errors while logging errors
        console.warn('Error reporter failed:', err.message);
      }
    },

    /**
     * Manually log an error (useful for try/catch blocks)
     */
    captureException: function(error, context) {
      this.logError({
        type: 'MANUAL_CAPTURE',
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        context: context || {},
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Log a custom message (non-error)
     */
    captureMessage: function(message, level, context) {
      this.logError({
        type: 'MESSAGE',
        level: level || 'info',
        message: message,
        context: context || {},
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Initialize immediately
  ErrorReporter.init();

  // Export for manual usage
  window.ErrorReporter = ErrorReporter;
})();
