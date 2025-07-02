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

// CORS - разрешаем все домены для Railway и кастомный домен
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? function(origin, callback) {
            // Разрешаем Railway домены, кастомный домен и localhost
            const allowedOrigins = [
                /^https:\/\/.*\.up\.railway\.app$/,
                /^https:\/\/.*\.railway\.app$/,
                'https://psychologyforeveryday.com',
                'http://psychologyforeveryday.com',
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
            'http://localhost:5000',   // Main site
            'https://psychologyforeveryday.com',
            'http://psychologyforeveryday.com'
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

// API маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/admin', require('./routes/admin'));

// Базовый API endpoint для проверки
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API сервер работает',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
    });
});

// Health check endpoint для frontend
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Psychology Cabinet API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '2.0.0'
    });
});

// Contact form submission endpoint (дублируем для совместимости)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, service, message } = req.body;
        
        // Validation
        if (!name || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: 'Обязательные поля: имя, телефон, тип консультации'
            });
        }

        // Phone validation (simple)
        const phoneRegex = /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат номера телефона'
            });
        }

        // Email validation (if provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неверный формат email'
                });
            }
        }

        // Create contact record
        const contactData = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            service,
            message: message ? message.trim() : null,
            status: 'new',
            createdAt: new Date(),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };

        // Save to database using Mongoose
        try {
            const Contact = require('./models/Contact');
            const savedContact = await Contact.create(contactData);
            
            console.log('📧 Новая заявка сохранена:', {
                id: savedContact._id,
                name: contactData.name,
                phone: contactData.phone,
                service: contactData.service
            });

            // Send notifications
            await sendNotificationEmail(contactData);
            sendWebSocketNotification(app.locals.wsServer, contactData);

        } catch (dbError) {
            console.error('Database error:', dbError);
            // Continue without database if it fails
        }

        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                timestamp: contactData.createdAt,
                whatsappUrl: generateWhatsAppUrl(contactData)
            }
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Попробуйте еще раз или свяжитесь с нами напрямую.'
        });
    }
});

// Get contacts statistics for admin
app.get('/api/contacts/stats', async (req, res) => {
    try {
        const Contact = require('./models/Contact');
        
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Contact.countDocuments();
        const today = await Contact.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        res.json({
            success: true,
            data: {
                total,
                today,
                byStatus: stats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики'
        });
    }
});

// API endpoint для получения отзывов
app.get('/api/reviews', async (req, res) => {
    try {
        const Review = require('./models/Review');
        const { featured = false, limit = 10 } = req.query;
        
        let query = featured === 'true' ? Review.getFeatured() : Review.getApproved();
        const reviews = await query.limit(parseInt(limit));
        
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения отзывов'
        });
    }
});

// API endpoint для создания отзыва
app.post('/api/reviews', async (req, res) => {
    try {
        const Review = require('./models/Review');
        const { name, email, rating, title, text, service, isAnonymous } = req.body;
        
        // Валидация
        if (!name || !rating || !text || !service) {
            return res.status(400).json({
                success: false,
                message: 'Обязательные поля: имя, оценка, текст отзыва, услуга'
            });
        }
        
        const reviewData = {
            name: name.trim(),
            email: email ? email.trim() : null,
            rating: parseInt(rating),
            title: title ? title.trim() : null,
            text: text.trim(),
            service,
            isAnonymous: Boolean(isAnonymous),
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };
        
        const savedReview = await Review.create(reviewData);
        
        console.log('⭐ Новый отзыв создан:', {
            id: savedReview._id,
            name: reviewData.name,
            rating: reviewData.rating,
            service: reviewData.service
        });
        
        res.status(201).json({
            success: true,
            message: 'Спасибо за отзыв! Он будет опубликован после модерации.',
            data: { id: savedReview._id }
        });
        
    } catch (error) {
        console.error('Review creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка создания отзыва'
        });
    }
});

// Helper functions
async function sendNotificationEmail(contactData) {
    // Log notification (implement email service later)
    console.log('📧 Email уведомление:', {
        to: 'marina.psy1968@gmail.com',
        subject: `Новая заявка от ${contactData.name}`,
        text: `
Имя: ${contactData.name}
Телефон: ${contactData.phone}
Email: ${contactData.email || 'не указан'}
Услуга: ${contactData.service}
Сообщение: ${contactData.message || 'не указано'}
Время: ${contactData.createdAt.toLocaleString('ru-RU')}
        `.trim()
    });
}

function sendWebSocketNotification(wsServer, contactData) {
    if (wsServer) {
        wsServer.broadcast({
            type: 'new_contact',
            data: {
                name: contactData.name,
                service: contactData.service,
                timestamp: contactData.createdAt
            }
        });
    }
}

function generateWhatsAppUrl(contactData) {
    const phone = '79197448522'; // Marina's phone
    const message = `Новая заявка с сайта:
Имя: ${contactData.name}
Телефон: ${contactData.phone}
Email: ${contactData.email || 'не указан'}
Услуга: ${contactData.service}
${contactData.message ? `Сообщение: ${contactData.message}` : ''}`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

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
    console.log(`📱 Live site: https://backend-production-2c24.up.railway.app`);
});

module.exports = { app, server, wsServer }; 