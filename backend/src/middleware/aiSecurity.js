const { logSecurityEvent } = require('../utils/securityLogger');

// Prompt injection detection patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules|directions)/i,
  /disregard\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)/i,
  /you\s+are\s+now\s+(?:an?\s+)?(?:unfiltered|unrestricted|jailbroken|dan)/i,
  /bypass\s+(?:all\s+)?(?:safety|content|security)\s+(?:filters|guidelines|policies)/i,
  /(?:show|reveal|display|print)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions)/i,
  /<\|(?:im_start|im_end|endoftext)\|>/i,
  /\[\/?(?:INST|SYS)\]/i,
  /```(?:system|instruction|admin)\b/i,
];

// In-memory usage tracker for AI calls (resets daily)
const dailyAiUsageStore = new Map();

/**
 * Check if a text contains known prompt injection attempts
 */
const detectPromptInjection = (text) => {
  if (!text || typeof text !== 'string') return { isMalicious: false };

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { isMalicious: true, pattern: pattern.toString() };
    }
  }

  return { isMalicious: false };
};

/**
 * Middleware to inspect incoming AI queries for prompt injection
 */
const guardPromptInjection = (req, res, next) => {
  const prompt = req.body?.prompt || req.body?.query || req.body?.text || '';

  if (typeof prompt === 'string' && prompt.length > 2500) {
    return res.status(400).json({
      success: false,
      message: 'AI input length exceeds maximum allowed limit (2500 characters).',
    });
  }

  const { isMalicious, pattern } = detectPromptInjection(prompt);
  if (isMalicious) {
    logSecurityEvent({
      type: 'PROMPT_INJECTION_DETECTED',
      severity: 'WARN',
      ip: req.ip || req.connection?.remoteAddress,
      userId: req.user?.id,
      email: req.user?.email,
      details: `Prompt injection pattern detected: ${pattern}`,
      metadata: { promptSnippet: prompt.slice(0, 100) },
    });

    return res.status(400).json({
      success: false,
      message: 'Malicious prompt detected. The query violates security guidelines.',
    });
  }

  next();
};

/**
 * Middleware to enforce daily AI query caps (Max 50 queries per user/IP per day)
 */
const capAiUsage = (req, res, next) => {
  const identifier = req.user?.id ? `user-${req.user.id}` : `ip-${req.ip || 'anonymous'}`;
  const today = new Date().toISOString().slice(0, 10);
  const key = `${identifier}:${today}`;

  const currentUsage = dailyAiUsageStore.get(key) || 0;
  const DAILY_MAX_QUOTA = 50;

  if (currentUsage >= DAILY_MAX_QUOTA) {
    logSecurityEvent({
      type: 'AI_USAGE_CAP_REACHED',
      severity: 'INFO',
      ip: req.ip,
      userId: req.user?.id,
      details: `Daily AI quota of ${DAILY_MAX_QUOTA} queries reached for ${key}`,
    });

    return res.status(429).json({
      success: false,
      message: `Daily AI generation quota reached (${DAILY_MAX_QUOTA} queries/day). Quota resets at midnight UTC.`,
    });
  }

  dailyAiUsageStore.set(key, currentUsage + 1);
  req.aiQuotaRemaining = DAILY_MAX_QUOTA - (currentUsage + 1);
  next();
};

module.exports = {
  detectPromptInjection,
  guardPromptInjection,
  capAiUsage,
};
