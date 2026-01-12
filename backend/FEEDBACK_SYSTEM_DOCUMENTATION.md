# ISRS Feedback System Documentation

This document describes the feedback system implementation for the International Shellfish Restoration Society (ISRS) website.

## System Overview

**Features:**
- Floating feedback button on all public pages and admin portal
- Modal form for submitting feedback
- Anonymous and authenticated user support
- Component/page tracking
- Rating system (1-5 stars)
- Daily email digest to aaron.kornbluth@gmail.com
- Browser context capture (user agent, platform, screen size)
- Session tracking for anonymous users
- Admin view of all feedback with filtering

**Tech Stack:**
- Frontend: Vanilla JavaScript (no framework)
- Backend: Node.js + Express.js + PostgreSQL
- Email: AWS SES
- Deployment: Render
- Database: PostgreSQL on Render

---

## Architecture

### Frontend Components

**File:** `/Users/akorn/isrs-frontend/public/js/feedback-widget.js`

The feedback widget is a self-contained JavaScript module that:
- Creates a floating button styled with ISRS gradient colors (#2E5A8A to #5BC0BE)
- Positions vertically on the right side of the screen (rotated 90 degrees)
- Opens a modal dialog for feedback submission
- Captures user context and browser information
- Sends feedback to the backend API
- Displays success confirmation

**Integration:**
```html
<!-- In HTML pages -->
<script src="/js/feedback-widget.js"></script>
<script src="/js/components.js"></script>
```

```javascript
// In components.js
if (typeof initFeedbackWidget !== 'undefined') {
  initFeedbackWidget({ isAdminPortal: false });
}
```

### Backend Components

**Database Schema:**

**Table:** `feedback_submissions`
- `id` (UUID) - Primary key
- `user_email` (VARCHAR) - Email address (optional)
- `user_name` (VARCHAR) - User name (optional)
- `user_id` (UUID) - User ID if authenticated
- `session_id` (VARCHAR) - Session ID for anonymous users
- `page_url` (TEXT) - Page URL where feedback submitted
- `page_title` (VARCHAR) - Page title
- `component_name` (VARCHAR) - Component/section name
- `feedback_type` (VARCHAR) - Type: general, bug, feature_request, improvement
- `rating` (INTEGER) - 1-5 star rating
- `subject` (VARCHAR) - Optional subject line
- `message` (TEXT) - Feedback message (required)
- `browser_info` (JSONB) - Browser context data
- `user_agent` (TEXT) - User agent string
- `ip_address` (INET) - User IP address
- `is_admin_portal` (BOOLEAN) - Whether from admin portal
- `status` (VARCHAR) - Status: new, reviewed, resolved, archived
- `priority` (VARCHAR) - Priority: low, normal, high, urgent
- `created_at` (TIMESTAMP) - Submission timestamp
- `reviewed_at` (TIMESTAMP) - Review timestamp
- `reviewed_by` (VARCHAR) - Reviewer name
- `notes` (TEXT) - Admin notes

**Table:** `feedback_digest_log`
- `id` (UUID) - Primary key
- `digest_date` (DATE) - Date of digest
- `feedback_count` (INTEGER) - Number of feedback items
- `sent_at` (TIMESTAMP) - When digest was sent
- `sent_to` (VARCHAR) - Email address sent to
- `email_status` (VARCHAR) - Status: sent, failed, pending
- `feedback_ids` (UUID[]) - Array of feedback IDs included

**View:** `daily_feedback_summary`
- Aggregates daily statistics
- Total count, average rating
- Counts by type (bugs, features, improvements)

**Function:** `get_undigested_feedback()`
- Returns feedback not yet included in a digest
- Ordered by created_at DESC

**API Endpoints:**

```
POST   /api/feedback/submit          - Submit feedback (public)
GET    /api/feedback                 - Get all feedback (admin)
GET    /api/feedback/summary         - Get statistics (admin)
PATCH  /api/feedback/:id             - Update feedback status (admin)
```

**Files:**
- `/src/controllers/feedbackController.js` - API controller
- `/src/routes/feedbackRoutes.js` - Route definitions
- `/src/services/feedbackDigestService.js` - Email digest service
- `/database/migrations/032_feedback_system.sql` - Database schema

### Email Digest System

**Daily Digest Script:**

**File:** `/Users/akorn/isrs-database-backend/scripts/send-feedback-digest.js`

**Usage:**
```bash
# Send digest for yesterday
node scripts/send-feedback-digest.js

# Send digest for specific date
node scripts/send-feedback-digest.js 2025-01-15
```

**Cron Setup:**
```bash
# Edit crontab
crontab -e

# Add line to run daily at 9 AM
0 9 * * * cd /Users/akorn/isrs-database-backend && node scripts/send-feedback-digest.js
```

**Email Features:**
- Beautiful HTML email with ISRS branding
- Statistics section (total feedback, bugs, features, improvements, average rating)
- Feedback grouped by type with color coding
- Individual feedback cards with user info, timestamp, rating
- Browser information for debugging
- Link to page where feedback was submitted

**Email Service:**
- Uses AWS SES for email delivery
- Configured in `/src/services/emailService.js`
- Mock mode for development (when AWS credentials not set)
- Production mode sends via SES

---

## Installation Guide

### Step 1: Database Setup

1. **Run migration:**
   ```bash
   cd /Users/akorn/isrs-database-backend
   node database/run-feedback-migration.js
   ```

2. **Verify tables created:**
   ```sql
   SELECT * FROM feedback_submissions LIMIT 1;
   SELECT * FROM feedback_digest_log LIMIT 1;
   SELECT * FROM daily_feedback_summary;
   ```

### Step 2: Backend Configuration

1. **Set environment variables in `.env`:**
   ```bash
   # Feedback system
   FEEDBACK_ADMIN_EMAIL=aaron.kornbluth@gmail.com

   # AWS SES (for production email)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   SES_FROM_EMAIL=noreply@shellfish-society.org
   SES_FROM_NAME=ISRS
   ```

2. **Register feedback routes in `server.js`:**
   ```javascript
   const feedbackRoutes = require('./routes/feedbackRoutes');
   app.use('/api/feedback', feedbackRoutes);
   ```

3. **Restart backend:**
   ```bash
   npm run dev
   ```

### Step 3: Frontend Integration

1. **Add feedback widget to HTML pages:**
   ```html
   <script src="/js/feedback-widget.js"></script>
   <script src="/js/components.js"></script>
   ```

2. **Initialize widget in `components.js`:**
   ```javascript
   if (typeof initFeedbackWidget !== 'undefined') {
     initFeedbackWidget({ isAdminPortal: false });
   }
   ```

### Step 4: AWS SES Setup

1. **Verify email domain:**
   - Log in to AWS Console
   - Go to Amazon SES
   - Verify `shellfish-society.org` domain
   - Add DNS records (DKIM, SPF, DMARC)

2. **Create IAM user for SES:**
   - Create IAM user with SES send permissions
   - Generate access key and secret
   - Add to `.env` file

3. **Test email sending:**
   ```bash
   node -e "
   require('dotenv').config();
   const { sendEmail } = require('./src/services/emailService');
   sendEmail({
     to: 'aaron.kornbluth@gmail.com',
     subject: 'Test Email',
     body: '<h1>Test</h1><p>This is a test.</p>'
   }).then(() => console.log('Sent!'));
   "
   ```

### Step 5: Daily Digest Setup

1. **Test digest script:**
   ```bash
   # Insert test feedback
   node -e "
   require('dotenv').config();
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   pool.query(\`
     INSERT INTO feedback_submissions (user_email, user_name, page_url, message)
     VALUES ('test@example.com', 'Test User', 'https://shellfish-society.org', 'Test feedback')
   \`).then(() => console.log('Done'));
   "

   # Send digest
   node scripts/send-feedback-digest.js
   ```

2. **Set up cron job:**
   ```bash
   crontab -e

   # Add line (runs daily at 9 AM)
   0 9 * * * cd /Users/akorn/isrs-database-backend && node scripts/send-feedback-digest.js
   ```

---

## Customization

### Change Button Colors

Edit `/Users/akorn/isrs-frontend/public/js/feedback-widget.js`:

```javascript
#isrs-feedback-widget {
  background: linear-gradient(135deg, #2E5A8A 0%, #5BC0BE 100%);
}

#isrs-feedback-widget:hover {
  background: linear-gradient(135deg, #234a71 0%, #4aa8a6 100%);
}
```

### Change Button Position

```javascript
#isrs-feedback-widget {
  right: 0;           /* Distance from right */
  top: 50%;           /* Vertical position */
  transform: translateY(-50%) rotate(-90deg);
}
```

**Alternative positions:**
- Left side: `left: 0; transform: translateY(-50%) rotate(90deg);`
- Top right: `top: 100px; right: 20px; transform: rotate(0deg);`

### Change Email Schedule

```bash
# Current: Daily at 9 AM
0 9 * * *

# Alternatives:
0 8 * * *       # 8 AM daily
0 9 * * 1       # 9 AM every Monday
0 */6 * * *     # Every 6 hours
0 18 * * 1-5    # 6 PM weekdays only
```

### Add More Feedback Types

1. **Update database enum (if needed):**
   ```sql
   ALTER TYPE feedback_type ADD VALUE 'documentation';
   ```

2. **Update frontend dropdown:**
   ```javascript
   <option value="documentation">Documentation</option>
   ```

3. **Update digest email grouping:**
   ```javascript
   // In feedbackDigestService.js
   const documentationFeedback = feedback.filter(f => f.feedback_type === 'documentation');
   ```

---

## API Reference

### Submit Feedback

**POST** `/api/feedback/submit`

**Request Body:**
```json
{
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "page_url": "https://shellfish-society.org/index.html",
  "page_title": "ISRS Homepage",
  "component_name": "Hero Section",
  "feedback_type": "feature_request",
  "rating": 5,
  "subject": "New feature idea",
  "message": "It would be great if...",
  "browser_info": {
    "userAgent": "Mozilla/5.0...",
    "platform": "MacIntel",
    "screenWidth": 1920,
    "screenHeight": 1080
  },
  "is_admin_portal": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "70aa74ff-fd31-4608-b3fd-9db147d7ac16"
  }
}
```

### Get All Feedback (Admin)

**GET** `/api/feedback?type=bug&status=new&limit=50`

**Query Parameters:**
- `type` - Filter by feedback_type
- `status` - Filter by status
- `is_admin_portal` - Filter by source
- `limit` - Number of results
- `offset` - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "user_email": "...",
      "user_name": "...",
      "component_name": "...",
      "feedback_type": "bug",
      "rating": 4,
      "message": "...",
      "created_at": "2025-01-15T10:30:00Z",
      "status": "new"
    }
  ],
  "total": 150
}
```

### Get Feedback Summary (Admin)

**GET** `/api/feedback/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "by_type": {
      "bug": 45,
      "feature_request": 60,
      "improvement": 30,
      "general": 15
    },
    "by_status": {
      "new": 80,
      "reviewed": 50,
      "resolved": 20
    },
    "average_rating": 4.2
  }
}
```

### Update Feedback Status (Admin)

**PATCH** `/api/feedback/:id`

**Request Body:**
```json
{
  "status": "resolved",
  "priority": "high",
  "notes": "Fixed in v2.1.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "resolved",
    "reviewed_at": "2025-01-15T14:00:00Z"
  }
}
```

---

## Troubleshooting

### Feedback Not Submitting

1. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

2. **Verify API endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/feedback/submit \
     -H "Content-Type: application/json" \
     -d '{"page_url":"test","message":"test"}'
   ```

