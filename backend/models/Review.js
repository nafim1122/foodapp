const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  menuItem: {
    type: mongoose.Schema.ObjectId,
    ref: 'MenuItem'
  },
  rating: {
    food: {
      type: Number,
      required: [true, 'Please add a food rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    delivery: {
      type: Number,
      required: [true, 'Please add a delivery rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    overall: {
      type: Number,
      required: [true, 'Please add an overall rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    }
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  review: {
    type: String,
    required: [true, 'Please add a review'],
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  images: [{
    type: String
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same order
reviewSchema.index({ user: 1, order: 1 }, { unique: true });

// Update shop and menu item ratings after review is saved
reviewSchema.statics.getAverageRating = async function(shopId) {
  const obj = await this.aggregate([
    {
      $match: { shop: shopId }
    },
    {
      $group: {
        _id: '$shop',
        averageFood: { $avg: '$rating.food' },
        averageDelivery: { $avg: '$rating.delivery' },
        averageOverall: { $avg: '$rating.overall' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('Shop').findByIdAndUpdate(shopId, {
        'rating.average': obj[0].averageOverall,
        'rating.count': obj[0].count
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.shop);
});

// Call getAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.shop);
});

module.exports = mongoose.model('Review', reviewSchema);
