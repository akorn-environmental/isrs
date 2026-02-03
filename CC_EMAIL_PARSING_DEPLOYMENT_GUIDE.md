# CC Email Parsing System - Deployment Guide

Complete deployment guide for the CC-based email parsing workflow using AWS SES.

## Overview

This system allows ISRS team members to simply CC `admin@shellfish-society.org` on any email to trigger automatic AI parsing, contact extraction, and database integration.

**User Workflow:**
1. User sends/receives email about ISRS business
2. User CCs `admin@shellfish-society.org` on the email
3. System automatically parses email, extracts contacts, attachments, action items
4. Parsed data appears in CRM dashboard
5. Low-confidence emails forwarded to admin for review
6. Weekly digest email sent every Monday morning

---

## Prerequisites

Before deploying, ensure you have:

- [x] AWS Account with SES, S3, and SNS access
- [x] Domain `shellfish-society.org` verified in AWS SES
- [x] Backend server publicly accessible (Render, AWS, etc.)
- [x] PostgreSQL database with migrations applied
- [x] Environment variables configured (see Configuration section)

---

## Step 1: Database Migration

Apply the database migrations to create notification tables:

```bash
cd backend
psql $DATABASE_URL -f database/migrations/044_notifications_system.sql
```

**Verify migration:**
```sql
\d notifications
\d processed_s3_emails
\d weekly_digest_preferences
```

Expected output: 3 new tables created.

---

## Step 2: Install Dependencies

Install new npm packages required for CC email parsing:

```bash
cd backend
npm install
```

**New dependencies added:**
- `@aws-sdk/client-s3` - Download emails from S3
- `mailparser` - Parse MIME email format
- `node-cron` - Schedule weekly digest emails

---

## Step 3: Configure Environment Variables

Add these environment variables to your `.env` file or hosting platform:

```bash
# AWS Configuration (required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
INBOUND_EMAIL_BUCKET=isrs-inbound-emails

# Admin Configuration (required)
ADMIN_EMAIL=aaron@shellfish-society.org

# Frontend URL (for links in emails)
FRONTEND_URL=https://isrs-frontend.onrender.com

# Email Service (already configured - SendGrid or Nodemailer)
# Used for sending weekly digest and review notifications
SENDGRID_API_KEY=your_sendgrid_key
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

**For Render deployment:**
1. Go to your backend service in Render dashboard
2. Navigate to Environment tab
3. Add each variable above
4. Click "Save Changes"

---

## Step 4: AWS SES Configuration

### Option A: Automated Setup (CloudFormation)

Use the provided CloudFormation template:

```bash
cd aws
aws cloudformation create-stack \
  --stack-name isrs-inbound-email \
  --template-body file://ses-inbound-config.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=EmailAddress,ParameterValue=admin@shellfish-society.org \
    ParameterKey=WebhookEndpoint,ParameterValue=https://your-backend-url.onrender.com/api/email-parsing/inbound-webhook
