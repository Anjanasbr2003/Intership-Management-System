const crypto = require('crypto');
const { logSecurityEvent } = require('../utils/securityLogger');

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'interlink_default_webhook_signing_secret_2026';
const MAX_ALLOWED_TIMESTAMP_DRIFT_SECONDS = 300; // 5 minutes

/**
 * Middleware to cryptographically verify incoming payment webhook signatures
 * Headers expected:
 *   'x-webhook-signature': hex digest of HMAC-SHA256(secret, timestamp + '.' + rawBody)
 *   'x-webhook-timestamp': epoch seconds when the webhook was sent
 */
const verifyPaymentWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  if (!signature || !timestamp) {
    logSecurityEvent({
      type: 'INVALID_WEBHOOK_SIGNATURE',
      severity: 'WARN',
      ip: req.ip || req.connection?.remoteAddress,
      details: 'Missing webhook signature or timestamp headers',
    });
    return res.status(400).json({
      success: false,
      message: 'Missing webhook verification headers.',
    });
  }

  // Prevent replay attacks: check timestamp drift
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const eventTimestamp = parseInt(timestamp, 10);

  if (isNaN(eventTimestamp) || Math.abs(currentTimestamp - eventTimestamp) > MAX_ALLOWED_TIMESTAMP_DRIFT_SECONDS) {
    logSecurityEvent({
      type: 'WEBHOOK_REPLAY_ATTACK_BLOCKED',
      severity: 'ERROR',
      ip: req.ip || req.connection?.remoteAddress,
      details: `Webhook timestamp rejected: drift is ${Math.abs(currentTimestamp - eventTimestamp)}s (max allowed 300s)`,
    });
    return res.status(400).json({
      success: false,
      message: 'Webhook timestamp expired or out of tolerance.',
    });
  }

  // Compute expected HMAC-SHA256 signature
  const payloadToSign = `${timestamp}.${JSON.stringify(req.body)}`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadToSign)
    .digest('hex');

  // Use timing-safe equality check to block timing attacks
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    logSecurityEvent({
      type: 'INVALID_WEBHOOK_SIGNATURE',
      severity: 'ERROR',
      ip: req.ip || req.connection?.remoteAddress,
      details: 'Webhook HMAC-SHA256 signature mismatch',
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid webhook signature.',
    });
  }

  // Signature and timestamp verified!
  req.webhookVerified = true;
  next();
};

module.exports = { verifyPaymentWebhookSignature, WEBHOOK_SECRET };
