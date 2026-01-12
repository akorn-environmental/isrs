/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Structured error logging for easy parsing in Render logs
  console.error('🚨 BACKEND ERROR:', JSON.stringify({
    type: 'BACKEND_ERROR',
    message: err.message || 'Internal server error',
    stack: err.stack?.substring(0, 1000), // Truncate long stacks
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?.id || req.user?.email,
    status: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }, null, 2));

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async route wrapper to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  asyncHandler
};
