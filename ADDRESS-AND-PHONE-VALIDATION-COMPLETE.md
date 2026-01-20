# Address Fields & Phone Validation - Complete ✅

**Date**: 2026-01-20
**Status**: Code deployed, migration pending
**Next Step**: Run migration on Render

---

## Overview

Added comprehensive address collection with intelligent ZIP code lookup and international phone number validation.

---

## Features Implemented

### Address Fields

**New Fields:**
1. **Street Address** - Full street address (500 char)
2. **City** - Auto-populated from ZIP or manual entry
3. **State/Province** - Auto-populated from ZIP or manual entry
4. **ZIP/Postal Code** - Triggers auto-lookup when entered
5. **Country** - Required field, used for phone validation

**Smart ZIP Code Lookup:**
- Type your ZIP code → City and State automatically fill in
- Uses Nominatim (OpenStreetMap) free geocoding API
- Works for US and international postal codes
- 500ms debounce to avoid excessive API calls
- Gracefully fails silently if API unavailable
- User can always override or enter manually

### Phone Number Validation

**International Format Support:**
- Validates phone numbers based on selected country
- Uses Google's libphonenumber library (industry standard)
- Automatically formats to E.164 international standard
- Examples:
  - US: `(555) 123-4567` → `+15551234567`
  - UK: `020 7946 0958` → `+442079460958`
  - Brazil: `(11) 98765-4321` → `+5511987654321`

**Validation:**
- Checks if number is valid for the country
- Returns clear error message if invalid
- Format hint shown: "Format will be validated based on country"

---

## User Experience

### Before (Old Layout)
```
Country | City
Phone
```

### After (New Layout)
```
Street Address
_______________________________

City               | State/Province
____________       _______________

ZIP/Postal Code   | Country *
___________        ___________
(Enter ZIP to auto-fill city/state)

Phone
_______________________________
(Format will be validated based on country)
```

---

## Database Schema

### Migration File
`backend-python/migrations/add_address_fields.py`

### New Columns

| Column | Type | Length | Indexed | Required |
|--------|------|--------|---------|----------|
| `address` | VARCHAR | 500 | No | No |
| `city` | VARCHAR | 100 | No | No |
| `state` | VARCHAR | 100 | No | No |
| `zip_code` | VARCHAR | 20 | Yes | No |
| `country` | VARCHAR | 100 | No | Yes |

**Index**: `idx_attendee_profiles_zip_code` for fast ZIP lookups

---

## API Changes

### GET /api/auth/me
Now returns:
```json
{
  "id": "...",
  "email": "user@example.com",
  "phone": "+15551234567",
  "address": "123 Main Street",
  "city": "Silver Spring",
  "state": "Maryland",
  "zip_code": "20910",
  "country": "United States",
  ...
}
```

### PUT /api/auth/me
Accepts:
```json
{
  "phone": "(555) 123-4567",
  "address": "123 Main Street",
  "city": "Silver Spring",
  "state": "MD",
  "zip_code": "20910",
  "country": "US"
}
```

**Phone Validation:**
- Parses phone based on country
- Validates format is correct
- Returns error if invalid: `400 Bad Request`
- Stores in E.164 format: `+15551234567`

---

## ZIP Code Lookup

### How It Works

1. User types ZIP code: `20910`
2. After 500ms (debounce), calls Nominatim API
3. API returns location data
4. Extracts city and state from response
5. Auto-fills City and State fields
6. User can override if needed

### API Used

**Nominatim (OpenStreetMap Geocoding)**
- Free, no API key required
- URL: `https://nominatim.openstreetmap.org/search`
- Parameters:
  - `postalcode`: ZIP/postal code
  - `country`: Country code
  - `format`: json
  - `limit`: 1
- Rate limit: 1 request per second (we debounce to comply)
- User-Agent: `ISRS-Member-Portal/1.0`

### Example Request
```
GET https://nominatim.openstreetmap.org/search?postalcode=20910&country=US&format=json&limit=1
```

### Example Response
```json
[
  {
    "display_name": "Main Street, Silver Spring, Montgomery County, Maryland, 20910, United States",
    "lat": "39.0000",
    "lon": "-77.0000",
    ...
  }
]
```

**Parsing Logic:**
```javascript
const addressParts = result.display_name.split(', ');
// Format: Street, City, County, State, ZIP, Country
const city = addressParts[addressParts.length - 4]; // "Silver Spring"
const state = addressParts[addressParts.length - 2]; // "Maryland"
```

---

## Phone Number Validation

### Library: phonenumbers (Python)

**Installation:**
```bash
pip install phonenumbers==8.13.27
```

**Backend Validation Logic:**
```python
import phonenumbers
from phonenumbers import NumberParseException

# Parse phone number with country code
parsed_number = phonenumbers.parse(phone, country)

# Validate
if phonenumbers.is_valid_number(parsed_number):
    # Format to E.164
    formatted = phonenumbers.format_number(
        parsed_number,
        phonenumbers.PhoneNumberFormat.E164
    )
    # Returns: +15551234567
else:
    raise HTTPException(400, "Invalid phone number")
```

### Supported Formats (Examples)

**United States (US):**
- `555-123-4567`
- `(555) 123-4567`
- `555.123.4567`
- `5551234567`
- All become: `+15551234567`

**United Kingdom (GB):**
- `020 7946 0958`
- `+44 20 7946 0958`
- Becomes: `+442079460958`

**International:**
- Supports all countries
- Validates based on country-specific rules
- Number length, area codes, format

---

## Migration Steps

### 1. Wait for Deployment
Render should automatically deploy when pushed. Check deployment status.

