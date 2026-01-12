# ISRS & ICSR Database Backend

Production backend for the International Society for Reef Studies (ISRS) and International Conference on Shellfish Restoration (ICSR) database management system.

## Features

- **Board Vote Processing**: AI-powered extraction and processing of board vote emails using Claude API
- **Google Sheets Integration**: Direct integration with Google Sheets for data storage
- **Contact & Organization Management**: Track contacts, organizations, and conference attendees
- **Statistics Dashboard**: Comprehensive statistics and analytics
- **Role-Based Permissions**: Admin, Board, Steering, and Viewer access levels
- **ICSR Conference Management**: Registration, abstracts, sponsors tracking

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Google Sheets (via Google Sheets API v4)
- **AI**: Claude API (Anthropic)
- **Hosting**: Render.com

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials
- Claude API key from Anthropic

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd isrs-database-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `CLAUDE_API_KEY`: Your Anthropic Claude API key
   - `GOOGLE_SHEET_ID`: ID of your master Google Sheet
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
   - `GOOGLE_PRIVATE_KEY`: Service account private key (in JSON format)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

### Setting Up Google Sheets API

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab > "Add Key" > "Create new key"
   - Select JSON format and download

4. **Share Google Sheet with Service Account**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (from the JSON file)
   - Give it "Editor" permissions

5. **Extract credentials for .env**
   From the downloaded JSON file:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## API Endpoints

### Health Check
- `GET /` - API status and version
- `GET /health` - Health check endpoint

### Board Votes
- `POST /api/votes/process` - Process board vote manually
- `POST /api/votes/ai-process` - Process board vote with AI extraction
- `GET /api/votes/history?limit=500` - Get vote history
- `GET /api/votes/export` - Export vote history as CSV

### Admin
- `GET /api/admin/stats` - Get comprehensive statistics
- `GET /api/admin/icsr-data` - Get ICSR conference data
- `GET /api/admin/test-connection` - Test database connection
- `POST /api/admin/enhance` - Run data enhancement
- `POST /api/admin/cleanup` - Perform quick cleanup
- `GET /api/admin/export` - Prepare data export
- `GET /api/admin/board-members` - Get board members list
- `GET /api/admin/registration-stats` - Get registration statistics

### Users
- `GET /api/users/permissions?email=user@example.com` - Get user permissions

## Deployment to Render

### Option 1: Using render.yaml (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Add environment variables**
   In the Render dashboard, add these secret environment variables:
   - `CLAUDE_API_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy

### Option 2: Manual Configuration

1. **Create Web Service**
   - Name: `isrs-database-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add all environment variables** from `.env.example`

3. **Deploy**

### Post-Deployment

1. **Test the API**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **Update frontend**
   Update the `CONFIG.WEB_APP_URL` in your frontend HTML file to point to your Render URL:
   ```javascript
   const CONFIG = {
       WEB_APP_URL: 'https://your-app.onrender.com'
   };
   ```

## Project Structure

```
isrs-database-backend/
├── src/
│   ├── config/
│   │   └── googleSheets.js      # Google Sheets API configuration
│   ├── constants/
│   │   └── boardMembers.js      # Board members and permissions
│   ├── controllers/
│   │   ├── voteController.js    # Vote endpoints
│   │   ├── adminController.js   # Admin endpoints
│   │   └── userController.js    # User endpoints
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling
│   │   └── auth.js              # Authentication helpers
│   ├── routes/
│   │   ├── voteRoutes.js        # Vote routes
│   │   ├── adminRoutes.js       # Admin routes
│   │   └── userRoutes.js        # User routes
│   ├── services/
│   │   ├── claudeService.js     # Claude AI integration
│   │   ├── voteService.js       # Vote processing logic
│   │   └── adminService.js      # Admin/stats logic
│   └── server.js                # Main application entry
├── .env                         # Environment variables (local)
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── render.yaml                  # Render deployment config
└── README.md                    # This file
```

## Board Members

The system is configured for the following board members:
- Dorothy Leonard (Board Chair)
- Beth Walton
- Rick DeVoe
- Mark Risse
- Katie Mosher
- Mark Luckenbach
- Simon Branigan
- Tristan Hugh-Jones

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- Data enhancement and cleanup
- Staff: Aaron Kornbluth, Erin Flaherty, Lisa Paton

### Board
- View, edit, export data
- Process board votes
- Conference administration
- Donor access

### Steering Committee
- View, edit, export data
- Process board votes
- Conference management

### Viewer
- View and export data only

## Security

- API key authentication (optional)
- Rate limiting (100 requests per 15 minutes by default)
- CORS enabled for frontend access
- Environment variables for sensitive data
- Google Service Account authentication

## Maintenance

### Updating Board Members

Edit `src/constants/boardMembers.js`:
```javascript
const BOARD_MEMBERS = [
  'New Member Name',
  // ...existing members
];
```

### Updating Permissions

Edit `src/constants/boardMembers.js`:
```javascript
const ADMIN_USERS = [
  'newadmin@example.com'
];
```

## Troubleshooting

### Google Sheets Connection Issues

1. **Check service account has access**
   - Verify the sheet is shared with the service account email
   - Verify the service account has "Editor" permissions

2. **Check private key format**
   - Ensure the private key includes `\n` characters
   - Ensure the key is wrapped in quotes in the .env file

3. **Check API is enabled**
   - Verify Google Sheets API is enabled in your Google Cloud project

### Claude API Issues

1. **Check API key**
   - Verify the key is correct and active
   - Check you have credits available

2. **Rate limiting**
   - The system includes automatic retries for rate limits
   - Check logs for retry attempts

## Support

For issues or questions:
- Email: aaron.kornbluth@gmail.com
- GitHub Issues: [Create an issue]

## License

Private - ISRS Internal Use Only

## Version History

- **v1.3** - Production backend with Claude AI integration
  - AI-powered vote extraction
  - Comprehensive statistics
  - Google Sheets integration
  - Role-based permissions
  - Render deployment support
