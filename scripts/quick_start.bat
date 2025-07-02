@echo off
chcp 65001 > nul
title 🚀 БЫСТРЫЙ СТАРТ - Psychology Project

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                    🚀 БЫСТРЫЙ СТАРТ                              ║
echo ║              Психологический кабинет Марины Чикаидзе             ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 🔄 Запускаем полную систему...
echo.

echo 📦 Проверяем зависимости...
if not exist "node_modules" (
    echo ⚠️  Устанавливаем зависимости...
    call npm install
    echo ✅ Зависимости установлены!
)

echo.
echo 🚀 Запускаем бэкенд сервер...
start "⚙️ БЭКЕНД" cmd /k "node server/app.js"

echo ⏳ Ждем 3 секунды для инициализации бэкенда...
timeout /t 3 /nobreak > nul

echo 🖥️  Запускаем фронтенд сервер...
start "🖥️ ФРОНТЕНД" cmd /k "node simple_server.js"

echo.
echo ✅ СИСТЕМА ЗАПУЩЕНА!
echo.
echo 🌐 Основной сайт: http://localhost:3000
echo 🔧 Админ-панель: http://localhost:3000/admin/
echo 🔍 Мониторинг: http://localhost:3000/admin/system-monitor.html
echo 🔐 Авторизация: http://localhost:3000/auth/login
echo.
echo 🎉 Добро пожаловать!
echo.
pause 