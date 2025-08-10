const express = require('express');
const { body } = require('express-validator');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemPhoto,
  getMenuItemsByCategory
} = require('../controllers/menu');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

// Validation rules
const createMenuItemValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isNumeric({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn([
      'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads', 'Soups',
      'Sandwiches', 'Burgers', 'Pizza', 'Pasta', 'Rice', 'Noodles', 'Seafood',
      'Chicken', 'Beef', 'Pork', 'Vegetarian', 'Vegan', 'Sides', 'Breakfast',
      'Lunch', 'Dinner', 'Snacks', 'Other'
    ])
    .withMessage('Please select a valid category'),
  body('preparationTime')
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute')
];

// Public routes
router.get('/', optionalAuth, getMenuItems);
router.get('/category/:category', optionalAuth, getMenuItemsByCategory);
router.get('/:id', optionalAuth, getMenuItem);

// Protected routes
router.use(protect);

// Shop owner routes
router.post('/', authorize('shop_owner'), createMenuItemValidation, createMenuItem);
router.put('/:id', authorize('shop_owner'), updateMenuItem);
router.delete('/:id', authorize('shop_owner'), deleteMenuItem);
router.put('/:id/photo', authorize('shop_owner'), uploadSingle('image'), handleMulterError, uploadMenuItemPhoto);

module.exports = router;
