const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getShops,
  getShop,
  createShop,
  updateShop,
  deleteShop,
  getShopsByOwner,
  uploadShopPhoto,
  getShopStats,
  toggleShopStatus,
  getNearbyShops
} = require('../controllers/shops');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Include menu routes
const menuRouter = require('./menu');
router.use('/:shopId/menu', menuRouter);

// Validation rules
const createShopValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Shop name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('category')
    .isIn([
      'Fast Food', 'Restaurant', 'Cafe', 'Bakery', 'Pizza', 'Chinese',
      'Indian', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American',
      'Desserts', 'Healthy', 'Vegetarian', 'Other'
    ])
    .withMessage('Please select a valid category'),
  body('cuisine')
    .isArray({ min: 1 })
    .withMessage('Please select at least one cuisine'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('address.coordinates.lat')
    .isNumeric()
    .withMessage('Valid latitude is required'),
  body('address.coordinates.lng')
    .isNumeric()
    .withMessage('Valid longitude is required'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('deliveryFee')
    .isNumeric({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
  body('minimumOrder')
    .isNumeric({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
  body('deliveryTime.min')
    .isInt({ min: 1 })
    .withMessage('Minimum delivery time must be at least 1 minute'),
  body('deliveryTime.max')
    .isInt({ min: 1 })
    .withMessage('Maximum delivery time must be at least 1 minute')
];

// Public routes
router.get('/', optionalAuth, getShops);
router.get('/nearby', optionalAuth, getNearbyShops);
router.get('/:id', optionalAuth, getShop);

// Protected routes
router.use(protect);

// Shop owner routes
router.get('/owner/my-shops', authorize('shop_owner'), getShopsByOwner);
router.post('/', authorize('shop_owner'), createShopValidation, createShop);
router.put('/:id', authorize('shop_owner'), updateShop);
router.delete('/:id', authorize('shop_owner'), deleteShop);
router.put('/:id/photo', authorize('shop_owner'), uploadSingle('image'), handleMulterError, uploadShopPhoto);
router.get('/:id/stats', authorize('shop_owner'), getShopStats);
router.patch('/:id/toggle-status', authorize('shop_owner'), toggleShopStatus);

module.exports = router;
