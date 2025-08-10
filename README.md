# Food Delivery App

A full-stack food delivery application built with Node.js, Express, MongoDB, React, Next.js, and TypeScript.

## Features

### For Customers
- Browse restaurants and menus
- Add items to cart with variants and add-ons
- Secure checkout with Stripe payments
- Real-time order tracking
- Order history and ratings
- User profile management

### For Shop Owners
- Restaurant management dashboard
- Menu item management (CRUD with images)
- Order management and status updates
- Real-time notifications
- Sales analytics and reporting
- Profile and shop settings

### For Admins
- Admin dashboard with analytics
- User and restaurant management
- Order oversight
- Revenue and performance metrics

### Technical Features
- JWT-based authentication with role-based access
- Real-time updates using Socket.io
- File uploads with Cloudinary integration
- Stripe payment processing
- Responsive design with Tailwind CSS
- TypeScript for type safety
- RESTful API architecture

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Validation**: express-validator

### Frontend
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Calls**: Axios with React Query
- **Forms**: React Hook Form with Yup validation
- **UI Components**: Headless UI
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Stripe account (for payments)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configurations:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fooddelivery
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000

# Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Update the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=FoodDelivery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-details` - Update user details
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Shop Endpoints
- `GET /api/shops` - Get all shops with filtering
- `GET /api/shops/:id` - Get single shop
- `POST /api/shops` - Create new shop (Shop Owner)
- `PUT /api/shops/:id` - Update shop (Shop Owner)
- `DELETE /api/shops/:id` - Delete shop (Shop Owner)
- `GET /api/shops/nearby` - Get nearby shops

### Menu Endpoints
- `GET /api/shops/:shopId/menu` - Get shop menu items
- `GET /api/shops/:shopId/menu/:id` - Get single menu item
- `POST /api/shops/:shopId/menu` - Create menu item (Shop Owner)
- `PUT /api/shops/:shopId/menu/:id` - Update menu item (Shop Owner)
- `DELETE /api/shops/:shopId/menu/:id` - Delete menu item (Shop Owner)

### Order Endpoints
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/shop/:shopId` - Get shop orders (Shop Owner)
- `POST /api/orders` - Create new order (Customer)
- `PATCH /api/orders/:id/status` - Update order status (Shop Owner)
- `PATCH /api/orders/:id/cancel` - Cancel order (Customer)

### Payment Endpoints
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook

## Database Models

### User Model
- Personal information (name, email, phone)
- Authentication (password hash)
- Role (customer, shop_owner, admin)
- Address information
- Account status

### Shop Model
- Basic information (name, description, category)
- Contact details (phone, email, address)
- Operating hours and delivery info
- Ratings and reviews
- Status (active/inactive, open/closed)

### MenuItem Model
- Basic information (name, description, price)
- Media (images)
- Nutritional information
- Variants and add-ons
- Availability status

### Order Model
- Customer and shop references
- Order items with quantities
- Delivery address and contact info
- Pricing breakdown
- Payment information
- Status tracking with history

## Deployment

### Backend Deployment (Example with Heroku)

1. Create a Heroku app:
```bash
heroku create your-app-name-api
```

2. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... other environment variables
```

3. Deploy:
```bash
git push heroku main
```

### Frontend Deployment (Example with Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## Acknowledgments

- Thanks to all the open-source libraries used in this project
- Special thanks to the Node.js and React communities
- Icons by Heroicons
- UI inspiration from various food delivery platforms
