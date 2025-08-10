#!/bin/bash

# 🚀 Quick Deployment Script for Food Delivery App
# This script automates the deployment process

echo "🍕 Food Delivery App - Deployment Script"
echo "========================================"

# Check if required CLI tools are installed
check_cli_tools() {
    echo "📋 Checking required CLI tools..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    echo "✅ All required tools are available!"
}

# Install CLI tools
install_deployment_tools() {
    echo "📦 Installing deployment CLI tools..."
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    else
        echo "✅ Railway CLI already installed"
    fi
    
    # Install Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    else
        echo "✅ Vercel CLI already installed"
    fi
}

# Deploy backend to Railway
deploy_backend() {
    echo "🔧 Deploying Backend to Railway..."
    
    cd backend
    
    # Login to Railway (if not already logged in)
    echo "Please login to Railway if prompted..."
    railway login
    
    # Initialize Railway project (if not already initialized)
    if [ ! -f "railway.json" ]; then
        railway init
    fi
    
    # Deploy to Railway
    echo "🚀 Deploying backend..."
    railway up
    
    echo "✅ Backend deployed to Railway!"
    echo "📝 Don't forget to set environment variables in Railway dashboard"
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo "🌐 Deploying Frontend to Vercel..."
    
    cd frontend
    
    # Deploy to Vercel
    echo "🚀 Deploying frontend..."
    vercel --prod
    
    echo "✅ Frontend deployed to Vercel!"
    echo "📝 Don't forget to set environment variables in Vercel dashboard"
    
    cd ..
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Check prerequisites
    check_cli_tools
    
    # Install deployment tools
    install_deployment_tools
    
    echo ""
    echo "🎯 Choose deployment option:"
    echo "1. Deploy Backend only (Railway)"
    echo "2. Deploy Frontend only (Vercel)" 
    echo "3. Deploy Both (Full deployment)"
    echo "4. Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            deploy_frontend
            ;;
        4)
            echo "Deployment cancelled."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in Railway dashboard"
    echo "2. Set up environment variables in Vercel dashboard"
    echo "3. Configure MongoDB Atlas database"
    echo "4. Test your deployed application"
    echo ""
    echo "📖 For detailed instructions, check DEPLOYMENT.md"
}

# Run the script
main
