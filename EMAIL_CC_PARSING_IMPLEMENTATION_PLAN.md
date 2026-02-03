# CC Email Parsing Implementation Plan

**Date:** February 2, 2026
**Status:** 📋 Implementation Plan
**Email Address:** admin@shellfish-society.org

---

## 🎯 User Workflow (Super Simple!)

**For ISRS Board Members, Staff, and Partners:**

1. **Compose any email** (to anyone)
2. **CC:** `admin@shellfish-society.org`
3. **Send!**

**That's it!** The system automatically:
- Receives the email
- Parses with AI (contacts, attachments, versions)
- Extracts all participants
- Stores in database
- Shows in CRM dashboard

**No training needed. No special apps. Just CC an email.** ✅

---

## 🏗️ Technical Architecture

### System Flow

```
User sends email with CC: admin@shellfish-society.org
  ↓
AWS SES receives email
  ↓
SES triggers SNS notification OR stores in S3
  ↓
Webhook/Lambda calls ISRS API: POST /api/email-parsing/inbound
  ↓
Email Parser Service (Claude AI)
  ↓
Check parsing confidence
  ↓
├─ High confidence (≥70%)
│    ↓
│   Store in database (auto-approved)
│    ↓
│   Dashboard notification
│
└─ Low confidence (<70%)
     ↓
    Store in database (pending review)
     ↓
    Forward to human inbox for review
     ↓
    Dashboard notification (flagged for review)
```

---

## 📧 AWS SES Configuration

### Current Setup (Based on Your Response)

**Existing:**
- `no-reply@shellfish-society.org` - Already configured in AWS SES
- Domain: `shellfish-society.org` - Verified in AWS

**New Configuration Needed:**
- `admin@shellfish-society.org` - Inbound email receiving

### SES Inbound Email Setup

**Step 1: Verify Domain (Already Done ✅)**
- Domain: shellfish-society.org
- Status: Verified (since no-reply@ works)

**Step 2: Create Receipt Rule Set**

Create SES rule to receive emails at `admin@shellfish-society.org`:

```json
{
  "RuleName": "ISRS-Email-Parser",
  "Recipients": ["admin@shellfish-society.org"],
  "Actions": [
    {
      "S3Action": {
        "BucketName": "isrs-inbound-emails",
        "ObjectKeyPrefix": "emails/"
      }
    },
    {
      "SNSAction": {
        "TopicArn": "arn:aws:sns:us-east-1:ACCOUNT_ID:isrs-email-received"
      }
    }
  ],
  "Enabled": true
}
```

**Step 3: Create S3 Bucket**
- Bucket: `isrs-inbound-emails`
- Region: us-east-1 (or your region)
- Lifecycle: Delete emails after 7 days (privacy)

**Step 4: Create SNS Topic**
- Topic: `isrs-email-received`
- Subscription: Webhook to ISRS backend
- Endpoint: `https://your-backend.com/api/email-parsing/inbound-webhook`

---

## 🔧 Backend Implementation

### New API Endpoint

**File:** `backend/src/routes/emailParsingRoutes.js`

**Endpoint:** `POST /api/email-parsing/inbound-webhook`

**Purpose:** Receive SNS notifications when email arrives

### Architecture Options

#### Option A: Direct SNS → API (Recommended)

**Pros:**
- Real-time processing
- Simple architecture
- No polling needed

**Cons:**
- Backend must be publicly accessible
- Requires webhook security

**Flow:**
```
Email received → SES stores in S3 → SNS notification → ISRS API
  ↓
API downloads email from S3
  ↓
Parse with existing emailParsingService
  ↓
Store in database
```

#### Option B: S3 + Polling

**Pros:**
- No webhook needed
- Works with private backend

**Cons:**
- Not real-time (polls every 5 min)
- More complex

**Flow:**
```
Email received → SES stores in S3
  ↓
ISRS backend polls S3 every 5 minutes
  ↓
Download new emails
  ↓
Parse and store
```

#### Recommendation: **Option A (SNS Webhook)**

Aligns with your existing Gmail poller architecture and provides real-time parsing.

---

## 💻 Code Implementation

### 1. New Route Handler

**File:** `backend/src/routes/emailParsingRoutes.js`

