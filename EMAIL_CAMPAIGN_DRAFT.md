# ISRS/ICSR2026 Announcement Email - Draft

## Campaign Details
- **From**: ISRS <noreply@shellfish-society.org>
- **Subject**: Important Updates from ISRS & ICSR2026 Save the Date
- **Target Audience**: All Contacts
- **Scheduled Send**: [Week of February 3, 2026]

---

## Email Subject Line Options

**Option 1 (Recommended)**: `{{firstName}}, Save the Date: ICSR2026 in Washington State`

**Option 2**: `Important ISRS Updates & ICSR2026 Announcement`

**Option 3**: `Join Us for ICSR2026 - October 4-8, Washington`

---

## Email Body (HTML with Conditional Content)

```html
<p>Dear {{firstName}},</p>

<p>We hope this message finds you well! We're writing to share exciting updates about The International Shellfish Restoration Society (ISRS) and the upcoming International Conference on Shellfish Restoration (ICSR2026).</p>

<!-- CONDITIONAL: ICSR2024 Participants (attendees, presenters, posters, volunteers, planning committee, sponsors, exhibitors, field trip participants) -->
<div class="icsr2024-participant-section info-box">
<h2>Thank You for ICSR2024!</h2>

<p>We want to extend our heartfelt gratitude for your participation in ICSR2024 at Jekyll Island, Georgia. {{icsr2024ParticipationSummary}}</p>

{{icsr2024RecognitionItems}}
</div>

<!-- Main Announcement - For Everyone -->
<h2>🎉 Save the Date: ICSR2026 in Washington State</h2>

<div class="announcement">
<img src="{{icsr2026LogoSrc}}" alt="ICSR2026 Logo">
<h3>ICSR2026 - International Conference on Shellfish Restoration</h3>
<p><strong>📅 October 4-8, 2026</strong></p>
<p><strong>📍 Little Creek Casino Resort, Shelton, Washington</strong></p>
<p style="font-size: 14px; margin-top: 10px;"><em>Hosted by Puget Sound Restoration Fund at Little Creek Casino Resort</em></p>
<p>
<a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=ICSR2026+-+International+Conference+on+Shellfish+Restoration&dates=20261004/20261009&details=Join+us+for+ICSR2026+at+Little+Creek+Casino+Resort+in+Shelton%2C+Washington.+More+details+at+https://www.shellfish-society.org&location=Little+Creek+Casino+Resort%2C+Shelton%2C+WA" class="button">
   Add to Google Calendar
</a>
<a href="data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20261004%0ADTEND:20261009%0ASUMMARY:ICSR2026 - International Conference on Shellfish Restoration%0ADESCRIPTION:Join us for ICSR2026 at Little Creek Casino Resort in Shelton%2C Washington.%0ALOCATION:Little Creek Casino Resort%2C Shelton%2C WA%0AEND:VEVENT%0AEND:VCALENDAR" download="ICSR2026.ics" class="button">
   Download .ics File
</a>
</p>
</div>

<p>We're thrilled to announce that ICSR2026 will be hosted by <a href="https://restorationfund.org" target="_blank" rel="noopener">Puget Sound Restoration Fund</a> at <a href="https://www.littlecreek.com" target="_blank" rel="noopener">Little Creek Casino Resort</a> in Shelton, Washington. The resort is operated by the <a href="https://www.squaxinisland.org" target="_blank" rel="noopener">Squaxin Island Tribe</a>, whose ancestral territory and ongoing stewardship make this an ideal location for learning about Indigenous shellfish restoration and management. Since 1996, ICSR has been held worldwide—from the United States to Canada, Scotland, Australia, and beyond—fostering lasting collaborations among practitioners on the leading edge of molluscan shellfish restoration.</p>

<p><strong>Conference Theme:</strong> <em>Engaging Communities, Collaborating with Knowledge Holders, and Advancing Restorative Aquaculture</em></p>

<p>The Little Creek Casino Resort offers the ideal setting, located in the heartland of historic shellfish abundance, world-class shellfish production, and collaborative shellfish restoration. We're expecting 300+ participants including practitioners, researchers, growers, Indigenous communities, and natural resources managers.</p>

<h3>Conference Highlights:</h3>
<ul>
<li><strong>Welcome Reception:</strong> Connect with colleagues from around the world</li>
<li><strong>Traditional Salmon & Clam Bake:</strong> Experience coastal traditions and Indigenous cuisine</li>
<li><strong>Field Trips:</strong> Visit nearby shellfish facilities, restoration sites, and cultural locations</li>
<li><strong>Golf Tournament:</strong> Network while enjoying the Pacific Northwest outdoors</li>
<li><strong>Scientific Program:</strong> Presentations, posters, and workshops on shellfish restoration and conservation</li>
<li><strong>Indigenous Knowledge:</strong> Learn from Tribal restoration practices and Traditional Ecological Knowledge</li>
</ul>

<h3>Venue & Travel:</h3>
<ul>
<li><strong>Lodging:</strong> Little Creek Casino Resort provides accommodations for all conference attendees</li>
<li><strong>Airport:</strong> Sea-Tac International Airport is the closest major airport</li>
<li><strong>Location:</strong> Short drive from Olympia, Washington's state capital</li>
</ul>

<!-- CONDITIONAL: Already registered -->
<div class="already-registered-section info-box">
<p><strong>✓ Thank You for Registering!</strong><br>
We see you've already registered for ICSR2026. We're looking forward to seeing you in Washington! Keep an eye out for additional details about the program, accommodations, and field trips in the coming months.</p>
</div>

<!-- CONDITIONAL: Not yet registered -->
<div class="not-registered-section">
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
</div>

<!-- CONDITIONAL: Sponsors & Funders -->
<div class="sponsor-funder-section info-box">
<h3 style="margin-top: 0;">Thank You for Your Support</h3>
<p>As a valued {{sponsorLevel}} sponsor and supporter of ISRS, your contributions make our conferences and programs possible. We're grateful for your continued partnership in advancing shellfish restoration globally. If you're interested in sponsorship opportunities for ICSR2026, please reach out to us directly.</p>
</div>

<!-- About ISRS -->
<h2 style="margin-top: 40px;">About the International Shellfish Restoration Society</h2>

<p>ISRS is a new global nonprofit organization dedicated to advancing shellfish restoration through science, education, and community engagement. Our mission is to support the restoration and sustainable management of shellfish populations worldwide, recognizing their critical role in coastal ecosystems, water quality, habitat creation, and food security.</p>

<h3>How You Can Get Involved:</h3>
<ul>
<li><strong>Submit an Abstract:</strong> Abstract submissions for ICSR2026 will open in Spring 2026</li>
<li><strong>Volunteer:</strong> Help make ICSR2026 a success by volunteering during the conference</li>
<li><strong>Become a Member:</strong> Join ISRS to stay connected with the global restoration community</li>
<li><strong>Sponsorship:</strong> Support the conference through sponsorship opportunities</li>
</ul>

<!-- Call to Action -->
<h2 style="margin-top: 40px;">Stay Connected</h2>

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

<!-- Questions -->
<p style="margin-top: 40px;">If you have any questions about ICSR2026 or ISRS programs, please don't hesitate to reach out. We're here to help!</p>

<p>We look forward to seeing you in Washington State this October!</p>

<p>Warm regards,<br>
<strong>The ISRS and ICSR2026 Teams</strong></p>

<!-- Footer is automatically added by emailService.js wrapEmailTemplate() -->
```

