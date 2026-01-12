# ISRS Database API Documentation

Base URL: `https://your-service.onrender.com`

All endpoints return JSON responses with the following structure:
```json
{
  "success": true,
  "... response data ..."
}
```

Or on error:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-30T..."
}
```

## Health & Status

### GET /
**Description**: API status and version information

**Response**:
```json
{
  "ok": true,
  "message": "ISRS Database API running",
  "version": "prod-1.3",
  "model": "claude-sonnet-4.5-20250929",
  "timestamp": "2025-01-30T..."
}
```

### GET /health
**Description**: Health check endpoint for monitoring

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T..."
}
```

## Board Votes

### POST /api/votes/process
**Description**: Process board vote manually with extracted data

**Request Body**:
```json
{
  "motionTitle": "Appointment of Mark Luckenbach as Secretary",
  "voteDate": "2025-01-30",
  "voteMethod": "email",
  "votes": {
    "Dorothy Leonard": "Yes",
    "Beth Walton": "Yes",
    "Rick DeVoe": "Yes",
    "Mark Risse": "Yes",
    "Katie Mosher": "No",
    "Mark Luckenbach": "Abstain",
    "Simon Branigan": "Yes",
    "Tristan Hugh-Jones": "Yes"
  },
  "processedBy": "Aaron Kornbluth",
  "emailContent": "Original email text..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Board vote processed and saved",
  "vote": {
    "motionTitle": "Appointment of Mark Luckenbach as Secretary",
    "voteDate": "2025-01-30",
    "voteMethod": "email",
    "result": "Carried",
    "summary": {
      "yes": 6,
      "no": 1,
      "abstain": 1,
      "total": 8,
      "quorumMet": "Yes"
    },
    "perMember": { ... }
  }
}
```

### POST /api/votes/ai-process
**Description**: Process board vote with AI extraction from email content

**Request Body**:
```json
{
  "emailContent": "Full email thread text...",
  "motionTitle": "Optional - AI will extract if not provided",
  "voteDate": "2025-01-30",
  "voteMethod": "email",
  "processedBy": "Aaron Kornbluth"
}
```

**Response**: Same as `/api/votes/process`

**Notes**:
- AI automatically extracts motion title, votes, and vote method
- Falls back to rule-based parser if AI fails
- Retries up to 5 times for API errors

### GET /api/votes/history
**Description**: Get board vote history

**Query Parameters**:
- `limit` (optional): Number of votes to return (default: 500)

**Example**: `/api/votes/history?limit=100`

**Response**:
```json
{
  "success": true,
  "votes": [
    {
      "timestamp": "2025-01-30T12:00:00.000Z",
      "voteId": "VOTE_1706616000000",
      "motion": "Appointment of Mark Luckenbach as Secretary",
      "date": "2025-01-30",
      "method": "email",
      "result": "Carried",
      "summary": {
        "yes": 6,
        "no": 1,
        "abstain": 1,
        "total": 8,
        "quorum": "Yes"
      },
      "individualVotes": {
        "Dorothy Leonard": "Yes",
        "Beth Walton": "Yes",
        ...
      },
      "processedBy": "AI-CLAUDE",
      "emailContent": "...",
      "raw": "..."
    }
  ],
  "total": 150,
  "showing": 100
}
```

### GET /api/votes/export
**Description**: Export vote history as CSV file

**Response**: CSV file download with Content-Type: text/csv

**CSV Format**:
```
Vote ID,Motion,Date,Result,Yes,No,Abstain,Total,Quorum,Method,Processed By,Dorothy Leonard,Beth Walton,...
VOTE_xxx,"Motion text",2025-01-30,Carried,6,1,1,8,Yes,email,"AI-CLAUDE",Yes,Yes,...
```

## Admin Endpoints

### GET /api/admin/stats
**Description**: Get comprehensive database statistics

**Response**:
```json
{
  "success": true,
  "totalContacts": 2620,
  "totalOrganizations": 402,
  "icsr2024Attendees": 312,
  "dataQuality": 85,
  "boardMembers": 8,
  "steeringCommittee": 19,
  "totalVotes": 150,
  "recentVotes": 12,
  "icsr2026Registered": 0,
  "icsr2026Sponsors": 0,
  "icsr2026PotentialSponsors": 15,
  "icsr2026Exhibitors": 0,
  "icsr2026Abstracts": 0,
  "committedFunding": 0,
  "pipelineFunding": 250000,
  "lastUpdated": "2025-01-30T...",
  "systemStatus": "Active"
}
```

### GET /api/admin/icsr-data
**Description**: Get ICSR conference information

**Response**:
```json
{
  "success": true,
  "icsr2024": {
    "location": "Jekyll Island, Georgia",
    "dates": "September 15-18, 2024",
    "attendees": 312,
    "countries": 23,
    "sessions": 45,
    "posters": 30,
    "sponsors": 12,
    "exhibitors": 11
  },
  "icsr2026": {
    "location": "Squaxin Island Tribe, Washington",
    "dates": "October 4-8, 2026",
    "registrationOpen": false,
    "earlyBirdDeadline": "July 1, 2026",
    "abstractDeadline": "May 1, 2026",
    "estimatedAttendees": 350,
    "confirmedSponsors": 0,
    "potentialSponsors": 15
  }
}
```

