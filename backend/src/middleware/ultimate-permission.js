// Расширенная система разрешений для ультимативной админ-панели

const ROLE_PERMISSIONS = {
    admin: [
        // Все разрешения
        '*'
    ],
    editor: [
        // Контент
        'articles.*',
        'services.*',
        'faq.*',
        'media.*',
        
        // Аналитика (только чтение)
        'analytics.read',
        
        // Базовый мониторинг
        'monitoring.basic'
    ],
    moderator: [
        // Модерация
        'reviews.*',
        'comments.*',
        
        // Просмотр контента
        'articles.read',
        'services.read',
        'faq.read',
        
        // Базовая аналитика
        'analytics.read'
    ],
    developer: [
        // Разработка
        'development.*',
        'system.logs',
        'system.monitor',
        'system.cache',
        'system.backup',
        
        // Полный доступ к контенту
        'articles.*',
        'services.*',
        'faq.*',
        'media.*',
        
        // Аналитика
        'analytics.*',
        
        // Мониторинг
        'monitoring.*',
        
        // Enterprise разработка
        'development.containers',
        'development.deploy',
        'development.api',
        'development.database.admin'
    ],
    security_admin: [
        // Безопасность
        'security.*',
        'users.*',
        'system.logs',
        'system.monitor',
        
        // Аналитика безопасности
        'analytics.security',
        
        // Аудит
        'audit.*',
        
        // Enterprise безопасность
        'security.mfa',
        'security.biometric',
        'security.ai',
        'security.firewall',
        'security.penetration',
        'security.gdpr'
    ],
    content_manager: [
        // Управление контентом
        'articles.*',
        'services.*',
        'faq.*',
        'media.*',
        'reviews.moderate',
        
        // SEO
        'seo.*',
        
        // Базовая аналитика
        'analytics.content'
    ]
};

const PERMISSION_DESCRIPTIONS = {
    // Контент
    'articles.create': 'Создание статей',
    'articles.read': 'Просмотр статей',
    'articles.update': 'Редактирование статей',
    'articles.delete': 'Удаление статей',
    'articles.publish': 'Публикация статей',
    
    'services.create': 'Создание услуг',
    'services.read': 'Просмотр услуг',
    'services.update': 'Редактирование услуг',
    'services.delete': 'Удаление услуг',
    
    'reviews.create': 'Создание отзывов',
    'reviews.read': 'Просмотр отзывов',
    'reviews.update': 'Редактирование отзывов',
    'reviews.delete': 'Удаление отзывов',
    'reviews.moderate': 'Модерация отзывов',
    
    'faq.create': 'Создание FAQ',
    'faq.read': 'Просмотр FAQ',
    'faq.update': 'Редактирование FAQ',
    'faq.delete': 'Удаление FAQ',
    
    'media.upload': 'Загрузка медиа',
    'media.read': 'Просмотр медиа',
    'media.update': 'Редактирование медиа',
    'media.delete': 'Удаление медиа',
    'media.optimize': 'Оптимизация медиа',
    
    // Пользователи
    'users.create': 'Создание пользователей',
    'users.read': 'Просмотр пользователей',
    'users.update': 'Редактирование пользователей',
    'users.delete': 'Удаление пользователей',
    'users.roles': 'Управление ролями',
    'users.permissions': 'Управление разрешениями',
    
    // Аналитика
    'analytics.read': 'Просмотр аналитики',
    'analytics.export': 'Экспорт аналитики',
    'analytics.content': 'Аналитика контента',
    'analytics.users': 'Аналитика пользователей',
    'analytics.security': 'Аналитика безопасности',
    
    // Система
    'system.monitor': 'Мониторинг системы',
    'system.logs': 'Просмотр логов',
    'system.cache': 'Управление кэшем',
    'system.backup': 'Создание резервных копий',
    'system.restore': 'Восстановление из резервных копий',
    'system.deploy': 'Развертывание',
    'system.config': 'Настройка системы',
    
    // Разработка
    'development.code': 'Редактирование кода',
    'development.database': 'Управление базой данных',
    'development.api': 'Управление API',
    'development.debug': 'Отладка',
    'development.containers': 'Управление контейнерами',
    'development.deploy': 'Развертывание приложений',
    'development.database.admin': 'Администрирование базы данных',
    
    // Безопасность
    'security.audit': 'Аудит безопасности',
    'security.firewall': 'Управление файрволом',
    'security.ssl': 'Управление SSL',
    'security.backup': 'Безопасные резервные копии',
    'security.mfa': 'Управление многофакторной аутентификацией',
    'security.biometric': 'Управление биометрической аутентификацией',
    'security.ai': 'AI-мониторинг безопасности',
    'security.penetration': 'Тестирование на проникновение',
    'security.gdpr': 'Соответствие GDPR',
    
    // SEO
    'seo.meta': 'Управление мета-тегами',
    'seo.sitemap': 'Управление sitemap',
    'seo.robots': 'Управление robots.txt',
    'seo.analytics': 'SEO аналитика',
    
    // Мониторинг
    'monitoring.basic': 'Базовый мониторинг',
    'monitoring.advanced': 'Расширенный мониторинг',
    'monitoring.alerts': 'Настройка уведомлений',
    'monitoring.performance': 'Мониторинг производительности',
    
    // Аудит
    'audit.logs': 'Просмотр логов аудита',
    'audit.reports': 'Создание отчетов аудита',
    'audit.export': 'Экспорт данных аудита'
};

