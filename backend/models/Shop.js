const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a shop name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Fast Food',
      'Restaurant',
      'Cafe',
      'Bakery',
      'Pizza',
      'Chinese',
      'Indian',
      'Italian',
      'Mexican',
      'Thai',
      'Japanese',
      'American',
      'Desserts',
      'Healthy',
      'Vegetarian',
      'Other'
    ]
  },
  cuisine: [{
    type: String,
    required: true
  }],
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Please add latitude']
      },
      lng: {
        type: Number,
        required: [true, 'Please add longitude']
      }
    }
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  website: String,
  image: {
    type: String,
    default: 'default-shop.jpg'
  },
  images: [{
    type: String
  }],
  openingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Please add a delivery fee'],
    min: [0, 'Delivery fee cannot be negative']
  },
  minimumOrder: {
    type: Number,
    required: [true, 'Please add minimum order amount'],
    min: [0, 'Minimum order cannot be negative']
  },
  deliveryTime: {
    min: {
      type: Number,
      required: [true, 'Please add minimum delivery time']
    },
    max: {
      type: Number,
      required: [true, 'Please add maximum delivery time']
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete menu items when a shop is deleted
shopSchema.pre('remove', async function(next) {
  await this.model('MenuItem').deleteMany({ shop: this._id });
  next();
});

// Reverse populate with virtuals
shopSchema.virtual('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'shop',
  justOne: false
});

module.exports = mongoose.model('Shop', shopSchema);
