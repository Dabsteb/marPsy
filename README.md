# 🧠 Персональный Психологический Кабинет Марины Чикаидзе

Современный веб-сайт с админ-панелью для персонального психологического кабинета. Полнофункциональная система с чистой архитектурой и интуитивно понятной структурой папок.

## 📁 Структура Проекта

```
Psychology/
├── backend/                    # 🗂️ Серверная часть (Node.js + Express)
│   ├── src/
│   │   ├── controllers/        # Обработчики API запросов
│   │   ├── models/            # Модели данных (Mongoose)
│   │   ├── routes/            # API маршруты
│   │   ├── services/          # Бизнес-логика
│   │   ├── utils/             # Вспомогательные функции
│   │   ├── config/            # Конфигурация (.env файлы)
│   │   └── middleware/        # Промежуточное ПО
│   ├── database/              # Миграции и сиды БД
│   ├── scripts/               # Административные скрипты
│   └── tests/                 # Тесты backend
│
├── frontend/                   # 🗂️ Клиентская часть
│   ├── main-site/             # Основной сайт для пользователей
│   │   ├── public/            # Статические файлы
│   │   ├── src/
│   │   │   ├── assets/        # Изображения, шрифты
│   │   │   ├── components/    # Переиспользуемые компоненты
│   │   │   ├── pages/         # Страницы сайта
│   │   │   ├── styles/        # CSS/SCSS файлы
│   │   │   └── utils/         # JS утилиты
│   │   └── tests/             # Тесты frontend
│   │
│   └── admin-panel/           # Административная панель
│       ├── public/            # Статические файлы админки
│       ├── src/               # Исходники админ-панели
│       └── tests/             # Тесты админки
│
├── docs/                      # 📚 Документация проекта
├── scripts/                   # 🔧 Вспомогательные скрипты
└── temp-backup/              # 🗑️ Временные резервные копии файлов
```

## 🚀 Быстрый Запуск

### 1. Установка Зависимостей

```bash
# Установить зависимости для всех частей проекта
npm run install:all

# Или по частям:
npm run install:backend
npm run install:frontend
```

### 2. Настройка Переменных Окружения

```bash
# Скопировать примеры и настроить:
cp backend/.env.example backend/.env
```

Отредактировать `backend/.env`:
```env
# База данных MongoDB
MONGODB_URI=mongodb://localhost:27017/marina-psychology
MONGODB_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/marina-psychology

# Порты
PORT=3000
FRONTEND_PORT=5000
ADMIN_PORT=5001

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth (Google, Яндекс)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Создание Администратора

```bash
# Создать первого администратора
cd backend && node scripts/create-admin.js
```

### 4. Запуск в Режиме Разработки

```bash
# Запустить все сервисы одновременно
npm run dev

# Или по отдельности:
npm run dev:backend    # http://localhost:3000
npm run dev:main-site  # http://localhost:5000  
npm run dev:admin      # http://localhost:5001
```

### 5. Продакшн Запуск

```bash
# Сборка проекта
npm run build

# Запуск в продакшн режиме
npm start
```

## 🛠️ Доступные Команды

### Корневые Команды (Монорепозиторий)

- `npm run install:all` - Установить зависимости везде
- `npm run dev` - Запуск всех сервисов в dev режиме
- `npm start` - Запуск всех сервисов в продакшн режиме
- `npm run build` - Сборка всех частей проекта
- `npm test` - Запуск всех тестов
- `npm run lint` - Проверка кода линтером
- `npm run clean` - Очистка node_modules и build папок

### Backend Команды

```bash
cd backend/
npm start      # Запуск сервера
npm run dev    # Запуск с nodemon
npm test       # Тесты
npm run lint   # Линтинг
```

### Frontend Команды

```bash
cd frontend/main-site/  # или cd frontend/admin-panel/
npm start      # Запуск dev сервера
npm run build  # Сборка для продакшн
npm test       # Тесты
npm run lint   # Линтинг
```

## 🌟 Основные Функции

### ✅ Готовые Функции

- **Адаптивный дизайн** - идеальная работа на всех устройствах
- **Система авторизации** - email/пароль + OAuth (Google, Яндекс)
- **Ультимативная админ-панель** - полное управление контентом
- **Real-time уведомления** - WebSocket для живых обновлений
- **Мониторинг системы** - отслеживание состояния сервера
- **Управление пользователями** - роли и права доступа
- **CMS система** - управление статьями, услугами, отзывами
- **Файловый менеджер** - загрузка и оптимизация изображений
- **SEO оптимизация** - meta теги, sitemap, robots.txt

### 🔧 В Разработке

- **Система онлайн-записи** - календарь и бронирование
- **Личный кабинет клиента** - история сессий, ресурсы
- **Библиотека ресурсов** - статьи, медитации, курсы
- **Платежная система** - интеграция с платежными провайдерами
- **Многоязычность** - поддержка нескольких языков

## 🔧 Технологический Стек

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (WebSocket)
- Passport.js (аутентификация)
- JWT токены
- Multer (загрузка файлов)
- Sharp (обработка изображений)

**Frontend:**
- Vanilla JavaScript (ES6+)
- CSS3 + Flexbox/Grid
- WebSocket клиент
- Responsive Design
- PWA ready

**DevOps & Tools:**
- Webpack (сборка)
- ESLint + Prettier (качество кода)
- Jest (тестирование)
- Nodemon (разработка)
- PM2 (продакшн)

## 📊 Админ-Панель

Доступ: `http://localhost:5001/admin`

**Возможности:**
- 📈 Dashboard с аналитикой в реальном времени
- 👥 Управление пользователями и ролями
- 📝 CMS для статей, услуг, FAQ
- 🔍 Мониторинг системы и логов
- 📧 Управление заявками и консультациями
- 🖼️ Файловый менеджер с оптимизацией
- ⚙️ Системные настройки

## 🔒 Безопасность

- ✅ Helmet.js для заголовков безопасности
- ✅ Rate limiting для API
- ✅ Валидация входных данных
- ✅ JWT токены с истечением
- ✅ Хеширование паролей (bcrypt)
- ✅ HTTPS готов (SSL сертификаты)
- ✅ CORS настроен

## 🚀 Деплой

### Готовность к продакшн:

1. **Настроить переменные окружения на сервере**
2. **Установить PM2:** `npm install -g pm2`
3. **Запустить:** `pm2 start backend/src/app.js --name marina-psychology`
4. **Настроить Nginx** для статики и проксирования
5. **Установить SSL сертификат** (Let's Encrypt)

## 📞 Поддержка

При возникновении проблем:

1. Проверить логи: `pm2 logs` или `npm run dev`
2. Проверить статус: `pm2 status`
3. Перезапустить: `pm2 restart marina-psychology`

## 📄 Лицензия

MIT License - свободное использование и модификация.

---

**Проект готов к запуску и дальнейшему развитию! 🎉** 