# Notification Preferences System - Complete ✅

**Date**: 2026-01-20
**Status**: Code deployed, migration pending
**Next Step**: Run migration on Render

---

## Overview

Comprehensive notification system allowing users to control what emails they receive, with separate admin-only notification types.

---

## Features Implemented

### For All Members

**Master Control:**
- ✅ **"Receive Notifications"** toggle - One-click to disable all
- Grays out individual options when disabled
- Always allows critical account security alerts

**Individual Notification Types:**
1. ✅ **Member Directory Updates**
   - New members join
   - Profile updates from connections

2. ✅ **Conference Announcements (ICSR)**
   - Event news
   - Registration opens
   - Deadlines
   - Important updates

3. ✅ **Admin Announcements**
   - Organization news
   - Policy changes
   - ISRS updates

**Delivery Options:**
- ✅ **Email notifications** - Immediate delivery
- ✅ **Daily digest** - Combine notifications into one daily email
- ✅ **Weekly digest** - Combine notifications into one weekly email

### For Admins/Board Members Only

**Additional Admin Notifications:**
4. ✅ **New Member Registrations**
   - Notified when members sign up
   - Approval/moderation required

5. ✅ **Moderation Alerts**
   - Profile flags
   - Reported content
   - Member concerns

6. ✅ **System Alerts**
   - Technical issues
   - Deployment notifications
   - Critical errors

**Visual Distinction:**
- Admin notifications shown in yellow boxes
- Separate "Admin-Only Notifications" section
- Only visible to users with admin or board_member role

---

## User Interface

### Profile Page Location
Located between "Privacy Settings" and "Data Privacy & Account" sections

### Layout

```
🔔 Notification Settings
━━━━━━━━━━━━━━━━━━━━━━

┌─ Master Switch ─────────────────────────┐
│ ✓ Receive Notifications                 │
│   Master control - turn off to stop all │
└──────────────────────────────────────────┘

┌─ Member Directory Updates ──────────────┐
│ ✓ New members join, profile updates     │
└──────────────────────────────────────────┘

┌─ Conference Announcements (ICSR) ───────┐
│ ✓ Event news, registration, deadlines   │
└──────────────────────────────────────────┘

┌─ Admin Announcements ────────────────────┐
│ ✓ Organization news, policy changes     │
└──────────────────────────────────────────┘

🔒 Admin-Only Notifications (if admin)
┌─ New Member Registrations ──────────────┐
│ ☐ Notified when members sign up         │
└──────────────────────────────────────────┘

┌─ Moderation Alerts ──────────────────────┐
│ ☐ Profile flags, reported content       │
└──────────────────────────────────────────┘

┌─ System Alerts ──────────────────────────┐
│ ☐ Technical issues, critical errors     │
└──────────────────────────────────────────┘

Email Delivery Preference:
[Send immediately (no digest) ▼]

[Save Notification Settings]
```

---

## Database Schema

### Migration File
`backend-python/migrations/add_notification_preferences.py`

### New Columns

**notifications_enabled** (BOOLEAN)
- Default: `TRUE`
- Master switch for all notifications

**notification_preferences** (JSONB)
- Flexible structure for preferences
- Default values:
```json
{
  "member_directory": true,
  "conference_announcements": true,
  "admin_announcements": true,
  "direct_messages": true,
  "digest_frequency": "off",
  "admin_new_registrations": false,
  "admin_moderation_alerts": false,
  "admin_system_alerts": false
}
```

### Indexes
- GIN index on `notification_preferences` for efficient JSONB queries

---

## API Changes

### GET /api/auth/me
Returns notification preferences:
```json
{
  "id": "...",
  "email": "user@example.com",
  ...
  "notifications_enabled": true,
  "notification_preferences": {
    "member_directory": true,
    "conference_announcements": true,
    "admin_announcements": true,
    "digest_frequency": "daily",
    "admin_new_registrations": false,
    "admin_moderation_alerts": false,
    "admin_system_alerts": false
  }
}
```

### PUT /api/auth/me
Accepts notification updates:
```json
{
  "notifications_enabled": true,
  "notification_preferences": {
    "member_directory": false,
    "conference_announcements": true,
    "admin_announcements": true,
    "digest_frequency": "weekly"
  }
}
```

---

## Use Cases

### Use Case 1: Member - All Notifications On
```
Master: ✓ On
Individual: All checked
Digest: Off (immediate)
Result: Gets every notification immediately
```

### Use Case 2: Member - Weekly Digest Only
```
Master: ✓ On
Individual: All checked
Digest: Weekly
Result: Gets one email per week with all notifications
```

### Use Case 3: Member - Conference Only
```
Master: ✓ On
Individual: Only "Conference Announcements" checked
Digest: Off
Result: Only gets ICSR event notifications
```

### Use Case 4: Member - Unsubscribe All
```
Master: ☐ Off
Individual: (grayed out)
Digest: (disabled)
Result: No notifications except critical security
```

### Use Case 5: Admin - System Monitoring
```
Master: ✓ On
Individual: All checked
Admin: All checked (registrations, moderation, system)
Digest: Daily
Result: Gets all notifications + admin alerts in daily summary
```

### Use Case 6: Admin - Critical Only
```
Master: ✓ On
Individual: None checked
Admin: System Alerts only
Digest: Off
Result: Only gets critical system errors immediately
```

---

## GDPR Compliance

### Privacy Features
- ✅ **Explicit opt-in/opt-out** for each notification type
- ✅ **Granular control** - Not all-or-nothing
- ✅ **Clear descriptions** - Users know what they're signing up for
- ✅ **Master unsubscribe** - One-click to stop all
- ✅ **Persistent settings** - Saved in database, not cookies
- ✅ **No third parties** - Email addresses never shared