```

**Wait for stack creation:**
```bash
aws cloudformation wait stack-create-complete --stack-name isrs-inbound-email
```

### Option B: Manual Setup

Follow the detailed manual setup instructions:

See `aws/MANUAL_SETUP_INSTRUCTIONS.md` for step-by-step AWS console instructions.

**Key steps:**
1. Verify domain in SES
2. Create S3 bucket for email storage
3. Create SNS topic for notifications
4. Create SES receipt rule for admin@shellfish-society.org
5. Subscribe webhook endpoint to SNS topic

---

## Step 5: Verify AWS Setup

### 5.1 Verify Domain in SES

```bash
aws ses verify-domain-identity --domain shellfish-society.org
```

Add the verification TXT record to your DNS:

```
Name: _amazonses.shellfish-society.org
Type: TXT
Value: [verification token from AWS]
```

**Check verification status:**
```bash
aws ses get-identity-verification-attributes --identities shellfish-society.org
```

Wait for status: `Success`

### 5.2 Move Out of SES Sandbox

**Important:** SES starts in sandbox mode (can only send to verified addresses).

To move out of sandbox:
1. Go to AWS SES Console → Account Dashboard
2. Click "Request production access"
3. Fill out use case form (mention: "Email parsing for internal CRM system")
4. Wait for approval (usually 24 hours)

### 5.3 Test S3 Bucket Access

```bash
aws s3 ls s3://isrs-inbound-emails/
```

Expected: Empty bucket or existing emails

### 5.4 Verify SNS Subscription

Check webhook endpoint health:

```bash
curl https://your-backend-url.onrender.com/api/email-parsing/inbound/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Inbound Email Parser",
  "s3": {
    "configured": true,
    "bucket": "isrs-inbound-emails",
    "region": "us-east-1",
    "hasCredentials": true
  },
  "queue": {
    "queueSize": 0,
    "isProcessing": false,
    "processedCount": 0,
    "failedCount": 0,
    "successRate": 0
  }
}
```

---

## Step 6: Deploy Backend

### For Render:

1. Push code to GitHub:
```bash
git add .
git commit -m "Add CC email parsing system"
git push origin main
```

2. Render will auto-deploy (if auto-deploy is enabled)

3. Monitor deployment logs in Render dashboard

### For Manual Deployment:

```bash
cd backend
npm install
npm start
```

**Verify server is running:**
```bash
curl https://your-backend-url.onrender.com/health
```

---

## Step 7: Subscribe Webhook to SNS

After deploying backend, SNS will send a subscription confirmation:

**Method 1: Automatic (recommended)**
- The webhook endpoint automatically confirms subscriptions
- Check server logs for: `[Inbound Webhook] Subscription confirmed successfully`

**Method 2: Manual**
If automatic confirmation fails:
1. Check SNS console for pending subscription
2. Copy SubscribeURL from SNS message
3. Visit the URL in browser to confirm

**Verify subscription:**
```bash
aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:isrs-inbound-emails
```

Expected: Status should be "Confirmed"

---

## Step 8: Testing

### Test 1: Send Test Email

Send a test email CCing admin@shellfish-society.org:

```
To: your-email@example.com
CC: admin@shellfish-society.org
Subject: Test Email Parsing

Hi team,

This is a test email for the CC parsing system.

Contact: John Doe (john@example.com) from Ocean Research Institute
Action Item: Review quarterly report by Feb 15
Attachment: Q4_Report_2025.pdf

Thanks!
```

### Test 2: Check Server Logs

Monitor backend logs for:
```
[Inbound Webhook] Received SNS message type: Notification
[Email Queue] Email queued: emails/...
[Email Queue] Processing email: emails/...
[Inbound Email] Parsing raw MIME email...
[Inbound Email] AI parsing complete (confidence: 85%)
[Notification] Created notification: email_parsed
```

### Test 3: Verify Database

Check parsed email was stored:

```sql
SELECT id, subject, from_email, overall_confidence, created_at
FROM parsed_emails
WHERE metadata->>'source' = 'ses_inbound'
ORDER BY created_at DESC
LIMIT 5;
```

### Test 4: Check Notifications

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url.onrender.com/api/notifications
```

Expected: Notification for parsed email

### Test 5: Test Low Confidence Email

Send an email with vague content (will trigger review):

```
To: your-email@example.com
CC: admin@shellfish-society.org
Subject: Quick question

Hey, got a sec?
```

**Verify:**
- Admin receives review email at aaron@shellfish-society.org
- Email includes confidence score and extracted data

### Test 6: Weekly Digest Preview

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url.onrender.com/api/weekly-digest/preview
```

**Or trigger manual digest:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url.onrender.com/api/weekly-digest/trigger
```

---

## Step 9: Monitor Production

### Dashboard Metrics

Monitor these key metrics:

1. **Queue Stats:**
   ```bash
   curl https://your-backend-url.onrender.com/api/email-parsing/inbound/health | jq '.queue'
   ```

