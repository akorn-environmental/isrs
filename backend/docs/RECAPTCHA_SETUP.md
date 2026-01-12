# Google reCAPTCHA v3 Setup Guide

This guide will help you set up Google reCAPTCHA v3 for the ISRS Conference registration system to prevent bot submissions.

## What is reCAPTCHA v3?

reCAPTCHA v3 is an invisible bot protection system that doesn't require users to solve puzzles. It analyzes user behavior and returns a score from 0.0 (bot) to 1.0 (human).

## Step-by-Step Setup

### 1. Access Google reCAPTCHA Admin Console

1. Go to: **https://www.google.com/recaptcha/admin**
2. Sign in with your Google account

### 2. Create or Configure Your Site

#### Option A: Create a New Site

1. Click the **"+"** (plus icon) in the top right
2. Fill in the form:
   - **Label:** `ISRS Conference Registration`
   - **reCAPTCHA type:** Select **reCAPTCHA v3**
   - **Domains:** Add the following (one per line):
     ```
     shellfish-society.org
     www.shellfish-society.org
     localhost
     ```
   - **Owners:** Add any additional Google accounts that should have access
3. Accept the reCAPTCHA Terms of Service
4. Click **Submit**

#### Option B: Update Existing Site

If you see a site with key `6LfVHJsqAAAAAKYN8vE_wqVb0mHPmZxKQVjQ0F8H`:

1. Click on the site name
2. Click **Settings** (gear icon)
3. Under **Domains**, ensure these are added:
   ```
   shellfish-society.org
   www.shellfish-society.org
   localhost
   ```
4. Click **Save**

### 3. Copy Your Keys

After creating/configuring the site, you'll see:

```
Site Key:   6LfVHJsqAAAAAKYN8vE_wqVb0mHPmZxKQVjQ0F8H
Secret Key: 6LfVHJsqAAAAAB-xxxxxxxxxxxxxxxxxxxxxxxx
```

- **Site Key** - Used in the frontend (HTML)
- **Secret Key** - Used in the backend (server) - **KEEP THIS PRIVATE!**

### 4. Update Frontend (Already Done)

The frontend already has the site key configured in `/public/conference/register.html`:

```html
<script src="https://www.google.com/recaptcha/api.js?render=6LfVHJsqAAAAAKYN8vE_wqVb0mHPmZxKQVjQ0F8H"></script>
```

**If you created a NEW site with a different key:**

Update line 14 in `/public/conference/register.html` and line 1326 with your new site key.

### 5. Update Backend Environment Variables

#### On Render.com (Production):

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service: `isrs-database-backend`
3. Click **Environment** in the left sidebar
4. Add these environment variables:
   - **Key:** `RECAPTCHA_SECRET_KEY`
   - **Value:** `[Paste your secret key here]`

   - **Key:** `RECAPTCHA_MIN_SCORE`
   - **Value:** `0.5` (or adjust threshold: 0.0-1.0)

5. Click **Save Changes**
6. Render will automatically redeploy with the new environment variables

#### For Local Development:

Update your `.env` file:

```bash
# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=6LfVHJsqAAAAAB-your-actual-secret-key-here
RECAPTCHA_MIN_SCORE=0.5
```

### 6. How It Works

#### Frontend (register.html):
1. User fills out registration form
2. When they click "Complete Registration", reCAPTCHA generates a token
3. Token is sent to backend along with registration data

#### Backend (Node.js):
1. Receives registration request with `recaptcha_token`
2. Validates token with Google's API using secret key
3. Checks if score meets minimum threshold (default: 0.5)
4. If valid: Process registration
5. If invalid: Reject with error

### 7. Score Thresholds

The `RECAPTCHA_MIN_SCORE` determines how strict the bot detection is:

- **0.9-1.0** - Very strict (may reject some real users)
- **0.7-0.8** - Balanced (recommended for important forms)
- **0.5-0.6** - Lenient (default, good for registration)
- **0.3-0.4** - Very lenient (allows most submissions)

**Recommendation:** Start with `0.5` and adjust based on your needs.

### 8. Testing reCAPTCHA

#### Test on Localhost:

```bash
cd isrs-database-backend
npm start
```

Visit: http://localhost:3000/conference/register.html

#### Test on Production:

Visit: https://www.shellfish-society.org/conference/register.html

**Check browser console:**
- ✅ Should see: `✅ reCAPTCHA token obtained`
- ✅ Should see: `✅ Google Analytics initialized`
- ❌ Should NOT see: `⚠️ reCAPTCHA token generation failed`

**Check backend logs on Render:**
- ✅ Should see: `✅ reCAPTCHA verified successfully (score: 0.X)`
- ❌ Should NOT see: `⚠️ RECAPTCHA_SECRET_KEY not configured`

### 9. Troubleshooting

#### Error: "Invalid site key"

**Cause:** Domain not added to allowed domains in reCAPTCHA admin.

**Fix:** Add `shellfish-society.org` and `www.shellfish-society.org` to your site settings.

#### Error: "reCAPTCHA verification failed"

**Cause:** Secret key not configured or incorrect.

**Fix:**
1. Verify secret key is correct in Render environment variables
2. Check backend logs for specific error messages
3. Ensure secret key matches the site key in frontend

#### Warning: "RECAPTCHA_SECRET_KEY not configured"

**Cause:** Environment variable not set in production.

**Fix:** Add `RECAPTCHA_SECRET_KEY` to Render environment variables.

**Note:** The system will still work (registrations allowed) but without bot protection.

#### Score too low errors

**Cause:** User's behavior looks suspicious to reCAPTCHA.

**Fix:**
1. Lower `RECAPTCHA_MIN_SCORE` to `0.4` or `0.3`
2. Ask user to try again from a different browser/device
3. Check if user is using VPN (can trigger low scores)

### 10. Security Best Practices

✅ **Do:**
- Keep secret key private (never commit to git)
- Use environment variables for keys
- Monitor reCAPTCHA scores in analytics
- Adjust threshold based on bot traffic

❌ **Don't:**
- Share secret key publicly
- Use the same keys for dev and production (optional but recommended)
- Set minimum score too high (may reject real users)
- Disable reCAPTCHA validation in production

## Support

- **reCAPTCHA Documentation:** https://developers.google.com/recaptcha/docs/v3
- **Admin Console:** https://www.google.com/recaptcha/admin
- **Support:** https://support.google.com/recaptcha/

## Current Implementation Status

- ✅ Frontend integration complete
- ✅ Backend validation ready
- ⏳ Waiting for secret key configuration
- ⏳ Domain verification in reCAPTCHA admin

**Next Steps:**
1. Complete Google reCAPTCHA admin setup
2. Add secret key to Render environment
3. Test registration form
4. Monitor scores and adjust threshold if needed
