# AWS SES Production Access Appeal Response

**Case #**: 176229192700336
**Organization**: International Shellfish Restoration Society (ISRS)
**Tax ID**: 39-2829151 (501(c)(3) nonprofit)
**Domain**: shellfish-society.org
**Website**: https://shellfish-society.org

---

## About Our Organization

The International Shellfish Restoration Society (ISRS) is a 501(c)(3) nonprofit organization established in 2024. We support the global shellfish restoration community through the International Conference on Shellfish Restoration (ICSR), which has convened restoration professionals since 1996.

Our network includes 2,600+ researchers, practitioners, government agencies, and conservation organizations across 6 continents working to restore vital shellfish ecosystems.

---

## How We Plan to Use Amazon SES

### 1. **Email Types and Frequency**

We send four primary types of emails:

**A. Conference Registration Confirmations** (Transactional)
- **Frequency**: As registrations occur, primarily Sept-Oct 2025 leading to ICSR2026 (Oct 4-8, 2026)
- **Volume**: Estimated 300-400 registrations over 3 months
- **Recipients**: Opt-in registrants who actively sign up for our biennial conference
- **Content**: Registration confirmation, payment receipt, conference details

**B. Membership Communications** (Transactional)
- **Frequency**: As memberships are purchased/renewed
- **Volume**: 10-20/month
- **Recipients**: Members who sign up via our website
- **Content**: Welcome emails, membership confirmations, renewal reminders

**C. Admin/Board Notifications** (Transactional)
- **Frequency**: Weekly during active periods
- **Volume**: 5-10/week to ~20 board members and staff
- **Recipients**: Internal team only (board members, conference planners)
- **Content**: Meeting reminders, vote notifications, administrative updates

**D. Newsletter/Updates** (Marketing - Opt-in Only)
- **Frequency**: Quarterly
- **Volume**: ~2,000 emails per quarter to opted-in subscribers
- **Recipients**: Only contacts who explicitly opt in via website forms
- **Content**: Conference announcements, restoration news, community updates

**Total Estimated Volume**:
- Daily: 5-30 emails (mostly transactional)
- Monthly: 150-600 emails
- Peak: Sept-Oct 2026 conference season

---

### 2. **How We Maintain Recipient Lists**

**Data Collection:**
- All emails collected through:
  - Conference registration forms (explicit consent)
  - Website newsletter signup forms (explicit opt-in)
  - Membership applications (consent to communicate)
  - Contact forms with permission checkbox

**List Maintenance:**
- PostgreSQL database with email validation on entry
- Regular data audits to remove invalid emails
- Automatic suppression list for bounces/complaints
- Clear unsubscribe link in all marketing emails
- Unsubscribe requests processed within 24 hours
- No purchased or third-party email lists - 100% organic opt-ins

**Data Quality:**
- Email verification at point of entry
- Double opt-in for newsletter subscriptions (planned)
- Regular list cleaning to remove inactive addresses
- Segmentation by engagement level

---

### 3. **Bounce and Complaint Management**

**Bounce Handling:**
- Monitor SES bounce notifications via SNS
- Hard bounces: Immediately remove from mailing list
- Soft bounces: Retry 3x over 72 hours, then remove
- Bounce rate monitoring and alerts if >2%
- Automatic suppression list integration

**Complaint Handling:**
- Immediate removal upon complaint notification
- Complaint rate monitoring (target <0.1%)
- Investigation of patterns/root causes
- Feedback loop with AWS SES
- Manual review of all complaints

**Unsubscribe Process:**
- One-click unsubscribe in email footer
- Honor requests within 24 hours
- Separate lists for different email types
- Users can opt out of marketing while keeping transactional

**Technical Implementation:**
```
- SNS topics for bounce/complaint notifications
- Webhook endpoints to process feedback
- Automated suppression list updates
- Dashboard monitoring of email health metrics
```

---

### 4. **Example Emails We Send**

