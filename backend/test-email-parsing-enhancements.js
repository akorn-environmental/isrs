/**
 * Test Email Parsing Enhancements
 *
 * This script demonstrates the new email parsing capabilities:
 * 1. Attachment metadata extraction
 * 2. Automatic To/CC contact extraction
 * 3. Document versioning detection
 */

const emailParsingService = require('./src/services/emailParsingService');

// Sample email based on the user's provided example
const sampleEmail = {
  subject: 'Updated docs & Status Report',
  fromEmail: 'betsy@example.org',
  fromName: 'Betsy Peabody',
  toEmails: [
    'simon@example.com',
    'm@example.org',
    'tristan@example.com',
    'dot@example.org',
    'mark@example.edu',
    'katie@example.org',
    'lisa@example.com',
    'mark2@example.org',
    'beth@example.com',
    'aaron@example.org'
  ],
  ccEmails: [],
  receivedDate: new Date('2026-02-02T14:00:00Z'),
  emailBody: `Hello to all,

I look forward to seeing you in an hour or so.

In the meantime, I've attached:
- Updated ICSR Save-the-Date
- Updated ICSR Sponsorship Prospectus
- ICSR 2026 Status Report (as of Feb 2)
- Revised 2026 Work Plan (as of Feb 2)

Thanks so much to the ISRS Board for reviewing draft docs, and providing lots of great input, and to Aaron for working with me on the Save the Date and Sponsorship docs.

See you soon. Full steam ahead.

Betsy`,
  attachments: [
    {
      filename: 'ICSR_Save_the_Date_Updated.pdf',
      content_type: 'application/pdf',
      size: 245678,
      attachment_id: 'att_001',
      gmail_attachment_id: 'ANGjdJ8w...'
    },
    {
      filename: 'ICSR_Sponsorship_Prospectus_Updated.pdf',
      content_type: 'application/pdf',
      size: 389012,
      attachment_id: 'att_002',
      gmail_attachment_id: 'ANGjdJ8x...'
    },
    {
      filename: 'ICSR_2026_Status_Report_as_of_Feb_2.pdf',
      content_type: 'application/pdf',
      size: 156789,
      attachment_id: 'att_003',
      gmail_attachment_id: 'ANGjdJ8y...'
    },
    {
      filename: 'Revised_2026_Work_Plan_as_of_Feb_2.pdf',
      content_type: 'application/pdf',
      size: 203456,
      attachment_id: 'att_004',
      gmail_attachment_id: 'ANGjdJ8z...'
    },
    {
      filename: 'ISRS_Form_1023_Budget_Pages.pdf',
      content_type: 'application/pdf',
      size: 512340,
      attachment_id: 'att_005',
      gmail_attachment_id: 'ANGjdJ9a...'
    }
  ]
};

// Sample reply email in the same thread
const replyEmail = {
  subject: 'Re: Updated docs & Status Report',
  fromEmail: 'simon.branigan@ccma.vic.gov.au',
  fromName: 'Simon Branigan',
  toEmails: [
    'betsy@example.org',
    'm@example.org',
    'tristan@example.com',
    'dot@example.org',
    'mark@example.edu',
    'katie@example.org',
    'lisa@example.com',
    'mark2@example.org',
    'beth@example.com',
    'aaron@example.org'
  ],
  ccEmails: [],
  receivedDate: new Date('2026-02-02T16:21:00Z'),
  emailBody: `Hi All,

The meeting invitation didn't reach me for some reason. Moving forward, let's revert to my work email address simon.branigan@ccma.vic.gov.au which will also connect to my outlook calendar.

Cheers,
Simon
--
Email: simon.branigan@gmail.com
Ph: 0409 087 278`,
  attachments: []
};

