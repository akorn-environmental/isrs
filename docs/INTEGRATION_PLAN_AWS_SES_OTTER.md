# AWS SES + Otter.ai Integration Plan

**Date**: January 12, 2026
**Project**: ISRS Admin Portal Enhancements

---

## 🎯 Overview

Adding two major integrations to ISRS admin portal:
1. **AWS SES Email Management** - Monitor sending, quotas, reputation
2. **Otter.ai Meeting Recordings** - Display recordings and transcripts

---

## 1️⃣ AWS SES Integration

### Features to Implement

#### A. Dashboard Widget - Email Statistics
```
┌────────────────────────────────────┐
│  📧 Email Activity (Last 24h)      │
├────────────────────────────────────┤
│  Sent: 247                         │
│  Failed: 3                         │
│  Bounced: 1                        │
│  Complaints: 0                     │
│                                    │
│  Quota: 247 / 50,000 (0.5%)       │
│  [View Email Settings →]           │
└────────────────────────────────────┘
```

#### B. Dedicated Email Settings Page (`/admin/email-settings.html`)
Full AWS SES management dashboard:
- **Sending Statistics**
  - Emails sent today/this week/this month
  - Success rate chart
  - Failure breakdown (bounces, complaints, rejects)

- **Quota Management**
  - Daily sending limit
  - Current usage with progress bar
  - Send rate (emails/second)

- **Verified Identities**
  - List of verified sender emails/domains
  - Verification status
  - Add new email/domain button

- **Reputation Dashboard**
  - Bounce rate (should be < 5%)
  - Complaint rate (should be < 0.1%)
  - Reputation score
  - Deliverability trends

- **Suppression List**
  - View bounced/complaint emails
  - Manual add/remove from suppression
  - Export suppression list

- **Configuration Sets**
  - Active configuration sets
  - Event destinations (SNS, CloudWatch)
  - Tracking settings

#### C. Company Settings Section
Add "Email System" section to existing Company Settings page:
- Current daily quota
- Emails sent today
- Primary verified sender
- Last 24h statistics
- Link to full Email Settings page

---

## 2️⃣ Otter.ai Integration

### Features to Implement

#### A. Dashboard Widget - Recent Recordings
```
┌─────────────────────────────────────────┐
│  🎙️ Recent Meeting Recordings           │
│  Last synced: 5 min ago [Sync]         │
├─────────────────────────────────────────┤
│  🔴 Board Meeting - Jan 10             │
│      45 min • 6 speakers               │
│      [▶️ Play] [📄 Transcript]         │
├─────────────────────────────────────────┤
│  🔴 Committee Call - Jan 8             │
│      32 min • 4 speakers               │
│      [▶️ Play] [📄 Transcript]         │
├─────────────────────────────────────────┤
│  [View All Recordings →]                │
└─────────────────────────────────────────┘
```

#### B. Board Documents - Recordings Tab
New tab in `/admin/board-documents.html`:
- **Grid View** of all recordings
- **Search** by title/keywords in transcript
- **Filter** by date range
- **Recording Cards** with:
  - Meeting title and date
  - Duration and speaker count
  - Play button (opens Otter.ai)
  - View transcript button (modal)
  - Download transcript (PDF/TXT)

- **Transcript Viewer Modal**:
  - Full searchable transcript
  - Timestamp navigation
  - Speaker identification
  - Export options

---

## 🔧 Backend Implementation

### Phase 1: AWS SES Service

**File**: `backend/src/services/sesMonitoringService.js`

```javascript
const { SESv2Client, GetAccountCommand, GetSendStatisticsCommand } = require('@aws-sdk/client-sesv2');

class SESMonitoringService {
  async getQuota() {
    // Returns: { Max24HourSend, SentLast24Hours, MaxSendRate }
  }

  async getSendingStatistics(days = 1) {
    // Returns: { sent, bounces, complaints, rejects }
  }

  async getVerifiedIdentities() {
    // Returns: [{ email, status, type }]
  }

  async getSuppressionList() {
    // Returns: [{ email, reason, timestamp }]
  }

  async getReputationMetrics() {
    // Returns: { bounceRate, complaintRate, score }
  }
}
```

**Routes**: `backend/src/routes/sesRoutes.js`
- `GET /api/ses/quota` - Daily sending quota
- `GET /api/ses/statistics` - Sending stats (default: last 24h)
- `GET /api/ses/identities` - Verified emails/domains
- `GET /api/ses/reputation` - Bounce/complaint rates
- `GET /api/ses/suppression` - Suppression list
- `GET /api/ses/dashboard` - All stats combined

### Phase 2: Otter.ai Service

**File**: `backend/src/services/otterService.js`

```javascript
const axios = require('axios');

class OtterService {
  constructor() {
    this.apiKey = process.env.OTTER_API_KEY;
    this.baseUrl = 'https://otter.ai/forward/api/v1';
  }

  async getSpeeches(limit = 10) {
    // Returns: [{ id, title, created_at, duration, summary }]
  }

  async getSpeech(speechId) {
    // Returns: { id, title, transcript, speakers, audio_url }
  }

  async getTranscript(speechId) {
    // Returns: { text, segments: [{ speaker, text, start, end }] }
  }

  async syncRecordings() {
    // Syncs to local database for caching
  }
}
```

**Routes**: `backend/src/routes/otterRoutes.js`
- `GET /api/otter/recordings` - List recordings
- `GET /api/otter/recordings/:id` - Get specific recording
- `GET /api/otter/recordings/:id/transcript` - Get transcript
- `POST /api/otter/sync` - Manual sync from Otter.ai
- `GET /api/otter/recent` - Last 5 recordings

