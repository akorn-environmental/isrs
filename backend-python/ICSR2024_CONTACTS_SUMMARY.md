# ICSR2024 Contacts Extraction Summary

## Overview
Processed **3 batches** of ICSR2024 planning/execution emails
Extracted **36 contacts** with full details
Identified **8 distinct email workflow types**

## Contacts Database Ready to Add

Run this SQL script on production:
```bash
psql $DATABASE_URL -f scripts/add_icsr2024_contacts.sql
```

### Contact Breakdown by Category:

#### Planning Committee (18 contacts)
Core team that organized ICSR2024:
- Dorothy Leonard (Ocean Equities) - Social media lead
- Peter Kingsley-Smith (SC DNR) - Program chair
- Mark Risse (GA Sea Grant) - Director
- Sara Karlsson (GA Sea Grant) - Registration/finance
- Betsy Peabody (PSRF) - ICSR2026 lead
- Michael Doall (Stony Brook) - Interested in ICSR2026
- Bob Rheault (ECSGA)
- Boze Hancock (TNC)
- Christi Lambert (TNC)
- Kevin Cox
- James Gilstrap (UGA)
- LaDon Swann (MS-AL Sea Grant)
- Lisa Paton
- Carli Bertrand (NOAA/NMFS)
- Sherry L. Larkin (UF)
- Thomas H Bliss (UGA)
- Anne Birch - Interested in ICSR2026
- Loren Coen (FAU)

#### Field Trip Leaders (2 contacts)
- Yank Moore (Jekyll Island Authority) - Conservation tour
- Christi Lambert (TNC) - Living shorelines tour

