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
| Register | /conference/register.html | FIXED | Registration form |
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
| Support | /support.html | FIXED | Support/help (i18n keys added) |
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
| My Reviews API missing | /member/my-reviews.html | Medium | FIXED | Added /api prefix router alias to expose abstracts routes (commit c17cb13) |
| Conference registration error | /conference/register.html | Critical | FIXED | Added /api/conference/active endpoint + router alias (commit a763e74) |
| Support page i18n missing | /support.html | Medium | FIXED | Added 46 translation keys for EN/ES/FR (commit ed53779) |

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
- [x] My Reviews page - FIXED (added /api prefix alias for abstracts routes)

### Round 3: Admin Portal
- [x] Dashboard (/admin/index.html) - Redirects to /login.html (placeholder)
- [x] Users (/admin/users.html) - Placeholder page ("coming soon")
- [x] Contacts (/admin/contacts.html) - Redirects to homepage without auth (correct behavior)
- [ ] Conferences - Not tested
- [ ] Abstracts - Not tested

### Round 4: Conference & Abstract Submission
- [x] Conference Registration (/conference/register.html) - FIXED (was missing /api/conference/active endpoint)
- [x] Abstract Submission (/abstracts/submit.html) - Redirects to login (correct - requires auth)

### Round 5: Additional Public Pages (2026-01-21)
- [x] ICSR2026 (/icsr2026.html) - Working, conference info displays correctly
- [x] Gallery (/gallery.html) - Working, photos load with filters functional

### Round 7: Extended Public Pages (2026-01-21)
- [x] About (/about.html) - Working, mission/vision/values display correctly
- [x] Support (/support.html) - FIXED (was showing translation keys, now working)
- [x] Press Kit (/press-kit.html) - Working, quick facts and media resources display
- [x] Why Restoration (/why-restoration-matters.html) - Working, ecosystem services info displays

### Round 8: Legal Pages (2026-01-21)
- [x] Privacy Policy (/legal/privacy.html) - Working, full policy displays
- [x] Terms & Conditions (/legal/terms.html) - Working, conference terms included
- [x] Accessibility (/legal/accessibility.html) - Working, WCAG 2.1 AA statement
- [x] Code of Conduct (/legal/code-of-conduct.html) - Working, conference conduct policy

### Round 9: Additional Pages (2026-01-21)
- [x] ICSR (/icsr.html) - Working, conference history and info displays
- [x] ICSR 2024 Photos (/icsr2024-photos.html) - Working, Jekyll Island photos display
- [x] Travel (/travel/index.html) - Working, Travel & Roommate Finder with forms
- [x] Meeting Calendar (/meetings/calendar.html) - Working, calendar with filters, empty state
- [x] Conference Confirmation (/conference/confirmation.html) - Working, shows error without valid token (correct)

### Round 6: API Endpoints
- [x] GET /health - Working
- [x] GET /api/zones/public/page/* - Fixed and working
- [x] GET /api/auth/me - Returns 401 without auth (correct)
- [x] GET /api/conferences/ - Returns 401 without auth (correct)
- [x] GET /api/conference/active - Working (added in commit a763e74)

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

#### Medium (ALL FIXED - commit f836dfa)
7. ~~**No session inactivity timeout** - auth.py:81-111 - `last_activity` not enforced~~ **FIXED** - Added 60-min inactivity check in is_session_valid()
8. ~~**Missing rate limiting** - auth.py:592-746 - Profile update has no rate limit~~ **FIXED** - Added 20/hour limit
9. ~~**IP detection behind proxy** - auth.py:155,218,260,402 - `request.client.host` not proxy-aware~~ **FIXED** - Added get_client_ip() helper checking X-Forwarded-For/X-Real-IP
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
