# 🔐 Environment Variables Configuration Guide

This document contains all the environment variables needed for your Food Delivery App deployment.

## 🔧 Backend Environment Variables (Railway)

Copy these variables to your Railway dashboard:

### Required Variables
```
NODE_ENV=production
PORT=5000
```

### Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fooddelivery?retryWrites=true&w=majority
```
**How to get:**
1. Create account at https://cloud.mongodb.com/
2. Create a new cluster
3. Go to "Connect" → "Connect your application"
4. Copy the connection string and replace username/password

### JWT Configuration
```
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long-for-production
JWT_EXPIRE=30d
```
**How to generate JWT_SECRET:**
```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend URL
```
FRONTEND_URL=https://your-app-name.vercel.app
```
**Note:** Replace with your actual Vercel deployment URL

### Image Upload (Cloudinary)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
**How to get:**
1. Create account at https://cloudinary.com/
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### Payment Processing (Stripe)
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```
**How to get:**
1. Create account at https://stripe.com/
2. Go to Dashboard → API keys
3. Copy the secret key (use live key for production)

### Email Service (Optional - for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Food Delivery App
```

### SMS Service (Optional - for order notifications)
```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🌐 Frontend Environment Variables (Vercel)

Copy these variables to your Vercel dashboard:

### API Configuration
```
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-name.up.railway.app
```
**Note:** Replace with your actual Railway backend URL

### App Configuration
```
NEXT_PUBLIC_APP_NAME=Food Delivery App
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Payment Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```
**How to get:**
1. Go to Stripe Dashboard → API keys
2. Copy the publishable key (use live key for production)

### Google Services (Optional)
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Social Login (Optional)
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

---

## 🚀 Quick Setup Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Environment Variables
```bash
# Test backend connection
curl https://your-backend-url.railway.app/

# Test frontend
curl https://your-app.vercel.app/
```

---

## 📋 Environment Variables Checklist

### Backend (Railway) ✅
- [ ] NODE_ENV=production
- [ ] MONGODB_URI (MongoDB Atlas)
- [ ] JWT_SECRET (Generated secure string)
- [ ] JWT_EXPIRE=30d
- [ ] FRONTEND_URL (Vercel URL)
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] STRIPE_SECRET_KEY

### Frontend (Vercel) ✅
- [ ] NEXT_PUBLIC_API_URL (Railway backend URL)
- [ ] NEXT_PUBLIC_SOCKET_URL (Railway backend URL)
- [ ] NEXT_PUBLIC_APP_NAME
- [ ] NEXT_PUBLIC_APP_URL (Vercel URL)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

---

## 🔐 Security Best Practices

### 1. Environment Variable Security
- ✅ Use different secrets for production vs development
- ✅ Never commit .env files to git
- ✅ Use secure, randomly generated secrets
- ✅ Rotate secrets regularly

### 2. Database Security
- ✅ Use MongoDB Atlas with authentication
- ✅ Whitelist specific IP addresses (or 0.0.0.0/0 for cloud deployments)
- ✅ Use strong database passwords
- ✅ Enable backup and monitoring

### 3. API Security
- ✅ Use HTTPS for all communications
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use JWT tokens with short expiration times

---

## 🔧 Service Setup Guides

### MongoDB Atlas Setup
1. Visit https://cloud.mongodb.com/
2. Create new account or sign in
3. Create new cluster (free tier available)
4. Create database user with readWrite permissions
5. Add IP addresses to whitelist (0.0.0.0/0 for production)
6. Get connection string from "Connect" button

### Cloudinary Setup
1. Visit https://cloudinary.com/
2. Create free account
3. Go to Dashboard to get credentials
4. Copy Cloud Name, API Key, and API Secret

### Stripe Setup
1. Visit https://stripe.com/
2. Create account and verify
3. Go to Dashboard → API keys
4. Copy publishable key and secret key
5. For production, ensure you're using live keys

### Railway Deployment
1. Connect GitHub repository to Railway
2. Select backend folder as root directory
3. Add all environment variables
4. Deploy automatically on git push

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Select frontend folder as root directory
3. Add all environment variables
4. Deploy automatically on git push

---

## 🐛 Troubleshooting

### Common Environment Variable Issues

1. **"Cannot connect to database"**
   - Check MONGODB_URI format
   - Verify database user permissions
   - Check IP whitelist in MongoDB Atlas

2. **"JWT token invalid"**
   - Ensure JWT_SECRET is the same across all instances
   - Check JWT_EXPIRE format
   - Verify secret is at least 32 characters

3. **"CORS error"**
   - Verify FRONTEND_URL matches your Vercel deployment
   - Check CORS configuration in backend

4. **"Stripe webhook failed"**
   - Verify STRIPE_WEBHOOK_SECRET
   - Check webhook endpoint URL in Stripe dashboard

5. **"Images not uploading"**
   - Verify all three Cloudinary variables
   - Check API limits in Cloudinary dashboard

### Environment Variable Testing
```bash
# Test if variables are loaded correctly
node -e "console.log(process.env.NODE_ENV)"
node -e "console.log(process.env.MONGODB_URI ? 'DB connected' : 'DB not connected')"
```

---

## 📞 Support

If you need help with environment variables:

1. Check the deployment logs in Railway/Vercel dashboards
2. Verify all variables are spelled correctly (case-sensitive)
3. Ensure no extra spaces in variable values
4. Test each service individually (MongoDB, Stripe, Cloudinary)

Remember: Environment variables are case-sensitive and should not contain spaces around the = sign!
