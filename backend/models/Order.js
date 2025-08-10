const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    variant: {
      name: String,
      price: Number
    },
    addOns: [{
      name: String,
      price: Number
    }],
    specialInstructions: String,
    itemTotal: {
      type: Number,
      required: true,
      min: [0, 'Item total cannot be negative']
    }
  }],
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    deliveryInstructions: String
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: [0, 'Delivery fee cannot be negative']
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative']
    },
    tip: {
      type: Number,
      default: 0,
      min: [0, 'Tip cannot be negative']
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative']
      },
      couponCode: String,
      description: String
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  paymentInfo: {
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'digital_wallet'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String, // For Stripe
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  status: {
    type: String,
    enum: [
      'placed',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded'
    ],
    default: 'placed'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  actualDeliveryTime: Date,
  deliveryPerson: {
    name: String,
    phone: String,
    vehicleInfo: String
  },
  specialInstructions: String,
  rating: {
    foodRating: {
      type: Number,
      min: [1, 'Food rating must be at least 1'],
      max: [5, 'Food rating cannot be more than 5']
    },
    deliveryRating: {
      type: Number,
      min: [1, 'Delivery rating must be at least 1'],
      max: [5, 'Delivery rating cannot be more than 5']
    },
    overallRating: {
      type: Number,
      min: [1, 'Overall rating must be at least 1'],
      max: [5, 'Overall rating cannot be more than 5']
    },
    review: String,
    ratedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'shop', 'admin']
    },
    cancelledAt: Date,
    refundAmount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${Date.now()}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Add status to status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Index for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ shop: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
