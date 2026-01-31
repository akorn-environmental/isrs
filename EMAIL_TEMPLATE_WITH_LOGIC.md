# ISRS/ICSR2026 Email Template - With Logic Flow

## Email Subject Line
```
{{firstName}}, Save the Date: ICSR2026 in Washington State
```

## Email Body - Full Logic Flow

---

### GREETING (Always shown)
```
Dear {{firstName}},

We hope this message finds you well! We're writing to share exciting updates about the International Shellfish Restoration Society (ISRS) and the upcoming International Conference on Shellfish Restoration (ICSR2026).
```

---

### SECTION 1: ICSR2024 THANK YOU / MISSED YOU
**Conditional Logic:**

```javascript
IF recipient.icsr2024_attended === true:
  SHOW "Thank You for ICSR2024" section

  IF recipient.icsr2024_presented === true AND recipient.icsr2024_presentation_titles.length > 0:
    ALSO SHOW "Special Recognition" paragraph with presentation details
  ELSE:
    DO NOT SHOW "Special Recognition" paragraph
  END IF

ELSE IF recipient.icsr2024_attended === false:
  SHOW "We Missed You at ICSR2024" section

END IF
```

**Content:**

```html
<!-- IF icsr2024_attended === true -->
<h2>Thank You for ICSR2024!</h2>

<p>We want to extend our heartfelt gratitude for your participation in ICSR2024 at Jekyll Island, Georgia. Your presence made the conference a tremendous success, bringing together researchers, practitioners, and advocates from around the world to advance shellfish restoration science.</p>

  <!-- IF icsr2024_presented === true AND presentation_count > 0 -->
  <p style="background: #f0f8ff; padding: 15px; border-left: 4px solid #2e5a8a; margin: 20px 0;">
  <strong>Special Recognition:</strong> Thank you for contributing to the scientific program with your {{icsr2024PresentationCount}} presentation(s): <em>{{icsr2024PresentationTitles}}</em>. Your research and insights enriched the conference and helped drive important conversations in our field.
  </p>
  <!-- END IF -->

<!-- ELSE IF icsr2024_attended === false -->
<h2>We Missed You at ICSR2024</h2>

<p>While we were sorry you couldn't join us for ICSR2024 in Jekyll Island, Georgia, we wanted to share some highlights from the conference. Our community came together to discuss cutting-edge research, share restoration strategies, and build partnerships that will advance shellfish restoration worldwide.</p>
<!-- END IF -->
```

---

### SECTION 2: ICSR2026 ANNOUNCEMENT (Always shown to everyone)

```html
<h2>🎉 Save the Date: ICSR2026 in Washington State</h2>

<div class="announcement">
<img src="cid:icsr2026Logo" alt="ICSR2026 Logo">
<h3>ICSR2026 - International Conference on Shellfish Restoration</h3>
<p><strong>📅 October 4-8, 2026</strong></p>
<p><strong>📍 Squaxin Island Tribe, Washington</strong></p>
<p>
<a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=ICSR2026+-+International+Conference+on+Shellfish+Restoration&dates=20261004/20261009&details=Join+us+for+ICSR2026+at+the+Squaxin+Island+Tribe+in+Washington+State.+More+details+at+https://www.shellfish-society.org&location=Squaxin+Island+Tribe,+Washington" class="button">
   Add to Google Calendar
</a>
<a href="data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20261004%0ADTEND:20261009%0ASUMMARY:ICSR2026 - International Conference on Shellfish Restoration%0ADESCRIPTION:Join us for ICSR2026 at the Squaxin Island Tribe in Washington State.%0ALOCATION:Squaxin Island Tribe%2C Washington%0AEND:VEVENT%0AEND:VCALENDAR" download="ICSR2026.ics" class="button">
   Download .ics File
</a>
</p>
</div>

<p>We're thrilled to announce that ICSR2026 will be hosted by the Squaxin Island Tribe in beautiful Washington State. This location offers a unique opportunity to learn from Indigenous leadership in shellfish restoration and stewardship, explore the Pacific Northwest's rich shellfish ecosystems, and engage with cutting-edge restoration science.</p>

<h3>Conference Highlights:</h3>
<ul>
<li><strong>Indigenous Knowledge & Leadership:</strong> Learn from Tribal restoration practices and Traditional Ecological Knowledge</li>
<li><strong>Pacific Northwest Ecosystems:</strong> Explore geoduck, olympia oysters, and other iconic shellfish species</li>
<li><strong>Field Excursions:</strong> Visit active restoration sites in Puget Sound</li>
<li><strong>Networking:</strong> Connect with the global shellfish restoration community</li>
<li><strong>Scientific Program:</strong> Presentations, posters, workshops, and panel discussions</li>
</ul>
```

