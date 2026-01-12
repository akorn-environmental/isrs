# ISRS Database - Deployment Guide

This guide walks you through deploying the ISRS Database backend to Render and updating your frontend to use it.

## Part 1: Setup Google Cloud Service Account

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Note your project ID

### Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### Step 3: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in:
   - Service account name: `isrs-database-backend`
   - Service account ID: `isrs-database-backend`
   - Click **Create and Continue**
4. Skip the optional steps
5. Click **Done**

### Step 4: Generate Service Account Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. The JSON file will download automatically - **SAVE THIS FILE SECURELY**

### Step 5: Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1o1dG8fBCIKb1_pNAqZmlmOhQHjNIIwwJzUT5s_BQ3OA/edit
2. Click the **Share** button
3. Add the service account email from the JSON file (looks like `isrs-database-backend@project-id.iam.gserviceaccount.com`)
4. Give it **Editor** permissions
5. Uncheck "Notify people"
6. Click **Share**

## Part 2: Deploy to Render

### Step 1: Push Code to GitHub

1. Open terminal in the backend directory:
   ```bash
   cd /Users/akorn/isrs-database-backend
   ```

2. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ISRS Database Backend"
   ```

3. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name: `isrs-database-backend`
   - Keep it **Private**
   - Don't initialize with README (we already have one)
   - Click **Create repository**

4. Connect and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/isrs-database-backend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com/)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create Web Service

1. Click **New +** > **Web Service**
2. Connect your `isrs-database-backend` repository
3. Render will auto-detect the configuration from `render.yaml`
4. Click **Create Web Service**

### Step 4: Add Environment Variables

In the Render dashboard, go to your service and add these **Environment Variables**:

1. **CLAUDE_API_KEY**
   - Value: `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`

2. **GOOGLE_SERVICE_ACCOUNT_EMAIL**
   - Open the downloaded JSON file from Step 1
   - Copy the value of `client_email`
   - Example: `isrs-database-backend@project-id.iam.gserviceaccount.com`

3. **GOOGLE_PRIVATE_KEY**
   - Open the downloaded JSON file
   - Copy the value of `private_key` (including the quotes and newlines)
   - **Important**: Keep the `\n` characters as-is
   - Example: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"`

### Step 5: Deploy

1. Click **Save Changes** (if you manually added variables)
2. Render will automatically build and deploy
3. Wait for the build to complete (usually 2-3 minutes)
4. Your API will be available at: `https://your-service-name.onrender.com`

### Step 6: Test the Deployment

1. Get your Render URL (looks like `https://isrs-database-api.onrender.com`)

2. Test the health endpoint:
   ```bash
   curl https://your-service-name.onrender.com/health
   ```

3. You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-01-30T..."
   }
   ```

4. Test the stats endpoint:
   ```bash
   curl https://your-service-name.onrender.com/api/admin/stats
   ```

## Part 3: Update Frontend

### Step 1: Update Configuration

1. Open your frontend HTML file (currently on GitHub Pages)

2. Find the `CONFIG` object (around line 1560):
   ```javascript
   const CONFIG = {
       WEB_APP_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
       EMAILJS_SERVICE_ID: 'service_a9wrtmr',
       EMAILJS_TEMPLATE_ID: 'template_7h7up3g',
       EMAILJS_PUBLIC_KEY: 'B6-9-G29FPsgjWE_7'
   };
   ```

3. Replace it with your new Render URL:
   ```javascript
   const CONFIG = {
       WEB_APP_URL: 'https://your-service-name.onrender.com',
       EMAILJS_SERVICE_ID: 'service_a9wrtmr',
       EMAILJS_TEMPLATE_ID: 'template_7h7up3g',
       EMAILJS_PUBLIC_KEY: 'B6-9-G29FPsgjWE_7'
   };
   ```

### Step 2: Update API Calls

The backend uses RESTful endpoints, so you'll need to update the `makeAPICall` function:

**OLD** (Google Apps Script format):
```javascript
async function makeAPICall(action, additionalData = {}) {
    const formData = new URLSearchParams();
    formData.append('action', action);

    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });

    const response = await fetch(CONFIG.WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
    });

    return await response.json();
}
```

**NEW** (RESTful format):
```javascript
async function makeAPICall(action, additionalData = {}) {
    // Map old actions to new endpoints
    const endpoints = {
        'getStats': { method: 'GET', url: '/api/admin/stats' },
        'getICSRData': { method: 'GET', url: '/api/admin/icsr-data' },
        'testConnection': { method: 'GET', url: '/api/admin/test-connection' },
        'runEnhancement': { method: 'POST', url: '/api/admin/enhance' },
        'quickCleanup': { method: 'POST', url: '/api/admin/cleanup' },
        'exportData': { method: 'GET', url: '/api/admin/export' },
        'getUserPermissions': { method: 'GET', url: `/api/users/permissions?email=${additionalData.email || ''}` },
        'getBoardMembers': { method: 'GET', url: '/api/admin/board-members' },
        'getRegistrationStats': { method: 'GET', url: '/api/admin/registration-stats' },
        'getVoteHistory': { method: 'GET', url: `/api/votes/history?limit=${additionalData.limit || 500}` },
        'exportVoteHistory': { method: 'GET', url: '/api/votes/export' },
        'processBoardVote': { method: 'POST', url: '/api/votes/process' },
        'aiProcessBoardVote': { method: 'POST', url: '/api/votes/ai-process' }
    };

    const endpoint = endpoints[action];
    if (!endpoint) {
        throw new Error(`Unknown action: ${action}`);
    }

    const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'omit'
    };

    if (endpoint.method === 'POST') {
        options.body = JSON.stringify(additionalData);
    }

    const response = await fetch(CONFIG.WEB_APP_URL + endpoint.url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}
