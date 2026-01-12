const ExcelJS = require('exceljs');
const { parse: csvParse } = require('csv-parse/sync');

// mammoth and pdf-parse are optional dependencies
// Install with: npm install mammoth pdf-parse
let mammoth = null;
let pdf = null;

try {
  mammoth = require('mammoth');
} catch (error) {
  console.warn('mammoth not available - Word document parsing disabled');
}

try {
  pdf = require('pdf-parse');
} catch (error) {
  console.warn('pdf-parse not available - PDF parsing disabled');
}

/**
 * Parse Excel file (.xlsx, .xls) to extract contact data
 */
async function parseExcel(buffer) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const firstSheet = workbook.worksheets[0];
    const data = [];
    const sheetNames = workbook.worksheets.map(ws => ws.name);

    // Get headers from first row
    const headers = [];
    const headerRow = firstSheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value;
    });

    // Convert rows to objects
    firstSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value !== null ? cell.value : '';
        }
      });

      data.push(rowData);
    });

    return {
      success: true,
      contacts: data.map(row => normalizeContact(row)),
      rawData: data,
      sheetNames: sheetNames
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse CSV file
 */
async function parseCSV(buffer, options = {}) {
  try {
    const content = buffer.toString('utf-8');
    const records = csvParse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      ...options
    });

    return {
      success: true,
      contacts: records.map(row => normalizeContact(row)),
      rawData: records
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse TSV file (Tab-separated values)
 */
async function parseTSV(buffer) {
  return parseCSV(buffer, { delimiter: '\t' });
}

/**
 * Parse Word document (.docx)
 * Extracts text and attempts to find contact information
 */
async function parseWord(buffer) {
  if (!mammoth) {
    return {
      success: false,
      error: 'Word document parsing is not available. Install mammoth package: npm install mammoth'
    };
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Extract contact information using patterns
    const contacts = extractContactsFromText(text);

    return {
      success: true,
      contacts,
      rawText: text,
      messages: result.messages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Parse PDF file
 * Extracts text and attempts to find contact information
 */
async function parsePDF(buffer) {
  if (!pdf) {
    return {
      success: false,
      error: 'PDF parsing is not available. Install pdf-parse package: npm install pdf-parse'
    };
  }

  try {
    const data = await pdf(buffer);
    const text = data.text;

    // Extract contact information using patterns
    const contacts = extractContactsFromText(text);

    return {
      success: true,
      contacts,
      rawText: text,
      pages: data.numpages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract contact information from plain text using regex patterns
 */
function extractContactsFromText(text) {
  const contacts = [];

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];

  // Phone pattern (US/International)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phones = [];
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    phones.push(phoneMatch[0]);
  }

  // Name pattern (basic - look for capitalized words before email/phone)
  const lines = text.split('\n');
  const potentialContacts = [];

  lines.forEach((line, index) => {
    const hasEmail = emailRegex.test(line);
    const hasPhone = phoneRegex.test(line);

    if (hasEmail || hasPhone) {
      // Look at current and previous lines for name
      const contextLines = lines.slice(Math.max(0, index - 2), index + 1);
      const contextText = contextLines.join(' ');

      const email = line.match(emailRegex)?.[0] || '';
      const phone = line.match(phoneRegex)?.[0] || '';

      // Simple name extraction (capitalized words)
      const nameMatch = contextText.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/);
      const name = nameMatch ? nameMatch[0] : '';

      if (email || phone || name) {
        potentialContacts.push({
          full_name: name,
          email: email,
          phone: phone,
          notes: `Extracted from document`,
          data_source: 'Document Parser',
          confidence: 50 // Low confidence for automated extraction
        });
      }
    }
  });

  // Deduplicate by email
  const uniqueContacts = [];
  const seenEmails = new Set();

  potentialContacts.forEach(contact => {
    if (contact.email && !seenEmails.has(contact.email.toLowerCase())) {
      seenEmails.add(contact.email.toLowerCase());
      uniqueContacts.push(contact);
    } else if (!contact.email && (contact.full_name || contact.phone)) {
      uniqueContacts.push(contact);
    }
  });

  return uniqueContacts;
}

/**
 * Normalize contact data from various formats
 * Maps different column names to standard ISRS fields
 */
function normalizeContact(rawRow) {
  const contact = {};

  // Name mappings
  const nameFields = ['name', 'full_name', 'fullname', 'contact_name', 'contactname', 'Full Name', 'Name'];
  const firstNameFields = ['first_name', 'firstname', 'fname', 'First Name', 'given_name'];
  const lastNameFields = ['last_name', 'lastname', 'lname', 'Last Name', 'surname', 'family_name'];

  // Email mappings
  const emailFields = ['email', 'email_address', 'emailaddress', 'Email', 'Email Address', 'e-mail', 'mail'];

  // Phone mappings
  const phoneFields = ['phone', 'phone_number', 'phonenumber', 'Phone', 'Phone Number', 'tel', 'telephone', 'mobile'];

  // Organization mappings
  const orgFields = ['organization', 'company', 'org', 'Organization', 'Company', 'organization_name', 'institution', 'affiliation'];

  // Role/Title mappings
  const roleFields = ['role', 'Role', 'member_type', 'membership_type'];
  const titleFields = ['title', 'position', 'job_title', 'Title', 'Position', 'Job Title'];

  // Address mappings
  const addressFields = ['address', 'street', 'Address', 'Street Address', 'street_address'];
  const cityFields = ['city', 'City'];
  const stateFields = ['state', 'state_province', 'State', 'Province', 'State/Province'];
  const countryFields = ['country', 'Country', 'nation'];
  const zipFields = ['zip', 'zipcode', 'zip_code', 'postal_code', 'Zip', 'ZIP', 'postcode'];

  // ISRS-specific fields
  const expertiseFields = ['expertise', 'Expertise', 'specialization', 'research_area', 'focus_area'];
  const interestsFields = ['interests', 'Interests', 'research_interests'];

  // Notes mappings
  const notesFields = ['notes', 'comments', 'description', 'Notes', 'Comments', 'Description', 'bio'];

  // Helper function to find first matching field
  const findField = (obj, fields) => {
    for (const field of fields) {
      if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
        return obj[field];
      }
    }
    return null;
  };

  // Map fields
  contact.full_name = findField(rawRow, nameFields);
  contact.first_name = findField(rawRow, firstNameFields);
  contact.last_name = findField(rawRow, lastNameFields);

  // If full_name not provided but first/last are, combine them
  if (!contact.full_name && (contact.first_name || contact.last_name)) {
    const parts = [contact.first_name, contact.last_name].filter(Boolean);
    contact.full_name = parts.join(' ');
  }

  // Ensure we have at least a full_name
  if (!contact.full_name) {
    contact.full_name = 'Unknown';
  }

  contact.email = findField(rawRow, emailFields);
  contact.phone = findField(rawRow, phoneFields);
  contact.organization_name = findField(rawRow, orgFields);
  contact.role = findField(rawRow, roleFields);
  contact.title = findField(rawRow, titleFields);
  contact.address = findField(rawRow, addressFields);
  contact.city = findField(rawRow, cityFields);
  contact.state_province = findField(rawRow, stateFields);
  contact.country = findField(rawRow, countryFields);
  contact.zip = findField(rawRow, zipFields);
  contact.expertise = findField(rawRow, expertiseFields);
  contact.interests = findField(rawRow, interestsFields);
  contact.notes = findField(rawRow, notesFields);

  // Remove null/undefined values
  Object.keys(contact).forEach(key => {
    if (contact[key] === null || contact[key] === undefined) {
      delete contact[key];
    }
  });

  return contact;
}

/**
 * Main parser function - detects file type and routes to appropriate parser
 */
async function parseFile(buffer, filename) {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'xlsx':
    case 'xls':
      return parseExcel(buffer);

    case 'csv':
      return parseCSV(buffer);

    case 'tsv':
    case 'tab':
      return parseTSV(buffer);

    case 'docx':
      return parseWord(buffer);

    case 'pdf':
      return parsePDF(buffer);

    default:
      return {
        success: false,
        error: `Unsupported file type: ${ext}. Supported types: xlsx, xls, csv, tsv, docx, pdf`
      };
  }
}

module.exports = {
  parseFile,
  parseExcel,
  parseCSV,
  parseTSV,
  parseWord,
  parsePDF,
  extractContactsFromText,
  normalizeContact
};
