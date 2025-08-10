const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalMenuItems = await MenuItem.countDocuments();

    // User breakdown
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Active vs inactive shops
    const shopsByStatus = await Shop.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          'paymentInfo.paymentStatus': 'completed',
          status: { $ne: 'cancelled' }
        }
      },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$pricing.total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate([
        { path: 'customer', select: 'name email' },
        { path: 'shop', select: 'name category' }
      ])
      .sort('-createdAt')
      .limit(10);

    // Recent users
    const recentUsers = await User.find()
      .sort('-createdAt')
      .limit(10)
      .select('-password');

    // Top performing shops
    const topShops = await Shop.find()
      .sort('-totalOrders')
      .limit(5)
      .populate('owner', 'name email');

    // Monthly data for charts
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [
                { $eq: ['$paymentInfo.paymentStatus', 'completed'] },
                '$pricing.total',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      totalCounts: {
        users: totalUsers,
        shops: totalShops,
        orders: totalOrders,
        menuItems: totalMenuItems
      },
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      shopsByStatus: shopsByStatus.reduce((acc, curr) => {
        acc[curr._id ? 'active' : 'inactive'] = curr.count;
        return acc;
      }, {}),
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        totalCompletedOrders: revenueData[0]?.totalOrders || 0
      },
      recentOrders,
      recentUsers,
      topShops,
      monthlyData: monthlyOrders
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

// @desc    Get all shops (admin view)
// @route   GET /api/admin/shops
// @access  Private (Admin)
exports.getAllShops = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Shop.countDocuments(query);

    const shops = await Shop.find(query)
      .populate([
        { path: 'owner', select: 'name email phone' }
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
      count: shops.length,
      total,
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

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
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
      count: users.length,
      total,
      pagination,
      data: users
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

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      query['paymentInfo.paymentStatus'] = req.query.paymentStatus;
    }

    // Date range filter
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
        { path: 'shop', select: 'name category' }
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

// @desc    Toggle shop status
// @route   PATCH /api/admin/shops/:id/toggle-status
// @access  Private (Admin)
exports.toggleShopStatus = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    shop.isActive = !shop.isActive;
    await shop.save();

    res.status(200).json({
      success: true,
      data: {
        isActive: shop.isActive
      },
      message: `Shop ${shop.isActive ? 'activated' : 'deactivated'} successfully`
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

// @desc    Toggle user status
// @route   PATCH /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to deactivate themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        isActive: user.isActive
      },
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
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

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue-stats
// @access  Private (Admin)
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'paymentInfo.paymentStatus': 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total revenue
    const totalRevenue = revenueStats.reduce((total, day) => total + day.revenue, 0);
    const totalOrders = revenueStats.reduce((total, day) => total + day.orders, 0);

    res.status(200).json({
      success: true,
      data: {
        dailyStats: revenueStats,
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          period: `${period} days`
        }
      }
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

// @desc    Get order statistics
// @route   GET /api/admin/order-stats
// @access  Private (Admin)
exports.getOrderStats = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Group by date
    const dailyStats = {};
    orderStats.forEach(stat => {
      if (!dailyStats[stat._id.date]) {
        dailyStats[stat._id.date] = {};
      }
      dailyStats[stat._id.date][stat._id.status] = stat.count;
    });

    // Status distribution
    const statusStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyStats,
        statusDistribution: statusStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        period: `${period} days`
      }
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
