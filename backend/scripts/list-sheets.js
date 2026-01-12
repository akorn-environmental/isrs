#!/usr/bin/env node
/**
 * List all sheets in the Google Spreadsheet
 */

require('dotenv').config();
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function listSheets() {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'isrs-database-prod',
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Get spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log('\n📊 Google Spreadsheet: ' + response.data.properties.title);
    console.log('🔗 ID: ' + SPREADSHEET_ID);
    console.log('\n📋 Sheet Names:\n');

    response.data.sheets.forEach((sheet, index) => {
      const sheetName = sheet.properties.title;
      const rowCount = sheet.properties.gridProperties.rowCount;
      const colCount = sheet.properties.gridProperties.columnCount;

      console.log(`${index + 1}. "${sheetName}"`);
      console.log(`   ${rowCount} rows × ${colCount} columns`);
      console.log('');
    });

    console.log('\n✅ Found ' + response.data.sheets.length + ' sheets total\n');
    console.log('💡 Update scripts/migrate-from-sheets.js with these exact names:');
    console.log('   const SHEETS = {');
    response.data.sheets.forEach(sheet => {
      const name = sheet.properties.title;
      const varName = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      console.log(`     ${varName}: '${name}',`);
    });
    console.log('   };');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listSheets();
