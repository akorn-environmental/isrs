# ISRS AI Assistant - Administrator Technical Guide

## 🔧 Technical Overview

The ISRS AI Assistant is a Claude-powered conversational interface that provides real-time access to database statistics, contact management, conference analytics, and organizational insights.

---

## 🏗️ Architecture

### Frontend Components

**Location**: `/frontend/public/js/ai-assistant.js`
- **Class**: `ISRSAIAssistant`
- **Initialization**: Auto-loads on admin and member pages
- **CSS**: `/frontend/public/css/ai-assistant.css` (dynamically injected)

### Backend API

**Endpoint**: `POST /api/ai/query`
- **Route**: `/backend/src/routes/aiRoutes.js`
- **Controller**: `/backend/src/controllers/aiController.js`
- **Service**: `/backend/src/services/aiInsightsService.js`

**Model**: Claude Sonnet 3.5 (Anthropic API)
- Max tokens: 3000
- Streaming: Not enabled
- Response format: JSON

---

## 📊 Database Context

The AI Assistant has access to the following database statistics:

### Tables Queried:
1. **contacts** - Member and stakeholder information
2. **conference_registrations** - ICSR registration data
3. **abstracts** - Conference submission data
4. **funding_prospects** - Grant and funding pipeline
5. **email_campaigns** - Email marketing metrics
6. **organizations** - Organizational data

### Context Gathered (on each query):
```javascript
{
  contacts: { total, with_email, orgs, countries },
  icsr2026: { total_registrations, full_registrations, student_registrations, daily_registrations },
  abstracts: { total_abstracts, accepted, pending, oral_presentations, posters },
  board: { total_board_members },
  funding: { total, funded_total },
  emails: { total, avg_open_rate }
}
```

---

## 🔌 API Integration

### Request Format:
```javascript
POST /api/ai/query
Headers: {
  'Authorization': 'Bearer <session_token>',
  'Content-Type': 'application/json'
}
Body: {
  "query": "How many ICSR2026 registrations do we have?"
}
```

### Response Format:
```javascript
{
  "success": true,
  "response": {
    "type": "metrics" | "data-list" | "info" | "data-summary" | "analysis",
    "title": "Response Title",
    "content": "Main response text",
    "items": [...],      // Optional: for lists
    "metrics": {...},    // Optional: for statistics
    "insight": "..."     // Optional: recommendations
  }
}
```

### Response Types:

1. **metrics** - Statistical data with numbers
2. **data-list** - List of items (contacts, abstracts, etc.)
3. **info** - General information and answers
4. **data-summary** - Summary with insight
5. **analysis** - Detailed analysis with recommendations

---

## 🎨 Frontend Integration

### Admin Pages (Auto-loaded):

The AI Assistant is automatically initialized on all admin pages that include:
```html
<script src="/js/ai-assistant.js"></script>
<script src="/js/admin-layout.js"></script>
```

**Initialization** (in `admin-layout.js`):
```javascript
if (typeof window.initISRSAIAssistant === 'function' && !window.isrsAIAssistant) {
  setTimeout(() => {
    window.initISRSAIAssistant(true); // true = admin mode
  }, 100);
}
```

### Member Pages (Auto-loaded):

Initialized via `components.js`:
```javascript
if (typeof window.initISRSAIAssistant === 'function' && !window.isrsAIAssistant) {
  window.initISRSAIAssistant(false); // false = member mode
}
```

---

## 🔐 Security & Permissions

### Authentication:
- Requires valid session token
- Token passed in Authorization header
- Session validated by `requireAuth` middleware

### Data Access:
- **Admin mode**: Access to all database statistics
- **Member mode**: Limited to public info and own data
- Permission checks enforced at API level

### Rate Limiting:
- No explicit rate limit currently
- Consider adding rate limiting for production

---

## 🛠️ Customization

### Adding New Example Queries

Edit `/frontend/public/js/ai-assistant.js`:

```javascript
this.exampleQueries = this.isAdmin ? [
  "How many ICSR2026 registrations do we have?",
  "Show me contacts from universities",
  // Add new admin queries here
] : [
  "When is ICSR2026?",
  "How do I submit an abstract?",
  // Add new member queries here
];
```

### Adding New Database Context

Edit `/backend/src/services/aiInsightsService.js` in `gatherDatabaseContext()`:

```javascript
// Add new table statistics
const newStats = await query(`
  SELECT COUNT(*) as total FROM your_table
