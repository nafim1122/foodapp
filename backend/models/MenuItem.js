const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a menu item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: function() {
      return this.price;
    }
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Appetizers',
      'Main Course',
      'Desserts',
      'Beverages',
      'Salads',
      'Soups',
      'Sandwiches',
      'Burgers',
      'Pizza',
      'Pasta',
      'Rice',
      'Noodles',
      'Seafood',
      'Chicken',
      'Beef',
      'Pork',
      'Vegetarian',
      'Vegan',
      'Sides',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snacks',
      'Other'
    ]
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  images: [{
    type: String
  }],
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String,
    enum: [
      'Gluten',
      'Dairy',
      'Eggs',
      'Fish',
      'Shellfish',
      'Tree Nuts',
      'Peanuts',
      'Wheat',
      'Soybeans',
      'Sesame'
    ]
  }],
  dietary: [{
    type: String,
    enum: [
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Dairy-Free',
      'Nut-Free',
      'Low-Carb',
      'Keto',
      'Halal',
      'Kosher',
      'Organic'
    ]
  }],
  spiceLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
    default: 'Mild'
  },
  preparationTime: {
    type: Number, // in minutes
    required: [true, 'Please add preparation time'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  nutritionInfo: {
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  variants: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Variant price cannot be negative']
    },
    description: String
  }],
  addOns: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Add-on price cannot be negative']
    },
    category: {
      type: String,
      enum: ['Extra Sauce', 'Extra Cheese', 'Extra Meat', 'Side', 'Drink', 'Other'],
      default: 'Other'
    }
  }],
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
  totalOrders: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate discounted price
menuItemSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Create index for shop and category for better query performance
menuItemSchema.index({ shop: 1, category: 1 });
menuItemSchema.index({ shop: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
