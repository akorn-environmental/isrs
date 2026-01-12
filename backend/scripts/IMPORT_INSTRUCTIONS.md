# Data Import Instructions

## Option 1: Publish Sheets to Web (Easiest)

For each Google Sheet, you need to **publish to web**:

1. Open the Google Sheet
2. Click **File** → **Share** → **Publish to web**
3. Select **Entire Document** or specific sheet
4. Choose **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the published URL

Then run:
```bash
node scripts/import-from-google-sheets.js
```

---

## Option 2: Download CSVs Manually (Quick)

For each Google Sheet:

1. Open the sheet
2. Click **File** → **Download** → **Comma Separated Values (.csv)**
3. Save to `/Users/akorn/isrs-database-backend/data/import/`

Name the files:
- `abstracts.csv` - ICSR2024 Abstract Submissions
- `contacts.csv` - ICSR2024 Contact Forms
- `sponsors-exhibitors.csv` - Sponsor/Exhibitor Info
- `sponsors.csv` - Sponsors
- `master-database.csv` - ISRS Master Database

Then run:
```bash
node scripts/import-from-csv-files.js
```

---

## Option 3: Use Google Sheets API (Most Robust)

Would require setting up Google Cloud credentials, but provides best automation.

---

## What the Import Will Do:

✅ **Create unique profiles** for each person (deduplicated by email)
✅ **Assign UUIDs** to each person and organization
✅ **Link roles** (attendee, presenter, sponsor contact, etc.)
✅ **Create organizations** with fuzzy matching to avoid duplicates
✅ **Track relationships** across conferences

---

## Recommend: Option 2 (Download CSVs)

This is fastest and you have full control. Just download each sheet as CSV and run the import script!
