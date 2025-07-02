const permission = (requiredPermission) => {
    return (req, res, next) => {
        // Проверяем, что пользователь аутентифицирован
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется аутентификация'
            });
        }

        const { role, permissions } = req.user;

        // Админы имеют все разрешения
        if (role === 'admin') {
            return next();
        }

        // Проверяем наличие конкретного разрешения
        if (!permissions || !permissions.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'Недостаточно прав доступа',
                required: requiredPermission
            });
        }

        next();
    };
};

module.exports = permission; 