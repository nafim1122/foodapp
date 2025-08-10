# 🚀 Deployment Guide

This guide will help you deploy your Food Delivery App to production using Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

Before deploying, make sure you have:
- MongoDB Atlas account (free tier available)
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Cloudinary account for image uploads
- Stripe account for payments

## 🔧 Backend Deployment (Railway)

### Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for production
5. Copy your connection string

### Step 2: Deploy to Railway

1. **Connect Repository to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to backend directory
   cd backend
   
   # Initialize Railway project
   railway init
   
   # Deploy
   railway up
   ```

2. **Set Environment Variables in Railway Dashboard:**
   Go to your Railway dashboard and set these variables:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fooddelivery
   JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
   JWT_EXPIRE=30d
   FRONTEND_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret
   ```

3. **Note Your Backend URL:**
   After deployment, Railway will provide you with a URL like:
   `https://your-app-name-production.up.railway.app`

### Alternative: Manual Railway Deployment

1. Go to [Railway](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `foodapp` repository
5. Choose the `backend` folder as the root directory
6. Add environment variables in the Railway dashboard
7. Deploy

## 🌐 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Using Vercel CLI:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to frontend directory
   cd frontend
   
   # Deploy to Vercel
   vercel --prod
   ```

2. **Using Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Configure environment variables (see below)
   - Deploy

### Step 2: Set Environment Variables in Vercel

In your Vercel project dashboard, add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=FoodDelivery
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Step 3: Update Backend CORS Settings

Update your backend's FRONTEND_URL environment variable in Railway to match your Vercel deployment URL.

## 🔐 Security Configuration

### Backend Security (Railway)

Make sure these are configured:
- Strong JWT secret (at least 32 characters)
- MongoDB connection with authentication
- CORS properly configured for your frontend domain
- Rate limiting enabled
- Helmet.js for security headers

### Frontend Security (Vercel)

- Environment variables properly set
- API URLs pointing to HTTPS backend
- No sensitive data in client-side code

## 🗃️ Database Setup

### MongoDB Atlas Configuration

1. **Create Database:**
   - Database name: `fooddelivery`
   - Collections will be created automatically

2. **Create Indexes for Better Performance:**
   ```javascript
   // In MongoDB Atlas, run these commands in the shell:
   
   // Users collection indexes
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "role": 1 })
   
   // Shops collection indexes
   db.shops.createIndex({ "owner": 1 })
   db.shops.createIndex({ "isActive": 1 })
   db.shops.createIndex({ "category": 1 })
   
   // Orders collection indexes
   db.orders.createIndex({ "customer": 1 })
   db.orders.createIndex({ "shop": 1 })
   db.orders.createIndex({ "status": 1 })
   db.orders.createIndex({ "createdAt": -1 })
   
   // Menu items collection indexes
   db.menuitems.createIndex({ "shop": 1 })
   db.menuitems.createIndex({ "isAvailable": 1 })
   ```

## 🧪 Testing Your Deployment

### Backend Testing
```bash
# Test API endpoints
curl https://your-backend-url.railway.app/api/shops
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"customer"}'
```

### Frontend Testing
1. Visit your Vercel URL
2. Test user registration and login
3. Test admin panel access
4. Test shop owner dashboard
5. Verify all API calls are working

## 🔄 Continuous Deployment

### Automatic Deployments
Both Railway and Vercel support automatic deployments:

1. **Railway:** Automatically deploys when you push to the main branch
2. **Vercel:** Automatically deploys when you push to the main branch

### Manual Deployment Updates
```bash
# Update backend
cd backend
railway up

# Update frontend
cd frontend
vercel --prod
```

## 📊 Monitoring and Logs

### Railway Monitoring
- View logs in Railway dashboard
- Monitor CPU and memory usage
- Set up alerts for downtime

### Vercel Monitoring
- View deployment logs in Vercel dashboard
- Monitor performance metrics
- Set up custom domains

## 🌍 Custom Domain Setup

### Backend Domain (Railway)
1. Go to Railway project settings
2. Add custom domain
3. Configure DNS records

### Frontend Domain (Vercel)
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records
4. SSL certificates are automatically provided

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Verify FRONTEND_URL in Railway matches your Vercel URL
   - Check CORS configuration in backend

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist in MongoDB Atlas

3. **Environment Variables:**
   - Ensure all required environment variables are set
   - Verify variable names match exactly

4. **Build Failures:**
   - Check build logs in deployment dashboard
   - Verify all dependencies are listed in package.json

### Health Checks

Your backend includes a health check endpoint:
- `GET /` - Returns server status
- Check this endpoint to verify your backend is running

## 📈 Performance Optimization

### Backend Optimization
- Enable compression middleware
- Use Redis for session storage (optional)
- Implement database query optimization
- Set up CDN for static assets

### Frontend Optimization
- Next.js automatic image optimization
- Code splitting and lazy loading
- PWA configuration for mobile users

## 🔐 Production Best Practices

1. **Environment Variables:**
   - Never commit .env files
   - Use different secrets for production
   - Rotate JWT secrets periodically

2. **Database Security:**
   - Use MongoDB Atlas with authentication
   - Regular backups
   - Monitor for unusual activity

3. **API Rate Limiting:**
   - Implement rate limiting for all endpoints
   - Monitor API usage

4. **Error Handling:**
   - Implement proper error logging
   - Set up error monitoring (e.g., Sentry)

5. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories

---

## 🎉 Your App is Now Live!

After following this guide, your Food Delivery App will be deployed and accessible:

- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-backend.railway.app

Users can register, browse restaurants, place orders, and manage their accounts in a fully production-ready environment!
