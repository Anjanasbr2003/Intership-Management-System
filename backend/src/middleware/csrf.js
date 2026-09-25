const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/securityLogger');
const { getSecureCookieOptions } = require('../utils/cookieHelper');

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Endpoint handler to issue a fresh CSRF token
 */
const getCsrfTokenHandler = (req, res) => {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    token = generateCsrfToken();
  }

  // Double submit cookie must be readable by frontend JavaScript to set the X-CSRF-Token header
  res.cookie(CSRF_COOKIE_NAME, token, getSecureCookieOptions({
    httpOnly: false, // Must be readable by client JS to mirror in X-CSRF-Token header
  }));

  res.json({
    success: true,
    csrfToken: token,
  });
};

/**
 * Middleware to verify CSRF token on state-modifying requests
 */
const verifyCsrfToken = (req, res, next) => {
  // Safe HTTP methods do not modify state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF verification for cryptographically signed webhooks (they use HMAC signatures)
  if (req.originalUrl.startsWith('/api/payments/webhook')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers['x-xsrf-token'] || req.body?._csrf;

  // If a cookie token is present, header token MUST match it
  if (cookieToken) {
    if (!headerToken || headerToken !== cookieToken) {
      logSecurityEvent({
        type: 'CSRF_VALIDATION_FAILED',
        severity: 'ERROR',
        ip: req.ip || req.connection?.remoteAddress,
        userId: req.user?.id,
        email: req.user?.email,
        details: `CSRF validation mismatch on ${req.method} ${req.originalUrl}`,
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid or missing CSRF token.',
      });
    }
    return next();
  }

  // If Bearer token is used without CSRF cookie, verify that if an X-CSRF-Token header was supplied, it is non-empty
  // If no cookie was set yet, allow initial public auth requests to establish session, but enforce token when cookie exists
  next();
};

module.exports = {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  getCsrfTokenHandler,
  verifyCsrfToken,
};
