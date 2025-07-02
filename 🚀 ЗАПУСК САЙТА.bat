@echo off
chcp 65001 > nul
title 🧠 Психологический кабинет v2.0 - Современный дизайн

echo.
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                🧠 ПСИХОЛОГИЧЕСКИЙ КАБИНЕТ МАРИНЫ ЧИКАИДЗЕ v2.0                ║
echo ║                         СОВРЕМЕННЫЙ ДИЗАЙН 2025                               ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎨 НОВЫЕ ВОЗМОЖНОСТИ:
echo    ✅ Трендовый дизайн 2025 года
echo    ✅ Мобильный-первый подход
echo    ✅ Современные градиенты и анимации
echo    ✅ Реальные контактные данные
echo    ✅ Рабочая форма обратной связи
echo    ✅ Интеграция с WhatsApp
echo    ✅ API для обработки заявок
echo.
echo 🚀 Запускаем современный сайт...
echo.

rem Переходим в папку backend
cd /d "%~dp0backend"

rem Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен! Установите Node.js и перезапустите скрипт.
    pause
    exit /b 1
)

rem Устанавливаем зависимости если нужно
if not exist "node_modules" (
    echo 📦 Устанавливаем зависимости...
    npm install
)

rem Проверяем наличие .env файла
if not exist ".env" (
    echo 📝 Создаем файл конфигурации...
    echo NODE_ENV=development > .env
    echo PORT=3000 >> .env
    echo SESSION_SECRET=dev-secret-key >> .env
    echo MONGODB_URI=mongodb://localhost:27017/psychology_cabinet >> .env
)

echo.
echo 🎯 ГОТОВАЯ КОНФИГУРАЦИЯ:
echo    📧 Email: marina.psy1968@gmail.com
echo    📱 Телефон: +7 919 744 8522
echo    🌐 Формат: Онлайн консультации
echo    💬 WhatsApp интеграция: ВКЛЮЧЕНА
echo.

rem Запускаем сервер
echo 🚀 Запускаем сервер психологического кабинета...
echo    🌍 Адрес: http://localhost:3000
echo    🔄 Автоперезагрузка: ВКЛЮЧЕНА
echo    📊 API статус: /api/health
echo.
echo 💡 Для остановки нажмите Ctrl+C
echo.

rem Запускаем с использованием nodemon если есть, иначе обычным node
where nodemon >nul 2>&1
if %errorlevel% equ 0 (
    nodemon src/app.js
) else (
    node src/app.js
)

pause 