@echo off
chcp 65001 > nul
title 🚀 Обновление и деплой - Psychology Cabinet v2.0

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║               🚀 ОБНОВЛЕНИЕ И АВТОДЕПЛОЙ                         ║
echo ║         Психологический кабинет Марины Чикаидзе v2.0            ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 📦 Собираем фронтенд...
cd frontend/main-site
call npm run build
cd ../../

echo 🔄 Добавляем изменения в git...
git add .
git commit -m "🎨 Обновление дизайна и функций сайта психолога"

echo 🚀 Отправляем на Railway...
git push origin main

echo.
echo ✅ ГОТОВО! 
echo 🌐 Сайт будет обновлен на Railway в течение 1-2 минут
echo 📱 Ссылка: backend-production-2c24.up.railway.app
echo.
pause 