### 2. Run Migration
```bash
# In Render Shell:
python backend-python/migrations/add_address_fields.py
```

Expected output:
```
Connecting to database...

=== Adding address fields to attendee_profiles ===
✓ address column added
✓ zip_code column added
✓ zip_code index created
✓ state column added

✅ Migration completed successfully!
   Column: address
   Type: character varying(500)

   Column: state
   Type: character varying(100)

   Column: zip_code
   Type: character varying(20)
```

### 3. Verify Deployment
Visit: https://www.shellfish-society.org/member/profile.html

Click "Edit Profile" and verify:
- [ ] Street Address field appears
- [ ] State/Province field appears
- [ ] ZIP/Postal Code field appears
- [ ] Fields are in new layout (2 columns)
- [ ] Phone has validation hint

### 4. Test ZIP Lookup
1. Click "Edit Profile"
2. Enter a US ZIP code: `20910`
3. Wait 1 second
4. City should auto-fill: "Silver Spring"
5. State should auto-fill: "Maryland"

### 5. Test Phone Validation
1. Enter invalid phone: `123`
2. Select Country: "United States"
3. Click "Save Changes"
4. Should get error: "Invalid phone number"
5. Enter valid phone: `(555) 123-4567`
6. Save should succeed
7. Reload page
8. Phone displays as: `+15551234567`

---

## Use Cases

### Use Case 1: US Member - ZIP Lookup
```
1. Enter ZIP: 90210
2. Auto-fills:
   - City: Beverly Hills
   - State: California
3. User adds:
   - Address: 123 Rodeo Drive
   - Phone: (310) 555-1234
4. Saves successfully
5. Phone stored as: +13105551234
```

### Use Case 2: International Member
```
1. Enter manually:
   - Address: 10 Downing Street
   - City: London
   - State: (leave empty)
   - ZIP: SW1A 2AA
   - Country: United Kingdom
   - Phone: 020 7946 0958
2. Saves successfully
3. Phone stored as: +442079460958
```

### Use Case 3: Invalid Phone
```
1. Enter: 123
2. Country: United States
3. Click Save
4. Error: "Invalid phone number format"
5. Fix to: (555) 123-4567
6. Saves successfully
```

---

## Profile Completion Impact

Address fields are NOT included in completion percentage (yet).

Current calculation remains:
- Core (40%): name, email, country
- Professional (30%): org, position
- Contact (20%): contact_email, phone, city
- Extended (10%): department, bio

**Future consideration**: Add address/ZIP to Contact category for higher completion scores.

---

## Error Handling

### ZIP Lookup Failures
- Network error → Silent fail, user enters manually
- Invalid ZIP → No results, user enters manually
- API rate limit → Silently stops, user enters manually
- No User-Agent → Request blocked, user enters manually

All failures are graceful - never blocks the user.

### Phone Validation Failures
- Empty phone → Allowed (optional field)
- Invalid format → Clear error message
- No country selected → Uses "US" as default
- Country mismatch → Error specifies which country

---

## Privacy Considerations

### ZIP Code Lookup
- Query sent to Nominatim (OpenStreetMap)
- Only sends: ZIP code + country code
- No personal information transmitted
- Open-source, privacy-respecting service
- No tracking or data collection

### Phone Number Storage
- Stored in E.164 format (+1234567890)
- Format is international standard
- Not displayed in directory by default
- User controls visibility via privacy settings
- Contact Email preferred for public display

---

## Technical Details

### Why E.164 Format?
- **International standard** - Works worldwide
- **Consistency** - All phones stored same way
- **Validation** - Easy to verify format
- **Calling** - Can be used directly for calls/SMS
- **Display** - Can format for display later

### Why Nominatim?
- **Free** - No API key, no cost
- **Open** - Open-source, community-driven
- **Privacy** - No tracking, GDPR-compliant
- **Reliable** - Used by millions of apps
- **Global** - Supports worldwide postal codes

### Debouncing
Prevents excessive API calls:
- User types: `2...0...9...1...0`
- Without debounce: 5 API calls
- With 500ms debounce: 1 API call (after typing stops)

---

## Future Enhancements

Potential improvements:
1. **Address autocomplete** - Google Places API for full address lookup
2. **Phone formatting** - Display phones in local format (+1-555-123-4567)
3. **Address validation** - USPS API for US address verification
4. **Multiple addresses** - Home, work, mailing addresses
5. **Geolocation** - Map display of member locations
6. **Distance calculator** - Find nearby members
7. **Phone SMS verification** - Verify phone ownership
8. **Address standardization** - Format addresses consistently

---

## Files Changed

### Backend
- `backend-python/app/models/conference.py`
  - Added address, city, state, zip_code, country fields
  - Reorganized Contact Details section

- `backend-python/app/routers/auth.py`
  - Added phonenumbers import
  - Added phone validation in update endpoint
  - Updated GET /me to return new fields
  - Updated PUT /me to accept new fields
  - UpdateProfileRequest schema updated

- `backend-python/requirements.txt`
  - Added phonenumbers==8.13.27

- `backend-python/migrations/add_address_fields.py`
  - New migration (executable)

### Frontend
- `frontend/public/member/profile.html`
  - Reorganized address section layout
  - Added street address field
  - Added state field
  - Added ZIP field with auto-lookup
  - Reorganized city/state/ZIP/country into grid
  - Added phone validation hint
  - Added ZIP lookup JavaScript
  - Updated form submission to include new fields

---

**Implementation**: Claude Sonnet 4.5
**Co-Authored-By**: Claude Sonnet 4.5 <noreply@anthropic.com>