---

### SECTION 3: REGISTRATION STATUS
**Conditional Logic:**

```javascript
IF recipient.icsr2026_registered === true:
  SHOW "Thank You for Registering" section
  HIDE "Registration Now Open" section

ELSE IF recipient.icsr2026_registered === false:
  HIDE "Thank You for Registering" section
  SHOW "Registration Now Open" section

END IF
```

**Content:**

```html
<!-- IF icsr2026_registered === true -->
<div class="info-box">
<p><strong>✓ Thank You for Registering!</strong><br>
We see you've already registered for ICSR2026. We're looking forward to seeing you in Washington! Keep an eye out for additional details about the program, accommodations, and field trips in the coming months.</p>
</div>
<!-- END IF -->

<!-- IF icsr2026_registered === false -->
<h3>Registration Now Open!</h3>

<p>Early bird registration is available now! Secure your spot and take advantage of reduced registration rates.</p>

<div style="text-align: center; margin: 30px 0;">
<a href="https://www.zeffy.com/en-US/ticketing/icsr2026-international-conference-on-shellfish-restoration"
   style="background: #2e5a8a; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
   Register for ICSR2026 →
</a>
</div>

<p><strong>Registration Categories:</strong></p>
<ul>
<li>Full Conference Registration</li>
<li>Student Registration (Discounted)</li>
<li>Daily Registration</li>
<li>Virtual Attendance Options</li>
</ul>
<!-- END IF -->
```

---

### SECTION 4: SPONSOR THANK YOU
**Conditional Logic:**

```javascript
IF recipient.is_sponsor === true OR recipient.is_funder === true:
  SHOW sponsor thank you section
ELSE:
  HIDE sponsor thank you section
END IF
```

**Content:**

```html
<!-- IF is_sponsor === true OR is_funder === true -->
<div class="info-box">
<h3 style="margin-top: 0;">Thank You for Your Support</h3>
<p>As a valued {{sponsorLevel}} sponsor and supporter of ISRS, your contributions make our conferences and programs possible. We're grateful for your continued partnership in advancing shellfish restoration globally. If you're interested in sponsorship opportunities for ICSR2026, please reach out to us directly.</p>
</div>
<!-- END IF -->
```

---

### SECTION 5: ABOUT ISRS (Always shown)

```html
<h2>About the International Shellfish Restoration Society</h2>

<p>ISRS is a NEW global nonprofit organization dedicated to advancing shellfish restoration through science, education, and community engagement. Our mission is to support the restoration and sustainable management of shellfish populations worldwide, recognizing their critical role in coastal ecosystems, water quality, habitat creation, and food security.</p>

<h3>How You Can Get Involved:</h3>
<ul>
<li><strong>Submit an Abstract:</strong> Abstract submissions for ICSR2026 will open in Spring 2026</li>
<li><strong>Volunteer:</strong> Help make ICSR2026 a success by volunteering during the conference</li>
<li><strong>Become a Member:</strong> Join ISRS to stay connected with the global restoration community</li>
<li><strong>Sponsorship:</strong> Support the conference through sponsorship opportunities</li>
</ul>
```

---

### SECTION 6: STAY CONNECTED (Always shown)

```html
<h2>Stay Connected</h2>

<p>We'll be sharing more details about ICSR2026 in the coming months, including:</p>
<ul>
<li>Abstract submission guidelines and deadlines</li>
<li>Hotel and accommodation information</li>
<li>Field trip and excursion details</li>
<li>Sponsorship and exhibitor opportunities</li>
<li>Special events and networking activities</li>
</ul>

<p><strong>For more information, visit our website:</strong></p>
<p><a href="https://www.shellfish-society.org">www.shellfish-society.org</a></p>
```

