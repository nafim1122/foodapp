const { validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const Shop = require('../models/Shop');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all menu items for a shop
// @route   GET /api/shops/:shopId/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Build query
    let query = { shop: shopId };
    
    // Add filters
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === 'true';
    }
    
    if (req.query.isPopular !== undefined) {
      query.isPopular = req.query.isPopular === 'true';
    }
    
    if (req.query.isFeatured !== undefined) {
      query.isFeatured = req.query.isFeatured === 'true';
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Search by name
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sorting
    let sortBy = '-createdAt';
    if (req.query.sort) {
      const sortOptions = {
        'price_asc': 'price',
        'price_desc': '-price',
        'rating': '-rating.average',
        'popular': '-totalOrders',
        'newest': '-createdAt',
        'name': 'name'
      };
      sortBy = sortOptions[req.query.sort] || '-createdAt';
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await MenuItem.countDocuments(query);
    
    const menuItems = await MenuItem.find(query)
      .populate({
        path: 'shop',
        select: 'name category'
      })
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total,
      pagination,
      data: menuItems
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

// @desc    Get single menu item
// @route   GET /api/shops/:shopId/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate({
        path: 'shop',
        select: 'name category owner address phone'
      });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if menu item belongs to the shop
    if (menuItem.shop._id.toString() !== req.params.shopId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item does not belong to this shop'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
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

// @desc    Create new menu item
// @route   POST /api/shops/:shopId/menu
// @access  Private (Shop Owner)
exports.createMenuItem = async (req, res, next) => {
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

    const { shopId } = req.params;

    // Check if shop exists and user owns it
    const shop = await Shop.findById(shopId);
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
        message: 'User not authorized to add menu items to this shop'
      });
    }

    // Add shop ID to request body
    req.body.shop = shopId;

    const menuItem = await MenuItem.create(req.body);

    // Populate shop information
    await menuItem.populate({
      path: 'shop',
      select: 'name category'
    });

    // Emit real-time event
    if (req.io) {
      req.io.to(`shop_${shopId}`).emit('menu_item_added', {
        menuItem: menuItem
      });
    }

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during menu item creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/shops/:shopId/menu/:id
// @access  Private (Shop Owner)
exports.updateMenuItem = async (req, res, next) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if menu item belongs to the shop
    if (menuItem.shop.toString() !== req.params.shopId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item does not belong to this shop'
      });
    }

    // Check if shop belongs to user
    const shop = await Shop.findById(req.params.shopId);
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this menu item'
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'shop',
      select: 'name category'
    });

    // Emit real-time event
    if (req.io) {
      req.io.to(`shop_${req.params.shopId}`).emit('menu_item_updated', {
        menuItem: menuItem
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during menu item update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/shops/:shopId/menu/:id
// @access  Private (Shop Owner)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if menu item belongs to the shop
    if (menuItem.shop.toString() !== req.params.shopId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item does not belong to this shop'
      });
    }

    // Check if shop belongs to user
    const shop = await Shop.findById(req.params.shopId);
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to delete this menu item'
      });
    }

    // Delete image from Cloudinary if it exists
    if (menuItem.image && !menuItem.image.includes('default')) {
      const publicId = menuItem.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`menu/${publicId}`);
    }

    await menuItem.remove();

    // Emit real-time event
    if (req.io) {
      req.io.to(`shop_${req.params.shopId}`).emit('menu_item_deleted', {
        menuItemId: req.params.id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during menu item deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Upload menu item photo
// @route   PUT /api/shops/:shopId/menu/:id/photo
// @access  Private (Shop Owner)
exports.uploadMenuItemPhoto = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if menu item belongs to the shop
    if (menuItem.shop.toString() !== req.params.shopId) {
      return res.status(400).json({
        success: false,
        message: 'Menu item does not belong to this shop'
      });
    }

    // Check if shop belongs to user
    const shop = await Shop.findById(req.params.shopId);
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this menu item'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'menu');

    // Delete old image from Cloudinary if it exists and is not default
    if (menuItem.image && !menuItem.image.includes('default')) {
      const publicId = menuItem.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`menu/${publicId}`);
    }

    await MenuItem.findByIdAndUpdate(req.params.id, { image: result.url });

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

// @desc    Get menu items by category
// @route   GET /api/shops/:shopId/menu/category/:category
// @access  Public
exports.getMenuItemsByCategory = async (req, res, next) => {
  try {
    const { shopId, category } = req.params;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const menuItems = await MenuItem.find({
      shop: shopId,
      category: category,
      isAvailable: true
    }).populate({
      path: 'shop',
      select: 'name category'
    }).sort('name');

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
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
