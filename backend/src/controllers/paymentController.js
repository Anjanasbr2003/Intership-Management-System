const { getServerSidePrice, PRICING_CATALOG } = require('../config/pricing');
const { logSecurityEvent } = require('../utils/securityLogger');

/**
 * Create a payment order or subscription invoice.
 * Enforces 8. Set prices server-side: completely ignores any client-supplied amounts!
 */
const createOrder = async (req, res) => {
  try {
    const { tierId, vacancyTitle } = req.body;

    if (!tierId) {
      return res.status(400).json({ success: false, message: 'Pricing tierId is required.' });
    }

    // Server-side price authority: lookup strictly from immutable server catalog
    const pricingItem = getServerSidePrice(tierId);

    // If client attempted to pass their own 'amount' or 'price', detect tampering
    if (req.body.amount !== undefined || req.body.price !== undefined) {
      const clientAmount = req.body.amount || req.body.price;
      if (clientAmount !== pricingItem.amount) {
        logSecurityEvent({
          type: 'PRICE_TAMPERING_ATTEMPT',
          severity: 'WARN',
          ip: req.ip,
          userId: req.user?.id,
          email: req.user?.email,
          details: `Client attempted to submit price ${clientAmount} for tier ${tierId} (server price is ${pricingItem.amount})`,
        });
      }
    }

    // Construct order strictly using server price
    const order = {
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      tierId: pricingItem.id,
      name: pricingItem.name,
      amount: pricingItem.amount,
      currency: pricingItem.currency,
      description: pricingItem.description,
      createdAt: new Date().toISOString(),
      employerId: req.user?.id,
      vacancyTitle: vacancyTitle || 'Internship Listing',
      status: pricingItem.amount === 0 ? 'completed' : 'pending_payment',
    };

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Handle incoming verified payment webhook event.
 * Signature verified by verifyPaymentWebhookSignature middleware (7. Verify payment webhooks).
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const event = req.body;

    logSecurityEvent({
      type: 'PAYMENT_WEBHOOK_PROCESSED',
      severity: 'INFO',
      ip: req.ip,
      details: `Successfully processed verified webhook event: ${event.type || 'payment.success'} for order ${event.data?.orderId || 'unknown'}`,
    });

    res.json({
      received: true,
      verified: true,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get available public pricing catalog
 */
const getPricingCatalog = (req, res) => {
  res.json({
    success: true,
    catalog: PRICING_CATALOG,
  });
};

module.exports = {
  createOrder,
  handlePaymentWebhook,
  getPricingCatalog,
};
