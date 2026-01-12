const { asyncHandler } = require('../middleware/errorHandler');
const { getUserPermissions } = require('../middleware/auth');

/**
 * GET /api/users/permissions
 * Get user permissions by email
 */
exports.getPermissions = asyncHandler(async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email parameter required'
    });
  }

  const permissions = getUserPermissions(email);

  res.json({
    success: true,
    email: email.toLowerCase().trim(),
    ...permissions
  });
});