3. **Check CORS settings:**
   ```javascript
   // In server.js
   app.use(cors({
     origin: '*',  // Or specific domain
     credentials: true
   }));
   ```

### Email Digest Not Sending

1. **Check environment variables:**
   ```bash
   echo $FEEDBACK_ADMIN_EMAIL
   echo $AWS_REGION
   ```

2. **Test AWS SES credentials:**
   ```bash
   aws ses verify-email-identity --email-address test@example.com
   ```

3. **Check cron logs:**
   ```bash
   # View cron log
   cat /var/log/syslog | grep CRON

   # Test script manually
   node scripts/send-feedback-digest.js
   ```

4. **Verify SES sending limits:**
   - New AWS accounts start in "sandbox mode"
   - Limited to verified emails only
   - Request production access via AWS Console

### Database Connection Issues

1. **Check DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   ```

2. **Test connection:**
   ```bash
   node -e "
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   pool.query('SELECT NOW()').then(res => console.log(res.rows));
   "
   ```

3. **Verify SSL is enabled:**
   - Render PostgreSQL requires SSL
   - Check `ssl: { rejectUnauthorized: false }` in pool config

### Widget Not Appearing

1. **Check script loading:**
   ```html
   <!-- Verify order -->
   <script src="/js/feedback-widget.js"></script>
   <script src="/js/components.js"></script>
   ```

2. **Check initialization:**
   ```javascript
   // In browser console
   console.log(typeof initFeedbackWidget);  // Should be 'function'
   ```

3. **Check CSS conflicts:**
   - Widget uses `z-index: 9999`
   - May conflict with other fixed elements

---

## Security Considerations

1. **Input Validation:**
   - Message is required (enforced)
   - URLs validated on backend
   - SQL injection prevented by parameterized queries

2. **Rate Limiting:**
   - Consider adding rate limiting to prevent spam
   - Example: Max 10 submissions per IP per day

3. **Authentication:**
   - Public endpoint (no auth required)
   - User info captured if available
   - Session tracking for anonymous users

4. **Data Privacy:**
   - IP addresses logged (consider GDPR compliance)
   - Browser info captured (for debugging)
   - User emails stored (inform users via privacy policy)

5. **Email Security:**
   - AWS SES credentials in environment variables
   - Not hardcoded in source code
   - IAM user with minimal permissions

6. **Admin Access:**
   - Admin endpoints should require authentication
   - Implement role-based access control
   - Audit logs for feedback updates

---

## Performance Optimization

1. **Database Indexes:**
   - Already created on `user_email`, `created_at`, `status`
   - Add more indexes if filtering by other fields

2. **Pagination:**
   - Limit results to 50 per page by default
   - Use OFFSET/LIMIT for large datasets

3. **Caching:**
   - Cache summary statistics (Redis)
   - Update on feedback submission

4. **Email Digest:**
   - Batch processing (not real-time)
   - Runs daily during off-peak hours
   - Prevents duplicate sends via digest_log table

---

## Future Enhancements

1. **Admin Dashboard:**
   - Visual analytics (charts, graphs)
   - Feedback trends over time
   - User sentiment analysis

2. **Notifications:**
   - Real-time notifications for urgent feedback
   - Slack/Discord integration
   - SMS alerts for critical bugs

3. **Attachments:**
   - Allow screenshot uploads
   - File upload to S3
   - Image annotation tools

4. **Voting System:**
   - Users can upvote feedback
   - Prioritize popular requests
   - Community engagement

5. **Status Updates:**
   - Email users when feedback is resolved
   - Public roadmap of feature requests
   - Changelog integration

6. **AI Analysis:**
   - Sentiment analysis
   - Auto-categorization
   - Duplicate detection

---

## License

This feedback system is part of the ISRS project by akorn environmental.

**Created with Claude Code** - https://claude.com/claude-code

---

## Support

For questions or issues with the feedback system:
- Email: aaron.kornbluth@gmail.com
- GitHub: https://github.com/akornenvironmental/isrs-database-backend
