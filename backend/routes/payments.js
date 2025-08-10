const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createCustomer
} = require('../controllers/payments');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Webhook route (must be before other middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

// Customer routes
router.post('/create-payment-intent', authorize('customer'), createPaymentIntent);
router.post('/confirm-payment', authorize('customer'), confirmPayment);
router.post('/create-customer', authorize('customer'), createCustomer);
router.get('/payment-methods', authorize('customer'), getPaymentMethods);

module.exports = router;