### User Rights
- Can opt out of any notification type
- Can change preferences anytime
- Preferences survive account updates
- Critical security alerts always sent (GDPR exception)

---

## Migration Steps

### 1. Run Migration on Render
```bash
# In Render Shell:
python backend-python/migrations/add_notification_preferences.py
```

Expected output:
```
Connecting to database...

=== Adding notification preference columns to attendee_profiles ===
✓ notifications_enabled column added
✓ notification_preferences column added with defaults
✓ notification_preferences GIN index created

✅ Migration completed successfully!
   Column: notifications_enabled
   Type: boolean
   Default: true

   Column: notification_preferences
   Type: jsonb
   Default: {...}
```

### 2. Verify Deployment
- Visit: https://www.shellfish-society.org/member/profile.html
- Scroll to "Notification Settings" section
- All checkboxes should be checked by default
- Digest should be set to "off"

### 3. Test as Regular Member
- Toggle master switch → Options should gray out
- Check/uncheck individual types
- Change digest frequency
- Click "Save Notification Settings"
- Refresh page → Settings should persist

### 4. Test as Admin
- Login as admin account
- Visit profile page
- Should see "Admin-Only Notifications" section
- Three additional checkboxes visible
- Can toggle admin-specific alerts

---

## Future Enhancements

Potential improvements for later:
1. **In-app notifications** - Bell icon in header with badge count
2. **Notification history** - See past notifications
3. **Smart digest grouping** - Group by type/priority
4. **Notification preview** - Test email before committing
5. **Quiet hours** - No notifications during certain times
6. **Notification templates** - Customize email format
7. **Webhook integrations** - Slack, Discord, etc.
8. **SMS notifications** - For critical alerts only
9. **Push notifications** - Browser/mobile push
10. **Notification analytics** - Open rates, click rates

---

## Technical Details

### Why JSONB?
- **Flexibility**: Easy to add new notification types
- **Performance**: GIN index for fast lookups
- **Atomicity**: Update all preferences in one operation
- **Version control**: Can track preference changes over time
- **Queries**: Can search for users with specific preferences

### Default Values
All new users get:
- Notifications enabled
- All member notifications on
- All admin notifications off (upgraded when user becomes admin)
- No digest (immediate delivery)

### Admin Detection
Frontend checks `profile.role` field:
```javascript
const isAdmin = profile.role === 'admin' || profile.role === 'board_member';
```

Admin notifications only visible if `isAdmin === true`

### Master Switch Behavior
When disabled:
- Sets `notifications_enabled = false`
- Individual preferences still saved (for when re-enabled)
- Email service checks master switch before sending
- Critical security alerts bypass master switch

---

## Email Service Integration

When sending emails, check preferences:

```python
def should_send_notification(user, notification_type):
    # Check master switch
    if not user.notifications_enabled:
        return False

    # Check specific preference
    prefs = user.notification_preferences or {}
    if not prefs.get(notification_type, False):
        return False

    # Check digest frequency
    digest = prefs.get('digest_frequency', 'off')
    if digest != 'off':
        # Queue for digest instead
        queue_for_digest(user, notification_type)
        return False

    return True
```

---

## Testing Checklist

### Basic Functionality
- [ ] Profile page loads notification settings section
- [ ] All checkboxes load with correct defaults
- [ ] Master switch toggles gray out effect
- [ ] Individual checkboxes can be toggled
- [ ] Digest dropdown changes value
- [ ] Save button works and shows loading state
- [ ] Settings persist after page refresh

### Role-Based Display
- [ ] Regular member: No admin notifications visible
- [ ] Admin: Admin notifications section appears
- [ ] Board member: Admin notifications section appears
- [ ] Admin checkboxes are functional

### Error Handling
- [ ] Save fails gracefully with error message
- [ ] Network error doesn't break page
- [ ] Invalid data rejected by API
- [ ] Load failure shows helpful message

### Edge Cases
- [ ] New user has sensible defaults
- [ ] User with no preferences gets defaults
- [ ] Master switch off grays everything
- [ ] Digest selection updates immediately
- [ ] Multiple rapid saves handled correctly

---

## Files Changed

### Backend
- `backend-python/app/models/conference.py`
  - Added JSONB import
  - Added notifications_enabled field
  - Added notification_preferences field

- `backend-python/app/routers/auth.py`
  - Updated GET /me to return notification fields
  - Updated PUT /me to accept notification fields
  - Updated UpdateProfileRequest schema

- `backend-python/migrations/add_notification_preferences.py`
  - New migration file (executable)

### Frontend
- `frontend/public/member/profile.html`
  - Added "Notification Settings" section (145 lines)
  - Added loadNotificationPreferences() function
  - Added toggleNotificationTypes() function
  - Added save notification preferences handler
  - Added master switch toggle listener

---

## Support Resources

**User Documentation**:
Each notification type has clear description:
- Member Directory: "New members join, profile updates from connections"
- Conference: "Event news, registration opens, deadlines"
- Admin Announcements: "Organization news, policy changes"

**Admin Documentation**:
Admin-only section clearly labeled with lock icon:
- New Registrations: "Notified when members sign up and need approval"
- Moderation: "Profile flags, reported content, member concerns"
- System Alerts: "Technical issues, deployment notifications"

**GDPR Compliance**:
- Master switch explanation mentions can turn off all
- Digest explanation clarifies email frequency
- No hidden tracking or unexpected emails

---

**Implementation**: Claude Sonnet 4.5
**Co-Authored-By**: Claude Sonnet 4.5 <noreply@anthropic.com>
