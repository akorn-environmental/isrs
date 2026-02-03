# Quick Start: CC Email Parsing

Fast deployment guide for getting the CC email parsing system running.

---

## Prerequisites (5 minutes)

1. AWS Account with admin access
2. Domain verified: shellfish-society.org
3. Backend deployed and publicly accessible
4. PostgreSQL database running

---

## Step 1: Database (2 minutes)

```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/backend
psql $DATABASE_URL -f database/migrations/044_notifications_system.sql
```

**Verify:**
```sql
\dt notifications
\dt processed_s3_emails
\dt weekly_digest_preferences
```

---

## Step 2: Dependencies (3 minutes)

```bash
npm install
```

New packages: `@aws-sdk/client-s3`, `mailparser`, `node-cron`

---

## Step 3: Environment Variables (5 minutes)

Add to `.env` or Render dashboard:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
INBOUND_EMAIL_BUCKET=isrs-inbound-emails
ADMIN_EMAIL=aaron@shellfish-society.org
FRONTEND_URL=https://isrs-frontend.onrender.com
```

---

## Step 4: AWS Setup (15 minutes)

### Option A: CloudFormation (Recommended)

```bash
cd aws
aws cloudformation create-stack \
  --stack-name isrs-inbound-email \
  --template-body file://ses-inbound-config.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=EmailAddress,ParameterValue=admin@shellfish-society.org \
    ParameterKey=WebhookEndpoint,ParameterValue=https://isrs-database-backend.onrender.com/api/email-parsing/inbound-webhook

aws cloudformation wait stack-create-complete --stack-name isrs-inbound-email
```

### Option B: Manual Setup

See `aws/MANUAL_SETUP_INSTRUCTIONS.md`

---

## Step 5: Deploy Backend (5 minutes)

### Render (Auto-deploy):
```bash
git add .
git commit -m "Add CC email parsing system"
git push origin main
```

### Manual:
```bash
npm start
```

**Verify:**
```bash
curl https://your-backend.onrender.com/api/email-parsing/inbound/health
```

Expected: Status "healthy" with S3 config

---

## Step 6: Test (10 minutes)

### Send Test Email:

```
To: your-email@example.com
CC: admin@shellfish-society.org
Subject: Test CC Email Parsing

Hi,

Testing the CC email parsing system.

Contact: John Doe (john@example.com)
Action: Review by Feb 15

Thanks!
```

### Monitor Logs:

```bash
# Render
Check dashboard logs

# Local
npm start (watch console)
```

Expected logs:
```
[Inbound Webhook] Received SNS message type: Notification
[Email Queue] Email queued
[Email Queue] Processing email
[Inbound Email] AI parsing complete (confidence: 85%)
[Notification] Created notification: email_parsed
```

### Check Database:

```sql
SELECT id, subject, from_email, overall_confidence
FROM parsed_emails
WHERE metadata->>'source' = 'ses_inbound'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Notifications:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.onrender.com/api/notifications
```

---

## Step 7: Production Checklist

- [ ] SES out of sandbox mode (request production access)
- [ ] SNS subscription confirmed (check logs for "Subscription confirmed")
- [ ] DNS records added for SES domain verification
- [ ] Test low-confidence email (sends review to admin)
- [ ] Weekly digest preview works: GET `/api/weekly-digest/preview`
- [ ] Monitoring alerts configured
- [ ] Team trained (share `HOW_TO_USE_CC_EMAIL_PARSING.md`)

---

## Troubleshooting

### Issue: Webhook not receiving emails
```bash
# Check SNS subscription
aws sns list-subscriptions-by-topic --topic-arn YOUR_TOPIC_ARN

# Check S3 for emails
aws s3 ls s3://isrs-inbound-emails/emails/

# Test webhook
curl -X POST https://your-backend.onrender.com/api/email-parsing/inbound-webhook \
  -H "Content-Type: application/json" \
  -d '{"Type":"Notification","Message":"{}"}'
```

### Issue: Emails not parsed
```sql
-- Check for parse errors
SELECT * FROM notifications WHERE type = 'email_parse_error' ORDER BY created_at DESC;

-- Check queue stats
curl https://your-backend.onrender.com/api/email-parsing/inbound/health
```

### Issue: Low confidence rate high
- Review emails in dashboard
- Adjust confidence threshold in `inboundEmailService.js` (currently 70%)
- Tune AI prompt if needed

---

## Quick Commands

```bash
# Health check
curl https://your-backend.onrender.com/api/email-parsing/inbound/health

# Notification stats
curl -H "Authorization: Bearer TOKEN" https://your-backend.onrender.com/api/notifications/stats

# Weekly digest preview
curl -H "Authorization: Bearer TOKEN" https://your-backend.onrender.com/api/weekly-digest/preview

# Trigger manual digest
curl -X POST -H "Authorization: Bearer TOKEN" https://your-backend.onrender.com/api/weekly-digest/trigger

# Check recent parsed emails
psql $DATABASE_URL -c "SELECT id, subject, overall_confidence, created_at FROM parsed_emails WHERE metadata->>'source' = 'ses_inbound' ORDER BY created_at DESC LIMIT 10;"
```

---

## Support

- **Deployment Guide:** `CC_EMAIL_PARSING_DEPLOYMENT_GUIDE.md`
- **User Guide:** `HOW_TO_USE_CC_EMAIL_PARSING.md`
- **Summary:** `CC_EMAIL_PARSING_IMPLEMENTATION_SUMMARY.md`
- **Contact:** aaron@shellfish-society.org

---

**Total Setup Time: ~40 minutes**
**Status: Ready for deployment**
