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
| Profile update 500 error | /member/profile.html | Critical | FIXED | Array field mismatch in auth.py |
| Asset zones API 500 error | /api/zones/public/page/* | Critical | FIXED | Missing columns in assets table (focal_point_x, focal_point_y, alt_text, caption) |
| i18n placeholder showing | /icsr2026.html | Minor | FIXED | Added missing icsr2026OverviewText3 translation key |
| Member directory 404 error | /member/directory.html | Critical | FIXED | Added /api/auth/directory endpoint + fixed getDirectory() auth header |
| Directory names not showing | /member/directory.html | Medium | FIXED | Added full_name and organization fields to directory API response |
| My Reviews API missing | /member/my-reviews.html | Medium | OPEN | Backend missing /api/abstracts/* router - abstract review feature not implemented |
| Conference registration error | /conference/register.html | Critical | FIXED | Added /api/conference/active endpoint (commit a763e74) |

---

## Testing Progress

### Round 1: Public Pages (2026-01-21)
- [x] Home - Working, no errors
- [x] About - Working, no errors
- [x] ICSR2026 - Fixed (missing translation key)
- [x] Gallery - Working, photos load correctly

### Round 2: Member Portal
- [x] Login page - Working, magic link auth
- [x] Profile page - Working, edit saves correctly
- [x] Directory page - FIXED (was missing endpoint, now working)
- [x] My Reviews page - Backend API not implemented (abstracts router missing)

### Round 3: Admin Portal
- [x] Dashboard (/admin/index.html) - Redirects to /login.html (placeholder)
- [x] Users (/admin/users.html) - Placeholder page ("coming soon")
- [x] Contacts (/admin/contacts.html) - Working, loads with admin UI
- [ ] Conferences - Not tested
- [ ] Abstracts - Not tested

### Round 4: API Endpoints
- [x] GET /health - Working
- [x] GET /api/zones/public/page/* - Fixed and working
- [x] GET /api/auth/me - Returns 401 without auth (correct)
- [x] GET /api/conferences/ - Returns 401 without auth (correct)

---

## Security Audit (2026-01-21)

### Dependency Vulnerabilities (ALL FIXED - commit 8a5ba34)
| Package | Version | CVE/ID | Fix Version | Status |
|---------|---------|--------|-------------|--------|
| fastapi | 0.109.0 | PYSEC-2024-38 | 0.109.1 | ✅ FIXED (>=0.115.0) |
| pdfminer-six | 20221105 | CVE-2025-64512 | 20251107 | ✅ FIXED (>=20251230) |
| pdfminer-six | 20221105 | GHSA-f83h-ghpp-7wcc | 20251230 | ✅ FIXED (>=20251230) |
| starlette | 0.35.1 | CVE-2024-47874 | 0.40.0 | ✅ FIXED (transitive via fastapi) |
| starlette | 0.35.1 | CVE-2025-54121 | 0.47.2 | ✅ FIXED (transitive via fastapi) |
| ecdsa | 0.19.1 | CVE-2024-23342 | - | ⚠️ N/A (not exploitable - uses HS256) |

### API Security Vulnerabilities (12 found)

#### Critical (ALL FIXED - commit 4541dc1)
1. ~~**IDOR in withdraw_abstract()** - conferences.py:491 - undefined `current_user.contact_id`~~ **FIXED**
2. ~~**Missing admin auth checks** - conferences.py:644,792,995 - TODO comments for admin checks~~ **FIXED**
3. ~~**Broken authorization** - conferences.py:473-508 - `verify_abstract_owner` bypassed~~ **FIXED**

#### High (ALL FIXED - commit 0303a74)
4. ~~**Weak admin privilege detection** - permissions.py:14-47 - Uses notification_preferences~~ **FIXED** - Now uses proper RBAC with user_roles table
5. ~~**Excessive CORS** - main.py:37-43 - `allow_credentials=True` with `allow_methods=["*"]`~~ **FIXED** - Restricted methods and headers
6. ~~**Token exposure in logs** - auth.py:142,257 - Magic link tokens in queries~~ **FIXED** - Only logs first 8 chars

#### Medium (PARTIALLY FIXED)
7. **No session inactivity timeout** - auth.py:81-111 - `last_activity` not enforced
8. ~~**Missing rate limiting** - auth.py:592-746 - Profile update has no rate limit~~ **FIXED** - Added 20/hour limit
9. **IP detection behind proxy** - auth.py:155,218,260,402 - `request.client.host` not proxy-aware
10. ~~**Directory search risks** - auth.py:534-541 - No length limits, ReDoS potential~~ **FIXED** - Added 100 char limit + 30/hour rate limit
11. **Sensitive data in directory** - auth.py:514-589 - Email harvest risk (mitigated with rate limiting)

### Positive Security Findings
- Rate limiting on auth endpoints (3/5/10/60 per hour)
- Secure token generation (secrets.token_urlsafe 32/64 bytes)
- Magic link 15-minute expiry
- One-time token usage enforced
- Token rotation on refresh
- SQLAlchemy ORM prevents SQL injection
- Pydantic input validation