```javascript
// Add new route
router.post('/inbound-webhook', async (req, res) => {
  try {
    const snsMessage = req.body;

    // Verify SNS signature for security
    if (!verifySNSSignature(snsMessage)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Handle SNS subscription confirmation (one-time)
    if (snsMessage.Type === 'SubscriptionConfirmation') {
      await confirmSNSSubscription(snsMessage.SubscribeURL);
      return res.status(200).json({ message: 'Subscription confirmed' });
    }

    // Handle email notification
    if (snsMessage.Type === 'Notification') {
      const emailData = JSON.parse(snsMessage.Message);

      // Queue email for processing (async)
      await queueEmailForParsing(emailData);

      return res.status(200).json({ message: 'Email queued for parsing' });
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 2. Email Download from S3

**File:** `backend/src/services/s3EmailService.js` (NEW)

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function downloadEmailFromS3(s3Key) {
  const params = {
    Bucket: 'isrs-inbound-emails',
    Key: s3Key
  };

  const emailObject = await s3.getObject(params).promise();
  const rawEmail = emailObject.Body.toString('utf-8');

  return rawEmail;
}

module.exports = { downloadEmailFromS3 };
```

### 3. Email Parser Integration

**File:** `backend/src/services/inboundEmailService.js` (NEW)

```javascript
const { simpleParser } = require('mailparser');
const emailParsingService = require('./emailParsingService');

async function parseInboundEmail(rawEmail) {
  // Parse raw MIME email
  const parsed = await simpleParser(rawEmail);

  // Extract data
  const emailData = {
    subject: parsed.subject,
    fromEmail: parsed.from.value[0].address,
    fromName: parsed.from.value[0].name,
    toEmails: parsed.to.value.map(t => t.address),
    ccEmails: parsed.cc ? parsed.cc.value.map(c => c.address) : [],
    receivedDate: parsed.date,
    emailBody: parsed.text || parsed.html,
    attachments: parsed.attachments.map(att => ({
      filename: att.filename,
      content_type: att.contentType,
      size: att.size,
      attachment_id: att.contentId || att.checksum,
      content: att.content // Base64 for storage
    }))
  };

  // Use existing AI parsing
  const result = await emailParsingService.parseEmail(emailData);

  // Check confidence and forward if low
  if (result.overallConfidence < 70) {
    await forwardToHumanReview(emailData, result);
  }

  return result;
}

async function forwardToHumanReview(emailData, parseResult) {
  // Forward to admin inbox with parsing results
  const emailService = require('./emailService');

  await emailService.sendEmail({
    to: 'aaron@shellfish-society.org', // Or your admin email
    subject: `[Review Needed] Low Confidence Parse: ${emailData.subject}`,
    html: `
      <h2>Email Parsing Review Required</h2>
      <p><strong>Confidence:</strong> ${parseResult.overallConfidence}%</p>
      <p><strong>From:</strong> ${emailData.fromName} &lt;${emailData.fromEmail}&gt;</p>
      <p><strong>Subject:</strong> ${emailData.subject}</p>

      <h3>Parsed Data</h3>
      <ul>
        <li>Contacts: ${parseResult.parsed.contacts?.length || 0}</li>
        <li>Attachments: ${emailData.attachments?.length || 0}</li>
        <li>Action Items: ${parseResult.parsed.action_items?.length || 0}</li>
      </ul>

      <p><a href="https://your-crm.com/parsed-emails/${parseResult.parsedEmailId}">
        Review in CRM →
      </a></p>

      <hr>
      <h3>Original Email</h3>
      <pre>${emailData.emailBody}</pre>
    `
  });
}

module.exports = { parseInboundEmail };
```

### 4. Queue Processing

**File:** `backend/src/services/emailQueueService.js` (NEW)

```javascript
// Simple in-memory queue (or use Redis/Bull for production)
const emailQueue = [];
let isProcessing = false;

async function queueEmailForParsing(emailData) {
  emailQueue.push(emailData);

  if (!isProcessing) {
    processQueue();
  }
}

async function processQueue() {
  isProcessing = true;

  while (emailQueue.length > 0) {
    const emailData = emailQueue.shift();

    try {
      // Download from S3
      const rawEmail = await downloadEmailFromS3(emailData.s3Key);

      // Parse email
      const result = await parseInboundEmail(rawEmail);

      console.log(`Parsed email ${result.parsedEmailId} (confidence: ${result.overallConfidence}%)`);

      // Create dashboard notification
      await createDashboardNotification({
        type: 'email_parsed',
        emailId: result.parsedEmailId,
        subject: emailData.subject,
        confidence: result.overallConfidence
      });

    } catch (error) {
      console.error('Error parsing email:', error);

      // Add to error queue or retry
      await handleParsingError(emailData, error);
    }
  }

  isProcessing = false;
}

module.exports = { queueEmailForParsing };
```

---

## 🔔 Notification System

### Dashboard Notifications

