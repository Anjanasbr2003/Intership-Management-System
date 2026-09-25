const express = require('express');
const router = express.Router();
const { createOrder, handlePaymentWebhook, getPricingCatalog } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { verifyPaymentWebhookSignature } = require('../middleware/webhookVerifier');

// Public catalog
router.get('/pricing', getPricingCatalog);

// Authenticated order creation with server-side pricing
router.post('/order', protect, createOrder);

// Cryptographically verified webhook endpoint (7. Verify payment webhooks)
router.post('/webhook', verifyPaymentWebhookSignature, handlePaymentWebhook);

module.exports = router;
