# Email Service Setup Guide

The ISRS system uses email for magic link authentication, registration confirmations, and abstract submission notifications.

## Email Providers

The system supports two email providers:

1. **SendGrid** (Recommended) - Better deliverability, easier setup
2. **SMTP** (Fallback) - Works with any SMTP server (Gmail, Outlook, etc.)

---

## Option 1: SendGrid Setup (Recommended)

SendGrid provides excellent deliverability and is easy to configure.

### 1. Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com/)
2. Sign up for a free account
   - Free tier: **100 emails/day** (perfect for development and small conferences)
   - Paid tiers available for higher volume

### 2. Verify Sender Identity

SendGrid requires you to verify your sender email address:

1. Log in to SendGrid dashboard
2. Go to **Settings** → **Sender Authentication**
3. Choose one of these options:

   **Option A: Single Sender Verification** (Easier, good for testing)
   - Click "Verify a Single Sender"
   - Enter your email (e.g., noreply@shellfish-society.org)
   - Check your inbox and click the verification link

   **Option B: Domain Authentication** (Better for production)
   - Click "Authenticate Your Domain"
   - Follow the wizard to add DNS records to your domain
   - This improves email deliverability and removes "via sendgrid.net" from emails

### 3. Create API Key

1. Go to **Settings** → **API Keys**
2. Click "Create API Key"
3. Name it "ISRS Backend"
4. Choose "Restricted Access" and enable:
   - **Mail Send** → Full Access
5. Click "Create & View"
6. **Copy the API key** (you won't be able to see it again!)

### 4. Add to Environment Variables

In Render dashboard:

1. Go to your backend service
2. Click **Environment** tab
3. Add these variables:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@shellfish-society.org
EMAIL_FROM_NAME=ISRS
FRONTEND_URL=https://www.shellfish-society.org
```

4. Click "Save Changes"
5. Render will automatically redeploy with the new settings

---

## Option 2: SMTP Setup (Alternative)

If you prefer to use your own email server or Gmail:

### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. Add to Environment Variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=ISRS
FRONTEND_URL=https://www.shellfish-society.org
```

### Using Other SMTP Providers

Replace the SMTP settings with your provider's configuration:

- **Outlook**: `smtp.office365.com` port 587
- **Yahoo**: `smtp.mail.yahoo.com` port 465 (SMTP_SECURE=true)
- **Custom**: Check your email provider's documentation

---

## Testing Email Configuration

### 1. Development Mode (No SendGrid)

If `SENDGRID_API_KEY` is not set, emails will be logged to console instead of sent. This is useful for development:

```bash
# In terminal
npm start

# When you request a magic link, you'll see:
📧 EMAIL (Development Mode - Not Sent)
============================================================
To: user@example.com
Subject: Your Secure Login Link - ISRS

[Full email content displayed]
============================================================
```

### 2. Test Magic Link Email

1. Go to your frontend: `https://www.shellfish-society.org/profile/login.html`
2. Enter your email address
3. Click "Send Magic Link"
4. Check your inbox (and spam folder!)
5. Click the link in the email

### 3. Check SendGrid Dashboard

Monitor email delivery in SendGrid:

1. Go to **Activity** → **Activity Feed**
2. See all sent emails, opens, clicks, bounces
3. Troubleshoot delivery issues

---

## Email Templates

The system includes 3 email templates:

### 1. Magic Link Authentication
- **Function**: `sendMagicLink(email, firstName, magicLink)`
- **Sent**: When user requests login
- **Expires**: 15 minutes

### 2. Registration Confirmation
- **Function**: `sendRegistrationConfirmation(email, firstName, registrationData)`
- **Sent**: After successful conference registration
- **Includes**: Registration number, payment link, conference details

### 3. Abstract Submission Confirmation
- **Function**: `sendAbstractConfirmation(email, firstName, abstractData)`
- **Sent**: After abstract submission
- **Includes**: Submission number, review timeline

---

## Customizing Email Templates

Email templates are in `/src/services/emailService.js`:

```javascript
// Edit the HTML and text templates in these functions:
sendMagicLink()
sendRegistrationConfirmation()
sendAbstractConfirmation()
```

**Tips for customization:**
- HTML emails use inline CSS for maximum compatibility
- Always include a plain-text version (the `text` parameter)
- Test emails across different clients (Gmail, Outlook, iPhone)
- Keep HTML simple - many email clients don't support modern CSS

---

## Troubleshooting

### Emails not arriving?

1. **Check spam folder** - First time emails often go to spam
2. **Verify sender identity** - Make sure you completed SendGrid sender verification
3. **Check SendGrid Activity** - See if email was delivered or bounced
4. **Domain authentication** - Authenticate your domain for better deliverability
5. **Check environment variables** - Make sure `SENDGRID_API_KEY` is set correctly

### SendGrid API errors?

```
Error: Unauthorized
```
→ API key is invalid or expired. Generate a new one.

```
Error: Forbidden
```
→ API key doesn't have Mail Send permission. Create a new key with correct permissions.

```
Error: Bad Request - from email not verified
```
→ Complete sender verification in SendGrid dashboard.

### Gmail SMTP errors?

```
Error: Invalid login
```
→ Make sure you're using an App Password, not your regular password.

```
Error: Less secure app access
```
→ Enable 2FA and use App Passwords instead.

---

## Production Checklist

Before going live:

- [ ] SendGrid account created and sender verified
- [ ] Domain authentication completed (optional but recommended)
- [ ] API key created with Mail Send permission
- [ ] Environment variables set in Render
- [ ] Test magic link flow works end-to-end
- [ ] Test registration confirmation email
- [ ] Test abstract submission email
- [ ] Check spam score with [mail-tester.com](https://www.mail-tester.com/)
- [ ] Monitor SendGrid Activity Feed for first week

---

## Cost Considerations

### SendGrid Free Tier
- 100 emails/day
- Perfect for: Development, small conferences (<50 registrations/day)

### SendGrid Paid Plans
- **Essentials**: $19.95/month - 50,000 emails/month
- **Pro**: $89.95/month - 100,000 emails/month + advanced features

### When to upgrade?
- Conference with >100 registrations expected in one day
- Need dedicated IP address for better deliverability
- Want email validation and additional features

---

## Support

**SendGrid Documentation**: [docs.sendgrid.com](https://docs.sendgrid.com/)
**ISRS Email Code**: `/src/services/emailService.js`
**Controller**: `/src/controllers/userProfileController.js`

For questions about the ISRS email system, check the code comments or contact your development team.
