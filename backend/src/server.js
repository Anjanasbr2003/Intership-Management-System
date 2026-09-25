const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // Load models and associations

// Security Utilities & Middlewares
const { sanitizeInput } = require('./middleware/sanitize');
const { generalLimiter } = require('./middleware/rateLimiter');
const { getCsrfTokenHandler, verifyCsrfToken } = require('./middleware/csrf');
const { logSecurityEvent } = require('./utils/securityLogger');

dotenv.config();

const app = express();

// Connect to MySQL and sync models
connectDB().then(async () => {
  try {
    await sequelize.sync();
    console.log('MySQL schema synchronized successfully.');
  } catch (syncErr) {
    console.error('MySQL schema sync error:', syncErr.message);
  }
});

// 1. Add HSTS & Essential Security Headers (via Helmet)
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: false, // Prevent interference with Vite React inline scripts during development
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 14. Lock Down CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl) or matched whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logSecurityEvent({
          type: 'CORS_REJECTED',
          severity: 'WARN',
          details: `Rejected request from untrusted origin: ${origin}`,
        });
        callback(new Error('Cross-Origin Request Blocked by Security Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'x-csrf-token',
      'x-webhook-signature',
      'x-webhook-timestamp',
    ],
    maxAge: 86400, // 24-hour preflight caching
  })
);

// 19. Set secure cookie flags parser
app.use(cookieParser());

// 11. Limit Request Body Size (Cap at 1MB to block payload exhaustion DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 13. Sanitize Before Storing (Neutralize XSS and injected HTML/scripts)
app.use(sanitizeInput);

// 15. Disable Directory Listing & Restrict Static File Access
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    dotfiles: 'ignore', // Never serve hidden/dot files (.env, .git, etc.)
    index: false, // Disable directory index listing
    setHeaders: (res) => {
      res.set('X-Content-Type-Options', 'nosniff');
    },
  })
);

// General rate limiting across all API endpoints
app.use('/api', generalLimiter);

// 2. Add CSRF Tokens: Token Issuance Endpoint
app.get('/api/csrf-token', getCsrfTokenHandler);

// 2. Add CSRF Tokens: Double-submit validation on all state-modifying requests
app.use('/api', verifyCsrfToken);

// 16. Configurable / Obscured Admin Routes
const adminRoutePrefix = process.env.ADMIN_ROUTE_PREFIX || 'admin';
app.use(`/api/${adminRoutePrefix}`, require('./routes/adminRoutes'));

// If a custom admin prefix is active, turn default /api/admin into an active honeypot
if (adminRoutePrefix !== 'admin') {
  app.all('/api/admin*', (req, res) => {
    logSecurityEvent({
      type: 'UNAUTHORIZED_ADMIN_PROBE',
      severity: 'WARN',
      ip: req.ip,
      details: `Honeypot hit: automated scanner targeted default admin route ${req.originalUrl}`,
    });
    res.status(404).json({ message: 'Resource not found' });
  });
}

// Core API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/universities', require('./routes/universityRoutes'));
app.use('/api/supervisors', require('./routes/supervisorRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/employer', require('./routes/employerRoutes'));

// 7. & 8. Payment Webhook Verification & Server-Side Pricing Routes
app.use('/api/payments', require('./routes/paymentRoutes'));

// 9. & 10. AI Prompt Injection Defense & Capped Usage Routes
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Interlink Internship Management Portal API',
    securityHardened: true,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }

  logSecurityEvent({
    type: 'SERVER_UNCAUGHT_ERROR',
    severity: 'ERROR',
    ip: req.ip,
    details: err.message || 'Internal Server Error',
    metadata: { stack: err.stack },
  });

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 Interlink backend server running in hardened security mode on port ${PORT}`);
});

// Avoid ECONNRESET with proxy keep-alive connections
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is already in use. Retrying or free port ${PORT} to proceed.`);
  } else {
    console.error('Server startup error:', err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
