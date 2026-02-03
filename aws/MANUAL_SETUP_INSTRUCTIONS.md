# AWS SES Inbound Email - Manual Setup Instructions

**Purpose:** Configure AWS SES to receive emails at `admin@shellfish-society.org`

**Estimated Time:** 30-45 minutes

---

## Prerequisites

- [x] AWS Account with SES access
- [x] Domain: shellfish-society.org (verified in SES)
- [x] DNS access to add MX records
- [x] Backend deployed and accessible via HTTPS

---

## Option 1: CloudFormation (Recommended)

### Step 1: Deploy CloudFormation Stack

```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/aws

aws cloudformation create-stack \
  --stack-name isrs-email-parsing \
  --template-body file://ses-inbound-config.yaml \
  --parameters \
    ParameterKey=EmailDomain,ParameterValue=shellfish-society.org \
    ParameterKey=EmailAddress,ParameterValue=admin@shellfish-society.org \
    ParameterKey=BackendWebhookURL,ParameterValue=https://your-backend.onrender.com/api/email-parsing/inbound-webhook \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### Step 2: Wait for Stack Creation

```bash
aws cloudformation wait stack-create-complete \
  --stack-name isrs-email-parsing \
  --region us-east-1
```

### Step 3: Get Stack Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name isrs-email-parsing \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

---

## Option 2: Manual Setup (AWS Console)

### Step 1: Verify Domain in SES

1. Go to AWS Console → SES → Verified identities
2. Click "Create identity"
3. Select "Domain"
4. Enter: `shellfish-society.org`
5. Click "Create identity"
6. **Add DNS records** shown in SES console to your domain

**Wait 10-30 minutes for verification**

---

### Step 2: Create S3 Bucket

1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `isrs-inbound-emails-YOUR_ACCOUNT_ID`
   - Replace YOUR_ACCOUNT_ID with your AWS account ID
4. Region: us-east-1 (or your preferred region)
5. **Block all public access:** ✅ Enabled
6. **Versioning:** Enabled
7. Click "Create bucket"

**Configure Lifecycle Rule:**
1. Go to bucket → Management → Lifecycle rules
2. Create rule: "DeleteOldEmails"
3. Rule scope: All objects
4. Lifecycle rule actions:
   - ✅ Expire current versions: 7 days
   - ✅ Permanently delete noncurrent versions: 1 day
5. Save

**Add Bucket Policy:**
1. Go to bucket → Permissions → Bucket policy
2. Add this policy (replace BUCKET_NAME and ACCOUNT_ID):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSESPuts",
      "Effect": "Allow",
      "Principal": {
        "Service": "ses.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "aws:Referer": "ACCOUNT_ID"
        }
      }
    }
  ]
}
```

---

### Step 3: Create SNS Topic

1. Go to AWS Console → SNS → Topics
2. Click "Create topic"
3. Type: Standard
4. Name: `isrs-email-received`
5. Display name: `ISRS Email Received Notifications`
6. Click "Create topic"

**Add Access Policy:**
1. Click on the topic → Access policy → Edit
2. Add this policy (replace TOPIC_ARN and ACCOUNT_ID):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSESPublish",
      "Effect": "Allow",
      "Principal": {
        "Service": "ses.amazonaws.com"
      },
      "Action": "SNS:Publish",
      "Resource": "TOPIC_ARN",
      "Condition": {
        "StringEquals": {
          "aws:Referer": "ACCOUNT_ID"
        }
      }
    }
  ]
}
```

**Create Subscription:**
1. Click on the topic → "Create subscription"
2. Protocol: HTTPS
3. Endpoint: `https://your-backend.onrender.com/api/email-parsing/inbound-webhook`
4. Click "Create subscription"
5. Status will be "Pending confirmation"
   - **Important:** Your webhook must confirm the subscription (handled automatically by code)

---

### Step 4: Create SES Receipt Rule Set

1. Go to AWS Console → SES → Email receiving
2. Click "Create rule set"
3. Rule set name: `isrs-inbound-rules`
4. Click "Create rule set"

**Activate the rule set:**
```bash
aws ses set-active-receipt-rule-set \
  --rule-set-name isrs-inbound-rules \
  --region us-east-1
```

---

### Step 5: Create SES Receipt Rule

1. Go to SES → Email receiving → Rule sets
2. Click on `isrs-inbound-rules`
3. Click "Create rule"

**Rule Configuration:**
- Rule name: `ISRS-Email-Parser`
- Status: ✅ Enabled
- Spam and virus scanning: ✅ Enabled

**Recipients:**
- Add recipient: `admin@shellfish-society.org`

**Actions (in order):**

1. **Action 1: S3**
   - S3 bucket: `isrs-inbound-emails-YOUR_ACCOUNT_ID`
   - Object key prefix: `emails/`
   - Encryption: None (or your preference)

2. **Action 2: SNS**
   - SNS topic: `isrs-email-received`
   - Encoding: UTF-8

Click "Create rule"

---

### Step 6: Add MX Record to DNS

**Add this MX record to shellfish-society.org:**

```
Type: MX
Priority: 10
Value: inbound-smtp.us-east-1.amazonaws.com
```

**If using different region:**
- us-east-1: `inbound-smtp.us-east-1.amazonaws.com`
- us-west-2: `inbound-smtp.us-west-2.amazonaws.com`
- eu-west-1: `inbound-smtp.eu-west-1.amazonaws.com`

**DNS Provider Examples:**

