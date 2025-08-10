const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Shop = require('../models/Shop');
const User = require('../models/User');

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getOrders = async (req, res, next) => {
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
    let query = Order.find(JSON.parse(queryStr));

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
    const total = await Order.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'shop', select: 'name category' },
      { path: 'items.menuItem', select: 'name price image' }
    ]);

    // Executing query
    const orders = await query;

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
      count: orders.length,
      pagination,
      data: orders
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'shop', select: 'name category address phone' },
        { path: 'items.menuItem', select: 'name price image description' }
      ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user can access this order
    if (
      order.customer._id.toString() !== req.user.id &&
      order.shop.owner?.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
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

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
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

    const { shop: shopId, items, deliveryAddress, contactInfo, paymentInfo, specialInstructions, tip } = req.body;

    // Validate shop exists and is active
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (!shop.isActive || !shop.isOpen) {
      return res.status(400).json({
        success: false,
        message: 'Shop is currently not accepting orders'
      });
    }

    // Validate menu items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItem} not found`
        });
      }

      if (menuItem.shop.toString() !== shopId) {
        return res.status(400).json({
          success: false,
          message: 'All items must be from the same shop'
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently not available`
        });
      }

      let itemPrice = menuItem.price;
      
      // Handle variants
      if (item.variant) {
        const variant = menuItem.variants.find(v => v.name === item.variant.name);
        if (variant) {
          itemPrice = variant.price;
        }
      }

      // Handle add-ons
      let addOnPrice = 0;
      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const menuAddOn = menuItem.addOns.find(a => a.name === addOn.name);
          if (menuAddOn) {
            addOnPrice += menuAddOn.price;
          }
        }
      }

      const itemTotal = (itemPrice + addOnPrice) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: itemPrice,
        quantity: item.quantity,
        variant: item.variant,
        addOns: item.addOns,
        specialInstructions: item.specialInstructions,
        itemTotal: itemTotal
      });

      // Update menu item order count
      menuItem.totalOrders += item.quantity;
      await menuItem.save();
    }

    // Check minimum order
    if (subtotal < shop.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${shop.minimumOrder}`
      });
    }

    // Calculate pricing
    const deliveryFee = shop.deliveryFee;
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax + (tip || 0);

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date(Date.now() + (shop.deliveryTime.max * 60 * 1000));

    const orderData = {
      customer: req.user.id,
      shop: shopId,
      items: orderItems,
      deliveryAddress,
      contactInfo,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        tip: tip || 0,
        total
      },
      paymentInfo,
      estimatedDeliveryTime,
      specialInstructions
    };

    const order = await Order.create(orderData);

    // Populate the order
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'shop', select: 'name category address phone' },
      { path: 'items.menuItem', select: 'name price image' }
    ]);

    // Update shop total orders
    shop.totalOrders += 1;
    await shop.save();

    // Emit real-time events
    if (req.io) {
      // Notify shop owner
      req.io.to(`shop_${shopId}`).emit('new_order', {
        order: order
      });

      // Notify customer
      req.io.to(`customer_${req.user.id}`).emit('order_created', {
        order: order
      });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during order creation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Shop Owner/Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the shop or is admin
    const shop = await Shop.findById(order.shop);
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Validate status transition
    const allowedTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready_for_pickup', 'cancelled'],
      ready_for_pickup: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
      refunded: []
    };

    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user.id
    });

    // Set delivery time if delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Populate the order
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'shop', select: 'name category' }
    ]);

    // Emit real-time events
    if (req.io) {
      // Notify customer
      req.io.to(`customer_${order.customer._id}`).emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer)
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns the order
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order
    order.status = 'cancelled';
    order.cancellation = {
      reason: reason || 'Cancelled by customer',
      cancelledBy: 'customer',
      cancelledAt: new Date()
    };

    await order.save();

    // Emit real-time events
    if (req.io) {
      // Notify shop owner
      req.io.to(`shop_${order.shop}`).emit('order_cancelled', {
        orderId: order._id,
        reason: order.cancellation.reason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during order cancellation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { customer: req.user.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate([
        { path: 'shop', select: 'name category image' },
        { path: 'items.menuItem', select: 'name price image' }
      ])
      .sort('-createdAt')
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
      count: orders.length,
      total,
      pagination,
      data: orders
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

// @desc    Get shop orders
// @route   GET /api/orders/shop/:shopId
// @access  Private (Shop Owner)
exports.getShopOrders = async (req, res, next) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists and user owns it
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view shop orders'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    const query = { shop: shopId };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'items.menuItem', select: 'name price image' }
      ])
      .sort('-createdAt')
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
      count: orders.length,
      total,
      pagination,
      data: orders
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

// @desc    Add order rating
// @route   POST /api/orders/:id/rating
// @access  Private (Customer)
exports.addOrderRating = async (req, res, next) => {
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns the order
    if (order.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    // Make sure order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    // Make sure order hasn't been rated already
    if (order.rating && order.rating.ratedAt) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been rated'
      });
    }

    // Update order with rating
    order.rating = {
      ...req.body.rating,
      review: req.body.review,
      ratedAt: new Date()
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: order.rating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during rating',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
