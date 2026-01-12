const { google } = require('googleapis');

const MASTER_DATABASE_ID = process.env.GOOGLE_SHEET_ID || '1o1dG8fBCIKb1_pNAqZmlmOhQHjNIIwwJzUT5s_BQ3OA';

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

/**
 * Get or create a sheet by name
 */
async function ensureSheet(sheetName, headers) {
  const sheets = getGoogleSheetsClient();

  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: MASTER_DATABASE_ID
    });

    const sheet = spreadsheet.data.sheets?.find(
      s => s.properties.title === sheetName
    );

    if (sheet) {
      return sheet.properties.sheetId;
    }

    // Create new sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: MASTER_DATABASE_ID,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName
            }
          }
        }]
      }
    });

    const newSheetId = response.data.replies[0].addSheet.properties.sheetId;

    // Add headers if provided
    if (headers && headers.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: MASTER_DATABASE_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      // Format headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: MASTER_DATABASE_ID,
        resource: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: newSheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.29, green: 0.42, blue: 0.59 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }]
        }
      });
    }

    return newSheetId;

  } catch (error) {
    console.error(`Error ensuring sheet ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Append row to sheet
 */
async function appendRow(sheetName, values) {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: MASTER_DATABASE_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values]
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error appending row to ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Get all values from a sheet
 */
async function getSheetValues(sheetName, range = null) {
  const sheets = getGoogleSheetsClient();

  try {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: MASTER_DATABASE_ID,
      range: fullRange
    });

    return response.data.values || [];
  } catch (error) {
    // Sheet might not exist yet
    if (error.code === 400) {
      return [];
    }
    console.error(`Error getting values from ${sheetName}:`, error);
    throw error;
  }
}

/**
 * Get spreadsheet metadata
 */
async function getSpreadsheetInfo() {
  const sheets = getGoogleSheetsClient();

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: MASTER_DATABASE_ID
    });

    return response.data;
  } catch (error) {
    console.error('Error getting spreadsheet info:', error);
    throw error;
  }
}

module.exports = {
  MASTER_DATABASE_ID,
  getGoogleSheetsClient,
  ensureSheet,
  appendRow,
  getSheetValues,
  getSpreadsheetInfo
};
