@echo off
echo ============================================
echo Setting up Food Delivery App
echo ============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version

:: Create environment files from examples
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy "backend\.env.example" "backend\.env"
    echo Please update backend\.env with your actual configuration values
    echo.
)

if not exist "frontend\.env.local" (
    echo Creating frontend .env.local file...
    copy "frontend\.env.local.example" "frontend\.env.local"
    echo Please update frontend\.env.local with your actual configuration values
    echo.
)

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)
cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Update environment files with your configuration:
echo    - backend\.env
echo    - frontend\.env.local
echo.
echo 2. Start the applications:
echo    - Backend: cd backend && npm run dev
echo    - Frontend: cd frontend && npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo.
pause
