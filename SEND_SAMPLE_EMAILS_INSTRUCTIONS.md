# Instructions to Send Sample Emails from Render

## Option 1: Via Render Shell (RECOMMENDED)

1. Go to https://dashboard.render.com/
2. Navigate to your ISRS backend service
3. Click on the "Shell" tab
4. Run the following command:

```bash
node backend/scripts/send-sample-attendee-emails.js
```

This will send 2 sample emails to `aaron.kornbluth@gmail.com`:
- **Sample 1**: Sarah Chen (ICSR2024 presenter with 2 talks + field trip participant)
- **Sample 2**: Marcus Thompson (poster, volunteer, planning committee, Gold sponsor, exhibitor, field trip, already registered for ICSR2026)

## Option 2: Via API Endpoint

Once the deployment is complete, you can trigger via:

```bash
curl -X POST https://isrs.onrender.com/api/admin/email/send-sample-emails
```

Note: This requires authentication. The endpoint was just added.

## Expected Output

You should see console output like:

```
📧 Sending 2 sample ICSR2024 attendee emails to aaron.kornbluth@gmail.com

Sending sample for: Sarah Chen
Organization: Chesapeake Bay Foundation
ICSR2024 Activities:
  - Presented 2 talk(s)
  - Field trip participant
ICSR2026 Registered: No
✅ Sent! Message ID: 0102018d9e...

Sending sample for: Marcus Thompson
Organization: Pacific Shellfish Institute
ICSR2024 Activities:
  - Poster presentation
  - Volunteered
  - Planning committee member
  - Gold sponsor
  - Exhibitor
  - Field trip participant
ICSR2026 Registered: Yes
✅ Sent! Message ID: 0102018d9e...

💌 Check your inbox at aaron.kornbluth@gmail.com for both sample emails!
```

## What These Emails Demonstrate

**Sarah Chen's email will show**:
- ICSR2024 participation section with:
  - Blue box: "Scientific Contribution: Thank you for presenting 2 talks..."
  - Pink box: "Field Trip Participant"
- "Register Now" section (not yet registered for ICSR2026)
- NO sponsor section

**Marcus Thompson's email will show**:
- ICSR2024 participation section with ALL activity types:
  - Blue box: "Poster Presentation"
  - Green box: "Volunteer Service"
  - Green box: "Planning Committee"
  - Orange box: "Gold Sponsor"
  - Light blue box: "Exhibitor"
  - Pink box: "Field Trip Participant"
- "Already Registered" section (registered for ICSR2026)
- NO duplicate sponsor section (already shown in ICSR2024 section)

## Verify These Features

After receiving the emails, check:

1. ✅ ICSR2026 logo displays inline (not as attachment)
2. ✅ "The International Shellfish Restoration Society" in first paragraph
3. ✅ Reduced line heights and padding in announcement box
4. ✅ All ICSR2024 activities in color-coded boxes
5. ✅ Hyperlinks to partner organizations work
6. ✅ Enhanced footer with email, Tax ID, social links
7. ✅ No duplicate sponsor section for Marcus Thompson
8. ✅ Calendar add buttons work
9. ✅ Registration link works
10. ✅ Unsubscribe link present in footer