// Функция проверки разрешений
const ultimatePermission = (requiredPermission) => {
    return (req, res, next) => {
        // Проверяем, что пользователь аутентифицирован
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется аутентификация'
            });
        }

        const { role, permissions: customPermissions } = req.user;

        // Логируем попытку доступа для аудита
        logAccessAttempt(req.user, requiredPermission, req.ip, req.headers['user-agent']);

        // Админы имеют все разрешения
        if (role === 'admin') {
            return next();
        }

        // Получаем разрешения роли
        const rolePermissions = ROLE_PERMISSIONS[role] || [];
        
        // Объединяем с кастомными разрешениями пользователя
        const allPermissions = [...rolePermissions, ...(customPermissions || [])];

        // Проверяем наличие конкретного разрешения или wildcard
        const hasPermission = allPermissions.some(permission => {
            if (permission === '*') return true; // Полный доступ
            if (permission === requiredPermission) return true; // Точное совпадение
            
            // Проверка wildcard разрешений (например, articles.*)
            if (permission.endsWith('.*')) {
                const basePermission = permission.slice(0, -2);
                return requiredPermission.startsWith(basePermission + '.');
            }
            
            return false;
        });

        if (!hasPermission) {
            // Логируем отказ в доступе
            logAccessDenied(req.user, requiredPermission, req.ip);
            
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа',
                required: requiredPermission,
                description: PERMISSION_DESCRIPTIONS[requiredPermission] || 'Неизвестное разрешение'
            });
        }

        // Добавляем информацию о разрешениях в запрос
        req.permissions = {
            current: requiredPermission,
            all: allPermissions,
            role: role
        };

        next();
    };
};

// Функция для получения всех разрешений роли
const getRolePermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
};

// Функция для получения описания разрешения
const getPermissionDescription = (permission) => {
    return PERMISSION_DESCRIPTIONS[permission] || 'Описание недоступно';
};

// Функция для проверки, имеет ли пользователь разрешение
const hasPermission = (user, permission) => {
    if (!user) return false;
    
    const { role, permissions: customPermissions } = user;
    
    // Админы имеют все разрешения
    if (role === 'admin') return true;
    
    // Получаем разрешения роли
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    
    // Объединяем с кастомными разрешениями
    const allPermissions = [...rolePermissions, ...(customPermissions || [])];
    
    return allPermissions.some(perm => {
        if (perm === '*') return true;
        if (perm === permission) return true;
        if (perm.endsWith('.*')) {
            const basePermission = perm.slice(0, -2);
            return permission.startsWith(basePermission + '.');
        }
        return false;
    });
};

// Middleware для проверки множественных разрешений
const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется аутентификация'
            });
        }

        const hasAnyPermission = permissions.some(permission => 
            hasPermission(req.user, permission)
        );

        if (!hasAnyPermission) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа',
                required: permissions,
                description: 'Требуется одно из указанных разрешений'
            });
        }

        next();
    };
};

// Middleware для проверки всех разрешений
const requireAllPermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется аутентификация'
            });
        }

        const hasAllPermissions = permissions.every(permission => 
            hasPermission(req.user, permission)
        );

        if (!hasAllPermissions) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа',
                required: permissions,
                description: 'Требуются все указанные разрешения'
            });
        }

        next();
    };
};

// Функции логирования для аудита
function logAccessAttempt(user, permission, ip, userAgent) {
    console.log(`[AUDIT] Access attempt: ${user.email} trying to access ${permission} from ${ip}`);
    
    // Здесь можно добавить запись в базу данных или файл логов
    // await AuditLog.create({
    //     userId: user.id,
    //     action: 'access_attempt',
    //     resource: permission,
    //     ip: ip,
    //     userAgent: userAgent,
    //     timestamp: new Date()
    // });
}

function logAccessDenied(user, permission, ip) {
    console.log(`[AUDIT] Access denied: ${user.email} denied access to ${permission} from ${ip}`);
    
    // Здесь можно добавить запись в базу данных или файл логов
    // await AuditLog.create({
    //     userId: user.id,
    //     action: 'access_denied',
    //     resource: permission,
    //     ip: ip,
    //     timestamp: new Date()
    // });
}

// Экспорт
module.exports = {
    ultimatePermission,
    getRolePermissions,
    getPermissionDescription,
    hasPermission,
    requireAnyPermission,
    requireAllPermissions,
    ROLE_PERMISSIONS,
    PERMISSION_DESCRIPTIONS
}; 