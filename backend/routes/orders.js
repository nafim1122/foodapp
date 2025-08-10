const express = require('express');
const { body } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getShopOrders,
  addOrderRating
} = require('../controllers/orders');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('shop')
    .isMongoId()
    .withMessage('Valid shop ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.menuItem')
    .isMongoId()
    .withMessage('Valid menu item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('deliveryAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('contactInfo.phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('contactInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('paymentInfo.paymentMethod')
    .isIn(['card', 'cash', 'digital_wallet'])
    .withMessage('Valid payment method is required')
];

const ratingValidation = [
  body('rating.foodRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Food rating must be between 1 and 5'),
  body('rating.deliveryRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Delivery rating must be between 1 and 5'),
  body('rating.overallRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5')
];

// Protected routes
router.use(protect);

// Customer routes
router.get('/my-orders', authorize('customer'), getMyOrders);
router.post('/', authorize('customer'), createOrderValidation, createOrder);
router.get('/:id', getOrder);
router.patch('/:id/cancel', authorize('customer'), cancelOrder);
router.post('/:id/rating', authorize('customer'), ratingValidation, addOrderRating);

// Shop owner routes
router.get('/shop/:shopId', authorize('shop_owner', 'admin'), getShopOrders);
router.patch('/:id/status', authorize('shop_owner', 'admin'), updateOrderStatus);

// Admin routes
router.get('/', authorize('admin'), getOrders);

module.exports = router;