**Database Table:** `notifications` (if not exists)

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
ON notifications(user_id, read) WHERE read = false;
```

**Notification Types:**
- `email_parsed` - New email parsed successfully
- `email_review_needed` - Low confidence, needs review
- `contacts_imported` - Contacts imported to CRM
- `weekly_digest` - Weekly parsing summary

### Weekly Digest Email

**Schedule:** Every Monday at 9 AM

**Content:**
```
Subject: ISRS Email Parsing - Weekly Summary

Hi Team,

Here's your weekly email parsing summary:

📊 This Week's Activity:
- 12 emails parsed
- 45 contacts extracted
- 8 attachments processed
- 6 action items identified

✅ High Confidence (≥70%): 10 emails
⚠️ Review Needed (<70%): 2 emails

Top Contributors:
1. Betsy Peabody - 5 emails
2. Simon Branigan - 3 emails
3. Aaron Kornbluth - 2 emails

View all parsed emails in your CRM dashboard:
https://your-crm.com/parsed-emails

Questions? Reply to this email.

- ISRS Email Parser
```

**Implementation:** Use APScheduler (already in dependencies)

```python
# backend-python/app/services/weekly_digest.py
from apscheduler.schedulers.background import BackgroundScheduler

def send_weekly_digest():
    # Query last 7 days of parsed emails
    # Generate summary
    # Send email to board members
    pass

scheduler = BackgroundScheduler()
scheduler.add_job(
    send_weekly_digest,
    'cron',
    day_of_week='mon',
    hour=9,
    minute=0
)
scheduler.start()
```

---

## 🔒 Security Considerations

### 1. SNS Signature Verification

**Required:** Verify all SNS messages are legitimate

```javascript
const crypto = require('crypto');

function verifySNSSignature(message) {
  const keys = [
    'Message',
    'MessageId',
    'Subject',
    'Timestamp',
    'TopicArn',
    'Type'
  ];

  const stringToSign = keys
    .filter(key => message[key])
    .map(key => `${key}\n${message[key]}\n`)
    .join('');

  const verifier = crypto.createVerify('SHA1');
  verifier.update(stringToSign);

  return verifier.verify(
    message.SigningCertURL,
    message.Signature,
    'base64'
  );
}
```

### 2. Email Content Sanitization

**Prevent XSS and injection attacks:**

```javascript
const sanitizeHtml = require('sanitize-html');

function sanitizeEmailContent(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'a'],
    allowedAttributes: {
      'a': ['href']
    }
  });
}
```

### 3. Rate Limiting

**Prevent abuse:**

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 emails per 15 min
  message: 'Too many emails, please try again later'
});

router.post('/inbound-webhook', webhookLimiter, async (req, res) => {
  // ...
});
```

---

## 📋 Implementation Checklist

### Phase 1: AWS SES Setup (30 minutes)

- [ ] Verify `admin@shellfish-society.org` is routed in SES
- [ ] Create S3 bucket: `isrs-inbound-emails`
- [ ] Create SES receipt rule set
- [ ] Create SNS topic: `isrs-email-received`
- [ ] Test: Send email to admin@shellfish-society.org
- [ ] Verify: Email appears in S3

### Phase 2: Backend API (2 hours)

- [ ] Install dependencies: `npm install mailparser aws-sdk`
- [ ] Create route: `POST /api/email-parsing/inbound-webhook`
- [ ] Implement SNS signature verification
- [ ] Create S3EmailService for downloading emails
- [ ] Create InboundEmailService for parsing
- [ ] Integrate with existing emailParsingService
- [ ] Add queue processing
- [ ] Test with sample email

### Phase 3: Notifications (1 hour)

- [ ] Create notifications database table
- [ ] Implement dashboard notifications
- [ ] Add notification API endpoints
- [ ] Create weekly digest email template
- [ ] Schedule weekly digest job
- [ ] Test notifications

### Phase 4: Human Review (1 hour)

- [ ] Implement low-confidence forwarding
- [ ] Create review email template
- [ ] Add CRM review UI (if not exists)
- [ ] Test review workflow

### Phase 5: Testing & Launch (1 hour)

- [ ] Test: Send email with CC to admin@shellfish-society.org
- [ ] Verify: Email parsed correctly
- [ ] Verify: Contacts extracted
- [ ] Verify: Attachments captured
- [ ] Verify: Dashboard notification appears
- [ ] Test: Low confidence email triggers review
- [ ] Document: User instructions
- [ ] Communicate: Send to board members

**Total Estimated Time:** 5-6 hours

---

## 📝 User Instructions (Send to Team)

### How to Use Email Parsing - It's Easy!

