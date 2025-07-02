const mongoose = require('mongoose');

// Конфигурация базы данных
const databaseConfig = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/psychology_cabinet',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        }
    },
    collections: {
        users: 'users',
        contacts: 'contacts',
        sessions: 'sessions',
        reviews: 'reviews',
        appointments: 'appointments'
    }
};

// Подключение к базе данных
const connectDB = async () => {
    try {
        await mongoose.connect(databaseConfig.mongodb.uri, databaseConfig.mongodb.options);
        console.log('✅ Подключение к MongoDB установлено');
        
        // Настройка обработчиков событий
        mongoose.connection.on('error', (error) => {
            console.error('❌ Ошибка MongoDB:', error);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB отключена');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB переподключена');
        });
        
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    databaseConfig
}; 