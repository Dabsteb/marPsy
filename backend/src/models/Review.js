const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Основная информация
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный формат email']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    
    // Статус модерации
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'featured'],
        default: 'pending'
    },
    
    // Связь с контактом/пользователем
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Услуга, к которой относится отзыв
    service: {
        type: String,
        enum: ['individual', 'family', 'group', 'art', 'training', 'mindfulness'],
        required: true
    },
    
    // Модерация
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    moderationNote: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Техническая информация
    ip: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    
    // Дополнительные поля
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    reportCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'reviews'
});

// Индексы
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ service: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Виртуальные поля
reviewSchema.virtual('serviceLabel').get(function() {
    const serviceLabels = {
        individual: 'Индивидуальная консультация',
        family: 'Семейная терапия',
        group: 'Групповые занятия',
        art: 'Арт-терапия',
        training: 'Психологические тренинги',
        mindfulness: 'Mindfulness практики'
    };
    return serviceLabels[this.service] || this.service;
});

reviewSchema.virtual('statusLabel').get(function() {
    const statusLabels = {
        pending: 'На модерации',
        approved: 'Одобрен',
        rejected: 'Отклонен',
        featured: 'Рекомендуемый'
    };
    return statusLabels[this.status] || this.status;
});

reviewSchema.virtual('displayName').get(function() {
    if (this.isAnonymous) {
        return 'Анонимный пользователь';
    }
    return this.name;
});

// Методы экземпляра
reviewSchema.methods.approve = function(userId) {
    this.status = 'approved';
    this.moderatedBy = userId;
    this.moderatedAt = new Date();
    return this.save();
};

reviewSchema.methods.reject = function(userId, note = '') {
    this.status = 'rejected';
    this.moderatedBy = userId;
    this.moderatedAt = new Date();
    this.moderationNote = note;
    return this.save();
};

reviewSchema.methods.feature = function(userId) {
    this.status = 'featured';
    this.moderatedBy = userId;
    this.moderatedAt = new Date();
    return this.save();
};

// Статические методы
reviewSchema.statics.getApproved = function() {
    return this.find({ status: { $in: ['approved', 'featured'] } })
        .sort({ createdAt: -1 });
};

reviewSchema.statics.getFeatured = function() {
    return this.find({ status: 'featured' })
        .sort({ createdAt: -1 });
};

reviewSchema.statics.getPending = function() {
    return this.find({ status: 'pending' })
        .sort({ createdAt: -1 });
};

reviewSchema.statics.getAverageRating = function() {
    return this.aggregate([
        {
            $match: { status: { $in: ['approved', 'featured'] } }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
};

reviewSchema.statics.getRatingDistribution = function() {
    return this.aggregate([
        {
            $match: { status: { $in: ['approved', 'featured'] } }
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);
};

module.exports = mongoose.model('Review', reviewSchema); 