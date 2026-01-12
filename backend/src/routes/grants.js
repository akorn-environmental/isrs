const express = require('express');
const router = express.Router();
const grantsService = require('../services/grantsService');

// Middleware check - try to load auth, if not available, skip
let authenticateUser;
try {
  const auth = require('../middleware/auth');
  authenticateUser = auth.authenticateUser || ((req, res, next) => next());
} catch {
  authenticateUser = (req, res, next) => next();
}

router.post('/search', authenticateUser, async (req, res) => {
  try {
    const { keyword, fundingInstrument, eligibility, category, rows, offset } = req.body;
    const result = await grantsService.searchOpportunities({
      keyword, fundingInstrument, eligibility, category, rows, offset
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Grants search route error:', error);
    res.status(500).json({ error: 'Failed to search grants' });
  }
});

router.get('/:oppId', authenticateUser, async (req, res) => {
  try {
    const { oppId } = req.params;
    const result = await grantsService.fetchOpportunity(oppId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error('Grants fetch route error:', error);
    res.status(500).json({ error: 'Failed to fetch grant details' });
  }
});

router.get('/marine/all', authenticateUser, async (req, res) => {
  try {
    const result = await grantsService.searchMarineGrants();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Marine grants route error:', error);
    res.status(500).json({ error: 'Failed to fetch marine grants' });
  }
});

router.get('/category/:category', authenticateUser, async (req, res) => {
  try {
    const { category } = req.params;
    const result = await grantsService.searchByCategory(category);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Category grants route error:', error);
    res.status(500).json({ error: 'Failed to fetch grants by category' });
  }
});

module.exports = router;
