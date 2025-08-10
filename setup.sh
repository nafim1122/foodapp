#!/bin/bash

echo "============================================"
echo "Setting up Food Delivery App"
echo "============================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version

# Create environment files from examples
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp "backend/.env.example" "backend/.env"
    echo "Please update backend/.env with your actual configuration values"
    echo
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    cp "frontend/.env.local.example" "frontend/.env.local"
    echo "Please update frontend/.env.local with your actual configuration values"
    echo
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies"
    exit 1
fi
cd ..

echo
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo
echo "Next steps:"
echo "1. Update environment files with your configuration:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo
echo "2. Start the applications:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo
