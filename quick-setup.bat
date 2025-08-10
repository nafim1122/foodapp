@echo off
echo ====================================
echo   Food Delivery App Setup Script
echo ====================================
echo.

echo Installing Backend Dependencies...
cd backend
npm install
if errorlevel 1 (
    echo Backend installation failed!
    pause
    exit /b 1
)

echo.
echo Installing Frontend Dependencies...
cd ../frontend
npm install
if errorlevel 1 (
    echo Frontend installation failed!
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Setup Complete!
echo ====================================
echo.
echo To start the application:
echo 1. Backend: cd backend && npm start
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Access the app at: http://localhost:3000
echo API server at: http://localhost:5000
echo.
pause
