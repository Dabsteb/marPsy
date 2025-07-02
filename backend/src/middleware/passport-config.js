const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Сериализация пользователя для сессии
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Десериализация пользователя из сессии
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Локальная стратегия (email + password)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        console.log(`🔐 Попытка входа: ${email}`);
        
        // Поиск пользователя по email
        const user = await User.findByEmailOrPhone(email);
        if (!user) {
            console.log(`❌ Пользователь не найден: ${email}`);
            return done(null, false, { message: 'Неверный email или пароль' });
        }

        // Проверка пароля
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            console.log(`❌ Неверный пароль для: ${email}`);
            return done(null, false, { message: 'Неверный email или пароль' });
        }

        // Проверка активности аккаунта
        if (!user.isActive) {
            console.log(`❌ Аккаунт деактивирован: ${email}`);
            return done(null, false, { message: 'Аккаунт деактивирован' });
        }

        // Обновление истории входов
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        user.addLoginHistory(clientIP, userAgent, 'password');
        await user.save();

        console.log(`✅ Успешный вход: ${email}`);
        
        // Эмиссия события через WebSocket
        if (req.app.locals.wsServer) {
            req.app.locals.wsServer.emitEvent('user_login', {
                userId: user._id,
                email: user.email,
                method: 'password',
                ip: clientIP,
                userAgent: userAgent,
                timestamp: new Date()
            });
        }

        return done(null, user);
    } catch (error) {
        console.error('❌ Ошибка локальной авторизации:', error);
        return done(error);
    }
}));

// Google OAuth стратегия (только если настроены переменные окружения)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(`🔐 Google OAuth попытка: ${profile.emails[0].value}`);
            
            // Поиск или создание пользователя
            const user = await User.findOrCreateOAuth('google', profile, accessToken, refreshToken);
            
            console.log(`✅ Успешный Google OAuth: ${user.email}`);
            
            return done(null, user);
        } catch (error) {
            console.error('❌ Ошибка Google OAuth:', error);
            return done(error);
        }
    }));
} else {
    console.log('⚠️ Google OAuth не настроен (отсутствуют GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)');
}

// JWT стратегия для API аутентификации
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
}, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);
        if (user && user.isActive) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

// Middleware для проверки аутентификации
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    
    // Для API запросов возвращаем JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    
    // Для обычных запросов перенаправляем на страницу входа
    res.redirect('/auth/login');
};

// Middleware для проверки роли
const ensureRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }

        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!userRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа'
            });
        }

        next();
    };
};

// Middleware для проверки JWT токена
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware для логирования попыток авторизации
const logAuthAttempt = (req, res, next) => {
    const { email } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    console.log(`🔍 Попытка авторизации: ${email} с IP: ${clientIP}`);
    
    // Эмиссия события через WebSocket
    if (req.app.locals.wsServer) {
        req.app.locals.wsServer.emitEvent('auth_attempt', {
            email,
            ip: clientIP,
            userAgent,
            timestamp: new Date()
        });
    }
    
    next();
};

module.exports = {
    passport,
    ensureAuthenticated,
    ensureRole,
    authenticateJWT,
    logAuthAttempt
}; 