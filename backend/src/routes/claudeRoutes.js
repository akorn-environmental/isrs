const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const {
  identifyDuplicates,
  enhanceContact,
  batchReviewContacts,
  suggestMerge,
  standardizeOrganizations,
} = require('../services/claude');
const {
  ALLOWED_CONTACT_COLUMNS,
  filterToAllowedColumns,
  isValidId
} = require('../utils/security');

/**
 * POST /api/claude/find-duplicates
 * Identify potential duplicate contacts using Claude AI
 * Body: { contact_ids: [id1, id2, ...] } or { limit: 100 } for batch analysis
 */
router.post('/find-duplicates', requireAuth, async (req, res) => {
  try {
    const { contact_ids, limit = 100 } = req.body;

    let result;
    if (contact_ids && contact_ids.length > 0) {
      // Analyze specific contacts
      result = await pool.query(
        `SELECT * FROM contacts WHERE id = ANY($1::int[])`,
        [contact_ids]
      );
    } else {
      // Analyze a batch of contacts
      result = await pool.query(
        `SELECT * FROM contacts
         ORDER BY updated_at DESC
         LIMIT $1`,
        [Math.min(limit, 500)] // Cap at 500 to avoid token limits
      );
    }

    const contacts = result.rows;

    if (contacts.length === 0) {
      return res.json({
        success: true,
        duplicates: [],
        message: 'No contacts found to analyze'
      });
    }

    const duplicateGroups = await identifyDuplicates(contacts);

    res.json({
      success: true,
      duplicates: duplicateGroups,
      analyzed_count: contacts.length,
    });
  } catch (error) {
    console.error('Find duplicates error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/claude/enhance-contact
 * Get AI suggestions for improving a contact record with optional web search
 * Body: { contact_id: 123, useWebSearch: true }
 */
router.post('/enhance-contact', requireAuth, async (req, res) => {
  try {
    const { contact_id, useWebSearch = true } = req.body;

    if (!contact_id) {
      return res.status(400).json({
        success: false,
        error: 'contact_id is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1',
      [contact_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
      });
    }

    const contact = result.rows[0];
    const enhancement = await enhanceContact(contact, { useWebSearch });

    res.json({
      success: true,
      contact,
      enhancement,
    });
  } catch (error) {
    console.error('Enhance contact error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/claude/review-contacts
 * Get AI review and recommendations for a batch of contacts
 * Body: { contact_ids: [id1, id2, ...], focus: 'quality' } or { limit: 100, focus: 'quality' }
 */
router.post('/review-contacts', requireAuth, async (req, res) => {
  try {
    const { contact_ids, limit = 100, focus = 'quality' } = req.body;

    let result;
    if (contact_ids && contact_ids.length > 0) {
      result = await pool.query(
        `SELECT * FROM contacts WHERE id = ANY($1::int[])`,
        [contact_ids]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM contacts
         ORDER BY updated_at DESC
         LIMIT $1`,
        [Math.min(limit, 200)]
      );
    }

    const contacts = result.rows;

    if (contacts.length === 0) {
      return res.json({
        success: true,
        review: null,
        message: 'No contacts found to review'
      });
    }

    const review = await batchReviewContacts(contacts, { focus, limit });

    res.json({
      success: true,
      review,
      analyzed_count: contacts.length,
    });
  } catch (error) {
    console.error('Review contacts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/claude/suggest-merge
 * Get AI suggestions for merging duplicate contacts
 * Body: { contact_ids: [id1, id2, ...] }
 */
router.post('/suggest-merge', requireAuth, async (req, res) => {
  try {
    const { contact_ids } = req.body;

    if (!contact_ids || contact_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 contact_ids are required',
      });
    }

    const result = await pool.query(
      `SELECT * FROM contacts WHERE id = ANY($1::int[])`,
      [contact_ids]
    );

    const contacts = result.rows;

    if (contacts.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Not enough contacts found',
      });
    }

    const mergeSuggestion = await suggestMerge(contacts);

    res.json({
      success: true,
      suggestion: mergeSuggestion,
      source_contacts: contacts,
    });
  } catch (error) {
    console.error('Suggest merge error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/claude/execute-merge
 * Execute a merge of duplicate contacts (keeps first, merges data, deletes others)
 * Body: { contact_ids: [id1, id2, ...], merged_data: {...} }
 */
router.post('/execute-merge', requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { contact_ids, merged_data } = req.body;

    if (!contact_ids || contact_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 contact_ids are required',
      });
    }

    await client.query('BEGIN');

    // Get contacts
    const result = await client.query(
      `SELECT * FROM contacts WHERE id = ANY($1::int[])`,
      [contact_ids]
    );

    if (result.rows.length < 2) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Not enough contacts found',
      });
    }

    // Keep the first contact and merge data into it
    const primaryId = contact_ids[0];
    const duplicateIds = contact_ids.slice(1);

    // SECURITY: Validate all IDs are valid integers
    if (!isValidId(primaryId) || !duplicateIds.every(id => isValidId(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact IDs provided',
      });
    }

    // SECURITY: Filter merged_data to only allowed columns to prevent SQL injection
    const safeMergedData = filterToAllowedColumns(merged_data, ALLOWED_CONTACT_COLUMNS);

    // Build update query for merged data - only use whitelisted columns
    const updates = [];
    const values = [primaryId];
    let paramCount = 2;

    for (const [key, value] of Object.entries(safeMergedData)) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    // Add merge note
    const mergeNote = `\n\n[Merged on ${new Date().toISOString()}] Combined data from ${duplicateIds.length} duplicate contact(s): IDs ${duplicateIds.join(', ')}`;
    updates.push(`notes = COALESCE(notes, '') || $${paramCount}`);
    values.push(mergeNote);
    paramCount++;

    updates.push('updated_at = NOW()');

    // Update primary contact
    await client.query(
      `UPDATE contacts SET ${updates.join(', ')} WHERE id = $1`,
      values
    );

    // Delete duplicate contacts
    await client.query(
      `DELETE FROM contacts WHERE id = ANY($1::int[])`,
      [duplicateIds]
    );

    await client.query('COMMIT');

    // Get updated primary contact
    const updatedResult = await pool.query(
      'SELECT * FROM contacts WHERE id = $1',
      [primaryId]
    );

    res.json({
      success: true,
      merged_contact: updatedResult.rows[0],
      deleted_ids: duplicateIds,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Execute merge error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * POST /api/claude/standardize-organizations
 * Get AI suggestions for standardizing organization names
 * Body: { organization_ids: [id1, id2, ...] } or { limit: 100 }
 */
router.post('/standardize-organizations', requireAuth, async (req, res) => {
  try {
    const { organization_ids, limit = 100 } = req.body;

    let result;
    if (organization_ids && organization_ids.length > 0) {
      result = await pool.query(
        `SELECT * FROM organizations WHERE id = ANY($1::int[])`,
        [organization_ids]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM organizations
         ORDER BY name ASC
         LIMIT $1`,
        [Math.min(limit, 500)]
      );
    }

    const organizations = result.rows;

    if (organizations.length === 0) {
      return res.json({
        success: true,
        suggestions: null,
        message: 'No organizations found to analyze'
      });
    }

    const suggestions = await standardizeOrganizations(organizations);

    res.json({
      success: true,
      suggestions,
      analyzed_count: organizations.length,
    });
  } catch (error) {
    console.error('Standardize organizations error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
