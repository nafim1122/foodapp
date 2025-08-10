const express = require('express');
const {
  getDashboardStats,
  getAllShops,
  getAllUsers,
  getAllOrders,
  toggleShopStatus,
  toggleUserStatus,
  getRevenueStats,
  getOrderStats
} = require('../controllers/admin');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/revenue-stats', getRevenueStats);
router.get('/order-stats', getOrderStats);

// Shop management
router.get('/shops', getAllShops);
router.patch('/shops/:id/toggle-status', toggleShopStatus);

// User management
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Order management
router.get('/orders', getAllOrders);

module.exports = router;
