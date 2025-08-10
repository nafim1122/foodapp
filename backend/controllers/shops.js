const { validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all shops with filtering, sorting, and pagination
// @route   GET /api/shops
// @access  Public
exports.getShops = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    let query = Shop.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Shop.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate owner information
    query = query.populate({
      path: 'owner',
      select: 'name email phone'
    });

    // Executing query
    const shops = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: shops.length,
      pagination,
      data: shops
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
exports.getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate({
        path: 'owner',
        select: 'name email phone'
      })
      .populate('menuItems');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new shop
// @route   POST /api/shops
// @access  Private (Shop Owner)
exports.createShop = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Add user to req.body
    req.body.owner = req.user.id;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: req.user.id });

    if (existingShop && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'User can only create one shop'
      });
    }

    const shop = await Shop.create(req.body);

    // Populate owner information
    await shop.populate({
      path: 'owner',
      select: 'name email phone'
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('shop_created', {
        shop: shop
      });
    }

    res.status(201).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during shop creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Shop Owner)
exports.updateShop = async (req, res, next) => {
  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this shop'
      });
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'owner',
      select: 'name email phone'
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('shop_updated', {
        shop: shop
      });
    }

    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during shop update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (Shop Owner)
exports.deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to delete this shop'
      });
    }

    await shop.remove();

    // Emit real-time event
    if (req.io) {
      req.io.emit('shop_deleted', {
        shopId: req.params.id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during shop deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get shops by owner
// @route   GET /api/shops/owner/my-shops
// @access  Private (Shop Owner)
exports.getShopsByOwner = async (req, res, next) => {
  try {
    const shops = await Shop.find({ owner: req.user.id })
      .populate('menuItems')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Upload shop photo
// @route   PUT /api/shops/:id/photo
// @access  Private (Shop Owner)
exports.uploadShopPhoto = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this shop'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'shops');

    // Delete old image from Cloudinary if it exists and is not default
    if (shop.image && shop.image !== 'default-shop.jpg') {
      const publicId = shop.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`shops/${publicId}`);
    }

    await Shop.findByIdAndUpdate(req.params.id, { image: result.url });

    res.status(200).json({
      success: true,
      data: {
        image: result.url
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get shop statistics
// @route   GET /api/shops/:id/stats
// @access  Private (Shop Owner)
exports.getShopStats = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to view shop stats'
      });
    }

    // Get total orders
    const totalOrders = await Order.countDocuments({ shop: req.params.id });

    // Get total revenue
    const revenueData = await Order.aggregate([
      { $match: { shop: shop._id, 'paymentInfo.paymentStatus': 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);

    // Get menu items count
    const menuItemsCount = await MenuItem.countDocuments({ shop: req.params.id });

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { shop: shop._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ shop: req.params.id })
      .populate('customer', 'name email')
      .sort('-createdAt')
      .limit(10);

    const stats = {
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      menuItemsCount,
      averageRating: shop.rating.average,
      totalReviews: shop.rating.count,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentOrders
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Toggle shop status (open/closed)
// @route   PATCH /api/shops/:id/toggle-status
// @access  Private (Shop Owner)
exports.toggleShopStatus = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Make sure user is shop owner
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this shop'
      });
    }

    shop.isOpen = !shop.isOpen;
    await shop.save();

    // Emit real-time event
    if (req.io) {
      req.io.emit('shop_status_changed', {
        shopId: shop._id,
        isOpen: shop.isOpen
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isOpen: shop.isOpen
      },
      message: `Shop is now ${shop.isOpen ? 'open' : 'closed'}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get nearby shops
// @route   GET /api/shops/nearby
// @access  Public
exports.getNearbyShops = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    // Convert radius from km to meters
    const radiusInMeters = radius * 1000;

    const shops = await Shop.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      },
      isActive: true,
      isOpen: true
    }).populate({
      path: 'owner',
      select: 'name email phone'
    });

    res.status(200).json({
      success: true,
      count: shops.length,
      data: shops
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