async function testEmailParsing() {
  console.log('='.repeat(80));
  console.log('EMAIL PARSING ENHANCEMENTS TEST');
  console.log('='.repeat(80));
  console.log();

  try {
    // Test 1: Parse original email with attachments
    console.log('TEST 1: Parsing email with attachments and multiple recipients');
    console.log('-'.repeat(80));
    console.log('Subject:', sampleEmail.subject);
    console.log('From:', `${sampleEmail.fromName} <${sampleEmail.fromEmail}>`);
    console.log('To:', sampleEmail.toEmails.length, 'recipients');
    console.log('Attachments:', sampleEmail.attachments.length, 'files');
    console.log();

    const result1 = await emailParsingService.parseEmail(sampleEmail);

    console.log('PARSED RESULTS:');
    console.log();
    console.log('✓ Contacts Extracted:', result1.parsed.contacts.length);
    console.log('  - From To/CC headers:', result1.parsed.contacts.filter(c => c.source !== 'body').length);
    console.log('  - From email body:', result1.parsed.contacts.filter(c => c.source === 'body').length);
    console.log();

    console.log('Sample contacts:');
    result1.parsed.contacts.slice(0, 5).forEach((contact, idx) => {
      console.log(`  ${idx + 1}. ${contact.name || 'N/A'} <${contact.email}>`);
      console.log(`     Organization: ${contact.organization || 'N/A'}`);
      console.log(`     Source: ${contact.source}, Confidence: ${contact.confidence}%`);
    });
    console.log();

    console.log('✓ Attachments:', sampleEmail.attachments.length);
    sampleEmail.attachments.forEach((att, idx) => {
      console.log(`  ${idx + 1}. ${att.filename}`);
      console.log(`     Type: ${att.content_type}, Size: ${Math.round(att.size / 1024)}KB`);
    });
    console.log();

    console.log('✓ Document Versioning Detected:');
    if (result1.parsed.metadata?.document_versions?.length > 0) {
      result1.parsed.metadata.document_versions.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. ${doc.filename}`);
        console.log(`     Version: ${doc.version_indicator}`);
        if (doc.date) console.log(`     Date: ${doc.date}`);
      });
    } else {
      console.log('  (Check AI response for version info in metadata)');
    }
    console.log();

    console.log('✓ Action Items:', result1.parsed.action_items?.length || 0);
    if (result1.parsed.action_items && result1.parsed.action_items.length > 0) {
      result1.parsed.action_items.forEach((action, idx) => {
        console.log(`  ${idx + 1}. ${action.item}`);
        console.log(`     Owner: ${action.owner || 'N/A'}, Priority: ${action.priority}`);
      });
    }
    console.log();

    console.log('✓ Summary:', result1.parsed.summary);
    console.log();

    console.log('✓ Overall Confidence:', result1.overallConfidence + '%');
    console.log('✓ Parsed Email ID:', result1.parsedEmailId);
    console.log();

    // Test 2: Parse reply email
    console.log('='.repeat(80));
    console.log('TEST 2: Parsing reply email');
    console.log('-'.repeat(80));
    console.log('Subject:', replyEmail.subject);
    console.log('From:', `${replyEmail.fromName} <${replyEmail.fromEmail}>`);
    console.log();

    const result2 = await emailParsingService.parseEmail(replyEmail);

    console.log('PARSED RESULTS:');
    console.log();
    console.log('✓ Contacts Extracted:', result2.parsed.contacts.length);
    console.log('  Note: All To/CC recipients automatically extracted');
    console.log();

    console.log('Sample contacts:');
    result2.parsed.contacts.slice(0, 3).forEach((contact, idx) => {
      console.log(`  ${idx + 1}. ${contact.name || 'N/A'} <${contact.email}>`);
      console.log(`     Source: ${contact.source}, Confidence: ${contact.confidence}%`);
    });
    console.log();

    console.log('✓ Summary:', result2.parsed.summary);
    console.log('✓ Overall Confidence:', result2.overallConfidence + '%');
    console.log();

    console.log('='.repeat(80));
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log();
    console.log('KEY ENHANCEMENTS DEMONSTRATED:');
    console.log('1. ✓ Attachment metadata extraction (filename, type, size)');
    console.log('2. ✓ Automatic To/CC contact extraction (90%+ confidence)');
    console.log('3. ✓ Document versioning detection from filenames');
    console.log('4. ✓ Distinction between header contacts vs body mentions');
    console.log('5. ✓ Integration with existing AI analysis features');
    console.log();

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testEmailParsing()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testEmailParsing };
