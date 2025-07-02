@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║   🧠 ПЕРСОНАЛЬНЫЙ ПСИХОЛОГИЧЕСКИЙ КАБИНЕТ МАРИНЫ ЧИКАИДЗЕ    ║
echo ║                                                               ║
echo ║              ЗАПУСК ПРОЕКТА (НОВАЯ СТРУКТУРА)                 ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:MENU
echo Выберите действие:
echo.
echo 1. 📦 Установить все зависимости
echo 2. 🚀 Запустить проект в режиме разработки
echo 3. 🏗️  Собрать проект для продакшн
echo 4. ⚡ Быстрый запуск (установка + dev запуск)
echo 5. 🧹 Очистка старых файлов
echo 6. 📖 Показать README
echo 7. ❌ Выход
echo.
set /p choice="Введите номер (1-7): "

if "%choice%"=="1" goto INSTALL
if "%choice%"=="2" goto DEV
if "%choice%"=="3" goto BUILD
if "%choice%"=="4" goto QUICK_START
if "%choice%"=="5" goto CLEANUP
if "%choice%"=="6" goto README
if "%choice%"=="7" goto EXIT
goto MENU

:INSTALL
echo.
echo 📦 Установка зависимостей для всех частей проекта...
echo.
call npm run install:all
echo.
echo ✅ Установка завершена!
pause
goto MENU

:DEV
echo.
echo 🚀 Запуск проекта в режиме разработки...
echo.
echo Backend:      http://localhost:3000
echo Main Site:    http://localhost:5000
echo Admin Panel:  http://localhost:5001
echo.
call npm run dev
pause
goto MENU

:BUILD
echo.
echo 🏗️ Сборка проекта для продакшн...
echo.
call npm run build
echo.
echo ✅ Сборка завершена!
pause
goto MENU

:QUICK_START
echo.
echo ⚡ БЫСТРЫЙ ЗАПУСК...
echo.
echo 📦 Устанавливаем зависимости...
call npm run install:all
echo.
echo 🚀 Запускаем проект...
echo.
echo Backend:      http://localhost:3000
echo Main Site:    http://localhost:5000  
echo Admin Panel:  http://localhost:5001
echo.
call npm run dev
pause
goto MENU

:CLEANUP
echo.
echo 🧹 Запуск очистки старых файлов...
if exist scripts\cleanup-old-structure.bat (
    call scripts\cleanup-old-structure.bat
) else (
    echo Скрипт очистки не найден!
)
pause
goto MENU

:README
echo.
echo 📖 Открытие README.md...
if exist README.md (
    start README.md
) else (
    echo README.md не найден!
)
pause
goto MENU

:EXIT
echo.
echo 👋 До свидания!
echo.
exit

:ERROR
echo.
echo ❌ Произошла ошибка! Проверьте настройки проекта.
pause
goto MENU 