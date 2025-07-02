const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // Клиент
    client: {
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
        }
    },
    
    // Связь с контактом
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact'
    },
    
    // Детали записи
    service: {
        type: String,
        required: true,
        enum: ['individual', 'family', 'group', 'art', 'training', 'mindfulness']
    },
    
    // Дата и время
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 50 // в минутах
    },
    timezone: {
        type: String,
        default: 'Europe/Moscow'
    },
    
    // Статус записи
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'],
        default: 'scheduled'
    },
    
    // Детали сессии
    sessionType: {
        type: String,
        enum: ['zoom', 'skype', 'whatsapp', 'phone', 'offline'],
        default: 'zoom'
    },
    sessionLink: {
        type: String,
        trim: true
    },
    sessionPassword: {
        type: String,
        trim: true
    },
    
    // Оплата
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'RUB'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'yandex_money', 'sber_pay', 'other']
    },
    
    // Заметки
    clientNotes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    privateNotes: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    sessionNotes: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    
    // Напоминания
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: {
        type: Date
    },
    
    // Отмена/перенос
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: String,
        enum: ['client', 'therapist', 'system']
    },
    
    // Предыдущая запись (для переносов)
    previousAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    
    // Административная информация
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Техническая информация
    ip: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'appointments'
});

// Индексы
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ 'client.phone': 1 });
appointmentSchema.index({ 'client.email': 1 });
appointmentSchema.index({ service: 1 });
appointmentSchema.index({ paymentStatus: 1 });
appointmentSchema.index({ contactId: 1 });

// Составные индексы
appointmentSchema.index({ status: 1, scheduledDate: 1 });
appointmentSchema.index({ scheduledDate: 1, status: 1 });

// Виртуальные поля
appointmentSchema.virtual('serviceLabel').get(function() {
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

appointmentSchema.virtual('statusLabel').get(function() {
    const statusLabels = {
        scheduled: 'Запланирована',
        confirmed: 'Подтверждена',
        completed: 'Завершена',
        cancelled: 'Отменена',
        no_show: 'Не явился',
        rescheduled: 'Перенесена'
    };
    return statusLabels[this.status] || this.status;
});

appointmentSchema.virtual('isUpcoming').get(function() {
    return this.scheduledDate > new Date() && ['scheduled', 'confirmed'].includes(this.status);
});

appointmentSchema.virtual('isPast').get(function() {
    return this.scheduledDate < new Date();
});

appointmentSchema.virtual('isToday').get(function() {
    const today = new Date();
    const appointmentDate = new Date(this.scheduledDate);
    return appointmentDate.toDateString() === today.toDateString();
});

// Методы экземпляра
appointmentSchema.methods.confirm = function(userId) {
    this.status = 'confirmed';
    this.updatedBy = userId;
    return this.save();
};

appointmentSchema.methods.complete = function(sessionNotes, userId) {
    this.status = 'completed';
    this.sessionNotes = sessionNotes;
    this.updatedBy = userId;
    return this.save();
};

appointmentSchema.methods.cancel = function(reason, cancelledBy, userId) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    this.updatedBy = userId;
    return this.save();
};

appointmentSchema.methods.reschedule = function(newDate, userId) {
    // Создаем новую запись
    const newAppointment = new this.constructor({
        ...this.toObject(),
        _id: undefined,
        scheduledDate: newDate,
        status: 'scheduled',
        previousAppointment: this._id,
        createdAt: undefined,
        updatedAt: undefined,
        updatedBy: userId
    });

    // Отмечаем текущую как перенесенную
    this.status = 'rescheduled';
    this.updatedBy = userId;

    return Promise.all([
        this.save(),
        newAppointment.save()
    ]);
};

appointmentSchema.methods.markNoShow = function(userId) {
    this.status = 'no_show';
    this.updatedBy = userId;
    return this.save();
};

// Статические методы
appointmentSchema.statics.getUpcoming = function(days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return this.find({
        scheduledDate: { $gte: new Date(), $lte: endDate },
        status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ scheduledDate: 1 });
};

appointmentSchema.statics.getToday = function() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    return this.find({
        scheduledDate: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ scheduledDate: 1 });
};

appointmentSchema.statics.findConflicts = function(date, duration = 50) {
    const startTime = new Date(date);
    const endTime = new Date(date.getTime() + duration * 60000);
    
    return this.find({
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
            {
                scheduledDate: { $gte: startTime, $lt: endTime }
            },
            {
                $expr: {
                    $and: [
                        { $lte: ['$scheduledDate', startTime] },
                        { $gt: [{ $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] }, startTime] }
                    ]
                }
            }
        ]
    });
};

module.exports = mongoose.model('Appointment', appointmentSchema); 