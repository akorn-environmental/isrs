require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth'); // DEPRECATED - will be removed
const unifiedAuthRoutes = require('./routes/unifiedAuthRoutes'); // NEW: Secure magic link auth with RBAC
const conferenceRoutes = require('./routes/conferenceRoutes');
const publicRoutes = require('./routes/publicRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const abstractRoutes = require('./routes/abstractRoutes');
const travelRoutes = require('./routes/travelRoutes');
const committeeRoutes = require('./routes/committeeRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const profileRoutes = require('./routes/profile');
const claudeRoutes = require('./routes/claudeRoutes');
const importRoutes = require('./routes/importRoutes');
const fundingProspectsRoutes = require('./routes/fundingProspectsRoutes');
const emailRoutes = require('./routes/emailRoutes');
const abstractReviewRoutes = require('./routes/abstractRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const emailParsingRoutes = require('./routes/emailParsingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const photoRoutes = require('./routes/photoRoutes');
const boardDocumentsRoutes = require('./routes/boardDocumentsRoutes');
const errorsRouter = require('./routes/errors');
const grantsRoutes = require('./routes/grants');
const contactEnrichmentRoutes = require('./routes/contactEnrichmentRoutes');
const assetZoneRoutes = require('./routes/assetZoneRoutes');  // Asset zones for photo assignments
const notificationRoutes = require('./routes/notificationRoutes');  // Dashboard notifications
const weeklyDigestRoutes = require('./routes/weeklyDigestRoutes');  // Weekly digest emails
const { errorHandler} = require('./middleware/errorHandler');

// Weekly digest scheduler
const weeklyDigestScheduler = require('./services/weeklyDigestScheduler');

const app = express();
const PORT = process.env.PORT || 3001;  // ISRS backend port - DO NOT CHANGE (AKORN uses 3000)

// Trust proxy - required when running behind a reverse proxy (Render, Vercel, etc.)
// This allows Express to correctly identify client IPs from X-Forwarded-For headers
// Set to 1 for Render's single proxy layer
app.set('trust proxy', 1);

// Security middleware with Content Security Policy
// NOTE: 'unsafe-inline' is required for scripts/styles because the frontend uses inline
// scripts in HTML files. TODO: Refactor frontend to use external JS files and nonces
// to enable stricter CSP without unsafe-inline.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://isrs-database-backend.onrender.com", "https://api.anthropic.com"],
      frameSrc: ["'self'", "https://www.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  // SECURITY: HSTS (HTTP Strict Transport Security) - force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false,  // Required for external resources
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// SECURITY: CORS configuration with explicit origin whitelist
const isDevelopment = process.env.NODE_ENV !== 'production';

// Production-only origins (always included)
const productionOrigins = [
  'https://isrs-frontend.onrender.com',
  'https://www.shellfish-society.org',
  'https://shellfish-society.org'
];

// Development origins (only in dev mode)
const developmentOrigins = isDevelopment ? [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://127.0.0.1:8080'
] : [];

// Combine origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(o => o && o.startsWith('http'))
  : [...productionOrigins, ...developmentOrigins];

// Log configured origins on startup (security audit trail)
console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // SECURITY: Only allow no-origin requests in development (for Postman testing)
    // In production, all requests must have a valid origin
    // EXCEPTION: Allow no-origin for magic link verification (direct email clicks)
    if (!origin) {
      if (isDevelopment) {
        return callback(null, true);
      } else {
        // Allow no-origin for specific routes (e.g., magic link verification from email)
        // The actual request path isn't available in the CORS handler, so we allow
        // no-origin requests and rely on token validation in the route handler
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Rate limiting - more generous for admin portal usage
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute window
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 300, // 300 requests per minute
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// SECURITY: Stricter rate limiting for authentication endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // 5 requests per 15 minutes per IP
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Cookie parser (required for HTTP-only session cookies)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for photo uploads
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'ISRS Database API running',
    version: 'prod-1.3',
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4.5-20250929',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Magic link verification endpoint (outside /api for direct email link access)
const { verifyMagicLinkRedirect } = require('./controllers/unifiedAuthController');
app.get('/auth/verify', verifyMagicLinkRedirect);

// API routes
app.use('/api/public', publicRoutes);  // Public routes (no auth required)

// ===== AUTHENTICATION ROUTES (RBAC with Magic Links) =====
// NEW: Unified auth system with magic links, HTTP-only cookies, and RBAC
app.use('/api/auth', authLimiter, unifiedAuthRoutes);  // Secure magic link authentication with rate limiting

// LEGACY AUTH (DEPRECATED - will be removed after testing)
// Old insecure admin login - DO NOT USE
// app.use('/api/auth-legacy', authRoutes);  // Commented out to prevent use

// ===== PROTECTED ROUTES =====
app.use('/api/membership', membershipRoutes);  // Membership routes
app.use('/api/abstracts', abstractRoutes);  // Abstract submission routes
app.use('/api/travel', travelRoutes);  // Travel & roommate routes
app.use('/api/committees', committeeRoutes);  // Committee management routes
app.use('/api/meetings', meetingRoutes);  // Meeting scheduling routes
app.use('/api/profile', userProfileRoutes);  // User profile and magic link auth (legacy endpoint)
app.use('/api/profiles', profileRoutes);  // Admin profile management
app.use('/api/claude', claudeRoutes);  // AI enhancement and data quality
app.use('/api/import', importRoutes);  // File import and parsing
app.use('/api/funding-prospects', fundingProspectsRoutes);  // Funding prospects management
app.use('/api/admin/email', emailRoutes);  // Email campaigns and templates
app.use('/api/admin/abstracts', abstractReviewRoutes);  // Abstract review system
app.use('/api/payments', paymentRoutes);  // Stripe payment processing
app.use('/api/ai', aiRoutes);  // AI grant writing and insights
app.use('/api/email-parsing', emailParsingRoutes);  // Email parsing and extraction
app.use('/api/gmail-oauth', require('./routes/gmailOAuthRoutes'));  // Gmail OAuth integration
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conference', conferenceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/photos', photoRoutes);  // Photo upload and gallery
app.use('/api/board-documents', boardDocumentsRoutes);  // Board documents (restricted)
app.use('/api/errors', errorsRouter);  // Error logging endpoint (no auth required)
app.use('/api/grants', grantsRoutes);  // Grants.gov API integration
app.use('/api/contact-enrichment', contactEnrichmentRoutes);  // Apollo.io contact enrichment
app.use('/api/asset-zones', assetZoneRoutes);  // Asset zones for photo assignments (NEW)
app.use('/api/notifications', notificationRoutes);  // Dashboard notifications for email parsing
app.use('/api/weekly-digest', weeklyDigestRoutes);  // Weekly digest emails

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ISRS Database Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Claude Model: ${process.env.CLAUDE_MODEL || 'claude-sonnet-4.5-20250929'}`);

  // Start weekly digest scheduler
  weeklyDigestScheduler.startScheduler();
  console.log(`📧 Weekly digest scheduler started (runs every Monday at 9:00 AM)`);
});

module.exports = app;
