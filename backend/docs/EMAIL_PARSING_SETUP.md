# ISRS Email Parsing System - Setup Guide

## Overview

The ISRS Email Parsing System automatically extracts structured information from emails using AI, reducing manual data entry and improving organizational efficiency.

## Table of Contents

1. [Quick Start](#quick-start)
2. [How Email Forwarding Works](#how-email-forwarding-works)
3. [How to Forward Emails](#how-to-forward-emails)
4. [What to Forward](#what-to-forward)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Email Forwarding (Recommended)

Forward emails to: **isrs+aaron.kornbluth@gmail.com**

The system will automatically:
- Parse the email content
- Extract contacts, action items, and fundraising signals
- Store results in the database
- Flag items needing review

**Who can forward emails?**
- Any team member with the forwarding address
- Partners and collaborators
- Anyone who receives relevant communications

### Option 2: Web Interface (Manual Entry)

1. Go to https://isrs-frontend.onrender.com/admin/email-parser.html
2. Log in with your admin credentials
3. Paste email content into the form
4. Click "Parse Email"
5. Review extracted data and import contacts

---

## How Email Forwarding Works

### The Process

1. **You receive an email** (donor inquiry, conference registration, partnership request, etc.)
2. **Forward it** to `isrs+aaron.kornbluth@gmail.com`
3. **System receives** the forwarded email via webhook
4. **AI parses** the email automatically
5. **Data is extracted** and stored with confidence scores
6. **Review & import** extracted contacts in the admin portal

### What Gets Captured

When you forward an email, the system extracts:
- **From**: Original sender information
- **Subject**: Email subject line
- **Body**: Full email content (plain text)
- **Date**: When the email was sent
- **Context**: Forwarding metadata

### Forwarding Address Setup

The forwarding address `isrs+aaron.kornbluth@gmail.com` should be:
- Shared with team members who need to forward emails
- Added to your contacts for easy access
- Used consistently for all emails you want parsed

**Pro tip**: In Gmail, you can set up a keyboard shortcut or create a contact entry for quick forwarding.

---

## How to Forward Emails

### From Gmail

1. Open an email you want to parse
2. Click **"More"** (⋮) or press **Shift+F**
3. Click **"Forward"**
4. To: `isrs+aaron.kornbluth@gmail.com`
5. Click **Send**

That's it! The system will automatically parse the email within seconds.

### From Outlook

1. Open the email
2. Click **"Forward"** or press **Ctrl+F** (Windows) / **Cmd+F** (Mac)
3. To: `isrs+aaron.kornbluth@gmail.com`
4. Send

### From Apple Mail

1. Select the email
2. Click **"Forward"** or press **Cmd+Shift+F**
3. To: `isrs+aaron.kornbluth@gmail.com`
4. Send

### From Mobile (iPhone/Android)

1. Open the email
2. Tap the forward icon
3. Enter: `isrs+aaron.kornbluth@gmail.com`
4. Send

---

## What to Forward

Forward any email that contains valuable contact or engagement information:

### High-Value Emails
- **Fundraising inquiries**: Donations, sponsorships, grants, foundation contacts
- **Conference communications**: Registration inquiries, abstract submissions, speaker requests
- **Partnership requests**: Collaboration proposals, research partnerships
- **Board/committee communications**: Key stakeholder interactions
- **Major donor contacts**: Significant contributors or prospects

### Everyday Contacts
- New member introductions
- Conference attendee questions
- Research collaboration requests
- Media inquiries
- Speaking engagements

### When to Forward
✅ **Forward when**:
- Email contains contact information worth saving
- Action items or follow-ups are mentioned
- Fundraising or donation signals are present
- Scheduling or meeting requests are included

❌ **Don't forward**:
- Spam or promotional emails
- Internal team conversations (already tracked elsewhere)
- Automated system notifications
- Sensitive financial or legal information

---

## Testing

### Test Email Template

Send this to `isrs+aaron.kornbluth@gmail.com`:

```
Subject: Test - ICSR Sponsorship Interest

Hi Aaron,

I'm Dr. Sarah Johnson from the Marine Conservation Foundation (sarah.johnson@mcf.org, 555-123-4567). 
We're interested in sponsoring ICSR 2026 at the $50,000 level.

I'd like to schedule a call next week to discuss partnership opportunities. 
Are you available Tuesday or Wednesday afternoon?

Looking forward to collaborating with ISRS on coral reef conservation.

Best regards,
Sarah Johnson
Director of Marine Programs
Marine Conservation Foundation
www.marineconservation.org
```

**Expected Results:**

The system should extract:

✅ **Contact**:
- Name: Dr. Sarah Johnson
- Email: sarah.johnson@mcf.org
- Phone: 555-123-4567
- Organization: Marine Conservation Foundation
- Title: Director of Marine Programs

✅ **Fundraising Signal**:
- Sponsorship interest: $50,000
- Event: ICSR 2026
- Giving capacity: High

✅ **Action Item**:
- Schedule call with Sarah Johnson
- Deadline: Next week
- Priority: High

✅ **Scheduling**:
- Availability: Tuesday or Wednesday afternoon
- Meeting type: Phone call

### Verification Steps

1. **Check Web Interface**:
   - Go to https://isrs-frontend.onrender.com/admin/email-parser.html
   - Email should appear in "Recently Parsed Emails"
   - Click to view details

2. **Check Database**:
   - Contact should be extracted with high confidence (>70%)
   - Action item should be created
   - Fundraising signal should be flagged

3. **Check Gmail** (if using Apps Script):
   - Email should have "ISRS/Parsed" label
   - High confidence items: "ISRS/High-Confidence" label

---

## Troubleshooting

### Email Not Being Parsed

**Issue**: Email forwarded but not appearing in system

**Solutions**:
1. Check target email is correct: `isrs+aaron.kornbluth@gmail.com`
2. Verify API token is valid in Script Properties
3. Check Google Apps Script execution logs (View > Executions)
4. Manually test by running `processEmails()` function

### Low Confidence Scores

**Issue**: Extracted data has low confidence (<70%)

**Solutions**:
1. Email may lack clear information - review manually
2. Update contacts database with known information
3. Use structured email templates when possible
4. Mark as approved if data looks correct

### Contacts Not Importing

**Issue**: Contacts extracted but not in main database

**Solutions**:
1. Check confidence score (must be ≥70% for auto-import)
2. Manually import from email parser UI
3. Verify contact doesn't already exist
4. Check for validation errors (invalid email format, etc.)

### Email Not Processing

**Issue**: Forwarded email but nothing shows up in the system

**Solutions**:
1. Verify you forwarded to the correct address: `isrs+aaron.kornbluth@gmail.com`
2. Check email parser UI - it may have been parsed but with low confidence
3. Wait a few seconds and refresh the admin portal
4. Try using the web interface to manually paste the email content
5. Contact tech admin if issue persists

### Missing Action Items

**Issue**: Action items not extracted from email

**Solutions**:
1. Make action items explicit in email body
2. Use keywords: "need to", "deadline", "by [date]", "action item"
3. Review extracted data - may be in "next steps" instead
4. Manual emails are harder to parse than structured ones

---

## Best Practices

### For Email Senders

When composing emails to ISRS, make them parsing-friendly:

✅ **Do:**
- Include full name and title in signature
- Explicitly state deadlines and action items
- Mention dollar amounts and funding opportunities clearly
- Use clear scheduling language ("Tuesday at 2pm EST")
- Include organization name and website

❌ **Don't:**
- Use vague language ("we should talk sometime")
- Omit contact information
- Use HTML-only emails without plain text
- Include sensitive information (SSN, passwords, etc.)

### For ISRS Staff

1. **Review Pending Items Daily**
   - Check email parser UI for low-confidence items
   - Approve or correct as needed

2. **Import Contacts Regularly**
   - Weekly bulk import of high-confidence contacts
   - Review and clean up duplicates

3. **Create Follow-Up Tasks**
   - Action items with deadlines should go into task system
   - Assign owners for follow-up

4. **Train the System**
   - Mark good vs. bad extractions
   - Provide feedback on accuracy
   - Update contact database to improve matching

---

## Advanced Configuration

### Email Forwarding Best Practices

**Save the forwarding address as a contact:**
1. Add `isrs+aaron.kornbluth@gmail.com` to your contacts
2. Label it: "ISRS Email Parser" or "Forward to ISRS"
3. Makes forwarding faster and reduces typos

**Quick forwarding shortcuts:**
- Gmail: **Shift+F** (forward)
- Outlook: **Ctrl+F** (Windows) or **Cmd+F** (Mac)
- Apple Mail: **Cmd+Shift+F**

**Team coordination:**
- Share the forwarding address with all team members
- Encourage partners to forward relevant emails
- No special permissions or access needed

---

## Support

- **Technical Issues**: Contact tech admin
- **Feature Requests**: Submit via GitHub or admin portal
- **Training**: Schedule session with admin team

---

## Appendix: What Gets Extracted

The system extracts 10 categories of information:

1. **Contact Information**: Names, emails, phones, organizations, titles, addresses
2. **Relationship Mapping**: Connections between people, referrals, introductions
3. **Engagement Indicators**: Interest level, engagement types, communication preferences
4. **Fundraising Signals**: Donation interest, giving capacity, foundation connections
5. **Action Items & Follow-Ups**: Commitments, deadlines, next steps, meetings
6. **Scheduling & Calendar**: Dates, availability, timezones, meeting preferences
7. **Campaign/Project Context**: Topics, policy positions, expertise areas
8. **Institutional Knowledge**: Organizational history, relationships, decision authority
9. **Communication Metadata**: Urgency, sentiment, formality, response timing
10. **Stakeholder Classification**: Roles, influence levels, expertise, geography

Each extracted item includes a **confidence score (0-100)**:
- **90-100%**: Multiple confirmations, very reliable
- **70-90%**: Clearly stated, reliable
- **50-70%**: Implied or inferred, review recommended
- **<50%**: Low confidence, manual review required

---

**Last Updated**: January 2025
**Version**: 1.0
