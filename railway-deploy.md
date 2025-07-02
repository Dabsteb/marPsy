# 🚀 Деплой на Railway - Пошаговая инструкция

## ✅ Что уже готово в вашем проекте:
- ✅ `railway.toml` - конфигурация Railway
- ✅ `package.json` - настройки проекта  
- ✅ `.gitignore` - исключения файлов
- ✅ Структура backend + frontend

## 📋 Шаги развертывания:

### 1️⃣ Подготовка
- Убедитесь что у вас есть аккаунт GitHub (если нет - создайте)

### 2️⃣ Загрузка на GitHub
**Вариант А - Через веб-интерфейс:**
1. Идите на [github.com](https://github.com)
2. Нажмите "New repository" 
3. Название: `psychology-cabinet-v2`
4. Выберите "Public"
5. Нажмите "Create repository"
6. Нажмите "uploading an existing file"
7. Перетащите всю папку проекта (кроме node_modules)
8. Commit: "Initial commit"

**Вариант Б - Если есть Git:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_USERNAME/psychology-cabinet-v2.git
git push -u origin main
```

### 3️⃣ Деплой на Railway
1. Идите на [railway.app](https://railway.app)
2. Нажмите "Login" → войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Найдите `psychology-cabinet-v2`
6. Нажмите "Deploy Now"

### 4️⃣ Настройка переменных окружения
В Railway проекте:
1. Перейдите на вкладку "Variables"
2. Добавьте:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `MONGODB_URI` = ваша строка подключения к MongoDB
   - `SESSION_SECRET` = любой случайный секрет

### 5️⃣ Результат
- ✅ Ваш сайт будет доступен по адресу: `ваш-проект.up.railway.app`
- ✅ Автоматические деплои при обновлении GitHub
- ✅ $5 бесплатных кредитов каждый месяц
- ✅ SSL сертификат (HTTPS)

## 💰 Стоимость:
- **Первые $5 в месяц - БЕСПЛАТНО**
- Дальше: ~$0.01 за каждый час работы
- Для обычного сайта: $2-5/месяц

## 🔧 Дополнительно:
- База данных MongoDB: добавьте в Railway (+$3/месяц)
- Кастомный домен: бесплатно
- Мониторинг: встроен

## 🆘 Если что-то не работает:
1. Проверьте логи в Railway Dashboard
2. Убедитесь что все зависимости установлены
3. Проверьте переменные окружения 