# Aaron's Profile - Data Import Guide

**Current Status**: Profile created via self-registration, needs historical data imported

---

## Your ICSR2024 Registration Data (Found!)

From CSV file: `/Users/akorn/Desktop/SORT/01 ICSR2024 - REGISTRANTS - REGISTRANTS.csv`

```
First Name: Aaron
Last Name: Kornbluth
Email: aaron.kornbluth@gmail.com
Phone: (609) 534-0040
Address: 8902 Courts Way, Silver Spring, MD, 20910, USA
Package: Shellfish Restoration Conference - Full Registration
Type: Full Conference Attendee
Registration Date: 26/Aug/2024 11:51 AM
```

---

## Option 1: Manual Update (Simplest)

1. **Log in** to https://www.shellfish-society.org/member/login.html
2. **Click profile** to go to your profile page
3. **Fill in these fields**:

   ```
   Organization: akorn environmental
   Position: Founder & CEO
   Phone: (609) 534-0040
   Country: USA
   City: Silver Spring, MD

   Bio:
   Aaron Kornbluth is the Founder and CEO of akorn environmental, an environmental
   consulting firm specializing in shellfish restoration and coastal ecosystem
   management. As a board member of the International Shellfish Restoration Society
   (ISRS), Aaron has been instrumental in advancing shellfish restoration initiatives
   and facilitating collaboration between scientists, policymakers, and coastal
   communities.
   ```

4. **Save** your profile

**Result**: Profile will show ~80% completion

---

## Option 2: Quick JavaScript Console Update

If you're comfortable with browser console:

1. **Log in** to the member portal
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Paste and run** this code:

```javascript
// Quick profile update via console
await fetch('https://isrs-python-backend.onrender.com/api/auth/me', {
  method: 'PUT',  // Use PUT method
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('memberAuthToken')}`
  },
  body: JSON.stringify({
    organization_name: "akorn environmental",
    position: "Founder & CEO",
    phone: "(609) 534-0040",
    country: "USA",
    city: "Silver Spring, MD",
    bio: "Aaron Kornbluth is the Founder and CEO of akorn environmental, an environmental consulting firm specializing in shellfish restoration and coastal ecosystem management. As a board member of the International Shellfish Restoration Society (ISRS), Aaron has been instrumental in advancing shellfish restoration initiatives and facilitating collaboration between scientists, policymakers, and coastal communities."
  })
}).then(r => r.json()).then(console.log);
```

4. **Refresh** the page to see updated profile

**Note**: The PUT endpoint has been added to the backend and will be live after the next deployment (within ~5 minutes).

---

## Option 3: API Script (Automated)

We have a Node.js script ready: `import-aaron-via-api.js`

**Two-step process**:

### Step 1: Request Magic Link
```bash
cd "/Users/akorn/Desktop/ITERM PROJECTS/ISRS"
node import-aaron-via-api.js
```

This will email you a magic link.

### Step 2: Get Token and Import
1. Click the magic link in your email
2. Copy the token from the URL (after `?token=`)
3. Run:
```bash
node import-aaron-via-api.js YOUR_TOKEN_HERE
```

**Result**: Profile automatically updated with all data

---

## Additional Data Available

### From ICSR2024 Sponsor Outreach:
You were listed as the contact for:
- National Wildlife Federation (contacted Emily Donahoe)
- Pew Charitable Trusts (declined)
- The Rauch Foundation (potential, meeting scheduled)

This shows your role in conference sponsorship outreach.

### Conference History:
- **ICSR 2024** - Charleston, SC (Sept 22-26, 2024)
  - Full Conference Attendee
  - Registered: August 26, 2024

### ISRS Role:
- Board Member
- Involved in sponsorship outreach and conference planning

---

## What Happens After Update

Once your profile is complete, you'll have:

✅ **Complete Profile**
- Organization: akorn environmental
- Position: Founder & CEO
- Contact info populated
- Professional bio

✅ **Conference History**
- ICSR 2024 registration linked
- Attendance record preserved

✅ **Member Portal Access**
- View/edit profile anytime
- Access member resources
- Register for future conferences

---

## Recommended: Option 1 (Manual)

**Why**:
- Simple and straightforward
- You can verify each field as you enter it
- No technical setup required
- Takes ~2 minutes

**When to use Option 2 or 3**:
- If you want to automate updates
- If you're updating multiple profiles
- If you prefer programmatic approaches

---

## Questions?

If you have additional information to add (CV, additional conference history, etc.), you can:
1. Update it manually via the profile page
2. Provide it here and we'll add an import script
3. Use the API directly (I can help with this)

---

**Created**: 2026-01-19
**Data Source**: ICSR2024 Registration CSV
**Status**: Ready for update (choose any option above)
