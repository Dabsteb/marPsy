@echo off
title Psychology Cabinet v2.0 - Development Server

echo ========================================
echo    Psychology Cabinet v2.0
echo    Development Environment Launcher
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js detected

echo.
echo [2/3] Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting development servers...
echo.
echo 🚀 Backend server will start on: http://localhost:3000
echo 🌐 Frontend server will start on: http://localhost:5000
echo.
echo Press Ctrl+C to stop both servers
echo.

call npm run dev

echo.
echo Development servers stopped.
pause 