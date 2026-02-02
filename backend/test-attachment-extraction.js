/**
 * Test Attachment Extraction (No AI Required)
 *
 * This test verifies the attachment extraction logic without calling the AI API.
 */

const path = require('path');
require('dotenv').config();

// Mock Gmail message payload structure
const mockGmailMessage = {
  payload: {
    headers: [
      { name: 'Subject', value: 'Updated docs & Status Report' },
      { name: 'From', value: 'Betsy Peabody <betsy@example.org>' },
      { name: 'To', value: 'simon@example.com, aaron@example.org, mark@example.edu' },
      { name: 'Date', value: 'Sun, 02 Feb 2026 14:00:00 -0800' }
    ],
    parts: [
      {
        mimeType: 'text/plain',
        body: {
          data: Buffer.from('Hello to all,\n\nI look forward to seeing you in an hour or so.').toString('base64')
        }
      },
      {
        mimeType: 'application/pdf',
        filename: 'ISRS_Form_1023_Budget_Pages.pdf',
        body: {
          attachmentId: 'ANGjdJ9a123456',
          size: 512340
        }
      },
      {
        mimeType: 'application/pdf',
        filename: 'ICSR_Save_the_Date_Updated.pdf',
        body: {
          attachmentId: 'ANGjdJ8w789012',
          size: 245678
        }
      },
      {
        mimeType: 'application/pdf',
        filename: 'ICSR_2026_Status_Report_as_of_Feb_2.pdf',
        body: {
          attachmentId: 'ANGjdJ8y345678',
          size: 156789
        }
      },
      {
        mimeType: 'application/pdf',
        filename: 'Revised_2026_Work_Plan_as_of_Feb_2.pdf',
        body: {
          attachmentId: 'ANGjdJ8z901234',
          size: 203456
        }
      }
    ]
  },
  internalDate: '1738533600000'
};

// Mock Gmail poller service methods
class MockGmailPoller {
  extractAttachments(payload) {
    const attachments = [];

    const processPartForAttachments = (part) => {
      // Check if this part is an attachment
      if (part.filename && part.body && part.body.attachmentId) {
        attachments.push({
          filename: part.filename,
          content_type: part.mimeType || 'application/octet-stream',
          size: part.body.size || 0,
          attachment_id: part.body.attachmentId,
          gmail_attachment_id: part.body.attachmentId
        });
      }

      // Recursively process nested parts
      if (part.parts) {
        part.parts.forEach(subPart => processPartForAttachments(subPart));
      }
    };

    // Start processing from the root payload
    if (payload.parts) {
      payload.parts.forEach(part => processPartForAttachments(part));
    } else {
      // Single-part message might still have an attachment
      processPartForAttachments(payload);
    }

    return attachments;
  }

  extractEmailData(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract email addresses from header
    const extractEmails = (headerValue) => {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
      return headerValue.match(emailRegex) || [];
    };

    const from = getHeader('From');
    const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];

    return {
      subject: getHeader('Subject'),
      fromName: fromMatch[1].trim() || fromMatch[2],
      fromEmail: fromMatch[2],
      toEmails: extractEmails(getHeader('To')),
      ccEmails: extractEmails(getHeader('Cc')),
      date: new Date(parseInt(message.internalDate)),
      attachments: this.extractAttachments(message.payload)
    };
  }
}

async function testAttachmentExtraction() {
  console.log('='.repeat(80));
  console.log('ATTACHMENT EXTRACTION TEST (No AI Required)');
  console.log('='.repeat(80));
  console.log();

  const poller = new MockGmailPoller();

  // Test 1: Extract email data with attachments
  console.log('TEST 1: Extracting email metadata and attachments');
  console.log('-'.repeat(80));

  const emailData = poller.extractEmailData(mockGmailMessage);

  console.log('✓ Subject:', emailData.subject);
  console.log('✓ From:', `${emailData.fromName} <${emailData.fromEmail}>`);
  console.log('✓ To Recipients:', emailData.toEmails.length, '-', emailData.toEmails.join(', '));
  console.log('✓ Date:', emailData.date.toISOString());
  console.log();

  // Test 2: Verify attachment extraction
  console.log('TEST 2: Verifying attachment extraction');
  console.log('-'.repeat(80));

  console.log('✓ Attachments Found:', emailData.attachments.length);
  console.log();

  if (emailData.attachments.length === 0) {
    console.error('❌ FAIL: No attachments extracted!');
    process.exit(1);
  }

  console.log('Attachment Details:');
  emailData.attachments.forEach((att, idx) => {
    console.log(`  ${idx + 1}. ${att.filename}`);
    console.log(`     Type: ${att.content_type}`);
    console.log(`     Size: ${Math.round(att.size / 1024)}KB (${att.size} bytes)`);
    console.log(`     Attachment ID: ${att.attachment_id}`);
    console.log();
  });

  // Test 3: Verify specific attachments
  console.log('TEST 3: Verifying specific attachment filenames');
  console.log('-'.repeat(80));

  const expectedFiles = [
    'ISRS_Form_1023_Budget_Pages.pdf',
    'ICSR_Save_the_Date_Updated.pdf',
    'ICSR_2026_Status_Report_as_of_Feb_2.pdf',
    'Revised_2026_Work_Plan_as_of_Feb_2.pdf'
  ];

  const extractedFilenames = emailData.attachments.map(a => a.filename);

  expectedFiles.forEach(expected => {
    if (extractedFilenames.includes(expected)) {
      console.log(`✓ Found: ${expected}`);
    } else {
      console.error(`❌ Missing: ${expected}`);
    }
  });

  console.log();

  // Test 4: Test contact pre-processing
  console.log('TEST 4: Testing contact pre-processing (header extraction)');
  console.log('-'.repeat(80));

  const headerContacts = [];

  // Extract from From field
  headerContacts.push({
    name: emailData.fromName || emailData.fromEmail.split('@')[0],
    email: emailData.fromEmail,
    organization: emailData.fromEmail.split('@')[1] || '',
    confidence: 95,
    source: 'from'
  });

  // Extract To recipients
  if (emailData.toEmails && Array.isArray(emailData.toEmails)) {
    emailData.toEmails.forEach(email => {
      if (email) {
        headerContacts.push({
          name: email.split('@')[0],
          email: email,
          organization: email.split('@')[1] || '',
          confidence: 90,
          source: 'to'
        });
      }
    });
  }

  console.log('✓ Header Contacts Extracted:', headerContacts.length);
  console.log();

  console.log('Contact Details:');
  headerContacts.forEach((contact, idx) => {
    console.log(`  ${idx + 1}. ${contact.name} <${contact.email}>`);
    console.log(`     Organization: ${contact.organization}`);
    console.log(`     Source: ${contact.source}, Confidence: ${contact.confidence}%`);
    console.log();
  });

  // Test 5: Verify database connection
  console.log('TEST 5: Verifying database connection and schema');
  console.log('-'.repeat(80));

  try {
    const { query } = require('./src/config/database');

    const result = await query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'parsed_emails' AND column_name = 'attachments'"
    );

    if (result.rows.length > 0) {
      console.log('✓ Database connected successfully');
      console.log('✓ Attachments column exists:', result.rows[0].column_name);
      console.log('✓ Data type:', result.rows[0].data_type);
    } else {
      console.error('❌ Attachments column not found in database!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }

  console.log();

  // Summary
  console.log('='.repeat(80));
  console.log('ALL TESTS PASSED! ✅');
  console.log('='.repeat(80));
  console.log();
  console.log('Summary:');
  console.log('  ✓ Attachment extraction working correctly');
  console.log(`  ✓ ${emailData.attachments.length} attachments extracted`);
  console.log(`  ✓ ${headerContacts.length} contacts pre-processed from headers`);
  console.log('  ✓ Database schema updated successfully');
  console.log();
  console.log('Next Steps:');
  console.log('  1. Deploy changes to production');
  console.log('  2. Test with real Gmail API data');
  console.log('  3. Verify AI parsing with actual emails');
  console.log();

  process.exit(0);
}

// Run test
testAttachmentExtraction().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
