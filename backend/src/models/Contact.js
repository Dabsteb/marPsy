const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный формат email']
    },
    service: {
        type: String,
        required: true,
        enum: [
            'individual',      // Индивидуальная консультация
            'family',          // Семейная терапия
            'group',           // Групповые занятия
            'art',             // Арт-терапия
            'training',        // Психологические тренинги
            'mindfulness'      // Mindfulness практики
        ]
    },
    message: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'scheduled', 'completed', 'cancelled'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    scheduledDate: {
        type: Date
    },
    completedDate: {
        type: Date
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
    source: {
        type: String,
        default: 'website',
        enum: ['website', 'phone', 'whatsapp', 'email', 'referral', 'other']
    },
    // Метаданные
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }]
}, {
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
    collection: 'contacts'
});

// Индексы для поиска и производительности
contactSchema.index({ phone: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ service: 1 });
contactSchema.index({ priority: 1 });

// Составной индекс для админ панели
contactSchema.index({ status: 1, createdAt: -1 });

// Виртуальные поля
contactSchema.virtual('serviceLabel').get(function() {
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

contactSchema.virtual('statusLabel').get(function() {
    const statusLabels = {
        new: 'Новая',
        contacted: 'Связались',
        scheduled: 'Запланирована',
        completed: 'Завершена',
        cancelled: 'Отменена'
    };
    return statusLabels[this.status] || this.status;
});

contactSchema.virtual('isOverdue').get(function() {
    if (this.scheduledDate && this.status === 'scheduled') {
        return new Date() > this.scheduledDate;
    }
    return false;
});

contactSchema.virtual('age').get(function() {
    const diffTime = Math.abs(new Date() - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Методы экземпляра
contactSchema.methods.markAsContacted = function(userId) {
    this.status = 'contacted';
    this.updatedBy = userId;
    return this.save();
};

contactSchema.methods.schedule = function(date, userId) {
    this.status = 'scheduled';
    this.scheduledDate = date;
    this.updatedBy = userId;
    return this.save();
};

contactSchema.methods.complete = function(userId) {
    this.status = 'completed';
    this.completedDate = new Date();
    this.updatedBy = userId;
    return this.save();
};

contactSchema.methods.cancel = function(reason, userId) {
    this.status = 'cancelled';
    this.notes = this.notes ? `${this.notes}\n\nОтменено: ${reason}` : `Отменено: ${reason}`;
    this.updatedBy = userId;
    return this.save();
};

contactSchema.methods.addNote = function(note, userId) {
    const timestamp = new Date().toLocaleString('ru-RU');
    const noteWithTimestamp = `[${timestamp}] ${note}`;
    this.notes = this.notes ? `${this.notes}\n${noteWithTimestamp}` : noteWithTimestamp;
    this.updatedBy = userId;
    return this.save();
};

// Статические методы
contactSchema.statics.findByPhone = function(phone) {
    return this.findOne({ phone: phone.replace(/\s/g, '') });
};

contactSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

contactSchema.statics.findRecent = function(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

contactSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

contactSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

// Пагинация (простая реализация без mongoose-paginate-v2)
contactSchema.statics.paginate = async function(filter = {}, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };
    
    const docs = await this.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(options.populate || '');
    
    const totalDocs = await this.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);
    
    return {
        docs,
        totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
    };
};

// Middleware для логирования изменений
contactSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        console.log(`📝 Статус заявки ${this._id} изменен на: ${this.status}`);
    }
    next();
});

// Экспорт модели
module.exports = mongoose.model('Contact', contactSchema); 