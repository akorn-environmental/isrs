# Amazon SES Setup Guide for ISRS

Complete guide to setting up Amazon SES for the ISRS email system.

## Why Amazon SES?

- ✅ **62,000 FREE emails/month** for first 12 months (~2,000/day)
- ✅ After free tier: **$0.10 per 1,000 emails** (extremely cost-effective)
- ✅ Scales to millions of emails
- ✅ Excellent deliverability (99%+ inbox rate)
- ✅ Works seamlessly with Render

**Cost Examples:**
- 10,000 emails/month = $1.00
- 50,000 emails/month = $5.00
- 100,000 emails/month = $10.00
- 500,000 emails/month = $50.00

---

## Prerequisites

1. AWS Account (free to create)
2. Credit card (for AWS account verification - won't be charged during free tier)
3. Domain name: `shellfish-society.org`
4. Access to domain DNS settings

---

## Part 1: Create AWS Account (5 minutes)

### 1. Sign Up for AWS

1. Go to [aws.amazon.com](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Enter email, password, and account name: **"ISRS"**
4. Choose account type: **Personal**
5. Enter payment information (required but won't be charged)
6. Verify phone number
7. Choose **Basic Support (Free)**

### 2. Sign In to AWS Console

1. Go to [console.aws.amazon.com](https://console.aws.amazon.com/)
2. Sign in with your new account

---

## Part 2: Set Up Amazon SES (15 minutes)

### Step 1: Choose Region

Amazon SES is available in specific regions. Choose one:

**Recommended Regions:**
- **us-east-1** (N. Virginia) - Most popular, best support
- **us-west-2** (Oregon) - West coast option
- **eu-west-1** (Ireland) - For European users

1. In AWS Console top-right, click the region dropdown
2. Select **US East (N. Virginia)** or your preferred region
3. **Remember this region** - you'll need it later

### Step 2: Navigate to SES

1. In AWS Console search bar, type **"SES"**
2. Click **Simple Email Service**
3. Click **"Get started"** if this is your first time

### Step 3: Verify Email Identity

**Important:** Start with email verification for quick testing. You'll add domain verification later for production.

1. In SES dashboard, click **"Verified identities"** (left sidebar)
2. Click **"Create identity"**
3. Choose **"Email address"**
4. Enter: `noreply@shellfish-society.org` (or your preferred sender email)
   - ⚠️ You must have access to this email inbox
   - Alternative: Use your personal email for initial testing
5. Click **"Create identity"**

**Verify the Email:**
1. Check your inbox for "Amazon Web Services – Email Address Verification Request"
2. Click the verification link
3. Wait for confirmation: "Congratulations! You've successfully verified..."
4. In SES console, identity status should show **"Verified"** (refresh if needed)

### Step 4: Request Production Access (IMPORTANT!)

By default, SES is in **Sandbox Mode**, which restricts you to:
- ❌ Only sending to verified email addresses
- ❌ Maximum 200 emails per 24 hours
- ❌ Maximum 1 email per second

**Request Production Access:**

1. In SES dashboard, click **"Account dashboard"** (left sidebar)
2. Look for yellow banner: "Your account is in the sandbox"
3. Click **"Request production access"**
4. Fill out the form:

   **Mail Type:** Transactional

   **Website URL:** https://www.shellfish-society.org

   **Use case description:** (Copy this)
   ```
   We are the International Society for Reef Studies (ISRS), a scientific organization
   for shellfish restoration and marine conservation. We need to send transactional
   emails for:

   1. User authentication (magic link emails for passwordless login)
   2. Conference registration confirmations
   3. Abstract submission confirmations
   4. Password resets and account notifications

   All recipients have explicitly opted in by registering for our conferences or
   creating accounts on our website. We follow best practices for email deliverability
   and maintain very low bounce/complaint rates.

   Expected volume: 100-500 emails per day during conference registration periods,
   10-50 emails per day during normal operations.
   ```

   **Email addresses:** Leave blank (you've already verified)

   **Acknowledgement:** Check the box

5. Click **"Submit request"**

**Wait for Approval:**
- Typically approved within **24 hours** (often faster)
- You'll receive an email when approved
- You can start development in sandbox mode while waiting

### Step 5: Create IAM User for API Access

For security, don't use your root AWS credentials. Create a limited IAM user:

1. In AWS Console search bar, type **"IAM"**
2. Click **Identity and Access Management**
3. Click **"Users"** (left sidebar)
4. Click **"Create user"**
5. Username: **isrs-ses-sender**
6. Check **"Provide user access to the AWS Management Console"** = NO (uncheck it)
7. Click **"Next"**

**Set Permissions:**
1. Choose **"Attach policies directly"**
2. In search box, type **"SES"**
3. Check **"AmazonSESFullAccess"**
   - (For tighter security, use `ses:SendEmail` and `ses:SendRawEmail` only)
4. Click **"Next"**
5. Click **"Create user"**

**Create Access Keys:**
1. Click on the newly created user **isrs-ses-sender**
2. Click **"Security credentials"** tab
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Choose **"Application running outside AWS"**
6. Click **"Next"**
7. Description: **ISRS Backend on Render**
8. Click **"Create access key"**

**Save Your Credentials:**
```
Access Key ID: AKIA... (20 characters)
Secret Access Key: ... (40 characters)
```

⚠️ **IMPORTANT:** Copy these immediately! The secret key is only shown once.
- Save them to a password manager or secure note
- You'll add these to Render environment variables

---

## Part 3: (Optional) Domain Verification for Production

After getting production access, verify your domain for better deliverability:

### Why Verify Domain?

- ✅ Send from any email @shellfish-society.org (not just verified addresses)
- ✅ Better deliverability and inbox placement
- ✅ DKIM signing for email authentication
- ✅ Removes "via amazonses.com" from email headers

### Steps:

1. In SES console, click **"Verified identities"**
2. Click **"Create identity"**
3. Choose **"Domain"**
4. Enter: `shellfish-society.org`
5. Check **"Enable DKIM signing"**
6. Identity type: **"Easy DKIM"**
7. DKIM key length: **2048-bit** (recommended)
8. Click **"Create identity"**

**Add DNS Records:**

AWS will show you 3-4 DNS records to add. You need to add these to your domain DNS (Squarespace):

1. Copy each DNS record (CNAME records)
2. Go to your domain registrar (Squarespace DNS settings)
3. Add each CNAME record exactly as shown
4. Wait 10-60 minutes for DNS propagation
5. Return to SES console and wait for "Verified" status

**Example DNS Records:**
```
Type: CNAME
Name: abc123._domainkey.shellfish-society.org
Value: abc123.dkim.amazonses.com

Type: CNAME
Name: def456._domainkey.shellfish-society.org
Value: def456.dkim.amazonses.com

Type: CNAME
Name: ghi789._domainkey.shellfish-society.org
Value: ghi789.dkim.amazonses.com
```

---

## Part 4: Configure Render with SES Credentials (5 minutes)

### Add Environment Variables to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click your **isrs-database-backend** service
3. Click **Environment** tab
4. Click **"Add Environment Variable"**

Add these variables:

```
AWS_SES_REGION = us-east-1
(Replace with your chosen region: us-east-1, us-west-2, or eu-west-1)

AWS_ACCESS_KEY_ID = AKIA...
(Paste your IAM Access Key ID from Step 5)

AWS_SECRET_ACCESS_KEY = ...
(Paste your IAM Secret Access Key from Step 5)

EMAIL_FROM = noreply@shellfish-society.org
(The email address you verified in SES)

EMAIL_FROM_NAME = ISRS

FRONTEND_URL = https://www.shellfish-society.org
```

5. Click **"Save Changes"**
6. Render will automatically redeploy (~2 minutes)

---

## Part 5: Test Email Sending

### While in Sandbox Mode (Before Production Access)

You can only send to verified email addresses:

1. Verify your personal email in SES (repeat Step 3 with your email)
2. Go to: https://www.shellfish-society.org/profile/login.html
3. Enter your verified email
4. Click "Send Magic Link"
5. Check your inbox!

### After Production Access Approved

Send to any email address:

1. Go to: https://www.shellfish-society.org/profile/login.html
2. Enter any email address
3. Magic link will be delivered

---

## Monitoring & Metrics

### SES Dashboard

Monitor your email sending:

1. Go to SES Console → **Account dashboard**
2. View:
   - **Emails sent** (last 24 hours)
   - **Bounce rate** (keep < 5%)
   - **Complaint rate** (keep < 0.1%)
   - **Reputation** (keep healthy)

### CloudWatch Logs

Detailed sending logs:

1. Go to **CloudWatch** in AWS Console
2. Click **Logs** → **Log groups**
3. Find `/aws/ses/...` logs
4. View individual email send attempts

### Bounce and Complaint Notifications

Set up SNS notifications for bounces and complaints (recommended for production):

1. In SES console → **Configuration sets**
2. Create a configuration set
3. Add SNS topics for:
   - Bounce notifications
   - Complaint notifications
   - Delivery notifications (optional)

---

## Troubleshooting

### Error: "Email address not verified"

**Problem:** You're in sandbox mode and trying to send to unverified address

**Solutions:**
1. Verify the recipient email in SES console, OR
2. Request production access (Step 4)

### Error: "MessageRejected"

**Problem:** Email was rejected by SES

**Common causes:**
- Sending from unverified email address
- Email content looks like spam
- Recipient email is invalid

**Solution:**
1. Check SES bounce messages in console
2. Verify your FROM email address is correct
3. Review email content for spam triggers

### Error: "Daily sending quota exceeded"

**Problem:** Hit 200 email limit in sandbox mode

**Solution:**
- Request production access (approved within 24 hours)
- Production quota starts at 50,000 emails/day

### Emails Going to Spam

**Solutions:**
1. Complete domain verification with DKIM (Step 3)
2. Add SPF record to DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:amazonses.com ~all
   ```
3. Warm up your sending (start with small volumes)
4. Monitor bounce/complaint rates
5. Use professional email content (no spam words)

---

## Cost Monitoring

### Set Up Billing Alerts

1. Go to **Billing Dashboard** in AWS Console
2. Click **Budgets** (left sidebar)
3. Click **"Create budget"**
4. Choose **"Cost budget"**
5. Set amount: **$10/month**
6. Add your email for alerts
7. Click **"Create budget"**

### Expected Costs

**Free Tier (First 12 Months):**
- 62,000 emails/month = $0

**After Free Tier:**
- 10,000 emails/month = $1.00
- 50,000 emails/month = $5.00
- 100,000 emails/month = $10.00

**Data Transfer:** ~$0.01 per GB (negligible for emails)

---

## Production Checklist

Before launch:

- [ ] AWS account created
- [ ] SES region selected (remember it!)
- [ ] Email identity verified: `noreply@shellfish-society.org`
- [ ] Production access requested and approved
- [ ] Domain verification completed (DKIM)
- [ ] IAM user created with SES permissions
- [ ] Access keys saved securely
- [ ] Render environment variables configured
- [ ] Test email sent successfully
- [ ] Billing alerts configured
- [ ] Bounce/complaint notifications set up (optional)

---

## Security Best Practices

1. **Never commit AWS credentials to Git**
2. **Use IAM users, not root credentials**
3. **Rotate access keys every 90 days**
4. **Enable MFA on AWS root account**
5. **Monitor SES reputation daily**
6. **Set up CloudWatch alarms for high bounce rates**

---

## Support Resources

- **AWS SES Documentation:** https://docs.aws.amazon.com/ses/
- **SES Pricing:** https://aws.amazon.com/ses/pricing/
- **AWS Support:** https://console.aws.amazon.com/support/
- **SES Best Practices:** https://docs.aws.amazon.com/ses/latest/dg/best-practices.html

---

## Next Steps

1. Follow this guide to set up AWS SES
2. Add credentials to Render
3. Test magic link emails
4. Monitor first week of sending
5. Request quota increase if needed (can send up to 50k+/day after approval)

Your ISRS system is now configured to send unlimited emails at incredible prices! 🚀
