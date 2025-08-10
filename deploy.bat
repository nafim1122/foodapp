@echo off
REM 🚀 Quick Deployment Script for Food Delivery App (Windows)
REM This script automates the deployment process for Windows users

echo 🍕 Food Delivery App - Windows Deployment Script
echo ================================================

REM Check if required CLI tools are installed
:check_cli_tools
echo 📋 Checking required CLI tools...

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ All required tools are available!

REM Install CLI tools
:install_deployment_tools
echo 📦 Installing deployment CLI tools...

REM Install Railway CLI
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Railway CLI...
    npm install -g @railway/cli
) else (
    echo ✅ Railway CLI already installed
)

REM Install Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI already installed
)

echo.
echo 🎯 Choose deployment option:
echo 1. Deploy Backend only (Railway)
echo 2. Deploy Frontend only (Vercel)
echo 3. Deploy Both (Full deployment)
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto deploy_backend
if "%choice%"=="2" goto deploy_frontend
if "%choice%"=="3" goto deploy_both
if "%choice%"=="4" goto exit_script
echo Invalid choice. Please run the script again.
pause
exit /b 1

:deploy_backend
echo 🔧 Deploying Backend to Railway...
cd backend

echo Please login to Railway if prompted...
railway login

REM Check if railway.json exists
if not exist "railway.json" (
    railway init
)

echo 🚀 Deploying backend...
railway up

echo ✅ Backend deployed to Railway!
echo 📝 Don't forget to set environment variables in Railway dashboard
cd ..
if "%choice%"=="1" goto completion
goto deploy_frontend_part

:deploy_frontend
echo 🌐 Deploying Frontend to Vercel...
cd frontend

echo 🚀 Deploying frontend...
vercel --prod

echo ✅ Frontend deployed to Vercel!
echo 📝 Don't forget to set environment variables in Vercel dashboard
cd ..
goto completion

:deploy_both
call :deploy_backend
echo.

:deploy_frontend_part
echo 🌐 Deploying Frontend to Vercel...
cd frontend

echo 🚀 Deploying frontend...
vercel --prod

echo ✅ Frontend deployed to Vercel!
echo 📝 Don't forget to set environment variables in Vercel dashboard
cd ..

:completion
echo.
echo 🎉 Deployment completed!
echo.
echo 📋 Next steps:
echo 1. Set up environment variables in Railway dashboard
echo 2. Set up environment variables in Vercel dashboard
echo 3. Configure MongoDB Atlas database
echo 4. Test your deployed application
echo.
echo 📖 For detailed instructions, check DEPLOYMENT.md
echo.
pause
exit /b 0

:exit_script
echo Deployment cancelled.
pause
exit /b 0
