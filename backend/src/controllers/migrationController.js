const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Run specific migration
exports.runMigration = asyncHandler(async (req, res) => {
  const { migrationNumber } = req.params;

  // Only allow in development mode (no auth required) or with admin privileges in production
  if (process.env.NODE_ENV === 'production' && !req.user?.is_super_admin) {
    return res.status(403).json({
      success: false,
      error: 'Migration endpoint only available to super admins in production'
    });
  }
  // In development, allow unauthenticated access for ease of migration running

  if (migrationNumber !== '041') {
    return res.status(400).json({
      success: false,
      error: 'Only migration 041 is available through this endpoint'
    });
  }

  const steps = [];

  try {
    // Check current column type
    const checkResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name LIKE '%presentation%'
      ORDER BY column_name
    `);

    steps.push({
      step: 'check_current_columns',
      status: 'success',
      data: checkResult.rows
    });

    // Check if migration already applied
    const hasArrayColumn = checkResult.rows.some(row =>
      row.column_name === 'icsr2024_presentation_titles' && row.data_type === 'ARRAY'
    );

    if (hasArrayColumn) {
      return res.json({
        success: true,
        message: 'Migration 041 already applied',
        steps
      });
    }

    // Count records to migrate
    const dataCheck = await query(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE icsr2024_presentation_title IS NOT NULL
      AND icsr2024_presentation_title != ''
    `);

    steps.push({
      step: 'count_records_to_migrate',
      status: 'success',
      count: parseInt(dataCheck.rows[0].count)
    });

    // Create new array column
    await query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2024_presentation_titles TEXT[]`);
    steps.push({ step: 'create_array_column', status: 'success' });

    // Migrate data
    const migrateResult = await query(`
      UPDATE contacts
      SET icsr2024_presentation_titles = ARRAY[icsr2024_presentation_title]
      WHERE icsr2024_presentation_title IS NOT NULL
      AND icsr2024_presentation_title != ''
    `);
    steps.push({
      step: 'migrate_data',
      status: 'success',
      rows_updated: migrateResult.rowCount
    });

    // Drop old column
    await query(`ALTER TABLE contacts DROP COLUMN IF EXISTS icsr2024_presentation_title`);
    steps.push({ step: 'drop_old_column', status: 'success' });

    // Add comment
    await query(`
      COMMENT ON COLUMN contacts.icsr2024_presentation_titles IS
      'Array of presentation titles for ICSR2024 - supports multiple presentations per contact'
    `);
    steps.push({ step: 'add_comment', status: 'success' });

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_icsr2024_presentations
      ON contacts USING GIN(icsr2024_presentation_titles)
    `);
    steps.push({ step: 'create_index', status: 'success' });

    res.json({
      success: true,
      message: 'Migration 041 completed successfully',
      steps
    });
  } catch (error) {
    steps.push({
      step: 'error',
      status: 'failed',
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message,
      steps
    });
  }
});

// Get migration status
exports.getMigrationStatus = asyncHandler(async (req, res) => {
  const checkResult = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'contacts'
    AND column_name LIKE '%presentation%'
    ORDER BY column_name
  `);

  const migration041Applied = checkResult.rows.some(row =>
    row.column_name === 'icsr2024_presentation_titles' && row.data_type === 'ARRAY'
  );

  res.json({
    success: true,
    migration_041_applied: migration041Applied,
    presentation_columns: checkResult.rows
  });
});

module.exports = exports;
