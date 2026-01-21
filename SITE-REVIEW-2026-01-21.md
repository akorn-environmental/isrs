# ISRS Website Systematic Review
**Date:** 2026-01-21
**Site:** https://www.shellfish-society.org

---

## Portal Structure

### Member Portal (`/member/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Login | /member/login.html | | Magic link auth |
| Signup | /member/signup.html | | New member registration |
| Verify | /member/verify.html | | Email verification |
| Welcome | /member/welcome.html | | Post-login landing |
| Dashboard | /member/index.html | | Member home |
| Profile | /member/profile.html | FIXED | Profile editing |
| Directory | /member/directory.html | | Member directory |
| My Reviews | /member/my-reviews.html | | Abstract review assignments |

### Admin Portal (`/admin/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Dashboard | /admin/dashboard.html | | Admin home |
| Index | /admin/index.html | | Admin landing |
| Users | /admin/users.html | | User management |
| Contacts | /admin/contacts.html | | Contact database |
| Organizations | /admin/organizations.html | | Org management |
| Conferences | /admin/conferences.html | | Conference management |
| Registrations | /admin/conference-registrations.html | | Registration management |
| Abstracts | /admin/abstracts.html | | Abstract management |
| Reviews | /admin/reviews.html | | Review management |
| Votes | /admin/votes.html | | Voting system |
| Voting | /admin/voting.html | | Voting interface |
| Assets | /admin/assets.html | | Asset management |
| Assets Manager | /admin/assets-manager.html | | Asset uploads |
| Asset Zones | /admin/asset-zones.html | | Asset zone config |
| Photos | /admin/photos.html | | Photo gallery admin |
| Analytics | /admin/analytics.html | | Site analytics |
| Email Analytics | /admin/email-analytics.html | | Email stats |
| Email Campaigns | /admin/email-campaigns.html | | Email campaigns |
| Email Parser | /admin/email-parser.html | | Email parsing |
| Funding | /admin/funding.html | | Funding tracking |
| Funding Pipeline | /admin/funding-pipeline.html | | Funding pipeline |
| Funding Prospects | /admin/funding-prospects.html | | Prospect management |
| Settings | /admin/settings.html | | Admin settings |
| Company Settings | /admin/company-settings.html | | Organization settings |
| Authentication | /admin/authentication.html | | Auth settings |
| Audit Logs | /admin/audit-logs.html | | Security logs |
| Import | /admin/import.html | | Data import |
| Feedback | /admin/feedback.html | | User feedback |
| Workflows | /admin/workflows.html | | Workflow automation |
| Board Documents | /admin/board-documents.html | | Board docs |
| Press Kit | /admin/press-kit.html | | Press materials |
| ICSR2026 Planning | /admin/icsr2026-planning.html | | Conference planning |

### Abstract Submission (`/abstracts/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Submit | /abstracts/submit.html | | Abstract submission |
| Dashboard | /abstracts/dashboard.html | | Submission dashboard |

### Conference Registration (`/conference/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Register | /conference/register.html | | Registration form |
| Confirmation | /conference/confirmation.html | | Confirmation page |

### Meetings (`/meetings/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Calendar | /meetings/calendar.html | | Meeting calendar |
| Schedule | /meetings/schedule.html | | Scheduling |
| View | /meetings/view.html | | Meeting details |

### Public Pages
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Home | /index.html | | Main landing |
| About | /about.html | | About ISRS |
| ICSR | /icsr.html | | Conference info |
| ICSR2026 | /icsr2026.html | | 2026 conference |
| Gallery | /gallery.html | | Photo gallery |
| ICSR2024 Photos | /icsr2024-photos.html | | 2024 photos |
| Support | /support.html | | Support/help |
| Press Kit | /press-kit.html | | Public press kit |
| Travel | /travel/index.html | | Travel info |
| Why Restoration | /why-restoration-matters.html | | Educational |

### Legal Pages (`/legal/`)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Privacy | /legal/privacy.html | | Privacy policy |
| Terms | /legal/terms.html | | Terms of service |
| Accessibility | /legal/accessibility.html | | Accessibility |
| Code of Conduct | /legal/code-of-conduct.html | | Code of conduct |

---

## Testing Checklist

### Authentication Flow
- [ ] Magic link login works
- [ ] New user registration works
- [ ] Email verification works
- [ ] Session persistence works
- [ ] Logout works
- [ ] Token refresh works

### Member Portal Functions
- [ ] Profile view loads correctly
- [ ] Profile edit works (VERIFIED WORKING)
- [ ] Directory displays members
- [ ] Directory search works
- [ ] My Reviews shows assignments
- [ ] Review submission works

### Admin Portal Functions
- [ ] Dashboard loads with stats
- [ ] User management CRUD
- [ ] Contact management CRUD
- [ ] Organization management CRUD
- [ ] Conference management CRUD
- [ ] Abstract management CRUD
- [ ] Review assignment works
- [ ] Asset upload works
- [ ] Email features work

### API Endpoints to Test
- [ ] GET /api/auth/me
- [ ] PUT /api/auth/me
- [ ] GET /api/conferences
- [ ] GET /api/contacts
- [ ] POST /api/assets/upload
- [ ] GET /api/asset-zones

---

## Issues Found

| Issue | Page | Severity | Status | Fix |
|-------|------|----------|--------|-----|
| Profile update 500 error | /member/profile.html | Critical | FIXED | Array field mismatch |

---

## Testing Progress

### Round 1: Member Portal
- [ ] Login page
- [ ] Profile page
- [ ] Directory page
- [ ] My Reviews page

### Round 2: Admin Portal
- [ ] Dashboard
- [ ] Users
- [ ] Contacts
- [ ] Conferences
- [ ] Abstracts

### Round 3: Public Pages
- [ ] Home
- [ ] ICSR2026
- [ ] Gallery