**Route 53:**
1. Go to Route 53 → Hosted zones
2. Click on `shellfish-society.org`
3. Create record:
   - Record name: `admin` (or blank for root)
   - Record type: MX
   - Value: `10 inbound-smtp.us-east-1.amazonaws.com`
   - TTL: 300

**Cloudflare:**
1. Go to DNS → Records
2. Add record:
   - Type: MX
   - Name: `admin` (or `@` for root)
   - Mail server: `inbound-smtp.us-east-1.amazonaws.com`
   - Priority: 10

**GoDaddy:**
1. Go to DNS Management
2. Add record:
   - Type: MX
   - Host: `admin`
   - Points to: `inbound-smtp.us-east-1.amazonaws.com`
   - Priority: 10

**Wait 5-60 minutes for DNS propagation**

---

## Testing

### Test 1: Send Email to admin@shellfish-society.org

```bash
# From your personal email, send to:
To: admin@shellfish-society.org
Subject: Test Email Parsing
Body: This is a test email.
```

### Test 2: Verify Email in S3

```bash
aws s3 ls s3://isrs-inbound-emails-YOUR_ACCOUNT_ID/emails/
```

Expected: You should see a new object

### Test 3: Download and View Email

```bash
aws s3 cp s3://isrs-inbound-emails-YOUR_ACCOUNT_ID/emails/OBJECT_KEY test-email.txt
cat test-email.txt
```

### Test 4: Check SNS Notification

Check your backend logs for incoming webhook:
```bash
# Should see POST /api/email-parsing/inbound-webhook
```

---

## Troubleshooting

### Issue: MX record not working

**Check DNS:**
```bash
dig admin@shellfish-society.org MX
nslookup -type=MX admin.shellfish-society.org
```

Expected: Should show `inbound-smtp.us-east-1.amazonaws.com`

**Solution:** Wait longer for DNS propagation (up to 48 hours, usually 1 hour)

---

### Issue: Email bouncing

**Check SES receipt rule:**
1. Go to SES → Email receiving → Rule sets
2. Verify rule is active and enabled
3. Check recipient list includes `admin@shellfish-society.org`

**Check domain verification:**
1. Go to SES → Verified identities
2. Verify `shellfish-society.org` status is "Verified"

---

### Issue: SNS subscription not confirming

**Check webhook endpoint:**
```bash
curl -X POST https://your-backend.onrender.com/api/email-parsing/inbound-webhook \
  -H "Content-Type: application/json" \
  -d '{"Type":"SubscriptionConfirmation","SubscribeURL":"https://test.com"}'
```

Expected: 200 OK

**Manual confirmation:**
1. Go to SNS → Subscriptions
2. Find subscription with status "Pending confirmation"
3. Copy SubscribeURL from confirmation message
4. Visit URL in browser to confirm manually

---

### Issue: Emails not appearing in S3

**Check S3 bucket policy:**
```bash
aws s3api get-bucket-policy --bucket isrs-inbound-emails-YOUR_ACCOUNT_ID
```

Verify SES has PutObject permission.

**Check SES rule actions:**
1. Go to SES → Email receiving → Rules
2. Verify S3 action is configured correctly
3. Verify bucket name and prefix

---

## Verification Checklist

- [ ] Domain verified in SES
- [ ] S3 bucket created with lifecycle rule
- [ ] S3 bucket policy allows SES
- [ ] SNS topic created with access policy
- [ ] SNS subscription created and confirmed
- [ ] SES receipt rule set created and activated
- [ ] SES receipt rule created with S3 and SNS actions
- [ ] MX record added to DNS
- [ ] DNS propagation complete (test with dig/nslookup)
- [ ] Test email sent to admin@shellfish-society.org
- [ ] Email appears in S3 bucket
- [ ] SNS notification received by webhook
- [ ] Backend webhook confirms SNS subscription

---

## Environment Variables

Add these to your backend `.env`:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 Email Bucket
INBOUND_EMAIL_BUCKET=isrs-inbound-emails-YOUR_ACCOUNT_ID

# SNS Topic (for verification)
EMAIL_NOTIFICATION_TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT_ID:isrs-email-received

# Admin email for low-confidence forwarding
ADMIN_EMAIL=aaron@shellfish-society.org
```

---

## Security Recommendations

1. **Use IAM Role** (Render/Heroku/EC2):
   - Create IAM role with S3 read-only access
   - Attach to your backend service
   - No need for AWS_ACCESS_KEY_ID/SECRET

2. **Restrict S3 Access**:
   - Only allow SES to write
   - Only allow backend to read
   - No public access

3. **Enable SNS Signature Verification**:
   - Always verify SNS message signatures (implemented in code)

4. **Email Retention**:
   - 7-day lifecycle rule ensures privacy
   - Consider shorter retention if needed

5. **Monitor Costs**:
   - Set up AWS billing alerts
   - Expected: <$1/month for 100 emails

---

## Cost Estimate

**Monthly costs (100 emails/month):**
- SES inbound: $0.01 (100 × $0.10/1000)
- S3 storage: <$0.01 (< 100MB × $0.023/GB)
- SNS notifications: <$0.01 (100 × $0.50/million)
- **Total: <$0.05/month**

---

## Next Steps

After AWS setup is complete:

1. ✅ Deploy backend webhook code
2. ✅ Test with sample email
3. ✅ Verify parsing works end-to-end
4. ✅ Communicate CC workflow to team
5. ✅ Monitor first week of usage

---

**Questions?** Check troubleshooting section or contact AWS support.
