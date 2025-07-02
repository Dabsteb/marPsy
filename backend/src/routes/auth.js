const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { passport, logAuthAttempt } = require('../middleware/passport-config');

const router = express.Router();

// Валидаторы
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];

const registerValidation = [
    body('username').isLength({ min: 3, max: 30 }).trim().withMessage('Имя пользователя должно содержать от 3 до 30 символов'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('firstName').optional().isLength({ max: 50 }).trim(),
    body('lastName').optional().isLength({ max: 50 }).trim()
];

// Генерация JWT токена
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
    );
};

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Поиск пользователя
        const user = await User.findByEmailOrPhone(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверка активности пользователя
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Аккаунт деактивирован'
            });
        }

        // Проверка пароля
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Обновление данных о входе
        user.lastLogin = new Date();
        await user.save();

        // Генерация токена
        const token = generateToken(user._id);

        // Сохранение в сессии
        req.session.userId = user._id;
        req.session.token = token;

        res.json({
            success: true,
            message: 'Успешный вход',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                initials: user.initials,
                avatar: user.avatar
            },
            token
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// POST /api/auth/register - ОТКЛЮЧЕНО ДЛЯ БЕТА-ТЕСТИРОВАНИЯ
router.post('/register-disabled', [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
    body('firstName').trim().isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Фамилия должна содержать минимум 2 символа'),
    body('phone').optional().isMobilePhone().withMessage('Введите корректный номер телефона')
], async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

        // Проверка существования пользователя
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Создание нового пользователя
        const user = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            registrationIP: clientIP,
            registrationMethod: 'standard'
        });

        await user.save();

        // Генерация токенов
        const authToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        console.log(`✅ Новый пользователь зарегистрирован: ${email}`);

        // Эмиссия события через WebSocket
        if (req.app.locals.wsServer) {
            req.app.locals.wsServer.emitEvent('new_user_registration', {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                registrationMethod: 'standard',
                timestamp: new Date()
            });
        }

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            data: {
                user: user.toJSON(),
                tokens: {
                    accessToken: authToken,
                    refreshToken: refreshToken
                }
            }
        });

    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// POST /auth/register - Заблокировано для бета-тестирования
router.post('/register', (req, res) => {
    res.status(403).json({
        success: false,
        message: 'Регистрация временно недоступна. Система находится в режиме бета-тестирования.',
        betaMode: true
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Ошибка при выходе'
            });
        }

        res.clearCookie('connect.sid');
        res.json({
            success: true,
            message: 'Успешный выход'
        });
    });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден или деактивирован'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    avatar: user.avatar,
                    permissions: user.permissions,
                    lastLogin: user.lastLogin,
                    preferences: user.preferences
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// PUT /api/auth/profile
router.put('/profile', auth, [
    body('firstName').optional().isLength({ max: 50 }).trim(),
    body('lastName').optional().isLength({ max: 50 }).trim(),
    body('preferences.theme').optional().isIn(['light', 'dark']),
    body('preferences.language').optional().isIn(['ru', 'en']),
    body('preferences.notificationsEmail').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const { firstName, lastName, preferences } = req.body;

        // Обновление данных
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }

        await user.save();

        res.json({
            success: true,
            message: 'Профиль обновлен',
            data: { user }
        });

    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// POST /api/auth/change-password
router.post('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Проверка текущего пароля
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Неверный текущий пароль'
            });
        }

        // Обновление пароля
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });

    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
});

// Дублирующий роут удален - используется основной роут выше

// Google OAuth - инициация
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

// Google OAuth - callback
router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/auth/login?error=oauth_failed' 
    }),
    async (req, res) => {
        try {
            // Генерация токенов
            const authToken = req.user.generateAuthToken();
            const refreshToken = req.user.generateRefreshToken();

            // Обновление истории входов
            const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
            const userAgent = req.get('User-Agent') || 'unknown';
            req.user.addLoginHistory(clientIP, userAgent, 'google');
            await req.user.save();

            console.log(`✅ Google OAuth успешен: ${req.user.email}`);

            // Эмиссия события через WebSocket
            if (req.app.locals.wsServer) {
                req.app.locals.wsServer.emitEvent('user_login', {
                    userId: req.user._id,
                    email: req.user.email,
                    method: 'google',
                    ip: clientIP,
                    userAgent: userAgent,
                    timestamp: new Date()
                });
            }

            // Перенаправление с токенами в URL (для фронтенда)
            const redirectUrl = `/auth/success?token=${authToken}&refresh=${refreshToken}`;
            res.redirect(redirectUrl);

        } catch (error) {
            console.error('❌ Ошибка Google OAuth callback:', error);
            res.redirect('/auth/login?error=oauth_callback_failed');
        }
    }
);

// Обновление токена
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token не предоставлен'
            });
        }

        // Верификация refresh токена
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

        if (decoded.type !== 'refresh') {
            return res.status(400).json({
                success: false,
                message: 'Неверный тип токена'
            });
        }

        // Поиск пользователя
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден или деактивирован'
            });
        }

        // Генерация новых токенов
        const newAuthToken = user.generateAuthToken();
        const newRefreshToken = user.generateRefreshToken();

        res.json({
            success: true,
            message: 'Токены обновлены',
            data: {
                tokens: {
                    accessToken: newAuthToken,
                    refreshToken: newRefreshToken
                }
            }
        });

    } catch (error) {
        console.error('❌ Ошибка обновления токена:', error);
        res.status(401).json({
            success: false,
            message: 'Неверный или истекший refresh token'
        });
    }
});

// Страница успешной авторизации (для OAuth редиректа)
router.get('/success', (req, res) => {
    const { token, refresh } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Авторизация успешна</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 500px; margin: 0 auto; }
                .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
                .token-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success">✅ Авторизация успешна!</div>
                <p>Вы успешно вошли в систему через OAuth.</p>
                
                <div class="token-info">
                    <strong>Access Token:</strong><br>
                    <small>${token}</small>
                </div>
                
                <div class="token-info">
                    <strong>Refresh Token:</strong><br>
                    <small>${refresh}</small>
                </div>
                
                <p>
                    <a href="/" class="btn">Перейти на главную</a>
                    <a href="/admin" class="btn">Админ-панель</a>
                </p>
                
                <script>
                    // Сохраняем токены в localStorage для использования фронтендом
                    localStorage.setItem('accessToken', '${token}');
                    localStorage.setItem('refreshToken', '${refresh}');
                    
                    // Автоматическое перенаправление через 5 секунд
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 5000);
                </script>
            </div>
        </body>
        </html>
    `);
});

module.exports = router; 