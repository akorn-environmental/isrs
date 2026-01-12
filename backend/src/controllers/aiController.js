const { asyncHandler } = require('../middleware/errorHandler');
const aiGrantService = require('../services/aiGrantService');
const aiInsightsService = require('../services/aiInsightsService');

// Grant Writing endpoints
exports.generateGrantSection = asyncHandler(async (req, res) => {
  const { prospectId, section, customPrompt, context } = req.body;
  
  if (!prospectId || !section) {
    return res.status(400).json({ success: false, error: 'Prospect ID and section required' });
  }
  
  const result = await aiGrantService.generateGrantSection({
    prospectId,
    section,
    customPrompt,
    context
  });
  
  res.json({ success: true, ...result });
});

exports.createGrantDraft = asyncHandler(async (req, res) => {
  const { prospectId, title, grantType, fundingAmount, deadline, sections } = req.body;
  const createdBy = req.user?.email || 'system';
  
  const draft = await aiGrantService.createGrantDraft({
    prospectId,
    title,
    grantType,
    fundingAmount,
    deadline,
    sections,
    createdBy
  });
  
  res.json({ success: true, draft });
});

exports.updateGrantDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const editedBy = req.user?.email || 'system';
  
  const draft = await aiGrantService.updateGrantDraft(parseInt(id), updates, editedBy);
  
  res.json({ success: true, draft });
});

exports.getGrantDrafts = asyncHandler(async (req, res) => {
  const { prospectId } = req.params;
  
  const drafts = await aiGrantService.getGrantDrafts(parseInt(prospectId));
  
  res.json({ success: true, drafts });
});

exports.rateGeneration = asyncHandler(async (req, res) => {
  const { generationId } = req.params;
  const { rating, feedback, accepted } = req.body;
  
  await aiGrantService.rateGeneration(parseInt(generationId), rating, feedback, accepted);
  
  res.json({ success: true });
});

// AI Insights endpoints
exports.generateFundingInsights = asyncHandler(async (req, res) => {
  const insights = await aiInsightsService.generateFundingInsights();
  
  res.json({ success: true, insights });
});

exports.assessDataQuality = asyncHandler(async (req, res) => {
  const { tableName, sampleSize } = req.body;
  
  if (!tableName) {
    return res.status(400).json({ success: false, error: 'Table name required' });
  }
  
  const assessment = await aiInsightsService.assessDataQuality(tableName, sampleSize);
  
  res.json({ success: true, assessment });
});

exports.generateTrendAnalysis = asyncHandler(async (req, res) => {
  const { analysisType, timeframe } = req.body;
  
  if (!analysisType) {
    return res.status(400).json({ success: false, error: 'Analysis type required' });
  }
  
  const result = await aiInsightsService.generateTrendAnalysis(analysisType, timeframe);
  
  res.json({ success: true, ...result });
});

exports.suggestActions = asyncHandler(async (req, res) => {
  const result = await aiInsightsService.suggestActions();
  
  res.json({ success: true, ...result });
});

exports.getInsights = asyncHandler(async (req, res) => {
  const { category, limit } = req.query;
  
  const insights = await aiInsightsService.getActiveInsights(category, parseInt(limit) || 10);
  
  res.json({ success: true, insights });
});

exports.getSuggestedActions = asyncHandler(async (req, res) => {
  const { status, limit } = req.query;

  const actions = await aiInsightsService.getSuggestedActions(status || 'suggested', parseInt(limit) || 10);

  res.json({ success: true, actions });
});

exports.queryDatabase = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  const response = await aiInsightsService.queryDatabase(query);

  res.json({ success: true, response });
});