### Phase 3: Database Migrations

**Migration**: `backend/database/migrations/031_add_integrations.sql`

```sql
-- AWS SES cached statistics
CREATE TABLE ses_statistics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  emails_sent INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,
  rejects INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Otter.ai cached recordings
CREATE TABLE otter_recordings (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP NOT NULL,
  duration INTEGER,  -- seconds
  speaker_count INTEGER,
  transcript_url TEXT,
  audio_url TEXT,
  otter_url TEXT,
  folder VARCHAR(100),
  last_synced TIMESTAMP DEFAULT NOW()
);

-- Otter.ai transcripts cache
CREATE TABLE otter_transcripts (
  recording_id VARCHAR(255) PRIMARY KEY REFERENCES otter_recordings(id),
  transcript_text TEXT,
  segments JSONB,  -- [{ speaker, text, start, end }]
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otter_created ON otter_recordings(created_at DESC);
CREATE INDEX idx_ses_date ON ses_statistics(date DESC);
```

---

## 🎨 Frontend Implementation

### Phase 4: Dashboard Enhancements

**File**: `frontend/public/admin/index.html`

Add two new widgets to dashboard:

1. **Email Activity Widget** (below existing stats)
2. **Recent Recordings Widget** (in sidebar or second column)

Both widgets auto-refresh every 5 minutes.

### Phase 5: Email Settings Page

**New File**: `frontend/public/admin/email-settings.html`

Full-page AWS SES management interface with tabs:
- **Overview** - Quick stats and quota
- **Statistics** - Charts and trends
- **Identities** - Verified senders
- **Reputation** - Bounce/complaint monitoring
- **Suppression** - Blocked emails

### Phase 6: Company Settings Enhancement

**File**: `frontend/public/admin/company-settings.html`

Add new section:
```html
<section class="settings-section">
  <h3>Email System (AWS SES)</h3>
  <div class="settings-grid">
    <div class="setting-item">
      <label>Daily Quota</label>
      <span id="sesQuota">Loading...</span>
    </div>
    <div class="setting-item">
      <label>Sent Today</label>
      <span id="sesSentToday">Loading...</span>
    </div>
    <div class="setting-item">
      <label>Primary Sender</label>
      <span id="sesPrimarySender">Loading...</span>
    </div>
  </div>
  <a href="/admin/email-settings.html" class="btn-secondary">
    Manage Email Settings
  </a>
</section>
```

### Phase 7: Board Documents Enhancement

**File**: `frontend/public/admin/board-documents.html`

Add new tab: **Meeting Recordings**

Features:
- Grid of recording cards
- Search and filter controls
- Transcript viewer modal
- Auto-sync indicator

---

## 🔑 Environment Variables Needed

Add to Render "Shared API Keys" environment group:

```bash
# Otter.ai
OTTER_API_KEY=your_otter_api_key_here

# AWS SES (already have these)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
SES_FROM_EMAIL=noreply@shellfish-society.org
SES_FROM_NAME=ISRS
```

---

## 📅 Implementation Timeline

### Phase 1-3: Backend (2 hours)
- AWS SES monitoring service
- Otter.ai integration service
- Database migrations
- API routes
- Testing

### Phase 4-7: Frontend (2 hours)
- Dashboard widgets
- Email Settings page
- Company Settings section
- Board Documents tab
- Transcript viewer

**Total Estimated Time**: ~4 hours for complete implementation

---

## ✅ Testing Checklist

### AWS SES Integration
- [ ] Dashboard widget shows correct stats
- [ ] Email Settings page loads quota
- [ ] Verified identities displayed
- [ ] Reputation metrics accurate
- [ ] Company Settings section updated
- [ ] Links between pages work

### Otter.ai Integration
- [ ] Dashboard shows recent 3 recordings
- [ ] Recordings sync from Otter.ai
- [ ] Board Documents tab displays grid
- [ ] Play button opens Otter.ai
- [ ] Transcript viewer modal works
- [ ] Search transcripts functional
- [ ] Download transcript works

---

## 🚀 Deployment Steps

1. **Get API Keys**
   - Otter.ai: https://otter.ai/developer

2. **Add Environment Variables** to Render

3. **Deploy Backend Changes**
   - Commit to monorepo
   - Push to GitHub
   - Render auto-deploys

4. **Deploy Frontend Changes**
   - Included in same commit
   - Render auto-deploys static site

5. **Run Database Migration**
   - SSH to Render or use migration script

6. **Initial Sync**
   - Call `/api/otter/sync` to populate recordings

---

## 📊 Benefits

### AWS SES Management
✅ Monitor email deliverability
✅ Track daily quota usage
✅ Identify and fix bounce/complaint issues
✅ Manage verified senders
✅ Proactive reputation monitoring

### Otter.ai Integration
✅ Instant access to meeting recordings
✅ Searchable transcripts
✅ Speaker identification
✅ No manual uploading needed
✅ Historical meeting archive
✅ Mobile-friendly playback

---

## 🎯 Next Steps

Ready to proceed? I'll implement in this order:

1. **Backend First** (Phases 1-3)
   - Create services
   - Add routes
   - Test with Postman/curl

2. **Frontend** (Phases 4-7)
   - Dashboard widgets
   - New pages
   - Enhanced existing pages

3. **Testing & Deployment**
   - Full integration testing
   - Deploy to production

---

**Want me to start? Just say the word and I'll begin with Phase 1!**
