const rateLimit = require('express-rate-limit');
const { logSecurityEvent } = require('../utils/securityLogger');

/**
 * Standard handler when rate limit is exceeded
 */
const rateLimitHandler = (message, type = 'RATE_LIMIT_EXCEEDED') => (req, res, next, options) => {
  logSecurityEvent({
    type,
    severity: 'WARN',
    ip: req.ip || req.connection?.remoteAddress,
    userId: req.user?.id,
    email: req.user?.email || req.body?.email,
    details: `Rate limit triggered on ${req.method} ${req.originalUrl}: ${message}`,
  });

  res.status(options.statusCode).json({
    success: false,
    message,
    retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes',
  });
};

/**
 * General API rate limiter (300 requests / 15 minutes)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please slow down.',
  handler: rateLimitHandler('Too many requests. Please try again later.', 'API_RATE_LIMIT_EXCEEDED'),
});

/**
 * Strict authentication rate limiter (10 attempts / 15 minutes)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
  handler: rateLimitHandler('Too many authentication attempts. Please try again after 15 minutes.', 'AUTH_RATE_LIMIT_EXCEEDED'),
});

/**
 * Password reset rate limiter (Max 3 requests / 15 minutes per IP)
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many password reset requests from this IP. Please try again in 15 minutes.',
  handler: rateLimitHandler('Too many password reset requests. Please try again after 15 minutes.', 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'),
});

/**
 * AI usage rate limiter (Max 10 requests / 15 minutes per IP/user)
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'AI query limit reached for this window. Please wait a few minutes before trying again.',
  handler: rateLimitHandler('AI usage rate limit reached. Please try again in a few minutes.', 'AI_RATE_LIMIT_EXCEEDED'),
});

/**
 * File upload rate limiter (Max 30 uploads / 15 minutes per IP)
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many upload requests from this IP. Please try again later.',
  handler: rateLimitHandler('Too many upload requests. Please try again later.', 'UPLOAD_RATE_LIMIT_EXCEEDED'),
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  aiLimiter,
  uploadLimiter,
};