**For ISRS Board Members, Staff, and Partners:**

When you send an email about ISRS business (sponsors, contacts, conference planning, etc.), simply:

1. **CC:** `admin@shellfish-society.org`

That's it! The system will automatically:
- Extract all contacts (names, emails, organizations)
- Save all attachments with version info
- Identify action items and deadlines
- Store everything in the CRM

**Examples:**

✅ **Forwarding a sponsor email:**
```
To: sponsor@company.com
CC: admin@shellfish-society.org
Subject: Re: ICSR 2026 Sponsorship

Hi John,
Thanks for your interest in sponsoring ICSR 2026...
```
→ System extracts John's contact info, notes sponsorship interest

✅ **Board meeting email with attachments:**
```
To: Board members
CC: admin@shellfish-society.org
Subject: Updated 2026 Work Plan

Hi all,
Please review the attached updated work plan...
Attachments: Work_Plan_v2.pdf
```
→ System extracts all board emails, saves attachment with version

✅ **Conference planning:**
```
To: venue@location.com
CC: admin@shellfish-society.org
Subject: ICSR 2026 Venue Inquiry

Hello,
I'm inquiring about hosting our conference...
```
→ System captures venue contact, creates lead

**What gets captured:**
- ✅ All email addresses (To, CC, mentioned in email)
- ✅ Phone numbers
- ✅ Organizations
- ✅ Attachments with version dates
- ✅ Action items
- ✅ Meeting details

**Privacy:**
- Emails are processed by AI and stored securely
- Only ISRS admins see parsed data
- Originals deleted after 7 days

**Questions?** Contact Aaron at aaron@shellfish-society.org

---

## 🎯 Success Metrics

### Week 1 Goals
- [ ] 10+ emails parsed successfully
- [ ] 50+ contacts extracted
- [ ] 0 parsing failures
- [ ] Board members using CC workflow

### Month 1 Goals
- [ ] 100+ emails parsed
- [ ] 500+ contacts in CRM
- [ ] <5% emails requiring manual review
- [ ] Weekly digest being sent

---

## 🔄 Future Enhancements

### Phase 2 Features (Optional)

1. **Smart Routing**
   - Route to different parsers based on subject
   - "ICSR 2026" → conference parser
   - "Sponsorship" → fundraising parser

2. **Auto-Categorization**
   - Tag emails: Conference, Sponsorship, Research, Governance
   - Auto-assign to CRM categories

3. **Duplicate Detection**
   - Check if contact already exists
   - Merge or flag for review

4. **Integration with Calendar**
   - Extract meeting invites
   - Create calendar events automatically

5. **Mobile App Notifications**
   - Push notifications when email parsed
   - Review low-confidence emails on mobile

---

## 💡 Advantages of CC Workflow

### Why This is Better Than Gmail Labels

**Simplicity:**
- ❌ Gmail: "Go to Gmail, find email, apply label 'ISRS-Leads'"
- ✅ CC: "Just CC admin@shellfish-society.org"

**Accessibility:**
- ❌ Gmail: Only works if using Gmail
- ✅ CC: Works from ANY email client (Outlook, Apple Mail, phone)

**Real-time:**
- ❌ Gmail: Polls every 5 minutes
- ✅ CC: Instant parsing via webhook

**Collaboration:**
- ❌ Gmail: Only one person can apply label
- ✅ CC: Anyone can CC to trigger parsing

**Forgiveness:**
- ❌ Gmail: Forget to label = not parsed
- ✅ CC: Forget to CC = just add CC later and forward

---

## 📊 Cost Estimate

### AWS SES Pricing
- **Inbound emails:** $0.10 per 1,000 emails
- **S3 storage:** $0.023 per GB/month
- **SNS notifications:** $0.50 per 1 million requests

**Example Cost (100 emails/month):**
- SES: $0.01
- S3: <$0.01
- SNS: <$0.01
- **Total:** <$0.05/month

**Essentially free!** ✅

---

## ✅ Recommendation

**Proceed with CC workflow using admin@shellfish-society.org**

**Why:**
1. ✅ Super simple for non-technical users
2. ✅ Works from any email client
3. ✅ Real-time parsing (vs 5-min polling)
4. ✅ Essentially free (<$1/month)
5. ✅ Leverages existing AWS SES setup
6. ✅ Scales to hundreds of emails/day

**Next Steps:**
1. Set up AWS SES inbound rules (30 min)
2. Implement backend webhook (2 hours)
3. Test with sample emails (30 min)
4. Document and communicate to team (30 min)
5. Launch! 🚀

---

**Ready to implement?** Let me know and I'll start building the code!
