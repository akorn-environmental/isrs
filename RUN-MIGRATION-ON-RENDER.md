# Run Profile Directory Fields Migration on Render

## Quick Steps

1. **Wait for deployment to complete** (check https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50)

2. **Open Render Shell**:
   - Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/shell
   - Click "Launch Shell"

3. **Run the migration**:
   ```bash
   cd /opt/render/project/src/backend-python
   python migrations/add_profile_directory_fields.py
   ```

4. **Verify success**:
   - You should see: "✓ All 7 columns verified"
   - Migration complete message

## What This Migration Does

Adds 7 missing columns to `attendee_profiles` table:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `research_areas` | TEXT | NULL | User's research focus areas |
| `expertise_keywords` | TEXT | NULL | Searchable keywords |
| `website` | TEXT | NULL | Personal/professional website |
| `linkedin_url` | TEXT | NULL | LinkedIn profile URL |
| `orcid` | VARCHAR(19) | NULL | ORCID identifier |
| `directory_opt_in` | BOOLEAN | false | Show in member directory |
| `directory_visible_fields` | JSONB | {} | Customize directory visibility |

## After Migration

Your profile page will work correctly:
- ✅ Profile loads without 500 errors
- ✅ "Show in Directory" checkbox saves properly
- ✅ All profile fields persist correctly
- ✅ 7-day login sessions (stays logged in for a week)

## Troubleshooting

If migration fails with "permission denied":
```bash
# Use database owner credentials
export DATABASE_URL="postgresql://isrs_database_owner:PASSWORD@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database"
python migrations/add_profile_directory_fields.py
```

If you see "column already exists":
- ✅ This is fine! It means the migration already ran successfully
