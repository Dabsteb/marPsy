@echo off
echo 🚀 Обновление проекта для Railway...
echo.

:: Добавляем все изменения
git add .

:: Создаем коммит
git commit -m "Fix Railway deployment configuration - ready for production"

:: Пушим в репозиторий (Railway автоматически подхватит)
git push origin main

echo.
echo ✅ Все изменения отправлены!
echo 🌐 Railway начнет автоматический деплой через несколько секунд
echo 📱 Проверьте статус на: https://railway.com/project/40dad6f6-e6c0-47ce-9d7e-ac4f5849d86f
echo.
pause 