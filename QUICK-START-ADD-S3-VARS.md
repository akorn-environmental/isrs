# Quick Start: Add S3 Environment Variables to Render

Follow these steps exactly to add AWS S3 credentials to your ISRS Python backend.

---

## Step 1: Get Your Render API Key

1. Go to: https://dashboard.render.com/u/settings/api-keys
2. If you don't have an API key yet:
   - Click "Create API Key"
   - Name it: "CLI Access"
   - Click "Create API Key"
   - **COPY THE KEY** (starts with `rnd_`) - you won't see it again!
3. If you already have a key, copy it

---

## Step 2: Run the Script

Copy and paste these commands **one at a time** into your terminal:

```bash
# 1. Load AWS credentials from the system file
source /Users/akorn/Desktop/ITERM\ PROJECTS/_SYSTEM/.aws-s3-credentials

# 2. Set your Render API key (replace with your actual key)
export RENDER_API_KEY='rnd_paste_your_key_here'

# 3. Run the configuration script
bash /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/ADD-S3-ENV-VARS.sh
```

---

## Expected Output

You should see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ADD S3 ENVIRONMENT VARIABLES TO ISRS PYTHON BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment Variables to Add:

  AWS_ACCESS_KEY_ID = AKIA6PVP...ZYS5
  AWS_SECRET_ACCESS_KEY = Di+UeHAa...JuHH
  AWS_REGION = us-east-1
  AWS_BUCKET_NAME = akorn-assets

✓ RENDER_API_KEY found

Adding environment variables...

Adding AWS_ACCESS_KEY_ID... ✓
Adding AWS_SECRET_ACCESS_KEY... ✓
Adding AWS_REGION... ✓
Adding AWS_BUCKET_NAME... ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Environment variables configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next steps:
  1. Commit and push backend changes to trigger deployment
  2. After deployment, test asset upload endpoint:
     curl https://isrs-python-backend.onrender.com/api/assets/
```

---

## Step 3: Verify Configuration

After running the script, verify the variables were added:

1. Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/env
2. You should see 4 new environment variables:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - AWS_BUCKET_NAME

---

## Step 4: Wait for Auto-Redeploy

Render will automatically redeploy the service (takes ~3-5 minutes)

Check deployment status:
```bash
render deploys list srv-d5k0t5d6ubrc739a4e50 -o json | head -30
```

Or check the dashboard:
https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50

---

## Troubleshooting

### "RENDER_API_KEY not found in environment"
**Cause:** You didn't export the API key or it was typed incorrectly

**Fix:** Make sure you ran:
```bash
export RENDER_API_KEY='rnd_your_actual_key_here'
```

### "No such file or directory: .aws-s3-credentials"
**Cause:** The credentials file doesn't exist

**Fix:** The file should be at `/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.aws-s3-credentials`

Check if it exists:
```bash
ls -la /Users/akorn/Desktop/ITERM\ PROJECTS/_SYSTEM/.aws-s3-credentials
```

If it doesn't exist, use **Option 1** (manual dashboard method) instead.

### "curl: Failed to connect"
**Cause:** Network issue or Render API is down

**Fix:**
1. Check your internet connection
2. Try again in a few minutes
3. If persists, use **Option 1** (manual dashboard method)

---

## Alternative: Manual Dashboard Method (Option 1)

If the script doesn't work, you can add variables manually:

1. Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/env
2. Click "Add Environment Variable" button
3. Add these 4 variables one at a time:

   **Variable 1:**
   - Key: `AWS_ACCESS_KEY_ID`
   - Value: Get from `/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.aws-s3-credentials`

   **Variable 2:**
   - Key: `AWS_SECRET_ACCESS_KEY`
   - Value: Get from `/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.aws-s3-credentials`

   **Variable 3:**
   - Key: `AWS_REGION`
   - Value: `us-east-1`

   **Variable 4:**
   - Key: `AWS_BUCKET_NAME`
   - Value: `akorn-assets`

4. Click "Save Changes"

---

## After Configuration

Once the environment variables are added and deployment succeeds:

1. **Access the asset manager:**
   https://isrs-frontend.onrender.com/admin/assets-manager.html

2. **Test uploading an image:**
   - Drag and drop an image file
   - Select category (e.g., "Logo")
   - Add tags (optional)
   - Click "Upload Asset"
   - Verify it appears in the grid

3. **Test other features:**
   - View asset (opens in new tab)
   - Search by filename
   - Filter by category
   - Delete asset

---

**Total Time:** ~5 minutes
**Next:** Test asset management features after deployment completes