```

### Step 3: Update Vote Processing

Find the `processVoteEmail` function and update the payload format:

```javascript
async function processVoteEmail(data) {
    showLoading('AI is analyzing the email and extracting vote information...');

    try {
        const result = await makeAPICall('aiProcessBoardVote', {
            emailContent: data.emailContent,
            motionTitle: data.motionTitle,
            voteDate: data.voteDate,
            voteMethod: data.voteMethod,
            processedBy: currentUser ? currentUser.name : 'Unknown'
        });

        if (result.success) {
            displayVoteResults(result.vote);
            showSuccess('✅ Vote processed successfully and saved to Google Sheets!');
            refreshStats();

            document.getElementById('voteProcessingForm').reset();
            document.getElementById('voteDate').value = new Date().toISOString().split('T')[0];
        } else {
            throw new Error(result.error || 'Failed to save vote data');
        }

    } catch (error) {
        console.error('Error processing vote:', error);
        showError('Failed to process vote: ' + error.message);
    }
}
```

### Step 4: Deploy Frontend Changes

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update API endpoint to Render backend"
   git push origin main
   ```

2. GitHub Pages will automatically deploy the changes
3. Wait 1-2 minutes for deployment

### Step 5: Test Everything

1. Open your GitHub Pages site
2. Login with your authorized email
3. Test:
   - Dashboard statistics refresh
   - Board vote processing
   - Vote history
   - All other features

## Part 4: Monitor and Maintain

### Render Dashboard

- Monitor logs: https://dashboard.render.com/
- View deployments and health
- Check for errors

### Free Tier Limitations

Render's free tier:
- Service spins down after 15 minutes of inactivity
- 750 hours/month free
- First request after spin-down takes 30-60 seconds

To keep it always-on, upgrade to paid plan ($7/month).

### Environment Variable Updates

To update environment variables:
1. Go to Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Update variables
5. Service will automatically redeploy

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution**: Check CORS settings in backend. Ensure `CORS_ORIGIN=*` in Render environment variables.

### Issue: Google Sheets permission denied

**Solution**:
1. Verify service account email is shared on the Google Sheet
2. Verify it has Editor permissions
3. Check the private key is correctly formatted in environment variables

### Issue: Claude API errors

**Solution**:
1. Verify API key is correct in Render environment variables
2. Check you have credits remaining
3. Monitor rate limits

### Issue: Service takes long to respond initially

**Solution**: This is normal on free tier. Service spins down after inactivity. Upgrade to paid plan for always-on service.

## Need Help?

Contact: aaron.kornbluth@gmail.com

## Checklist

- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service account created with key
- [ ] Google Sheet shared with service account
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables added to Render
- [ ] Backend deployed successfully
- [ ] Backend health check passes
- [ ] Frontend CONFIG updated
- [ ] Frontend API calls updated
- [ ] Frontend deployed to GitHub Pages
- [ ] End-to-end testing completed

## Next Steps

After successful deployment:
1. Monitor the backend for 24 hours
2. Test all features thoroughly
3. Update documentation as needed
4. Consider upgrading to Render paid plan for production use
5. Set up monitoring/alerting (optional)