`);
context.yourData = newStats.rows[0];
```

Then update `buildAssistantSystemPrompt()` to include the new context.

### Modifying Response Types

The assistant supports these response types by default:
- `metrics`, `data-list`, `info`, `data-summary`, `analysis`

To add new types, update the response builders in `/frontend/public/js/ai-assistant.js`:
- `buildMetricsResponse()`
- `buildDataListResponse()`
- `buildInfoResponse()`
- `buildDataSummaryResponse()`

---

## 📈 Monitoring & Analytics

### Logging:
- All queries logged to console (development)
- Production: Consider adding query logging to database
- Track: query text, response type, response time, errors

### Performance Metrics to Track:
- Average response time
- Query success rate
- Most common queries
- Error rate

### Suggested Monitoring Query:
```sql
CREATE TABLE ai_query_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  query TEXT,
  response_type TEXT,
  response_time_ms INTEGER,
  success BOOLEAN,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Failed to process query"
**Causes**:
- Database connection error
- Anthropic API timeout
- Invalid SQL in context gathering
- Authentication failure

**Debug**:
```bash
# Check backend logs
tail -f /var/log/isrs-backend.log

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Test Anthropic API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

#### 2. Assistant Not Appearing
**Causes**:
- JavaScript not loaded
- CSS not loaded
- Initialization timing issue

**Fix**:
```javascript
// Check in browser console:
console.log(typeof window.initISRSAIAssistant); // should be 'function'
console.log(window.isrsAIAssistant); // should be ISRSAIAssistant object

// Manual initialization:
window.initISRSAIAssistant(true); // admin
window.initISRSAIAssistant(false); // member
```

#### 3. Slow Responses
**Causes**:
- Complex database queries
- Large context size
- Anthropic API latency

**Optimize**:
- Add database indexes on queried columns
- Reduce context size in `gatherDatabaseContext()`
- Cache database stats (refresh every 5-10 minutes)
- Consider using Claude Haiku for faster responses

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test all example queries
- [ ] Verify authentication works
- [ ] Check database query performance
- [ ] Test on multiple browsers
- [ ] Test mobile responsiveness
- [ ] Verify ANTHROPIC_API_KEY is set in environment
- [ ] Check error handling for edge cases
- [ ] Review AI responses for accuracy
- [ ] Set up monitoring/logging
- [ ] Test rate limiting (if implemented)
- [ ] Document any custom modifications

---

## 🔄 Maintenance

### Regular Tasks:

**Weekly**:
- Review query logs for errors
- Check response accuracy
- Monitor API usage/costs

**Monthly**:
- Update example queries based on user patterns
- Review and optimize database queries
- Update context statistics
- Check for Claude API updates

**Quarterly**:
- Audit AI responses for quality
- User feedback review
- Performance optimization
- Security audit

---

## 💰 Cost Considerations

### Anthropic API Pricing (as of Jan 2026):
- **Claude Sonnet 3.5**: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Average query cost**: ~$0.01-0.03 per query
- **Monthly estimate** (1000 queries): ~$10-30

### Optimization Tips:
- Cache database context (reduce API calls)
- Use shorter system prompts
- Consider Claude Haiku for simpler queries ($0.25/$1.25 per 1M tokens)
- Implement query result caching for common questions

---

## 📚 API Reference

### Frontend API:

```javascript
// Initialize
window.initISRSAIAssistant(isAdmin: boolean)

// Access instance
window.isrsAIAssistant.toggleExpanded()
window.isrsAIAssistant.fillQuery(query: string)
window.isrsAIAssistant.handleSubmit()
```

### Backend API:

```javascript
// Controller
exports.queryDatabase(req, res)

// Service
queryDatabase(userQuery: string): Promise<ResponseObject>
gatherDatabaseContext(): Promise<ContextObject>
buildAssistantSystemPrompt(context: ContextObject): string
```

---

## 🔗 Related Documentation

- **User Guide**: `AI_ASSISTANT_USER_GUIDE.md`
- **API Documentation**: `/backend/src/routes/aiRoutes.js`
- **Frontend Component**: `/frontend/public/js/ai-assistant.js`
- **Styling**: `/frontend/public/css/ai-assistant.css`

---

## 📞 Support

For technical issues or questions:
- **Code Repository**: GitHub (internal)
- **Technical Lead**: [Contact Info]
- **Anthropic Support**: https://support.anthropic.com

---

**Last Updated**: January 31, 2026
**Version**: 1.0.0
