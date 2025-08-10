// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'shop_owner' | 'admin';
  phone: string;
  avatar: string;
  address?: Address;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Shop types
export interface Shop {
  id: string;
  name: string;
  description: string;
  owner: string | User;
  category: ShopCategory;
  cuisine: string[];
  address: Address;
  phone: string;
  email: string;
  website?: string;
  image: string;
  images: string[];
  openingHours: OpeningHours;
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: {
    min: number;
    max: number;
  };
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isOpen: boolean;
  featured: boolean;
  totalOrders: number;
  tags: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
  menuItems?: MenuItem[];
}

export type ShopCategory = 
  | 'Fast Food'
  | 'Restaurant'
  | 'Cafe'
  | 'Bakery'
  | 'Pizza'
  | 'Chinese'
  | 'Indian'
  | 'Italian'
  | 'Mexican'
  | 'Thai'
  | 'Japanese'
  | 'American'
  | 'Desserts'
  | 'Healthy'
  | 'Vegetarian'
  | 'Other';

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

// Menu Item types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount: number;
  shop: string | Shop;
  category: MenuCategory;
  image: string;
  images: string[];
  ingredients: string[];
  allergens: Allergen[];
  dietary: DietaryTag[];
  spiceLevel: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';
  preparationTime: number;
  calories?: number;
  nutritionInfo?: NutritionInfo;
  isAvailable: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  variants: MenuVariant[];
  addOns: AddOn[];
  rating: {
    average: number;
    count: number;
  };
  totalOrders: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  discountedPrice?: number;
}

export type MenuCategory = 
  | 'Appetizers'
  | 'Main Course'
  | 'Desserts'
  | 'Beverages'
  | 'Salads'
  | 'Soups'
  | 'Sandwiches'
  | 'Burgers'
  | 'Pizza'
  | 'Pasta'
  | 'Rice'
  | 'Noodles'
  | 'Seafood'
  | 'Chicken'
  | 'Beef'
  | 'Pork'
  | 'Vegetarian'
  | 'Vegan'
  | 'Sides'
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks'
  | 'Other';

export type Allergen = 
  | 'Gluten'
  | 'Dairy'
  | 'Eggs'
  | 'Fish'
  | 'Shellfish'
  | 'Tree Nuts'
  | 'Peanuts'
  | 'Wheat'
  | 'Soybeans'
  | 'Sesame';

export type DietaryTag = 
  | 'Vegetarian'
  | 'Vegan'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Nut-Free'
  | 'Low-Carb'
  | 'Keto'
  | 'Halal'
  | 'Kosher'
  | 'Organic';

export interface NutritionInfo {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MenuVariant {
  name: string;
  price: number;
  description?: string;
}

export interface AddOn {
  name: string;
  price: number;
  category: 'Extra Sauce' | 'Extra Cheese' | 'Extra Meat' | 'Side' | 'Drink' | 'Other';
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  customer: string | User;
  shop: string | Shop;
  items: OrderItem[];
  deliveryAddress: Address & {
    deliveryInstructions?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  pricing: OrderPricing;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicleInfo?: string;
  };
  specialInstructions?: string;
  rating?: OrderRating;
  cancellation?: {
    reason: string;
    cancelledBy: 'customer' | 'shop' | 'admin';
    cancelledAt: string;
    refundAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItem: string | MenuItem;
  name: string;
  price: number;
  quantity: number;
  variant?: MenuVariant;
  addOns?: AddOn[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: {
    amount: number;
    couponCode?: string;
    description?: string;
  };
  total: number;
}

export interface PaymentInfo {
  paymentMethod: 'card' | 'cash' | 'digital_wallet';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface OrderRating {
  foodRating: number;
  deliveryRating: number;
  overallRating: number;
  review?: string;
  ratedAt: string;
}

// Cart types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  variant?: MenuVariant;
  addOns?: AddOn[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface Cart {
  items: CartItem[];
  shop?: Shop;
  subtotal: number;
  itemCount: number;
}

// Review types
export interface Review {
  id: string;
  user: string | User;
  shop: string | Shop;
  order: string | Order;
  menuItem?: string | MenuItem;
  rating: {
    food: number;
    delivery: number;
    overall: number;
  };
  title: string;
  review: string;
  images: string[];
  helpful: {
    user: string;
    createdAt: string;
  }[];
  response?: {
    text: string;
    respondedBy: string | User;
    respondedAt: string;
  };
  isVerified: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'customer' | 'shop_owner';
  address?: Address;
}

// Filter types
export interface ShopFilters {
  search?: string;
  category?: ShopCategory;
  cuisine?: string[];
  rating?: number;
  deliveryFee?: {
    min?: number;
    max?: number;
  };
  deliveryTime?: {
    max?: number;
  };
  isOpen?: boolean;
  featured?: boolean;
  sort?: 'rating' | 'delivery_time' | 'delivery_fee' | 'distance' | 'popularity';
  page?: number;
  limit?: number;
}

export interface MenuItemFilters {
  search?: string;
  category?: MenuCategory;
  isAvailable?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  dietary?: DietaryTag[];
  spiceLevel?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

// Socket types
export interface SocketEvents {
  // Shop events
  shop_created: (data: { shop: Shop }) => void;
  shop_updated: (data: { shop: Shop }) => void;
  shop_deleted: (data: { shopId: string }) => void;
  shop_status_changed: (data: { shopId: string; isOpen: boolean }) => void;
  
  // Menu events
  menu_item_added: (data: { menuItem: MenuItem }) => void;
  menu_item_updated: (data: { menuItem: MenuItem }) => void;
  menu_item_deleted: (data: { menuItemId: string }) => void;
  
  // Order events
  new_order: (data: { order: Order }) => void;
  order_status_updated: (data: { orderId: string; status: OrderStatus; estimatedDeliveryTime: string }) => void;
  order_cancelled: (data: { orderId: string; reason: string }) => void;
  payment_received: (data: { orderId: string; amount: number }) => void;
  
  // Customer events
  order_created: (data: { order: Order }) => void;
}

// Admin Dashboard types
export interface DashboardStats {
  totalCounts: {
    users: number;
    shops: number;
    orders: number;
    menuItems: number;
  };
  usersByRole: {
    customer: number;
    shop_owner: number;
    admin: number;
  };
  shopsByStatus: {
    active: number;
    inactive: number;
  };
  ordersByStatus: {
    [key in OrderStatus]: number;
  };
  revenue: {
    total: number;
    totalCompletedOrders: number;
  };
  recentOrders: Order[];
  recentUsers: User[];
  topShops: Shop[];
  monthlyData: Array<{
    _id: {
      year: number;
      month: number;
    };
    orders: number;
    revenue: number;
  }>;
}

// Form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CheckoutFormData {
  deliveryAddress: Address & {
    deliveryInstructions?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  paymentMethod: 'card' | 'cash' | 'digital_wallet';
  specialInstructions?: string;
  tip: number;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
}

export interface SearchResults<T> {
  results: T[];
  total: number;
  query: string;
  filters?: any;
}
