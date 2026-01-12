# ISRS Data Migration Guide

This guide explains how to migrate data from Google Sheets to PostgreSQL.

## Prerequisites

✅ Google Sheets API credentials configured in `.env`
✅ PostgreSQL database running (Render or local)
✅ Database schema already created (via `migrate.sh`)

## Google Sheets Structure

The migration script expects the following sheets in your Google Spreadsheet:

### Required Sheets:

1. **Contact Database**
   - Columns: Email, Full Name, First Name, Last Name, Organization ID, Role, Phone, Country, State, City, etc.

2. **Organizations**
   - Columns: ID, Organization Name, Type, Country, State/Province, City, Website, Notes

3. **Board Votes** (optional)
   - Columns: Vote ID, Motion, Date, Method, Result, Yes Count, No Count, Abstain Count, Total Votes, Quorum Met

4. **Vote Details** (optional)
   - Columns: Vote ID, Board Member, Vote, Notes

5. **Conferences** (optional)
   - Columns: Year, Location, Dates, Theme, Registration Open, Early Bird Deadline, Abstract Deadline

6. **Funding Prospects** (optional)
   - Columns: Organization, Contact Name, Contact Email, Target Amount, Amount Received, Status

## Environment Variables

Ensure these are set in your `.env` file:

```bash
# Google Sheets
GOOGLE_SHEET_ID=1o1dG8fBCIKb1_pNAqZmlmOhQHjNIIwwJzUT5s_BQ3OA
GOOGLE_SERVICE_ACCOUNT_EMAIL=isrs-database-backend@isrs-database-prod.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Database (use Render PostgreSQL URL)
DATABASE_URL=postgresql://isrs_user:password@host/isrs_database
```

## Running the Migration

### Step 1: Dry Run (Recommended)

First, review what data will be migrated without actually migrating:

```bash
# From the project root
node scripts/migrate-from-sheets.js
```

The script will show:
- Number of organizations found
- Number of contacts found
- Number of board votes found
- Any errors or warnings

### Step 2: Run Full Migration

If everything looks good, run the migration:

```bash
node scripts/migrate-from-sheets.js
```

### Step 3: Verify Migration

Check the database to ensure data was migrated correctly:

```bash
# Connect to database
psql "$DATABASE_URL"

# Check counts
SELECT COUNT(*) FROM contacts;
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM board_votes;

# Check sample data
SELECT email, full_name, organization_id FROM contacts LIMIT 10;
```

## Migration Features

### Data Cleaning

The script automatically:
- ✅ Removes duplicate emails (keeps latest)
- ✅ Maps organization IDs correctly
- ✅ Handles missing/null values gracefully
- ✅ Converts date formats
- ✅ Normalizes phone numbers
- ✅ Splits tags into arrays

### Error Handling

- **Skips invalid records** instead of failing entire migration
- **Logs errors** for manual review
- **Continues processing** if one record fails
- **Provides progress updates** every 100 records

### Idempotency

The script can be run multiple times safely:
- Uses `ON CONFLICT DO UPDATE` for contacts
- Won't create duplicate organizations
- Won't duplicate board votes

## Post-Migration Tasks

### 1. Verify Data Quality

```bash
# Run data quality check
node scripts/check-data-quality.js
```

### 2. Update Statistics

Visit your admin dashboard and refresh statistics:
- https://shellfish-society.org/admin/

### 3. Test Vote Processing

Try processing a test board vote to ensure everything works.

### 4. Backup Database

```bash
# Create backup after migration
pg_dump "$DATABASE_URL" > backup-post-migration.sql
```

## Troubleshooting

### Error: "Sheet not found"

- Check that sheet names match exactly (case-sensitive)
- Ensure Google Sheet is shared with service account email

### Error: "Permission denied"

- Verify service account has read access to the Google Sheet
- Check that `.env` has correct `GOOGLE_SERVICE_ACCOUNT_EMAIL`

### Error: "Database connection failed"

- Verify `DATABASE_URL` in `.env`
- Check that Render PostgreSQL database is running
- Test connection: `psql "$DATABASE_URL" -c "SELECT 1"`

### Error: "Foreign key violation"

- Ensure schema is created first: `./scripts/migrate.sh`
- Organizations must be migrated before contacts

### Partial Migration

If migration is interrupted:

```bash
# Check what was migrated
psql "$DATABASE_URL" -c "
  SELECT
    'Contacts' as table_name, COUNT(*) as count FROM contacts
  UNION ALL
  SELECT 'Organizations', COUNT(*) FROM organizations
  UNION ALL
  SELECT 'Board Votes', COUNT(*) FROM board_votes;
"

# Clear all data and start over (if needed)
psql "$DATABASE_URL" -c "TRUNCATE contacts, organizations, board_votes, board_vote_details CASCADE;"

# Re-run migration
node scripts/migrate-from-sheets.js
```

## Data Mapping Reference

### Contact Fields
| Google Sheets Column | PostgreSQL Column | Notes |
|---------------------|-------------------|-------|
| Email | email | Primary key |
| Full Name | full_name | |
| First Name | first_name | |
| Last Name | last_name | |
| Organization ID | organization_id | Mapped to UUID |
| Role | role | |
| Phone | phone | |
| Country | country | |
| State | state | |
| City | city | |
| Subscribed | subscribed | TRUE/FALSE → boolean |

### Organization Fields
| Google Sheets Column | PostgreSQL Column |
|---------------------|-------------------|
| Organization Name | name |
| Type | type |
| Country | country |
| State/Province | state |
| City | city |
| Website | website |
| Notes | notes |

## Support

If you encounter issues:

1. Check the console output for specific error messages
2. Review `/Users/akorn/isrs-database-backend/logs/migration.log`
3. Contact: aaron.kornbluth@gmail.com

## Additional Scripts

### Export Current Data

```bash
# Export all contacts to CSV
node scripts/export-contacts.js > contacts.csv

# Export organizations
node scripts/export-organizations.js > organizations.csv
```

### Compare Sheet vs Database

```bash
# Show differences between Google Sheets and PostgreSQL
node scripts/compare-data.js
```

---

**Last Updated**: October 30, 2025
**Script Version**: 1.0.0
