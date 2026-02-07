# ICSR Email Patterns Analysis

Based on ICSR2024 planning emails, here are the patterns for improving AI extraction:

## Email Types Observed

### 1. **Poster/Talk Submissions & Program Changes**
- **Subject**: "RE: Reef Ball Foundation poster?", "ICSR2024 - Co-author Information Needed"
- **Content**: Abstract submissions, co-author requests, program adjustments, talk cancellations
- **Key Data to Extract**:
  - Presenter names and affiliations
  - Co-authors and their organizations
  - Abstract content (keywords, methods, findings)
  - Presentation format (poster, talk, both)
  - Research topics and focus areas
- **Action Items**: "submit abstract", "provide co-author info", "adjust program", "fill cancellation slot"
- **Topics**: abstracts, presentations, research, program-management, co-authors

### 2. **Exhibitor/Sponsor Coordination**
- **Subject**: "One more sponsor", "Absence Malenthe Teunis"
- **Content**: Exhibit space arrangements, sponsorship packages, vendor logistics, giveaways/raffles
- **Key Data to Extract**:
  - Sponsor/exhibitor contact details
  - Company names and countries
  - Booth requirements
  - Donation/giveaway items
  - Registration discounts or special arrangements
- **Action Items**: "provide exhibit space", "coordinate raffle", "create poster", "locate package"
- **Topics**: sponsors, exhibitors, vendors, raffles, donations, logistics

### 3. **Travel & Ride Coordination**
- **Subject**: "RE: ICSR program" (with travel context)
- **Content**: Flight arrivals, airport sharing, rental car coordination, ride offers
- **Key Data to Extract**:
  - Arrival/departure airports (JAX, Savannah, Atlanta)
  - Flight times and dates
  - Rental car availability
  - Ride-share offers
  - Special needs (traveling with baby)
- **Action Items**: "share Uber", "offer ride", "coordinate pickup time"
- **Topics**: travel, logistics, transportation, ride-sharing, airports

### 4. **Attendee Substitutions**
- **Subject**: "Absence Malenthe Teunis"
- **Content**: Last-minute cancellations, replacement presenters/exhibitors
- **Key Data to Extract**:
  - Original attendee details
  - Replacement contact information
  - Presentation/booth responsibilities transferred
  - International company details
- **Action Items**: "cover presentation", "step up", "update program"
- **Topics**: substitutions, cancellations, program-updates, exhibitors

### 5. **Social Media Coordination**
- **Subject**: "Blurb for your social media"
- **Content**: Field trip descriptions, speaker announcements, conference promotion
- **Key Data to Extract**:
  - Event details (dates, locations)
  - Field trip leaders and descriptions
  - Speaker names
  - Social media handles/platforms mentioned
- **Action Items**: "post on Facebook/LinkedIn", "share", "send friend request"
- **Topics**: social-media, promotion, field-trips, speakers