---

### CLOSING (Always shown)

```html
<p style="margin-top: 40px;">If you have any questions about ICSR2026 or ISRS programs, please don't hesitate to reach out. We're here to help!</p>

<p>We look forward to seeing you in Washington State this October!</p>

<p>Warm regards,<br>
<strong>The ISRS and ICSR2026 Teams</strong></p>

<hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">

<p style="font-size: 12px; color: #666;">
<strong>Contact Information:</strong><br>
Email: <a href="mailto:noreply@shellfish-society.org">noreply@shellfish-society.org</a><br>
Website: <a href="https://www.shellfish-society.org">www.shellfish-society.org</a><br>
EIN: 88-3755389
</p>

<p style="font-size: 11px; color: #999;">
You're receiving this email because you're a contact in the ISRS database. If you'd like to unsubscribe from future communications, please <a href="{{unsubscribeLink}}">click here</a>.
</p>
```

---

## SUMMARY OF CONDITIONAL LOGIC

### Variables Used:
- `{{firstName}}` - Recipient's first name
- `{{icsr2024_attended}}` - Boolean: Did they attend ICSR2024?
- `{{icsr2024_presented}}` - Boolean: Did they present at ICSR2024?
- `{{icsr2024PresentationCount}}` - Number: How many presentations?
- `{{icsr2024PresentationTitles}}` - String: Comma-separated list of presentation titles
- `{{icsr2026_registered}}` - Boolean: Have they registered for ICSR2026?
- `{{is_sponsor}}` - Boolean: Are they a sponsor?
- `{{is_funder}}` - Boolean: Are they a funder?
- `{{sponsorLevel}}` - String: Their sponsor level (if applicable)

### Logic Flow:

1. **ICSR2024 Section:**
   - IF attended → Show "Thank You" + (IF presented → Show recognition)
   - IF NOT attended → Show "We Missed You"

2. **ICSR2026 Announcement:** Always show

3. **Registration Section:**
   - IF registered → Show "Thank You for Registering"
   - IF NOT registered → Show "Registration Now Open" with CTA button

4. **Sponsor Section:**
   - IF (sponsor OR funder) → Show thank you
   - ELSE → Hide

5. **About ISRS:** Always show

6. **Stay Connected:** Always show

7. **Closing:** Always show

---

## Test Scenarios

### Scenario 1: ICSR2024 Attendee + Presenter + Not Yet Registered
```javascript
{
  firstName: "Jane",
  icsr2024_attended: true,
  icsr2024_presented: true,
  icsr2024PresentationCount: 2,
  icsr2024PresentationTitles: "Oyster Reef Restoration in Chesapeake Bay, Climate Adaptation Strategies",
  icsr2026_registered: false,
  is_sponsor: false,
  is_funder: false
}
```
**Should show:**
- ✓ Thank You for ICSR2024
- ✓ Special Recognition paragraph
- ✓ ICSR2026 Announcement
- ✓ Registration Now Open (with button)
- ✗ Sponsor section hidden
- ✓ About ISRS
- ✓ Stay Connected

### Scenario 2: Non-Attendee + Already Registered + Sponsor
```javascript
{
  firstName: "John",
  icsr2024_attended: false,
  icsr2024_presented: false,
  icsr2026_registered: true,
  is_sponsor: true,
  is_funder: false,
  sponsorLevel: "Gold"
}
```
**Should show:**
- ✓ We Missed You at ICSR2024
- ✓ ICSR2026 Announcement
- ✓ Thank You for Registering
- ✗ Registration button hidden
- ✓ Sponsor thank you (Gold level)
- ✓ About ISRS
- ✓ Stay Connected

### Scenario 3: ICSR2024 Attendee (no presentation) + Not Registered
```javascript
{
  firstName: "Sarah",
  icsr2024_attended: true,
  icsr2024_presented: false,
  icsr2026_registered: false,
  is_sponsor: false,
  is_funder: false
}
```
**Should show:**
- ✓ Thank You for ICSR2024
- ✗ Special Recognition hidden
- ✓ ICSR2026 Announcement
- ✓ Registration Now Open (with button)
- ✗ Sponsor section hidden
- ✓ About ISRS
- ✓ Stay Connected
