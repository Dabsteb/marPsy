@echo off
chcp 65001 >nul
title 🧠 Psychology Cabinet - Простой запуск

echo.
echo ====================================
echo   🧠 Психологический кабинет v2.0
echo   Простой запуск
echo ====================================
echo.

echo [1/3] 🚀 Открываю сайт в браузере...
start "" "%~dp0..\index.html"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Сайт открыт в браузере!
echo.
echo 💡 Это автономная версия с современным дизайном 2025:
echo   • Макротипографика
echo   • Цвет года Mocha Mousse  
echo   • Глубокие градиенты
echo   • 3D эффекты
echo   • Микроанимации
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔥 Хотите запустить полный стек с backend?
echo.
echo [A] - Автономный HTML (уже открыт) ✅
echo [S] - Полный стек (backend + frontend)
echo [Q] - Выход
echo.
set /p choice=Выберите опцию: 

if /i "%choice%"=="S" goto fullstack
if /i "%choice%"=="A" goto autonomous  
if /i "%choice%"=="Q" goto exit

:fullstack
echo.
echo [2/3] 🔄 Запуск полного стека...
echo.
echo 🖥️  Backend API будет на: http://localhost:3000
echo 🌐 Frontend будет на: http://localhost:5000
echo.

rem Проверяем .env файл
if not exist ".env" (
    echo 🔧 Создаю .env файл...
    echo NODE_ENV=development > .env
    echo PORT=3000 >> .env
    echo MONGODB_URI=mongodb://localhost:27017/psychology >> .env
    echo JWT_SECRET=your-secret-key-here >> .env
)

if not exist "backend\.env" (
    copy .env backend\.env >nul
)

echo 🚀 Запускаю серверы...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..\frontend\main-site  
start "Frontend Server" cmd /k "npm run dev"
cd ..\..

echo.
echo ✅ Серверы запущены в отдельных окнах!
echo.
echo 📱 Через 30 секунд откройте:
echo   🌐 Frontend: http://localhost:5000
echo   🖥️  Backend: http://localhost:3000
echo.
goto end

:autonomous
echo.
echo ✅ Автономный режим активен!
echo 🌐 Сайт уже открыт в браузере
goto end

:exit
echo.
echo 👋 До свидания!
goto end

:end
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Спасибо за использование Psychology Cabinet!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause 