@echo off
chcp 65001 >nul
title 🚀 Psychology Cabinet v2.0 - Полный стек сервер

echo.
echo ========================================
echo    🧠 Psychology Cabinet v2.0
echo    Запуск полного стека
echo ========================================
echo.

:: Проверка Node.js
echo [1/6] 🔍 Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js не найден! Установите Node.js версии 18 или выше.
    echo 📥 Скачать: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js обнаружен: %NODE_VERSION%

:: Проверка NPM
echo.
echo [2/6] 📦 Проверка NPM...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ NPM не найден!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ NPM обнаружен: v%NPM_VERSION%

:: Проверка зависимостей
echo.
echo [3/6] 🔄 Проверка и установка зависимостей...
if not exist "node_modules\" (
    echo 📥 Установка корневых зависимостей...
    call npm install
    if errorlevel 1 (
        echo ❌ Ошибка установки корневых зависимостей!
        pause
        exit /b 1
    )
)

if not exist "backend\node_modules\" (
    echo 📥 Установка backend зависимостей...
    cd backend
    call npm install
    cd ..
    if errorlevel 1 (
        echo ❌ Ошибка установки backend зависимостей!
        pause
        exit /b 1
    )
)

if not exist "frontend\main-site\node_modules\" (
    echo 📥 Установка frontend зависимостей...
    cd frontend\main-site
    call npm install
    cd ..\..
    if errorlevel 1 (
        echo ❌ Ошибка установки frontend зависимостей!
        pause
        exit /b 1
    )
)

echo ✅ Все зависимости установлены

:: Проверка портов
echo.
echo [4/6] 🌐 Проверка доступности портов...
netstat -an | findstr :3000 >nul
if not errorlevel 1 (
    echo ⚠️  Порт 3000 занят! Попробуйте остановить другие процессы.
    echo 💡 Нажмите любую клавишу для продолжения или Ctrl+C для отмены
    pause >nul
)

netstat -an | findstr :5000 >nul
if not errorlevel 1 (
    echo ⚠️  Порт 5000 занят! Попробуйте остановить другие процессы.
    echo 💡 Нажмите любую клавишу для продолжения или Ctrl+C для отмены
    pause >nul
)

:: Проверка .env файла
echo.
echo [5/6] ⚙️  Проверка конфигурации...
if not exist ".env" (
    echo ⚠️  Файл .env не найден, создаю базовый...
    echo NODE_ENV=development > .env
    echo PORT=3000 >> .env
    echo MONGODB_URI=mongodb://localhost:27017/psychology >> .env
    echo JWT_SECRET=your-secret-key-here >> .env
    echo ✅ Создан базовый .env файл
)

if not exist "backend\.env" (
    echo ⚠️  Файл backend\.env не найден, копирую конфигурацию...
    copy .env backend\.env >nul
    echo ✅ Скопирован backend\.env файл
)

echo ✅ Конфигурация проверена

:: Запуск серверов
echo.
echo [6/6] 🚀 Запуск серверов...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🔥 СЕРВЕРЫ ЗАПУСКАЮТСЯ
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🖥️  Backend API:     http://localhost:3000
echo 🌐 Frontend Web:    http://localhost:5000
echo 📊 Статус API:      http://localhost:3000/api/status
echo 🔐 Авторизация:     http://localhost:3000/auth
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 💡 Советы:
echo   • Ctrl+C для остановки серверов
echo   • F5 для обновления страницы в браузере
echo   • Alt+Tab для переключения между окнами
echo.
echo 🔄 Автоперезапуск включен для разработки
echo ⏱️  Время запуска: %time%
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: Запуск с помощью concurrently
call npm run dev

:: Если серверы остановились
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   ⏹️  СЕРВЕРЫ ОСТАНОВЛЕНЫ
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 Статистика сессии:
echo   • Время работы: %time%
echo   • Режим: Development
echo   • Статус: Завершен
echo.
echo 💡 Для повторного запуска выполните этот файл снова
echo.
pause 