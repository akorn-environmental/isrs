require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findAdminTables() {
  const client = await pool.connect();
  try {
    console.log('Looking for admin-related tables...\n');

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND (table_name LIKE '%admin%' OR table_name LIKE '%user%' OR table_name LIKE '%auth%')
      ORDER BY table_name
    `);

    console.log('Admin-related tables:');
    tables.rows.forEach(t => console.log(`  - ${t.table_name}`));

    // Check beta_admins table
    console.log('\n\nChecking beta_admins table:');
    const betaAdmins = await client.query('SELECT * FROM beta_admins LIMIT 5');
    console.log(`Columns:`, betaAdmins.fields.map(f => f.name).join(', '));
    console.log(`Rows:`, betaAdmins.rows.length);
    if (betaAdmins.rows.length > 0) {
      console.log('\nSample rows:');
      betaAdmins.rows.forEach(row => {
        console.log(`  - ${row.email} (${row.role}) - Active: ${row.is_active}`);
      });
    }

  } finally {
    client.release();
    await pool.end();
  }
}

findAdminTables();
