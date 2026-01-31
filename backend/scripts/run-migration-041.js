const { query } = require('../src/config/database');

async function runMigration() {
  console.log('Starting migration 041: Update presentation titles to array...');

  try {
    // Check current column type
    const checkResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name LIKE '%presentation%'
      ORDER BY column_name
    `);

    console.log('\nCurrent presentation columns:');
    console.log(checkResult.rows);

    // Check if migration already applied
    const hasArrayColumn = checkResult.rows.some(row =>
      row.column_name === 'icsr2024_presentation_titles' && row.data_type === 'ARRAY'
    );

    if (hasArrayColumn) {
      console.log('\n✓ Migration already applied! Column icsr2024_presentation_titles already exists as array.');
      process.exit(0);
    }

    console.log('\nApplying migration...');

    // Step 1: Check if old column exists and has data
    const dataCheck = await query(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE icsr2024_presentation_title IS NOT NULL
      AND icsr2024_presentation_title != ''
    `);

    console.log(`Found ${dataCheck.rows[0].count} records with presentation data to migrate`);

    // Step 2: Create new array column first (can't alter type directly with data)
    await query(`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2024_presentation_titles TEXT[]`);
    console.log('✓ Created new array column');

    // Step 3: Migrate data from old column to new column
    await query(`
      UPDATE contacts
      SET icsr2024_presentation_titles = ARRAY[icsr2024_presentation_title]
      WHERE icsr2024_presentation_title IS NOT NULL
      AND icsr2024_presentation_title != ''
    `);
    console.log('✓ Migrated data to array column');

    // Step 4: Drop old column
    await query(`ALTER TABLE contacts DROP COLUMN IF EXISTS icsr2024_presentation_title`);
    console.log('✓ Dropped old column');

    // Step 5: Add comment
    await query(`
      COMMENT ON COLUMN contacts.icsr2024_presentation_titles IS
      'Array of presentation titles for ICSR2024 - supports multiple presentations per contact'
    `);
    console.log('✓ Added column comment');

    // Step 6: Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_icsr2024_presentations
      ON contacts USING GIN(icsr2024_presentation_titles)
    `);
    console.log('✓ Created GIN index');

    // Verify final state
    const finalCheck = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name = 'icsr2024_presentation_titles'
    `);

    console.log('\n✅ Migration completed successfully!');
    console.log('Final column state:', finalCheck.rows);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