**Example 1: Conference Registration Confirmation**
```
Subject: ICSR2026 Registration Confirmation

Dear [Name],

Thank you for registering for the International Conference on Shellfish
Restoration (ICSR2026) in Puget Sound, Washington, October 4-8, 2026.

Registration Details:
- Conference: ICSR2026
- Dates: October 4-8, 2026
- Venue: Little Creek Casino Resort, Puget Sound, WA
- Registration Type: [Type]
- Confirmation #: [Number]

Next Steps:
1. Complete payment via Zeffy (link provided)
2. Book accommodations (hotel block available)
3. Submit abstracts by May 1, 2026

Questions? Email info@shellfish-society.org

Best regards,
ISRS Conference Team

---
Unsubscribe: [link]
```

**Example 2: Membership Welcome**
```
Subject: Welcome to ISRS - Your Membership is Confirmed

Dear [Name],

Welcome to the International Shellfish Restoration Society! We're excited
to have you join our global network of 2,600+ restoration professionals.

Your Benefits:
- Access to members-only resources
- Discounted conference registration
- Networking opportunities
- Monthly newsletter

Get Started:
- Complete your profile: [link]
- Browse member directory: [link]
- View upcoming events: [link]

Questions? Reply to this email.

Best regards,
ISRS Team

---
Manage preferences: [link] | Unsubscribe: [link]
```

**Example 3: Quarterly Newsletter**
```
Subject: ISRS Q4 2025 Update - ICSR2026 Registration Opening Soon

Dear ISRS Community,

We're excited to share updates from the shellfish restoration world:

🎟️ ICSR2026 Registration Opening December 1, 2025
Join us in Puget Sound, WA, October 4-8, 2026
Early bird rates available through March 1, 2026

📰 Recent Restoration News
- [Story 1 with link]
- [Story 2 with link]

🤝 New Partnerships
[Partnership announcements]

📅 Upcoming Events
[Event listings]

[Read full newsletter on website]

---
You're receiving this because you opted in to ISRS updates.
Update preferences: [link] | Unsubscribe: [link]
```

---

### 5. **Domain Verification Status**

✅ **Domain Verified**: shellfish-society.org
- SPF record configured
- DKIM signing enabled
- DMARC policy set to monitor
- MX records pointing to email provider
- Domain ownership verified via DNS

**DNS Records Configured:**
```
TXT: "v=spf1 include:amazonses.com ~all"
DKIM: [AWS SES DKIM tokens]
DMARC: "v=DMARC1; p=none; rua=mailto:postmaster@shellfish-society.org"
```

---

### 6. **Sending Best Practices**

**Content Quality:**
- Professional, relevant content for our audience
- Clear sender identification
- Accurate subject lines (no deceptive practices)
- Plain text alternatives for all HTML emails
- Mobile-responsive templates
- Accessible design (WCAG compliant)

**Compliance:**
- CAN-SPAM Act compliant
- GDPR compliant (EU data protection)
- Clear privacy policy on website
- Data retention policies documented
- Regular compliance audits

**Reputation Management:**
- Warm-up period with gradual volume increase
- Monitor sender reputation scores
- Maintain low bounce/complaint rates
- Responsive to feedback
- Regular list hygiene

---

### 7. **Use Case Summary**

We are a legitimate nonprofit scientific organization needing email for:
1. Transactional communications (conference registrations, receipts)
2. Member services (account management, benefits)
3. Internal admin communications (board members, staff)
4. Opt-in community updates (quarterly newsletters)

**We will NOT:**
- Send unsolicited emails
- Purchase or rent email lists
- Use deceptive subject lines or sender names
- Ignore bounces or complaints
- Send emails to anyone who hasn't opted in

**Volume Justification:**
- 2,600 existing community members
- 300-400 expected conference registrations
- Modest growth trajectory
- Well below SES limits

---

### 8. **Why Amazon SES**

We chose SES because:
- Reliable infrastructure for transactional emails
- Cost-effective for nonprofit budget
- Excellent deliverability reputation
- Detailed analytics and monitoring
- Integration with our Node.js backend
- Compliance with email best practices

---

## Contact Information

**Organization**: International Shellfish Restoration Society
**Primary Contact**: Aaron Kornbluth
**Email**: info@shellfish-society.org
**Website**: https://shellfish-society.org
**Tax Status**: 501(c)(3) nonprofit (EIN: 39-2829151)

We respectfully request reconsideration of our production access request. We are committed to being responsible email senders and maintaining AWS SES's excellent reputation.

Thank you for your consideration.
