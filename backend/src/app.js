const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Импорт WebSocket сервера и Passport
const WebSocketServer = require('./websocket-server');
const { passport } = require('./middleware/passport-config');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Инициализация WebSocket сервера
const wsServer = new WebSocketServer(server);

// Сохраняем ссылку на WebSocket сервер в app.locals для доступа из маршрутов
app.locals.wsServer = wsServer;

// Middleware для безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'sha256-hU2XqNTQeKmua7NojdAiWeOlkzmKOpM5xJHXGjdb1Nw='"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:", "https:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

// Middleware для сжатия
app.use(compression());

// CORS - разрешаем все домены для Railway
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? function(origin, callback) {
            // Разрешаем Railway домены и localhost
            const allowedOrigins = [
                /^https:\/\/.*\.up\.railway\.app$/,
                /^https:\/\/.*\.railway\.app$/,
                'http://localhost:3000',
                'http://localhost:5000'
            ];
            
            if (!origin) return callback(null, true);
            
            const isAllowed = allowedOrigins.some(pattern => {
                if (pattern instanceof RegExp) {
                    return pattern.test(origin);
                }
                return pattern === origin;
            });
            
            callback(null, isAllowed);
        }
        : [
            'http://localhost:3000', 
            'http://127.0.0.1:3000',
            'http://localhost:5000'   // Main site
        ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: {
        error: 'Слишком много запросов с этого IP, попробуйте позже.'
    }
});
app.use('/api/', limiter);

// Парсинг JSON и URL-encoded данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology_cabinet'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Статические файлы - обновленный путь для Railway
app.use(express.static(path.join(__dirname, '../../frontend/main-site/public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology_cabinet', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Подключение к MongoDB установлено');
})
.catch((error) => {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
});

// Базовые API маршруты (только аутентификация)
app.use('/auth', require('./routes/auth'));

// Базовый API endpoint для проверки
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API сервер работает',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check для Railway
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/main-site/public/index.html'));
});

// Обработка всех остальных маршрутов (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/main-site/public/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('❌ Необработанная ошибка:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Внутренняя ошибка сервера' 
            : err.message
    });
});

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend сервер запущен на порту ${PORT}`);
    console.log(`🌐 WebSocket сервер активен`);
    console.log(`🔐 Система готова к разработке`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, wsServer }; 