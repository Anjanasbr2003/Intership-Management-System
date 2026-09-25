const xss = require('xss');

const SENSITIVE_KEYS = new Set(['password', 'newPassword', 'currentPassword', 'confirmPassword']);

/**
 * Recursively sanitize an object, array, or string using xss
 */
const sanitizeValue = (value, key = '') => {
  if (SENSITIVE_KEYS.has(key)) {
    // Password values must remain raw and unmutated (never HTML entity encoded or stripped)
    return typeof value === 'string' ? value : String(value || '');
  }
  if (typeof value === 'string') {
    // Sanitize string content and trim
    return xss(value.trim());
  } else if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  } else if (value !== null && typeof value === 'object') {
    const sanitizedObj = {};
    for (const subKey of Object.keys(value)) {
      // Prevent prototype pollution
      if (subKey === '__proto__' || subKey === 'constructor' || subKey === 'prototype') {
        continue;
      }
      sanitizedObj[subKey] = sanitizeValue(value[subKey], subKey);
    }
    return sanitizedObj;
  }
  return value;
};

/**
 * Express middleware to sanitize incoming request bodies, queries, and params before database storage
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = { sanitizeInput, sanitizeValue };
