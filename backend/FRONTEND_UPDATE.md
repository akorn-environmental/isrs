# Frontend Update Guide

This document explains the exact changes needed in your frontend HTML file to connect to the new Render backend.

## File to Update

Your current frontend file (on GitHub Pages): `index.html`

## Changes Required

### 1. Update CONFIG Object

**Location**: Around line 1560

**OLD CODE**:
```javascript
const CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbydPSksQVAI9z3yf0jiMD7ATEnD-HXtl-RYEdnMFVFV_Ww4p0wOfftY1hAXZ9AQss9yjw/exec',
    EMAILJS_SERVICE_ID: 'service_a9wrtmr',
    EMAILJS_TEMPLATE_ID: 'template_7h7up3g',
    EMAILJS_PUBLIC_KEY: 'B6-9-G29FPsgjWE_7'
};
```

**NEW CODE**:
```javascript
const CONFIG = {
    WEB_APP_URL: 'https://YOUR_RENDER_SERVICE.onrender.com',  // ⬅️ REPLACE WITH YOUR RENDER URL
    EMAILJS_SERVICE_ID: 'service_a9wrtmr',
    EMAILJS_TEMPLATE_ID: 'template_7h7up3g',
    EMAILJS_PUBLIC_KEY: 'B6-9-G29FPsgjWE_7'
};
```

### 2. Replace makeAPICall Function

**Location**: Around line 1610

**FIND THIS ENTIRE FUNCTION** and replace it:

```javascript
async function makeAPICall(action, additionalData = {}) {
    try {
        const formData = new URLSearchParams();
        formData.append('action', action);

        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawText = await response.text();

        try {
            return JSON.parse(rawText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return getDefaultStats();
        }

    } catch (error) {
        console.error('API call failed:', error);
        if (action === 'getStats') {
            return getDefaultStats();
        }
        throw error;
    }
}
```

**REPLACE WITH**:

```javascript
async function makeAPICall(action, additionalData = {}) {
    try {
        // Map old Google Apps Script actions to new RESTful endpoints
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

        // Add body for POST requests
        if (endpoint.method === 'POST') {
            options.body = JSON.stringify(additionalData);
        }

        const response = await fetch(CONFIG.WEB_APP_URL + endpoint.url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API call failed:', error);
        if (action === 'getStats') {
            return getDefaultStats();
        }
        throw error;
    }
}
```

### 3. Update processVoteEmail Function

**Location**: Around line 2070

**FIND**:
```javascript
async function processVoteEmail(data) {
    showLoading('AI is analyzing the email and extracting vote information...');

    try {
        const extractedData = await extractVoteInformation(data.emailContent);

        extractedData.motionTitle = data.motionTitle || extractedData.detectedMotion;
        extractedData.voteDate = data.voteDate;
        extractedData.voteMethod = data.voteMethod;
        extractedData.timestamp = new Date().toISOString();
        extractedData.processedBy = currentUser ? currentUser.name : 'Unknown';

        const saveResult = await makeAPICall('processBoardVote', extractedData);
```

**REPLACE WITH**:
```javascript
async function processVoteEmail(data) {
    showLoading('AI is analyzing the email and extracting vote information...');

    try {
        // Use AI processing endpoint directly
        const result = await makeAPICall('aiProcessBoardVote', {
            emailContent: data.emailContent,
            motionTitle: data.motionTitle,
            voteDate: data.voteDate,
            voteMethod: data.voteMethod,
            processedBy: currentUser ? currentUser.name : 'Unknown'
        });

        if (result.success) {
            // Display results from backend
            const voteData = result.vote;
            voteData.voteResult = voteData.result;
            voteData.detectedMotion = voteData.motionTitle;
            displayVoteResults(voteData);
```

### 4. Remove extractVoteInformation Function

**Location**: Around line 2105

**REMOVE THIS ENTIRE FUNCTION** (it's now handled by the backend):
```javascript
async function extractVoteInformation(emailContent) {
    // ... entire function
}
```

The backend now handles all AI extraction, so this function is no longer needed.

## Summary of Changes

| File | Line(s) | Change |
|------|---------|--------|
| index.html | ~1560 | Update CONFIG.WEB_APP_URL to Render URL |
| index.html | ~1610 | Replace entire makeAPICall function |
| index.html | ~2070 | Update processVoteEmail function |
| index.html | ~2105 | Delete extractVoteInformation function |

## Testing Checklist

After making changes:

1. **Dashboard**
   - [ ] Statistics load correctly
   - [ ] Refresh button works
   - [ ] Test Connection works

2. **Board Votes**
   - [ ] Load sample email works
   - [ ] Process vote with AI works
   - [ ] Vote history loads
   - [ ] Export vote history works

3. **Other Features**
   - [ ] User permissions load
   - [ ] Board members list loads
   - [ ] Data quality enhancement works
   - [ ] Quick cleanup works

## Common Issues

### Issue: CORS Errors

If you see errors like:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution**: Check that your Render backend has `CORS_ORIGIN=*` in environment variables.

### Issue: 404 Errors

If you see `404 Not Found` errors:

**Solution**: Double-check the endpoint mappings in the `makeAPICall` function match your backend routes.

### Issue: Vote Results Not Displaying

If votes process but don't display:

**Solution**: The backend returns data in a slightly different format. Check the `displayVoteResults` function and ensure it matches the new response structure.

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Render logs for backend errors
3. Verify all environment variables are set
4. Contact: aaron.kornbluth@gmail.com

## Complete Updated File

If you want to see all changes in context, I can provide a complete updated HTML file upon request.
