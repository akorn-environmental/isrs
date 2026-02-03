# How to Use CC Email Parsing - User Guide

Simple guide for ISRS team members on using the CC email parsing system.

---

## What is CC Email Parsing?

The CC email parsing system automatically extracts contacts, action items, and attachments from your emails - **you just need to CC one email address**.

No special apps, no logins, no complicated workflows. Just CC and go.

---

## How It Works

### Step 1: Send or Reply to Email Normally

Handle your email as you normally would - respond to colleagues, send updates, share documents.

### Step 2: CC admin@shellfish-society.org

When sending or replying, add `admin@shellfish-society.org` to the CC field.

**Example:**

```
To: john.doe@oceanresearch.org
CC: admin@shellfish-society.org
Subject: ICSR 2026 Conference Planning

Hi John,

Thanks for agreeing to present at ICSR 2026!

Details:
- Session: Restoration Techniques
- Date: April 15, 2026
- Duration: 30 minutes

Please confirm by Feb 15.

Attached: Speaker_Guidelines.pdf

Best,
Sarah
```

### Step 3: System Automatically Processes Email

Within seconds, the system:
- ✅ Extracts contacts (John Doe - Ocean Research)
- ✅ Identifies action items (Confirm by Feb 15)
- ✅ Logs attachments (Speaker_Guidelines.pdf)
- ✅ Stores everything in CRM database

### Step 4: View Results in Dashboard

Log into the ISRS CRM dashboard to see:
- Parsed email details
- Extracted contacts (with confidence scores)
- Action items and deadlines
- Attachment metadata

---

## When to Use CC Email Parsing

✅ **Use for:**
- Conference planning emails
- Board communications
- Partner/sponsor outreach
- Grant applications
- Research collaborations
- Event coordination
- Membership inquiries

❌ **Don't use for:**
- Personal emails
- Spam or promotional emails
- Internal team chat (use Slack instead)
- Sensitive financial information

---

## What Gets Extracted?

### Contacts
- Name
- Email address
- Organization/affiliation
- Phone numbers (if mentioned)
- Role/title (if mentioned)

**Example extraction:**
```
From: Dr. Jane Smith <jane@coastal.edu>
↓
Contact: Jane Smith
Email: jane@coastal.edu
Organization: Coastal University
Confidence: 95%
```