### GET /api/admin/test-connection
**Description**: Test database connections

**Response**:
```json
{
  "success": true,
  "tests": [
    {
      "name": "Master Contact Database",
      "status": "✅ Connected",
      "sheets": 5,
      "sheetNames": ["Contacts", "Board Votes", ...]
    },
    {
      "name": "Board Votes Sheet",
      "status": "✅ Connected",
      "note": "Sheet exists and is accessible"
    }
  ],
  "timestamp": "2025-01-30T..."
}
```

### POST /api/admin/enhance
**Description**: Run data enhancement process

**Response**:
```json
{
  "success": true,
  "duration": 4.2,
  "recordsCleaned": 156,
  "recordsEnriched": 89,
  "dataQuality": 92,
  "completedAt": "2025-01-30T..."
}
```

### POST /api/admin/cleanup
**Description**: Perform quick data cleanup

**Response**:
```json
{
  "success": true,
  "fixed": 42,
  "message": "Quick cleanup completed. Fixed 42 data inconsistencies."
}
```

### GET /api/admin/export
**Description**: Prepare data exports

**Response**:
```json
{
  "success": true,
  "message": "Export prepared successfully",
  "exports": [
    {
      "name": "Board Members",
      "format": "CSV",
      "size": "2.1 KB",
      "downloadUrl": "#"
    },
    {
      "name": "Contact Database",
      "format": "Excel",
      "size": "1.2 MB",
      "downloadUrl": "#"
    }
  ]
}
```

### GET /api/admin/board-members
**Description**: Get list of board members

**Response**:
```json
{
  "success": true,
  "boardMembers": [
    {
      "name": "Dorothy Leonard",
      "email": "msmussel@oceanequities.org",
      "role": "Board Chair",
      "organization": "Ocean Equities LLC",
      "phone": "(410) 562-4880"
    },
    ...
  ],
  "count": 8,
  "source": "database"
}
```

### GET /api/admin/registration-stats
**Description**: Get conference registration statistics

**Response**:
```json
{
  "success": true,
  "icsr2026": {
    "totalRegistrations": 0,
    "registrationsByType": {
      "earlyBird": 0,
      "regular": 0,
      "student": 0
    },
    "registrationsByCountry": {},
    "sponsorshipCommitments": 0,
    "exhibitorReservations": 0,
    "abstractSubmissions": 0
  },
  "trends": {
    "dailyRegistrations": [],
    "weeklyGrowth": 0,
    "monthlyGrowth": 0
  }
}
```

## User Endpoints

### GET /api/users/permissions
**Description**: Get user permissions by email

**Query Parameters**:
- `email` (required): User's email address

**Example**: `/api/users/permissions?email=aaron.kornbluth@gmail.com`

**Response**:
```json
{
  "success": true,
  "email": "aaron.kornbluth@gmail.com",
  "role": "admin",
  "permissions": [
    "view", "edit", "delete", "admin", "export", "import",
    "enhance", "cleanup", "user_management", "vote_process"
  ],
  "canAccessFinancials": true,
  "canManageUsers": true,
  "canManageConference": true,
  "canProcessVotes": true
}
```

## User Roles

### Admin
- **Users**: Aaron Kornbluth, Erin Flaherty, Lisa Paton
- **Permissions**: Full access to all features

### Board
- **Users**: Board members (Dorothy Leonard, Beth Walton, etc.)
- **Permissions**: View, edit, export, conference admin, donor access, vote processing

### Steering
- **Users**: Steering committee members
- **Permissions**: View, edit, export, conference management, vote processing

### Viewer
- **Users**: Anyone not in above categories
- **Permissions**: View and export only

## Rate Limiting

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per window
- **Response on limit**: 429 Too Many Requests

```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Missing required parameters |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Endpoint doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## CORS

CORS is enabled for all origins by default. You can restrict this by setting the `CORS_ORIGIN` environment variable.

## Authentication

Currently, the API uses email-based permissions. Optional API key authentication can be enabled by:
1. Setting `API_KEY` environment variable
2. Sending `x-api-key` header with requests

## Examples

### JavaScript (Frontend)

```javascript
// Get statistics
const response = await fetch('https://your-service.onrender.com/api/admin/stats');
const data = await response.json();
console.log(data);

// Process vote with AI
const voteResponse = await fetch('https://your-service.onrender.com/api/votes/ai-process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailContent: 'Email text here...',
    voteDate: '2025-01-30',
    voteMethod: 'email',
    processedBy: 'Aaron Kornbluth'
  })
});
const voteData = await voteResponse.json();
```

### cURL

```bash
# Get stats
curl https://your-service.onrender.com/api/admin/stats

# Process vote
curl -X POST https://your-service.onrender.com/api/votes/ai-process \
  -H "Content-Type: application/json" \
  -d '{
    "emailContent": "Email text...",
    "voteDate": "2025-01-30",
    "voteMethod": "email",
    "processedBy": "Aaron Kornbluth"
  }'

# Get vote history
curl https://your-service.onrender.com/api/votes/history?limit=50

# Export votes
curl https://your-service.onrender.com/api/votes/export -o votes.csv
```

## Support

For API support or questions:
- Email: aaron.kornbluth@gmail.com
- Documentation: https://github.com/YOUR_USERNAME/isrs-database-backend
