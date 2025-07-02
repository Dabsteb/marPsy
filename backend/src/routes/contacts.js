const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const { ensureRole } = require('../middleware/passport-config');

const router = express.Router();

// Валидаторы для контактной формы
const contactValidation = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Имя должно содержать от 2 до 100 символов'),
    body('phone').trim().isMobilePhone('ru-RU').withMessage('Неверный формат номера телефона'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Неверный формат email'),
    body('service').isIn(['individual', 'family', 'group', 'art', 'training', 'mindfulness']).withMessage('Неверный тип услуги'),
    body('message').optional().trim().isLength({ max: 1000 }).withMessage('Сообщение не должно превышать 1000 символов')
];

// POST /api/contacts - Отправка контактной формы
router.post('/', contactValidation, async (req, res) => {
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

        const { name, phone, email, service, message } = req.body;

        // Создание записи о контакте
        const contactData = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : null,
            service,
            message: message ? message.trim() : null,
            status: 'new',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        };

        const savedContact = await Contact.create(contactData);

        console.log('📧 Новая заявка сохранена:', {
            id: savedContact._id,
            name: contactData.name,
            phone: contactData.phone,
            service: contactData.service
        });

        // Отправка уведомлений через WebSocket
        if (req.app.locals.wsServer) {
            req.app.locals.wsServer.broadcast({
                type: 'new_contact',
                data: {
                    id: savedContact._id,
                    name: contactData.name,
                    service: contactData.service,
                    timestamp: savedContact.createdAt
                }
            });
        }

        // Генерация WhatsApp URL
        const whatsappUrl = generateWhatsAppUrl(contactData);

        res.status(201).json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            data: {
                id: savedContact._id,
                timestamp: savedContact.createdAt,
                whatsappUrl
            }
        });

    } catch (error) {
        console.error('Ошибка создания контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Произошла ошибка при отправке заявки. Попробуйте еще раз.'
        });
    }
});

// GET /api/contacts - Получение списка контактов (только для админов)
router.get('/', auth, ensureRole(['admin']), async (req, res) => {
    try {
        const { status, service, page = 1, limit = 20, search } = req.query;
        
        // Построение фильтра
        const filter = {};
        if (status) filter.status = status;
        if (service) filter.service = service;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Пагинация
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: {
                path: 'assignedTo updatedBy',
                select: 'firstName lastName email'
            }
        };

        const contacts = await Contact.paginate(filter, options);

        res.json({
            success: true,
            data: contacts
        });

    } catch (error) {
        console.error('Ошибка получения контактов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения контактов'
        });
    }
});

// GET /api/contacts/stats - Статистика контактов
router.get('/stats', auth, ensureRole(['admin']), async (req, res) => {
    try {
        const stats = await Contact.getStats();
        
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
                }, {}),
                recentContacts: await Contact.findRecent(7)
            }
        });

    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики'
        });
    }
});

// PUT /api/contacts/:id - Обновление контакта
router.put('/:id', auth, ensureRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, priority, scheduledDate } = req.body;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        // Обновление полей
        if (status) contact.status = status;
        if (notes) contact.notes = notes;
        if (priority) contact.priority = priority;
        if (scheduledDate) contact.scheduledDate = new Date(scheduledDate);
        contact.updatedBy = req.user.userId;

        await contact.save();

        res.json({
            success: true,
            message: 'Контакт успешно обновлен',
            data: contact
        });

    } catch (error) {
        console.error('Ошибка обновления контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления контакта'
        });
    }
});

// DELETE /api/contacts/:id - Удаление контакта
router.delete('/:id', auth, ensureRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        res.json({
            success: true,
            message: 'Контакт успешно удален'
        });

    } catch (error) {
        console.error('Ошибка удаления контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления контакта'
        });
    }
});

// Вспомогательная функция для генерации WhatsApp URL
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

module.exports = router; 