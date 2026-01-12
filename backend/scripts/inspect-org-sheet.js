#!/usr/bin/env node
/**
 * Inspect organization sheet to see actual column names and data
 */

require('dotenv').config();
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function inspectOrgSheet() {
  try {
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: '02_ORGANIZATIONS!A1:Z5',
    });

    const rows = response.data.values;

    console.log('\n📋 First 5 rows of 02_ORGANIZATIONS sheet:\n');
    console.log('HEADERS:', JSON.stringify(rows[0], null, 2));
    console.log('\n');
    console.log('Row 1:', JSON.stringify(rows[1], null, 2));
    console.log('\n');
    console.log('Row 2:', JSON.stringify(rows[2], null, 2));
    console.log('\n');
    console.log('Row 3:', JSON.stringify(rows[3], null, 2));
    console.log('\n');
    console.log('Row 4:', JSON.stringify(rows[4], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectOrgSheet();