### Action Items
- Task description
- Owner (who's responsible)
- Deadline/due date
- Priority

**Example extraction:**
```
"Please review the draft by March 1"
↓
Action Item: Review draft
Owner: [recipient]
Deadline: March 1, 2026
```

### Attachments
- Filename
- File type
- File size
- Timestamp

### Topics & Keywords
- Conference names (ICSR 2026, etc.)
- Research topics (restoration, aquaculture)
- Grant programs
- Event dates

---

## Confidence Scores

Each extracted piece of data has a confidence score:

- **90-100%:** Very high confidence (e.g., contacts in To/CC fields)
- **70-89%:** High confidence (clear mentions in email body)
- **50-69%:** Medium confidence (may need review)
- **Below 50%:** Low confidence (flagged for manual review)

**Low confidence emails** are automatically forwarded to Aaron for review.

---

## Privacy & Security

✅ **Your emails are:**
- Stored securely in AWS S3 (encrypted)
- Only accessible by authorized ISRS admins
- Automatically deleted after 7 days
- Protected by AWS security standards

✅ **The system:**
- Uses AI (Claude) to extract structured data
- Stores only extracted contacts/action items (not full email content long-term)
- Complies with data privacy best practices
- Doesn't share data with third parties

❌ **Never CC admin@ for:**
- Banking information
- Credit card numbers
- Social Security numbers
- Passwords or API keys

---

## Examples

### Example 1: Conference Speaker Invitation

```
To: dr.martinez@marine.edu
CC: admin@shellfish-society.org
Subject: Invitation to speak at ICSR 2026

Dear Dr. Martinez,

We'd like to invite you to present at the International Conference
on Shellfish Restoration 2026 in Charleston, SC.

Session: Sustainable Aquaculture Practices
Date: April 16, 2026, 2:00 PM
Duration: 45 minutes + 15 min Q&A

Please let us know by March 1 if you can join us.

Attached: Conference_Program_Draft.pdf

Best regards,
Sarah Johnson
ISRS Conference Committee
```

**Extracted:**
- Contact: Dr. Martinez (marine.edu)
- Contact: Sarah Johnson (ISRS)
- Action Item: Confirm speaker availability by March 1
- Event: ICSR 2026, Charleston, April 16
- Attachment: Conference_Program_Draft.pdf

### Example 2: Grant Collaboration

```
To: funding@noaa.gov
CC: admin@shellfish-society.org, team@isrs.org
Subject: NOAA Habitat Restoration Grant Application

Hello,

ISRS is submitting a proposal for NOAA's Habitat Restoration Grant
(RFP-2026-HR-001).

Project: Oyster Reef Restoration in Chesapeake Bay
Budget: $500,000
Timeline: 24 months
Deadline: February 28, 2026

We've attached our preliminary proposal. Can you review and provide
feedback by Feb 15?

Contacts:
- Project Lead: Dr. James Chen (james@isrs.org)
- Finance: Maria Rodriguez (maria@isrs.org)

Attachments:
- ISRS_NOAA_Proposal_v1.pdf
- Budget_Breakdown.xlsx

Thanks,
Aaron
```

**Extracted:**
- Contact: NOAA Funding Team
- Contact: Dr. James Chen (ISRS, Project Lead)
- Contact: Maria Rodriguez (ISRS, Finance)
- Action Item: Review proposal by Feb 15
- Grant: NOAA Habitat Restoration Grant RFP-2026-HR-001
- Budget: $500,000
- Deadline: Feb 28, 2026
- Attachments: Proposal PDF, Budget Excel

### Example 3: Board Meeting Follow-up

```
To: board@shellfish-society.org
CC: admin@shellfish-society.org
Subject: Action Items from January Board Meeting

Hi Board Members,

Summary of action items from our January 15 meeting:

1. Aaron - Update bylaws to reflect new committee structure (Due: Feb 10)
2. Betsy - Draft 2026 budget proposal (Due: Feb 20)
3. Chris - Coordinate with webmaster on site redesign (Due: March 1)

Next meeting: February 19, 2026, 7:00 PM Eastern

Please confirm receipt.

Best,
Betsy (Chair)
```

**Extracted:**
- Contacts: Board members (from To field)
- Action Item: Aaron - Update bylaws by Feb 10
- Action Item: Betsy - Draft budget by Feb 20
- Action Item: Chris - Coordinate redesign by March 1
- Meeting: Feb 19, 2026, 7:00 PM Eastern

---

## Weekly Digest

Every **Monday morning at 9:00 AM**, you'll receive an automated weekly digest email showing:

📊 **Stats:**
- Total emails parsed this week
- Average confidence score
- Contacts extracted
- Action items identified

📧 **Recent Emails:**
- List of parsed emails with subjects and confidence scores
- Links to view full details in dashboard

📋 **Quick Actions:**
- Button to review low-confidence emails
- Link to dashboard

You can opt out or change digest preferences in your CRM profile settings.

---

## Tips for Better Results

### ✅ Do:
- Use clear subject lines ("ICSR 2026 Planning" not "FW: Re: Quick Q")
- Include full names and organizations in email signatures
- Mention specific dates and deadlines
- Use standard date formats (Feb 15, 2026 or 2026-02-15)
- Keep contacts in To/CC fields (higher confidence than body mentions)

### ❌ Avoid:
- Vague subjects ("Update" or "FYI")
- Abbreviations without context (who is "JD"?)
- Relative dates ("next Tuesday" instead of specific date)
- Forwarding long email chains without context
- Including sensitive financial data

---

## Troubleshooting

### "I CCed admin@ but nothing happened"

**Check:**
1. Wait 1-2 minutes (processing takes time)
2. Log into CRM dashboard and check "Parsed Emails" section
3. Check spam folder for review notification (if low confidence)
4. Contact Aaron if email still not processed after 5 minutes

### "The extracted data is wrong"

**If confidence is high (>70%):**
- Report issue to Aaron with email subject/date
- We'll refine the AI extraction prompts

**If confidence is low (<70%):**
- This is expected for unclear emails
- You'll receive review notification
- Approve/edit the extracted data in dashboard

### "I forgot to CC admin@"

No problem! Two options:

1. **Forward the email** to admin@shellfish-society.org (include original email)
2. **Reply-all** and CC admin@shellfish-society.org

Both will trigger parsing.

### "Can I CC admin@ on past emails?"

Yes! Forward any historical emails to admin@shellfish-society.org to parse them retroactively.

---

## Getting Help

- **Technical issues:** Contact Aaron (aaron@shellfish-society.org)
- **Dashboard access:** Contact ISRS admin team
- **Privacy questions:** See ISRS Data Privacy Policy

---

## FAQ

**Q: Does this replace my normal email?**
A: No! Use your email normally. Just add CC when you want data extracted.

**Q: Will the recipient know I'm using this?**
A: Yes, they'll see admin@shellfish-society.org in the CC field. It's transparent.

**Q: What if I CC admin@ by accident?**
A: No harm done. The email will be parsed but you can delete it from the dashboard.

**Q: Can I use this on my phone?**
A: Yes! Just CC admin@shellfish-society.org from any email client (Gmail, Outlook, Apple Mail, etc.)

**Q: Is there a limit on emails?**
A: No practical limit. Process as many as you need.

**Q: What happens to attachments?**
A: Metadata is extracted (filename, size, type). Files aren't downloaded/stored by default.

**Q: Can I edit extracted data?**
A: Yes! Review and edit in the CRM dashboard.

**Q: Does this work with Gmail/Outlook/Apple Mail?**
A: Yes! Works with any email client.

**Q: How long until I see results?**
A: Usually 30-60 seconds after sending.

---

**Questions? Contact Aaron at aaron@shellfish-society.org**
