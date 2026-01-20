# Language Switcher Audit - ISRS Website

**Date**: 2026-01-19
**Status**: Partial Implementation

---

## ✅ Pages WITH Language Switcher

### Main Public Pages
- ✅ `/index.html` - Homepage
- ✅ `/about.html` - About ISRS
- ✅ `/icsr.html` - ICSR Overview
- ✅ `/icsr2026.html` - ICSR 2026 Conference
- ✅ `/gallery.html` - Photo Gallery
- ✅ `/support.html` - Support/Donate Page
- ✅ `/press-kit.html` - Press Kit
- ✅ `/login.html` - OLD Login (superseded by /member/login.html)

### Legal Pages
- ✅ `/legal/privacy.html` - Privacy Policy
- ✅ `/legal/terms.html` - Terms of Service
- ✅ `/legal/code-of-conduct.html` - Code of Conduct
- ✅ `/legal/accessibility.html` - Accessibility Statement

### Member Portal
- ✅ `/member/login.html` - Member Login (JUST ADDED)

---

## ❌ Pages MISSING Language Switcher

### Critical Member Portal Pages (High Priority)
- ❌ `/member/signup.html` - Member Registration
- ❌ `/member/profile.html` - Member Profile
- ❌ `/member/verify.html` - Email Verification
- ❌ `/member/welcome.html` - Welcome Page
- ❌ `/member/directory.html` - Member Directory
- ❌ `/member/index.html` - Member Portal Home

### Conference Pages (High Priority)
- ❌ `/conference/register.html` - Conference Registration
- ❌ `/conference/confirmation.html` - Registration Confirmation

### Authentication Pages
- ❌ `/auth/verify.html` - Token Verification

### Abstract Submission
- ❌ `/abstracts/submit.html` - Submit Abstract
- ❌ `/abstracts/dashboard.html` - Abstracts Dashboard

### Membership Pages
- ❌ `/membership/join.html` - Join ISRS
- ❌ `/membership/dashboard.html` - Membership Dashboard

### Profile System (Alternate)
- ❌ `/profile/login.html` - Profile Login
- ❌ `/profile/dashboard.html` - Profile Dashboard

### Travel/Meetings
- ❌ `/travel/index.html` - Travel Information
- ❌ `/meetings/calendar.html` - Meeting Calendar
- ❌ `/meetings/schedule.html` - Meeting Schedule
- ❌ `/meetings/view.html` - View Meeting

### Admin Portal (Low Priority - English Only OK)
- ❌ All `/admin/*.html` pages (30+ pages)

---

## Recommendations

### Phase 1: Critical Member-Facing Pages (Do Now)

**Member Portal**:
1. `/member/signup.html` - NEW USERS need language support
2. `/member/profile.html` - Members editing their info
3. `/member/verify.html` - Email verification page
4. `/member/welcome.html` - Post-signup welcome

**Conference Registration**:
5. `/conference/register.html` - International attendees registering
6. `/conference/confirmation.html` - Registration confirmation

**Why**: These are the primary user-facing flows where international users interact with the system.

### Phase 2: Secondary Member Features

**Member Directory**:
- `/member/directory.html` - Member search/browse
- `/member/index.html` - Member portal home

**Abstract Submission**:
- `/abstracts/submit.html` - Researchers submitting work
- `/abstracts/dashboard.html` - Managing submissions

**Membership**:
- `/membership/join.html` - Membership signup
- `/membership/dashboard.html` - Membership management

### Phase 3: Nice-to-Have

**Travel/Logistics**:
- `/travel/index.html` - Travel info for attendees
- `/meetings/calendar.html` - Meeting calendar

**Auth Pages**:
- `/auth/verify.html` - Token verification

### Phase 4: Admin (Optional)

Admin pages can remain English-only since they're internal tools for board/staff.

---

## Implementation Strategy

### Option A: Quick Fix (Recommended)
Add these 2 lines to each HTML file in Phase 1:

**In `<head>`**:
```html
<script src="/js/components.js"></script>
```

**After `<header id="site-header"></header>`**:
```html
<script>
  loadHeader();
</script>
```

**Before `<footer id="site-footer"></footer>`**:
```html
<script>
  loadFooter();
</script>
```

### Option B: Make Content Translatable (More Work)
For each page:
1. Add components.js
2. Add loadHeader() call
3. Replace hardcoded text with `t('translationKey')`
4. Add translation keys to components.js for all 3 languages
5. Add language change listener

---

## Priority Order

### Immediate (Do Today):
1. ✅ `/member/login.html` - DONE
2. `/member/signup.html` - Registration flow
3. `/member/verify.html` - Email verification
4. `/conference/register.html` - Conference registration

### This Week:
5. `/member/profile.html` - Profile editing
6. `/member/welcome.html` - Post-signup
7. `/conference/confirmation.html` - Registration confirm
8. `/member/directory.html` - Member search

### This Month:
9. `/abstracts/submit.html` - Abstract submission
10. `/membership/join.html` - Membership signup
11. All other member/conference pages

### Backlog:
- Admin pages (English only is fine)
- Test pages (not user-facing)

---

## Translation Coverage Needed

For each page, we need:
- Page title
- Main headings
- Form labels
- Button text
- Help text
- Error messages
- Success messages

### Example: /member/signup.html
```javascript
// English
joinISRS: 'Join ISRS',
createMemberAccount: 'Create your member account to access the directory and member benefits',
emailAddress: 'Email Address',
firstName: 'First Name',
lastName: 'Last Name',
organizationName: 'Organization Name',
country: 'Country',
optional: '(optional)',
createAccount: 'Create Account',
alreadyHaveAccount: 'Already have an account?',
signInHere: 'Sign in here',

// Spanish
joinISRS: 'Únase a ISRS',
createMemberAccount: 'Cree su cuenta de miembro para acceder al directorio y beneficios',
// ... etc

// French
joinISRS: 'Rejoindre ISRS',
createMemberAccount: 'Créez votre compte membre pour accéder au répertoire et aux avantages',
// ... etc
```

---

## Estimated Effort

### Quick Header/Footer Only (Option A):
- 2 minutes per page × 15 pages = **30 minutes**
- Just adds language switcher, doesn't translate content

### Full Translation (Option B):
- 30-60 minutes per page × 15 pages = **8-15 hours**
- Translates all page content to 3 languages

---

## Next Steps

1. **Quick Win**: Add header/footer to Phase 1 pages (30 min)
2. **Test**: Verify language switcher works on all pages
3. **Gradual Translation**: Add translations for most-used pages first
4. **User Feedback**: See which pages users actually switch language on

---

**Created**: 2026-01-19
**Last Updated**: 2026-01-19
**Status**: Login page complete, 15+ pages remaining