---

## Personalization Variables Used

This email template uses the following personalization:

**Basic:**
- `{{firstName}}` - Personalizes greeting

**ICSR2024 Conditional Content:**
- `{{icsr2024Attended}}` - Shows "Thank You" section for attendees
- `{{icsr2024Presented}}` - Shows presenter recognition
- `{{icsr2024PresentationCount}}` - Number of presentations
- `{{icsr2024PresentationTitles}}` - Comma-separated list of titles

**ICSR2026:**
- `{{icsr2026Registered}}` - Shows "Already Registered" vs "Register Now" section
- `{{icsr2026RegistrationType}}` - Shows their registration type

**Sponsors/Funders:**
- `{{isSponsor}}` - Shows sponsor thank you section
- `{{sponsorLevel}}` - Shows their sponsor level

---

## Implementation Notes

### For the Email Campaign System:

The conditional sections should be implemented using logic like:

```javascript
// Pseudo-code for conditional rendering
if (recipient.icsr2024_attended) {
  show('.icsr2024-attendee-section');
  if (recipient.icsr2024_presented) {
    show('.presenter-recognition');
  }
} else {
  show('.icsr2024-non-attendee-section');
}

if (recipient.icsr2026_registered) {
  show('.already-registered-section');
} else {
  show('.not-registered-section');
}

if (recipient.is_sponsor || recipient.is_funder) {
  show('.sponsor-funder-section');
}
```

### Alternative: Simplified Version

If conditional HTML sections are complex to implement, you can use a simpler version with inline conditionals within single paragraphs, relying on the personalization variables to handle the logic.

---

## Next Steps

1. ✅ **Review & Edit**: Review this draft and make any changes to tone, content, or structure
2. 🎨 **Format in Email System**: Create the campaign in your admin portal at `/admin/email-campaigns.html`
3. 🧪 **Send Test Emails**: Send to your email with different contact data scenarios:
   - ICSR2024 attendee who presented
   - ICSR2024 attendee who didn't present
   - Non-attendee
   - Someone already registered for ICSR2026
   - Sponsor/funder
4. 📤 **Schedule Send**: Schedule for next week once tests look good

---

**Questions to Consider:**

1. Should we include hotel/accommodation details now or wait?
2. Do you want to mention abstract submission dates?
3. Should we include early bird pricing details?
4. Any specific sponsors to thank by name?
5. Should we mention COVID-19 policies or safety measures?
