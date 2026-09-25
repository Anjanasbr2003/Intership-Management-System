const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const securityLogFile = path.join(logDir, 'security.log');

/**
 * Log a structured security event to security.log and console
 * @param {Object} event
 * @param {string} event.type - Event category e.g. FAILED_LOGIN, ACCOUNT_LOCKED, CSRF_FAILURE
 * @param {string} event.severity - INFO | WARN | ERROR | CRITICAL
 * @param {string} [event.ip] - Remote client IP
 * @param {string} [event.userId] - User ID if known
 * @param {string} [event.email] - Email address if known
 * @param {string} [event.details] - Human-readable explanation
 * @param {Object} [event.metadata] - Extra structured metadata
 */
const logSecurityEvent = ({
  type,
  severity = 'WARN',
  ip = 'unknown',
  userId = null,
  email = null,
  details = '',
  metadata = {},
}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    severity,
    ip,
    userId,
    email,
    details,
    metadata,
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  try {
    fs.appendFileSync(securityLogFile, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write to security.log:', err.message);
  }

  const prefix = `[SECURITY ${severity}] [${type}]`;
  if (severity === 'CRITICAL' || severity === 'ERROR') {
    console.error(`${prefix} ${details} (IP: ${ip}, User: ${email || userId || 'anonymous'})`);
  } else {
    console.warn(`${prefix} ${details} (IP: ${ip}, User: ${email || userId || 'anonymous'})`);
  }
};

module.exports = { logSecurityEvent };
