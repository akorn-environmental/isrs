# ISRS Portal System Documentation

## Two Separate Portal Systems

ISRS maintains **two distinct portal systems** with different access levels and features:

---

## 1. **Member Portal** (Public-Facing)
**URL**: https://www.shellfish-society.org/member/

### Target Users:
- Conference attendees
- Sponsors
- Students
- Speakers
- General ISRS members

### Features:
- **Magic Link Login** - Passwordless authentication via email
- View and edit personal profile
- Access member directory
- View conference registrations
- Download conference materials
- Connect with other members

### Login Flow:
```
1. User visits /member/login.html
2. Enters email address
3. Clicks "Send Magic Link"
4. Backend sends email with time-limited token (15 min)
5. User clicks link in email → /member/verify.html?token=XXX
6. Frontend verifies token with backend
7. Backend creates session + refresh tokens
8. User redirected to:
   - /member/welcome.html (first-time users)
   - /member/profile.html (returning users)
```

### Authentication:
- **Session Tokens**: Short-lived (configurable, typically 1-7 days)
- **Refresh Tokens**: Long-lived, rotated on use for security
- **No passwords**: Magic link only
- **Rate Limited**: 5 login requests/hour, 10 verification attempts/hour

### Permissions Level: **Member**
- Read own profile
- Update own profile
- View public member directory
- Access member-only content

---

## 2. **Admin Portal** (Restricted Access)
**URL**: https://www.shellfish-society.org/admin/ (or backend admin interface)

### Target Users:
- **Super Admins** - Full system access
- **Board Members** - Organization oversight
- **Admins** - Day-to-day operations
- **Special Access Users** - Specific elevated permissions

### Features:
- Manage all member profiles
- View conference registrations & payments
- Send bulk emails
- Generate reports & analytics
- Manage conference content
- Access financial data
- User role management

### Login Flow (To Be Implemented):
```
1. Admin visits /admin/login
2. Enters email address
3. Magic link sent (same as member portal)
4. Token verification includes permission check
5. If user has admin/board role:
   → Redirect to /admin/dashboard
   Else:
   → Show "Access Denied" error
```

### Permission Levels:

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Super Admin** | Full system access | All CRUD operations, user management, system config |
| **Board Member** | Organization oversight | View all data, reports, limited edits |
| **Admin** | Day-to-day operations | Manage members, conferences, emails |
| **Conference Manager** | Event-specific | Manage registrations, speakers, schedule |
| **Content Editor** | Website content | Edit pages, blog posts, resources |

### Authentication:
- Same magic link system as member portal
- **Additional permission check** after login
- Role verified against database `roles` or `permissions` table
- Admin actions logged for audit trail

---

## Technical Implementation

### Database Tables:

**attendee_profiles**
- Base user information (all users)
- `user_email`, `first_name`, `last_name`, etc.

**user_sessions**
- Active login sessions
- `session_token`, `expires_at`, `attendee_id`

**refresh_tokens**
- Long-lived tokens for session renewal
- `token`, `user_id`, `expires_at`, `revoked`

**user_roles** (To Be Created)
- Permission assignments
- `attendee_id`, `role` (member/admin/board/super_admin)
- `granted_at`, `granted_by`

### API Endpoints:

**Member Portal** (`/api/auth/`)
- `POST /request-login` - Send magic link
- `POST /verify-token` - Verify magic link, create session
- `GET /me` - Get current user profile
- `PUT /me` - Update profile
- `POST /logout` - End session
- `POST /refresh` - Refresh tokens

**Admin Portal** (`/api/admin/`)
- All member portal endpoints +
- `GET /users` - List all users
- `PUT /users/:id` - Edit any user
- `DELETE /users/:id` - Delete user
- `GET /roles` - Manage user roles
- `POST /bulk-email` - Send bulk communications
- `GET /analytics` - System reports

### Frontend Routes:

**Member Portal**
- `/member/login.html` - Login page
- `/member/verify.html` - Magic link handler
- `/member/profile.html` - User profile
- `/member/directory.html` - Member directory
- `/member/welcome.html` - First-time setup

**Admin Portal** (To Be Implemented)
- `/admin/login.html` - Admin login (same magic link)
- `/admin/dashboard.html` - Admin overview
- `/admin/users.html` - User management
- `/admin/conferences.html` - Conference management
- `/admin/emails.html` - Email campaigns
- `/admin/analytics.html` - Reports & insights

---

## Security Considerations

### Member Portal:
✅ Passwordless (no password breaches)
✅ Time-limited magic links (15 min expiry)
✅ Rate limiting on login attempts
✅ HTTPS only
✅ Token rotation for refresh tokens

### Admin Portal (Additional):
✅ Role-based access control (RBAC)
✅ Admin action audit logging
✅ IP address tracking for admin logins
✅ Two-factor authentication option (future)
✅ Separate admin session timeout (shorter)

---

## Migration Path

### Current State:
- Member portal ✅ Implemented
- Magic link auth ✅ Working
- Session + refresh tokens ✅ Implemented
- Admin portal ❌ Not yet implemented

### Next Steps:
1. Add `user_roles` table to database
2. Create admin middleware to check permissions
3. Build admin portal frontend pages
4. Add admin-specific API endpoints
5. Implement audit logging for admin actions
6. Add admin user invite system (board can invite admins)

---

## User Journey Examples

### Conference Attendee (Member Portal):
```
1. Registers for ICSR2026 → profile created
2. Receives welcome email with login link
3. Clicks link → auto-logged in
4. Updates profile with bio, expertise areas
5. Browses member directory to network
6. Downloads conference schedule PDF
```

### Board Member (Admin Portal):
```
1. Invited by super admin → profile created with "board" role
2. Receives admin invitation email with login link
3. Clicks link → verifies identity → redirected to admin dashboard
4. Views conference registration analytics
5. Reviews financial reports
6. Approves bulk email campaign to members
```

### Super Admin (Admin Portal):
```
1. Full access to both portals
2. Can grant/revoke admin roles
3. Can impersonate users for support
4. Access to system logs and debugging tools
5. Can modify system configuration
```

---

## FAQ

**Q: Can admin users access the member portal?**
A: Yes, all admin users also have member portal access. Admins are members with elevated permissions.

**Q: How does someone become an admin?**
A: Super admins can grant admin roles through the admin portal. Board members are typically imported from external list.

**Q: What happens if an admin's magic link expires?**
A: Same as members - they request a new one. No special treatment for security reasons.

**Q: Can members see the admin portal?**
A: No - attempting to access `/admin/*` without proper role returns "Access Denied" error.

**Q: How are board members identified?**
A: Email domain check (e.g., @isrs-board.org) OR manual role assignment in database.

---

**Last Updated**: 2026-01-19
**Author**: Development Team
**Status**: Member portal complete, Admin portal in planning
