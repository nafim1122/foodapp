const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Get shop dashboard data
router.get('/dashboard', protect, authorize('shop_owner'), async (req, res) => {
  try {
    let shop = await Shop.findOne({ owner: req.user._id });
    
    // If shop doesn't exist, create a basic one
    if (!shop) {
      shop = new Shop({
        name: `${req.user.name}'s Shop`,
        description: 'Welcome to our restaurant!',
        category: 'other',
        address: 'Please update your address',
        phone: 'Please update your phone',
        owner: req.user._id,
        isActive: false // Inactive until profile is completed
      });
      await shop.save();
    }

    // Get statistics
    const totalOrders = await Order.countDocuments({ shop: shop._id });
    const totalRevenue = await Order.aggregate([
      { $match: { shop: shop._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const menuItems = await MenuItem.countDocuments({ shop: shop._id });
    const recentOrders = await Order.find({ shop: shop._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      menuItems,
      recentOrders
    };

    res.json({
      success: true,
      data: {
        shop,
        stats
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop profile
router.get('/profile', protect, authorize('shop_owner'), async (req, res) => {
  try {
    let shop = await Shop.findOne({ owner: req.user._id });
    
    // If shop doesn't exist, create a basic one
    if (!shop) {
      shop = new Shop({
        name: `${req.user.name}'s Shop`,
        description: 'Welcome to our restaurant!',
        category: 'other',
        address: 'Please update your address',
        phone: 'Please update your phone',
        owner: req.user._id,
        isActive: false
      });
      await shop.save();
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shop profile
router.put('/profile', [
  protect,
  authorize('shop_owner'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['pizza', 'burger', 'sushi', 'chinese', 'indian', 'mexican', 'italian', 'thai', 'other']).withMessage('Invalid category'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, address, phone, openingHours } = req.body;

    const shop = await Shop.findOneAndUpdate(
      { owner: req.user._id },
      {
        name,
        description,
        category,
        address,
        phone,
        openingHours
      },
      { new: true, runValidators: true }
    );

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop menu items
router.get('/menu', protect, authorize('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const menuItems = await MenuItem.find({ shop: shop._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create menu item
router.post('/menu', [
  protect,
  authorize('shop_owner'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'side_dish', 'special']).withMessage('Invalid category'),
  body('preparationTime').isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const { name, description, price, category, isAvailable, preparationTime } = req.body;

    // Map category to match MenuItem schema
    const categoryMap = {
      'appetizer': 'Appetizers',
      'main_course': 'Main Course',
      'dessert': 'Desserts',
      'beverage': 'Beverages',
      'side_dish': 'Sides',
      'special': 'Other'
    };

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category: categoryMap[category] || 'Other',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      preparationTime: preparationTime || 15,
      image: 'default-food.jpg', // Default image
      shop: shop._id
    });

    await menuItem.save();

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Menu creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item
router.put('/menu/:id', [
  protect,
  authorize('shop_owner'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'side_dish', 'special']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, shop: shop._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Menu update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item
router.delete('/menu/:id', protect, authorize('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const menuItem = await MenuItem.findOneAndDelete({ _id: req.params.id, shop: shop._id });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Menu deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shop orders
router.get('/orders', protect, authorize('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const { status, startDate, endDate } = req.query;
    let query = { shop: shop._id };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/orders/:id/status', [
  protect,
  authorize('shop_owner'),
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shop: shop._id },
      { status: req.body.status },
      { new: true }
    ).populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
