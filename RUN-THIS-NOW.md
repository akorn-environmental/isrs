# 🚀 RUN THIS NOW - Add S3 Variables to Render

## You Need 2 Things:

1. **Your Render API Key** (starts with `rnd_`)
   - Get it here: https://dashboard.render.com/u/settings/api-keys
   - Click "Create API Key" if you don't have one
   - Copy the key

2. **Run these 2 commands** in your terminal:

```bash
# Replace 'rnd_paste_your_key_here' with your actual Render API key
export RENDER_API_KEY='rnd_paste_your_key_here'

# Run the setup script
bash /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/setup-s3.sh
```

---

## That's It!

The script will:
- ✅ Load AWS credentials automatically
- ✅ Add 4 environment variables to Render
- ✅ Trigger auto-redeploy
- ✅ Show you the next steps

**Takes 30 seconds to run**

---

## Alternative: Manual Method (No Script)

If you prefer to do it manually:

1. Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/env
2. Click "Add Environment Variable"
3. Add these 4 variables (get values from `/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.aws-s3-credentials`):
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` = `us-east-1`
   - `AWS_BUCKET_NAME` = `akorn-assets`
4. Click "Save Changes"

---

**After Setup:**
Test the asset manager: https://isrs-frontend.onrender.com/admin/assets-manager.html