#### Presenters/Researchers (13 contacts)
- Jim McFarlane (Reef Ball Foundation) - Poster + talk on 20-year reef ball study
- Loren Coen (FAU) - Abstract submission
- Dionne Hoskins-Brown (NOAA) - Presenter
- **Olympia Oyster Program Group (9 contacts)**:
  - Kerstin Wasson
  - Danielle Zacherl (Cal State Fullerton)
  - Phoebe Racine (TNC)
  - James McArdle (Swinomish Tribe)
  - Annie Raymond (Jamestown S'Klallam Tribe)
  - Ryan Crim (PSRF)
  - Julieta Martinelli (WA DFW) - Program Lead
  - Jacob Harris (Amah Mutsun Tribal Band)
  - Bryan DeAngelis (TNC)

#### Exhibitors/Sponsors (3 contacts)
- Jim McFarlane (Reef Ball Foundation) - Exhibit + models giveaway
- Malenthe Teunis (BESE Products BV, Netherlands) - Cancelled
- Peter Vodegel (BESE Products BV, Netherlands) - Replacement presenter

#### Support Staff (2 contacts)
- Wesley Voyles (UGA Georgia Center) - Registration services
- Sara Karlsson (GA Sea Grant) - Admin/finance

#### International Attendees (3 contacts)
- Kerstin Scherer (Alfred Wegener Institute, Germany)
- Bernadette Pogoda (Alfred Wegener Institute, Germany)
- Peter Vodegel (BESE Products BV, Netherlands)

## Key Organizational Patterns

### Academic Institutions:
- University of Georgia (4 contacts)
- Florida Atlantic University (1)
- Stony Brook University (1)
- Cal State Fullerton (1)
- University of Florida (1)

### Government Agencies:
- SC Department of Natural Resources (1)
- Washington Department of Fish and Wildlife (1)
- NOAA/NMFS (2)
- Jekyll Island Authority (1)

### Tribal Organizations (3):
- Swinomish Indian Tribal Community
- Jamestown S'Klallam Tribe
- Amah Mutsun Tribal Band

### Conservation Organizations:
- The Nature Conservancy (4 contacts)
- Pacific Shellfish Restoration Fund (3)
- East Coast Shellfish Growers Association (1)
- Ocean Equities LLC (1)
- Reef Ball Foundation (1)

### Sea Grant Programs:
- Georgia Marine Extension and Sea Grant (3)
- Mississippi-Alabama Sea Grant Consortium (1)

### International Companies:
- BESE Products BV (Netherlands) - 2 contacts
- Alfred Wegener Institute (Germany) - 2 contacts

## Special Groups Identified

### 1. **Olympia Oyster Restoration Network**
9 contacts working on native Olympia oyster restoration:
- Geographic focus: Pacific Northwest + California
- Multi-stakeholder: Tribes, state agencies, NGOs, universities
- Coordinated travel and logistics together
- Strong collaborative network

**Tagging**: `olympia-oysters`, `tribal-partnerships`, `west-coast`, `native-species`

### 2. **ICSR2026 Planning Pipeline**
Contacts who expressed interest in next conference:
- Betsy Peabody (leading coordination)
- Michael Doall (first-time committee member, wants to return)
- Anne Birch (requested notification)

**Tagging**: `icsr2026`, `planning-committee`

### 3. **International Participants**
- German research institutes (2)
- Netherlands company (2)
- Showed coordination challenges (time zones, substitutions)

**Tagging**: `international`, `international-exhibitors`

## Data Quality Notes

### Complete Contact Information (High Value):
- Peter Kingsley-Smith - Office, cell, address, title, pronouns
- Mark Risse - Office, cell, full address
- Yank Moore - Office, cell, emergency wildlife line
- Julieta Martinelli - Cell, pronouns, full title
- Dorothy Leonard - Cell, organization
- LaDon Swann - Cell, full title, websites

### Minimal Information (Needs Enrichment):
- Kevin Cox - Email only
- Lisa Paton - Email only
- Anne Birch - Email only

### Alternate Emails Captured:
- Peter Kingsley-Smith: KingsleySmithP@dnr.sc.gov
- Loren Coen: Lcoen1@fau.edu
- Multiple TNC contacts with uppercase variants
- Betsy Peabody: Betsy@restorationfund.org

## Research Topics Identified

From Jim McFarlane's abstract:
- **Reef Ball long-term study**: 20 years of data
- **Sea level rise adaptation**: Habitat transformation
- **Wave action mitigation**: Erosion reduction
- **Urban coastal management**: Docks and seawalls
- **Permeable reef structures**: Water flow and ecosystem services
- **Multi-species succession**: Oysters → corals as conditions change

**Keywords extracted**: shellfish restoration, species migration, community succession, Reef Balls, artificial reefs, climate change, sea level rise, oyster recruitment, habitat transformation, ecosystem resilience, wave action mitigation, urban coastal management, permeable reef structure

## Action Item Patterns by Email Type

### Poster/Talk Submissions:
- "submit abstract through portal"
- "provide co-author information"
- "fill cancellation slot"
- "adjust program"
- "trim to 2,000 character limit"

### Exhibitor Coordination:
- "provide exhibit space"
- "coordinate raffle/giveaway"
- "create promotional poster"
- "locate donated package"
- "step up and cover presentation"

### Travel Logistics:
- "share Uber/ride"
- "coordinate pickup time"
- "offer rental car ride"
- "arrive at [airport] at [time]"

### Registration:
- "check list"
- "send confirmation"
- "provide discount"
- "register by deadline"

## Signature Variations Observed

### Tribal Organization Style:
```
James McArdle
jmcardle@swinomish.nsn.us
Swinomish Indian Tribal Community
```

### International Company Style (Netherlands):
```
Met vriendelijke groet, Kind regards,
Malenthe Teunis
[LOGO]
Varkensmarkt 9 T: +31 345 74 54 00
4101 CK Culemborg info@bese-products.com
the Netherlands www.bese-products.com / LinkedIn / Instagram
```

### Academic Researcher with Pronouns:
```
Julieta Martinelli, Ph.D. (she/her)
Biologist & Olympia Oyster Program Lead
Washington Dept. of Fish and Wildlife
julieta.martinelli@dfw.wa.gov
425-725-0258
```

### Minimal Mobile Style:
```
Get Outlook for iOS
```

## Recommendations for AI Extraction Tuning

### High Priority:
1. **Extract research keywords from abstracts** - Rich source of topics and scientific focus
2. **Identify tribal affiliations** - Special organizational category
3. **Capture international details** - Country, phone format (+31), address format
4. **Recognize specialized programs** - "Olympia Oyster Program", "Reef Ball Foundation"
5. **Parse multi-line company info** - European addresses with unusual formats
6. **Handle "Get Outlook for iOS" signatures** - Common but information-poor

### Medium Priority:
7. **Track presentation formats** - Poster vs talk vs both
8. **Extract co-author relationships** - Build collaboration networks
9. **Identify program roles** - "Program Chair", "Program Lead", "Director"
10. **Capture travel logistics** - Can help with future event planning

### Low Priority:
11. **Parse raffle/giveaway items** - Sponsor relationship management
12. **Extract ride-sharing offers** - Community building indicator
13. **Track cancellations/substitutions** - Attendance reliability

## Next Steps

1. **Run SQL script** to add all 36 contacts
2. **Tag appropriately** using the identified categories
3. **Link related contacts** (Olympia oyster group, planning committee, etc.)
4. **Update AI prompts** with these patterns for future email processing
5. **Process more emails** if available to refine extraction rules

## Files Created

1. `scripts/add_icsr2024_contacts.sql` - Production-ready SQL to add contacts
2. `ICSR_EMAIL_PATTERNS.md` - Comprehensive email pattern analysis
3. `ICSR2024_CONTACTS_SUMMARY.md` - This file

All contacts preserve:
- Alternate emails in array format
- Full titles and organizational hierarchy
- Phone numbers (office, cell, emergency)
- Addresses where available
- Tags for easy filtering
- Comprehensive notes with context
