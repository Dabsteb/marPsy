const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token = null;

        // Проверяем токен в заголовке Authorization
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // Проверяем токен в сессии
        if (!token && req.session && req.session.token) {
            token = req.session.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Токен доступа не предоставлен'
            });
        }

        // Верификация токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        
        // Проверяем существование пользователя
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Недействительный токен или пользователь деактивирован'
            });
        }

        // Добавляем пользователя в request
        req.user = {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Недействительный токен'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Токен истек'
            });
        }

        console.error('Ошибка аутентификации:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

module.exports = auth; 