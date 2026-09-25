const express = require('express');
const router = express.Router();
const { generateMatchingSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const { guardPromptInjection, capAiUsage } = require('../middleware/aiSecurity');

// Protected AI endpoint with 9. Block prompt injection & 10. Cap AI usage
router.post(
  '/match-summary',
  protect,
  aiLimiter, // 10. Cap AI rate limit
  capAiUsage, // 10. Daily quota capping
  guardPromptInjection, // 9. Block prompt injection
  generateMatchingSummary
);

module.exports = router;
