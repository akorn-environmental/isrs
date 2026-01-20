# ISRS Existing Data Investigation - 2026-01-19

**User**: Aaron Kornbluth (aaron.kornbluth@gmail.com)
**Issue**: Profile shows 0% completion, no historical conference data
**Expected**: Should have existing ISRS data from past conferences

---

## Current Status

### ✅ Account Created
- Email: aaron.kornbluth@gmail.com
- First Name: Aaron
- Last Name: Kornbluth
- Account Status: Active
- Email Verified: Yes (via magic link)
- Created: 2026-01-19 (today, via new self-registration)

### ❌ Missing Data
- Organization: None
- Position: None
- Phone: None
- Country: None
- City: None
- Bio: None
- Historical conference registrations: None
- Contact enrichment data: None

---

## Data Sources Identified

### 1. **Import Scripts** (Node.js Backend)

Found multiple import scripts that reference Aaron's email:

#### `/backend/scripts/import-isrs-master-data.js`
- **Purpose**: Imports from ISRS Master Database CSV files
- **Data Location**: `/Users/akorn/Desktop/isrs icsr2024 data/`
- **Files Expected**:
  - `ISRS Master Database - Production - 01_MASTER_CONTACTS.csv`
  - `ISRS Master Database - Production - 02_ORGANIZATIONS.csv`
  - `ISRS Master Database - Production - 04_ICSR2024_SPONSORS.csv`
  - `ISRS Master Database - Production - 05_ICSR2024_EXHIBITORS.csv`
  - `ISRS Master Database - Production - 06_ICSR2024_ABSTRACTS.csv`
  - And more...
- **Status**: ❌ Directory does not exist at specified path

#### `/backend/scripts/import-icsr2024-local.js`
- **Purpose**: Imports ICSR 2024 conference data
- **Data Location**: `/Users/akorn/Desktop/SORT/`
- **Files Expected**:
  - `01 ICSR2024 - ABSTRACT SUBMISSIONS.csv`
  - `01 ICSR2024 - SPONSORS.csv`
  - `01 ICSR2024 - EXHIBITOR INFO.csv`
  - `01 ICSR2024 - REGISTRANTS.csv`
- **Status**: Checking...

#### `/backend/database/add-aaron-admin-v2.js`
- **Purpose**: Creates Aaron's admin and attendee profiles
- **What it does**:
  - Creates/updates admin_users record (role: super_admin)
  - Creates/updates attendee_profiles record
  - Links the two via attendee_id
- **Status**: ✅ Already executed (profiles exist)

### 2. **Database Models** (Python Backend)

#### `AttendeeProfile` Model Fields:
```python
# Basic Info
- user_email (unique, indexed)
- first_name, last_name
- organization_id (FK to organizations)
- organization_name (free text fallback)
- position, department

# Contact Details
- phone, country, city

# Professional
- bio, cv_url

# Account Status
- account_status, email_verified
- email_verified_at, last_login_at
- login_count

# Relationships
- contact_id (FK to contacts table)
- organization (FK to organizations)
- registrations (conference_registrations)
- user_sessions, refresh_tokens
```

### 3. **Conference Registration System**

Aaron should have `conference_registrations` linking to:
- ICSR 2024 (Charleston)
- Previous ICSR conferences
- ISRS events

These registrations would include:
- Registration type (early_bird, regular, etc.)
- Payment status
- Attendance confirmation
- Abstract submissions
- Sponsor/exhibitor roles

---

## Investigation Steps

### Step 1: Check SORT Directory
```bash
ls -la "/Users/akorn/Desktop/SORT"
```

**Expected**: CSV files with ICSR2024 registrants including Aaron's data

### Step 2: Check Production Database
Query the production database to see if Aaron already has:
- A contact record in `contacts` table
- Historical conference_registrations
- Organization affiliations
- Any enrichment data

### Step 3: Check Google Sheets
The system has Google Sheets import scripts. Check if Aaron's data exists in:
- ISRS Master Contacts spreadsheet
- ICSR2024 registration data
- Board member records

### Step 4: Manual Data Entry (Last Resort)
If no existing data found, gather from Aaron:
- Organization: akorn environmental (likely)
- Position: Founder/CEO (likely)
- Phone: (to be provided)
- Country: USA
- City: (to be provided)
- Bio: (to be provided)
- Historical conference attendance

---

## Database Schema Analysis

### Key Tables:

1. **attendee_profiles** - Member accounts (Aaron's current record)
2. **contacts** - Contact database (may have separate Aaron record)
3. **organizations** - Organization directory (akorn environmental?)
4. **conference_registrations** - Links attendees to conferences
5. **conferences** - Conference events (ICSR2024, ICSR2022, etc.)
6. **admin_users** - Admin access (Aaron is super_admin)

### Data Linking Strategy:

**Option A: Link to Existing Contact Record**
If Aaron has a `contacts` record:
1. Find contact by email (aaron.kornbluth@gmail.com)
2. Update `attendee_profiles.contact_id` to link
3. Sync data from contact to attendee profile

**Option B: Import Conference Registrations**
If historical registration data exists:
1. Import conference_registrations for Aaron
2. Populate profile fields from registration data
3. Create organization record if needed

**Option C: Manual Profile Completion**
If no existing data:
1. Ask Aaron for complete profile information
2. Create organization record (akorn environmental)
3. Populate attendee profile manually
4. Create historical conference_registrations

---

## Next Actions

1. ✅ Check if `/Users/akorn/Desktop/SORT` directory exists
2. ⏳ If CSV files exist, check if Aaron is in registrants
3. ⏳ Query production DB for existing contact/registration records
4. ⏳ Determine which data source to use (CSV vs DB vs manual)
5. ⏳ Execute import/sync based on findings

---

## Questions for Aaron

If no data sources are found:

1. **Organization**: What organization should be listed? (akorn environmental?)
2. **Position**: Your title/role?
3. **Contact Info**: Phone, city, country?
4. **Conference History**: Which ICSR/ISRS events have you attended?
   - ICSR 2024 (Charleston) - Attended?
   - Previous conferences?
5. **Roles**: Were you a sponsor, exhibitor, presenter, or attendee at past events?
6. **Bio**: Professional bio for member profile?

---

**Created**: 2026-01-19
**Status**: Investigating data sources
**Priority**: HIGH - User expects existing data to be linked
