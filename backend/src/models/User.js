const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    // Основная информация
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            // Пароль обязателен только для обычной регистрации
            return !this.googleId && !this.yandexId && !this.vkId;
        },
        minlength: 6
    },
    
    // Профиль пользователя
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    
    // OAuth провайдеры
    googleId: {
        type: String,
        sparse: true
    },
    yandexId: {
        type: String,
        sparse: true
    },
    vkId: {
        type: String,
        sparse: true
    },
    
    // OAuth токены (для доступа к API провайдеров)
    googleAccessToken: String,
    googleRefreshToken: String,
    yandexAccessToken: String,
    yandexRefreshToken: String,
    vkAccessToken: String,
    
    // Статус аккаунта
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    
    // Роли и разрешения
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    
    // Настройки пользователя
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            showProfile: { type: Boolean, default: false },
            showEmail: { type: Boolean, default: false }
        }
    },
    
    // История входов
    lastLogin: Date,
    loginHistory: [{
        ip: String,
        userAgent: String,
        loginDate: { type: Date, default: Date.now },
        method: { type: String, enum: ['password', 'google', 'yandex', 'vk'] }
    }],
    
    // Токены для восстановления пароля
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Метаданные
    registrationMethod: {
        type: String,
        enum: ['standard', 'google', 'yandex', 'vk'],
        default: 'standard'
    },
    registrationIP: String,
    
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.googleAccessToken;
            delete ret.googleRefreshToken;
            delete ret.yandexAccessToken;
            delete ret.yandexRefreshToken;
            delete ret.vkAccessToken;
            delete ret.emailVerificationToken;
            delete ret.resetPasswordToken;
            return ret;
        }
    }
});

// Индексы для оптимизации
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ yandexId: 1 });
userSchema.index({ vkId: 1 });
userSchema.index({ isActive: 1 });

// Виртуальное поле для полного имени
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Виртуальное поле для инициалов
userSchema.virtual('initials').get(function() {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Middleware для хеширования пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для генерации JWT токена
userSchema.methods.generateAuthToken = function() {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Метод для генерации refresh токена
userSchema.methods.generateRefreshToken = function() {
    const payload = {
        id: this._id,
        type: 'refresh'
    };
    
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', {
        expiresIn: '30d'
    });
};

// Метод для добавления записи в историю входов
userSchema.methods.addLoginHistory = function(ip, userAgent, method) {
    this.loginHistory.unshift({
        ip,
        userAgent,
        method,
        loginDate: new Date()
    });
    
    // Ограничиваем историю последними 10 входами
    if (this.loginHistory.length > 10) {
        this.loginHistory = this.loginHistory.slice(0, 10);
    }
    
    this.lastLogin = new Date();
};

// Метод для привязки OAuth аккаунта
userSchema.methods.linkOAuthAccount = function(provider, oauthData) {
    switch (provider) {
        case 'google':
            this.googleId = oauthData.id;
            this.googleAccessToken = oauthData.accessToken;
            this.googleRefreshToken = oauthData.refreshToken;
            break;
        case 'yandex':
            this.yandexId = oauthData.id;
            this.yandexAccessToken = oauthData.accessToken;
            this.yandexRefreshToken = oauthData.refreshToken;
            break;
        case 'vk':
            this.vkId = oauthData.id;
            this.vkAccessToken = oauthData.accessToken;
            break;
    }
};

// Статический метод для поиска или создания пользователя через OAuth
userSchema.statics.findOrCreateOAuth = async function(provider, profile, accessToken, refreshToken) {
    const providerIdField = `${provider}Id`;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    // Сначала ищем по ID провайдера
    let user = await this.findOne({ [providerIdField]: profile.id });
    
    if (user) {
        // Обновляем токены
        user.linkOAuthAccount(provider, {
            id: profile.id,
            accessToken,
            refreshToken
        });
        await user.save();
        return user;
    }
    
    // Если не найден по ID, ищем по email
    if (email) {
        user = await this.findOne({ email });
        if (user) {
            // Привязываем OAuth к существующему аккаунту
            user.linkOAuthAccount(provider, {
                id: profile.id,
                accessToken,
                refreshToken
            });
            await user.save();
            return user;
        }
    }
    
    // Создаем нового пользователя
    const userData = {
        email: email || `${provider}_${profile.id}@noemail.local`,
        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Пользователь',
        lastName: profile.name?.familyName || profile.displayName?.split(' ')[1] || provider.charAt(0).toUpperCase() + provider.slice(1),
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        isEmailVerified: !!email,
        registrationMethod: provider,
        [providerIdField]: profile.id
    };
    
    user = new this(userData);
    user.linkOAuthAccount(provider, {
        id: profile.id,
        accessToken,
        refreshToken
    });
    
    await user.save();
    return user;
};

// Статический метод для поиска пользователя по email или телефону
userSchema.statics.findByEmailOrPhone = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { phone: identifier }
        ],
        isActive: true
    });
};

module.exports = mongoose.model('User', userSchema); 