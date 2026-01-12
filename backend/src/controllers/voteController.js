const { asyncHandler } = require('../middleware/errorHandler');
const {
  processBoardVote,
  aiProcessBoardVote,
  getVoteHistory,
  exportVoteHistory
} = require('../services/voteService');

/**
 * POST /api/votes/process
 * Process board vote manually
 */
exports.processVote = asyncHandler(async (req, res) => {
  const result = await processBoardVote(req.body);
  res.json(result);
});

/**
 * POST /api/votes/ai-process
 * Process board vote with AI extraction
 */
exports.aiProcessVote = asyncHandler(async (req, res) => {
  const result = await aiProcessBoardVote(req.body);
  res.json(result);
});

/**
 * GET /api/votes/history
 * Get vote history
 */
exports.getHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 500;
  const result = await getVoteHistory(limit);
  res.json(result);
});

/**
 * GET /api/votes/export
 * Export vote history as CSV
 */
exports.exportHistory = asyncHandler(async (req, res) => {
  const result = await exportVoteHistory();

  if (result.success) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.csvContent);
  } else {
    res.status(500).json(result);
  }
});