2. **Notification Stats:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend-url.onrender.com/api/notifications/stats
   ```

3. **Parsing Confidence:**
   ```sql
   SELECT
     AVG(overall_confidence) as avg_confidence,
     COUNT(*) FILTER (WHERE overall_confidence >= 70) as high_confidence,
     COUNT(*) FILTER (WHERE overall_confidence < 70) as low_confidence
   FROM parsed_emails
   WHERE metadata->>'source' = 'ses_inbound'
   AND created_at >= NOW() - INTERVAL '7 days';
   ```

### AWS CloudWatch Logs

Monitor AWS services:

1. **SES Metrics:**
   - Go to AWS SES → Reputation dashboard
   - Monitor: Delivery rate, bounce rate, complaint rate

2. **S3 Storage:**
   ```bash
   aws s3 ls s3://isrs-inbound-emails/ --recursive | wc -l
   ```

3. **SNS Delivery:**
   - Check SNS topic metrics in CloudWatch
   - Monitor: NumberOfNotificationsDelivered, NumberOfNotificationsFailed

---

## Troubleshooting

### Issue: Webhook not receiving emails

**Check:**
1. SNS subscription is confirmed (see Step 7)
2. SES receipt rule is active
3. Backend webhook endpoint is accessible publicly
4. Check AWS SES → Email receiving → Receipt rules

**Debug:**
```bash
# Check S3 for received emails
aws s3 ls s3://isrs-inbound-emails/emails/

# Check SNS topic subscriptions
aws sns list-subscriptions-by-topic --topic-arn YOUR_TOPIC_ARN

# Test webhook endpoint
curl -X POST https://your-backend-url.onrender.com/api/email-parsing/inbound-webhook \
  -H "Content-Type: application/json" \
  -d '{"Type":"Notification","Message":"{}"}'
```

### Issue: Emails not being parsed

**Check:**
1. Anthropic API key is configured (ANTHROPIC_API_KEY or CLAUDE_API_KEY)
2. Queue is processing (check logs for `[Email Queue] Starting queue processing`)
3. Database connection is working

**Debug:**
```sql
-- Check for failed parsing
SELECT * FROM parsed_emails
WHERE metadata->>'source' = 'ses_inbound'
ORDER BY created_at DESC
LIMIT 10;

-- Check notifications for errors
SELECT * FROM notifications
WHERE type = 'email_parse_error'
ORDER BY created_at DESC;
```

### Issue: Weekly digest not sending

**Check:**
1. Cron scheduler is running (check server startup logs)
2. Email service is configured (SendGrid or SMTP)
3. Recipients are enabled in weekly_digest_preferences table

**Debug:**
```sql
-- Check digest preferences
SELECT * FROM weekly_digest_preferences;

-- Manually trigger digest
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend-url.onrender.com/api/weekly-digest/trigger
```

### Issue: High rate of low-confidence emails

**Solutions:**
1. Review AI prompt in `inboundEmailService.js`
2. Adjust confidence threshold (currently 70%)
3. Add more context to email subject lines

---

## Security Notes

1. **SNS Signature Verification:** Currently basic implementation - consider using `aws-sns-message-validator` package for production
2. **S3 Lifecycle:** Emails are automatically deleted after 7 days
3. **Database Permissions:** Ensure database user has minimal required permissions
4. **API Keys:** Never commit AWS keys or Anthropic API keys to git
5. **Webhook Endpoint:** Should use HTTPS in production (enforced by SNS)

---

## Cost Estimate

Based on 100 emails/month:

- **AWS SES:** $0.10 per 1000 emails = $0.01
- **AWS S3:** $0.023/GB storage + $0.0004/1000 requests = ~$0.01
- **AWS SNS:** $0.50 per 1 million requests = ~$0.01
- **Anthropic API:** ~1500 tokens/email × 100 emails = 150K tokens/month
  - Input: $3/M tokens = $0.45
  - Output: $15/M tokens = ~$0.50
- **Total:** ~$1.00/month for 100 emails

---

## Next Steps

After successful deployment:

1. **User Training:** Send team instructions on how to use CC workflow
2. **Monitor Performance:** Review parsing accuracy and confidence scores
3. **Adjust Thresholds:** Fine-tune confidence threshold based on results
4. **Scale:** Consider moving to Redis queue for higher volume (>1000 emails/month)

---

## Support

For issues or questions:
- Check server logs: `heroku logs --tail` or Render dashboard
- Review AWS CloudWatch logs
- Contact: aaron@shellfish-society.org