### 2. **Field Trip Coordination**
- **Subject**: "Field Trips"
- **Content**: Capacity management, sign-up tracking, participant lists
- **Key Data to Extract**:
  - Field trip leader contacts (name, email, organization)
  - Venue/location details (Jekyll Island, Brunswick, Cannon's Point)
  - Capacity numbers (23 participants, 20 participants)
  - Registration deadlines
- **Action Items**: "schedule extra staff", "allow sign-ups until noon", "check spreadsheet"
- **Topics**: field-trips, logistics, registration, capacity-management

### 3. **Abstract Submissions**
- **Subject**: "sorry for delay took a while with Ray"
- **Content**: Abstract files, co-presenter information
- **Key Data to Extract**:
  - Presenter contact details
  - Co-presenter names
  - Academic affiliations
  - Research topics
- **Action Items**: "submit abstract through portal", "add title to program"
- **Topics**: abstracts, presentations, research

### 4. **Registration & Logistics**
- **Subject**: "International Conference on Shellfish Restoration 9/15-9/18/2024"
- **Content**: Attendee questions, dietary requirements, special requests
- **Key Data to Extract**:
  - International attendees (country, organization)
  - Special needs (field trip confirmation, dietary restrictions)
  - Event details (Low Bowl Dinner, tours)
- **Action Items**: "confirm registration", "send confirmation", "check list"
- **Topics**: registration, international-attendees, logistics

### 6. **Olympia Oyster Restoration Program Coordination**
- **Subject**: "RE: ICSR program"
- **Content**: Specialized sub-group coordination (Olympia oyster researchers), multi-organization collaboration
- **Key Data to Extract**:
  - Tribal affiliations (Swinomish, Jamestown S'Klallam, Amah Mutsun)
  - State agencies (Washington DFW, California universities)
  - Conservation organizations (TNC, PSRF)
  - Research focus (native oyster restoration)
  - Geographic scope (Pacific Northwest, California)
- **Action Items**: "coordinate travel together", "share resources", "meet as group"
- **Topics**: olympia-oysters, native-species, tribal-partnerships, west-coast, restoration-programs

### 7. **Lab/Facility Tours**
- **Content**: Lab visits, hatchery tours, post-conference activities
- **Key Data to Extract**:
  - Facility locations (Skidaway Island)
  - Tour dates/times (Friday Sept 20, 9 am)
  - Tour leaders and attendees
- **Action Items**: "give tour", "coordinate visit"
- **Topics**: tours, facilities, lab-visits

### 8. **Post-Conference Thank You/Planning**
- **Subject**: "ICSR2024"
- **Content**: Success reflections, ICSR2026 planning initiation
- **Key Data to Extract**:
  - Planning committee volunteers for next conference
  - Feedback and testimonials
  - Organization details (PSRF coordinating)
- **Action Items**: "sign up for planning committee", "reach out about ICSR2026"
- **Topics**: planning-committee, icsr2026, feedback, next-conference

## Contact Extraction Patterns

### Signature Formats Observed:

1. **Academic Style** (Loren Coen):
```
Loren Coen, Ph.D.
Research Affiliate Professor
Department of Biological Sciences and Harbor Branch Oceanographic Institute at Florida Atlantic University
Lcoen1@fau.edu
239-470-2236
```

2. **Government Agency** (Peter Kingsley-Smith):
```
Peter Kingsley-Smith (he / him / his)
Assistant Director, Shellfish Research Section Manager
Marine Resources Research Institute
South Carolina Department of Natural Resources
217 Fort Johnson Road, Charleston SC 29412
Tel. No.: 843-953-9840 (office); 843-655-8763 (cell)
E-mail: kingsleysmithp@dnr.sc.gov
```

3. **Sea Grant** (Mark Risse, Sara Karlsson):
```
Dr. Mark Risse, P.E.
Marine Extension and Georgia Sea Grant | Director
1180 East Broad St.  1030 Chicopee Complex | Athens, GA 30602
c: 706-202-9576
w: gacoast.uga.edu
```

4. **Conservation Organization** (Yank Moore):
```
Yank Moore, Director of Conservation
Jekyll Island Authority
Office: 912.635.9384 | Cell: 912.215.9374
Wildlife Response Voicemail (24/7): 912.222.5992
Email: ymoore@jekyllisland.com
```

5. **University Research** (Michael Doall):
```
Michael Doall
Associate Director for Bivalve Restoration & Aquaculture
School of Marine & Atmospheric Sciences
Stony Brook University
cell:631-418-4249 / emaill: michael.doall@stonybrook.edu
```

### Data Points to Extract:

- **Name**: Including titles (Dr., Ph.D., P.E.), pronouns (he/him/his)
- **Title**: Full job title (may span multiple lines)
- **Organization**: Institution name, department, sub-units
- **Address**: Street, city, state, zip
- **Phones**: Office, cell, emergency/alternative numbers
- **Email**: Primary and alternate emails
- **Websites**: Personal, organizational, social media URLs
- **Pronouns**: (he/him/his) notation

## Action Item Patterns

- **Social Media**: "post on [platform]", "share", "re-share", "send friend request"
- **Coordination**: "schedule", "coordinate", "confirm", "check list"
- **Deadlines**: "by noon", "Monday AM", "this week"
- **Submissions**: "submit abstract", "send confirmation", "provide details"
- **Tours/Events**: "give tour", "join us", "sign up"
- **Planning**: "volunteer for committee", "reach out", "let me know"

## Topic Categories

### Primary Topics:
- `social-media` - Posts, shares, promotion
- `field-trips` - Tours, site visits, capacity management
- `registration` - Sign-ups, confirmations, attendee lists
- `abstracts` - Submissions, presentations, research
- `logistics` - Venues, timing, capacity, special needs
- `international` - International attendees, travel coordination
- `planning-committee` - Committee work, next conference planning
- `tours` - Lab visits, facility tours, post-conference activities
- `speakers` - Keynotes, presenters, panelists
- `sponsors` - Sponsorship inquiries, donor coordination

### Secondary Topics:
- `icsr2024` - Current conference
- `icsr2026` - Next conference planning
- `facilities` - Labs, hatcheries, venues
- `feedback` - Post-event reflections, testimonials
- `capacity-management` - Participant limits, waitlists
- `olympia-oysters` - Native Olympia oyster restoration
- `tribal-partnerships` - Tribal organizations and collaborations
- `west-coast` - Pacific coast restoration efforts
- `international-exhibitors` - Non-US companies/presenters
- `program-updates` - Schedule changes, cancellations, additions
- `raffles` - Giveaways, sponsor donations, prize drawings
- `ride-sharing` - Transportation coordination
- `co-authors` - Research collaborators

## Confidence Scoring Factors

### High Confidence (90-100%):
- Email signature with complete contact info
- Clear organizational affiliation
- Multiple data points (phone, address, title)
- Consistent formatting

### Medium Confidence (70-89%):
- Partial signature
- Email address without full details
- Organization mentioned in context
- Some ambiguity in title/role

### Low Confidence (50-69%):
- Minimal contact info
- Email-only identification
- Inferred relationships
- Ambiguous context

## Recommendations for AI Prompt Tuning

1. **Prioritize signature block extraction** - Most contact details are in standardized signatures
2. **Handle multiple phone types** - Office, cell, emergency, wildlife response
3. **Extract URLs** - Websites, GoFundMe, social media profiles
4. **Recognize multi-line titles** - Academic and government titles often span 2-3 lines
5. **Capture alternate emails** - Many contacts have multiple email addresses
6. **Tag conference-specific roles** - Planning Committee, Field Trip Leader, Presenter, etc.
7. **Extract event logistics** - Dates, times, locations, capacities
8. **Identify action owners** - Who needs to do what by when
9. **Link related emails** - Thread tracking for ongoing topics
10. **Categorize by conference phase** - Pre-conference (planning), during (logistics), post (feedback/next planning)

## Example Ideal Extraction

**From Dorothy Leonard's post-conference email:**
```json
{
  "extracted_contacts": [
    {
      "name": "Dorothy Leonard",
      "email": "msmussel@oceanequities.org",
      "organization": "Ocean Equities LLC",
      "phone": "(410) 562-4880",
      "role": "ICSR2024 Planning Committee",
      "confidence": 95
    }
  ],
  "action_items": [
    {
      "task": "Start planning ICSR2026",
      "owner": "Betsy Peabody / PSRF",
      "deadline": null,
      "priority": "medium",
      "context": "Betsy will reach out about ICSR2026 planning"
    },
    {
      "task": "Volunteer for ICSR2026 planning committee",
      "owner": "planning committee members",
      "deadline": null,
      "priority": "low",
      "context": "Let Betsy know if interested"
    }
  ],
  "topics": ["post-conference", "feedback", "icsr2026", "planning-committee", "success-celebration"],
  "overall_confidence": 92,
  "email_metadata": {
    "email_type": "thank-you-wrap-up",
    "conference": "ICSR2024",
    "phase": "post-conference",
    "planning_committee_size": 18
  }
}
```
