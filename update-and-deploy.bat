@echo off
echo 🚀 Обновление проекта для Railway...
echo.

:: Добавляем все изменения
"C:\Program Files\Git\bin\git.exe" add .

:: Создаем коммит
"C:\Program Files\Git\bin\git.exe" commit -m "🔄 Обновление проекта: синхронизация с GitHub и Railway"

:: Пушим в репозиторий (Railway автоматически подхватит)
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo ✅ Все изменения отправлены!
echo 🌐 Railway начнет автоматический деплой через несколько секунд
echo 📱 Проверьте статус на: https://railway.com/project/40dad6f6-e6c0-47ce-9d7e-ac4f5849d86f
echo.
pause 