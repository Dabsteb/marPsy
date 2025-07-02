const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для безопасности
app.use(helmet());
app.use(compression());
app.use(cors());

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB (если переменная установлена)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.log('❌ MongoDB ошибка:', err.message));
}

// Основные маршруты
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎉 Психологический кабинет запущен!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        message: 'API сервер работает',
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
