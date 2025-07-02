const express = require('express');
const auth = require('../middleware/auth');
const { ensureRole } = require('../middleware/passport-config');
const Contact = require('../models/Contact');
const User = require('../models/User');

const router = express.Router();

// Middleware для проверки прав администратора
router.use(auth);
router.use(ensureRole(['admin']));

// GET /api/admin/dashboard - Данные для дашборда
router.get('/dashboard', async (req, res) => {
    try {
        // Общая статистика
        const totalContacts = await Contact.countDocuments();
        const totalUsers = await User.countDocuments();
        
        // Статистика за сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayContacts = await Contact.countDocuments({
            createdAt: { $gte: today }
        });

        // Статистика за неделю
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekContacts = await Contact.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Статистика по статусам
        const statusStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Статистика по услугам
        const serviceStats = await Contact.aggregate([
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Последние контакты
        const recentContacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('assignedTo', 'firstName lastName');

        // Системная информация
        const systemInfo = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
        };

        res.json({
            success: true,
            data: {
                stats: {
                    totalContacts,
                    totalUsers,
                    todayContacts,
                    weekContacts,
                    statusStats: statusStats.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    serviceStats: serviceStats.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {})
                },
                recentContacts,
                systemInfo
            }
        });

    } catch (error) {
        console.error('Ошибка получения данных дашборда:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения данных дашборда'
        });
    }
});

// GET /api/admin/contacts - Управление контактами
router.get('/contacts', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            service, 
            priority,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Построение фильтра
        const filter = {};
        if (status) filter.status = status;
        if (service) filter.service = service;
        if (priority) filter.priority = priority;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Опции пагинации
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
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

// GET /api/admin/users - Управление пользователями
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        // Построение фильтра
        const filter = {};
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password -googleAccessToken -googleRefreshToken -yandexAccessToken -yandexRefreshToken -vkAccessToken')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalUsers = await User.countDocuments(filter);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / parseInt(limit)),
                    totalUsers,
                    hasNext: parseInt(page) * parseInt(limit) < totalUsers,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения пользователей'
        });
    }
});

// POST /api/admin/contacts/:id/assign - Назначение контакта
router.post('/contacts/:id/assign', async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        contact.assignedTo = assignedTo;
        contact.updatedBy = req.user.userId;
        await contact.save();

        res.json({
            success: true,
            message: 'Контакт успешно назначен',
            data: contact
        });

    } catch (error) {
        console.error('Ошибка назначения контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка назначения контакта'
        });
    }
});

// POST /api/admin/contacts/:id/notes - Добавление заметки
router.post('/contacts/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note || note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Заметка не может быть пустой'
            });
        }

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Контакт не найден'
            });
        }

        await contact.addNote(note.trim(), req.user.userId);

        res.json({
            success: true,
            message: 'Заметка добавлена',
            data: contact
        });

    } catch (error) {
        console.error('Ошибка добавления заметки:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка добавления заметки'
        });
    }
});

// GET /api/admin/analytics - Аналитика
router.get('/analytics', async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Контакты по дням
        const dailyContacts = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Контакты по услугам
        const serviceAnalytics = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Конверсия по статусам
        const conversionAnalytics = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: days,
                dailyContacts,
                serviceAnalytics,
                conversionAnalytics
            }
        });

    } catch (error) {
        console.error('Ошибка получения аналитики:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка получения аналитики'
        });
    }
});

module.exports = router; 