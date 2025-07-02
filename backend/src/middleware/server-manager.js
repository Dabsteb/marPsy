const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ServerManager {
    constructor(systemMonitor) {
        this.systemMonitor = systemMonitor;
        this.isRestarting = false;
        this.restartHistory = [];
        this.maxHistoryEntries = 100;
        
        // Определяем менеджер процессов
        this.processManager = this.detectProcessManager();
        
        console.log(`🔧 ServerManager инициализирован с ${this.processManager}`);
    }

    // Определение доступного менеджера процессов
    detectProcessManager() {
        if (process.env.PM2_HOME || process.env.PM_ID) {
            return 'pm2';
        }
        
        if (os.platform() === 'linux' && fs.access('/bin/systemctl')) {
            return 'systemd';
        }
        
        return 'node';
    }

    // Проверка прав доступа пользователя
    async checkUserPermissions(user) {
        const allowedRoles = ['admin', 'developer', 'super-admin'];
        
        if (!user || !allowedRoles.includes(user.role)) {
            throw new Error('Недостаточно прав для управления сервером');
        }
        
        return true;
    }

    // Логирование действий управления сервером
    logServerAction(action, user, result = 'success', error = null) {
        const logEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            result,
            error: error ? error.message : null,
            processManager: this.processManager,
            pid: process.pid,
            platform: os.platform(),
            nodeVersion: process.version
        };
        
        this.restartHistory.unshift(logEntry);
        
        // Ограничиваем размер истории
        if (this.restartHistory.length > this.maxHistoryEntries) {
            this.restartHistory = this.restartHistory.slice(0, this.maxHistoryEntries);
        }
        
        // Логируем в системный монитор
        if (this.systemMonitor) {
            this.systemMonitor.addLogEntry(
                result === 'success' ? 'info' : 'error',
                `Server ${action} by ${user.email}`,
                logEntry
            );
        }
        
        console.log(`🔧 [SERVER-MANAGER] ${action} by ${user.email}: ${result}`);
        
        return logEntry;
    }

    // Перезапуск сервера через PM2
    async restartWithPM2(user) {
        return new Promise((resolve, reject) => {
            const appName = process.env.PM2_APP_NAME || 'psychology-app';
            
            exec(`pm2 restart ${appName}`, (error, stdout, stderr) => {
                if (error) {
                    this.logServerAction('restart', user, 'error', error);
                    reject(new Error(`PM2 restart failed: ${error.message}`));
                    return;
                }
                
                this.logServerAction('restart', user, 'success');
                resolve({
                    method: 'pm2',
                    output: stdout,
                    message: 'Сервер успешно перезапущен через PM2'
                });
            });
        });
    }

    // Перезапуск через systemd
    async restartWithSystemd(user) {
        return new Promise((resolve, reject) => {
            const serviceName = process.env.SYSTEMD_SERVICE_NAME || 'psychology-app';
            
            exec(`sudo systemctl restart ${serviceName}`, (error, stdout, stderr) => {
                if (error) {
                    this.logServerAction('restart', user, 'error', error);
                    reject(new Error(`Systemd restart failed: ${error.message}`));
                    return;
                }
                
                this.logServerAction('restart', user, 'success');
                resolve({
                    method: 'systemd',
                    output: stdout,
                    message: 'Сервер успешно перезапущен через systemd'
                });
            });
        });
    }

    // Мягкий перезапуск Node.js процесса
    async restartNodeProcess(user) {
        return new Promise((resolve) => {
            this.logServerAction('restart', user, 'success');
            
            // Даем время на отправку ответа клиенту
            setTimeout(() => {
                console.log('🔄 Выполняется мягкий перезапуск Node.js процесса...');
                process.exit(0); // Процесс должен быть перезапущен менеджером процессов
            }, 1000);
            
            resolve({
                method: 'node-process',
                message: 'Инициирован мягкий перезапуск процесса'
            });
        });
    }

    // Основной метод перезапуска сервера
    async restartServer(user, options = {}) {
        try {
            // Проверка прав доступа
            await this.checkUserPermissions(user);
            
            // Проверка, не выполняется ли уже перезапуск
            if (this.isRestarting) {
                throw new Error('Перезапуск уже выполняется. Подождите завершения.');
            }
            
            this.isRestarting = true;
            
            console.log(`🔄 Начинается перезапуск сервера пользователем ${user.email}`);
            
            let result;
            
            // Выбираем метод перезапуска в зависимости от доступного менеджера процессов
            switch (this.processManager) {
                case 'pm2':
                    result = await this.restartWithPM2(user);
                    break;
                    
                case 'systemd':
                    result = await this.restartWithSystemd(user);
                    break;
                    
                default:
                    result = await this.restartNodeProcess(user);
                    break;
            }
            
            return {
                success: true,
                ...result,
                timestamp: new Date().toISOString(),
                user: user.email
            };
            
        } catch (error) {
            this.logServerAction('restart', user, 'error', error);
            throw error;
        } finally {
            this.isRestarting = false;
        }
    }

    // Остановка сервера (только для критических случаев)
    async stopServer(user, options = {}) {
        try {
            await this.checkUserPermissions(user);
            
            if (!options.forceConfirm) {
                throw new Error('Требуется подтверждение для остановки сервера');
            }
            
            console.log(`🛑 Остановка сервера пользователем ${user.email}`);
            
            let result;
            
            switch (this.processManager) {
                case 'pm2':
                    result = await this.stopWithPM2(user);
                    break;
                    
                case 'systemd':
                    result = await this.stopWithSystemd(user);
                    break;
                    
                default:
                    result = await this.stopNodeProcess(user);
                    break;
            }
            
            return {
                success: true,
                ...result,
                timestamp: new Date().toISOString(),
                user: user.email
            };
            
        } catch (error) {
            this.logServerAction('stop', user, 'error', error);
            throw error;
        }
    }

    // Остановка через PM2
    async stopWithPM2(user) {
        return new Promise((resolve, reject) => {
            const appName = process.env.PM2_APP_NAME || 'psychology-app';
            
            exec(`pm2 stop ${appName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`PM2 stop failed: ${error.message}`));
                    return;
                }
                
                this.logServerAction('stop', user, 'success');
                resolve({
                    method: 'pm2',
                    output: stdout,
                    message: 'Сервер остановлен через PM2'
                });
            });
        });
    }

    // Остановка через systemd
    async stopWithSystemd(user) {
        return new Promise((resolve, reject) => {
            const serviceName = process.env.SYSTEMD_SERVICE_NAME || 'psychology-app';
            
            exec(`sudo systemctl stop ${serviceName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Systemd stop failed: ${error.message}`));
                    return;
                }
                
                this.logServerAction('stop', user, 'success');
                resolve({
                    method: 'systemd',
                    output: stdout,
                    message: 'Сервер остановлен через systemd'
                });
            });
        });
    }

    // Остановка Node.js процесса
    async stopNodeProcess(user) {
        this.logServerAction('stop', user, 'success');
        
        setTimeout(() => {
            console.log('🛑 Остановка Node.js процесса...');
            process.exit(0);
        }, 1000);
        
        return {
            method: 'node-process',
            message: 'Процесс будет остановлен'
        };
    }

    // Получение статуса сервера
    async getServerStatus() {
        try {
            const metrics = this.systemMonitor ? await this.systemMonitor.getQuickStatus() : null;
            
            return {
                status: 'running',
                pid: process.pid,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                processManager: this.processManager,
                nodeVersion: process.version,
                platform: os.platform(),
                arch: os.arch(),
                isRestarting: this.isRestarting,
                metrics,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Получение истории действий
    getActionHistory(limit = 20) {
        return this.restartHistory.slice(0, limit);
    }

    // Проверка здоровья системы
    async performHealthCheck() {
        try {
            const checks = {
                memory: this.checkMemoryHealth(),
                disk: await this.checkDiskHealth(),
                database: await this.checkDatabaseConnection(),
                api: await this.checkAPIEndpoints()
            };
            
            const overallHealth = Object.values(checks).every(check => check.status === 'healthy');
            
            return {
                overall: overallHealth ? 'healthy' : 'warning',
                checks,
                timestamp: new Date().toISOString(),
                recommendations: this.generateRecommendations(checks)
            };
        } catch (error) {
            return {
                overall: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Проверка состояния памяти
    checkMemoryHealth() {
        const usage = process.memoryUsage();
        const totalMB = os.totalmem() / 1024 / 1024;
        const usedMB = usage.rss / 1024 / 1024;
        const percentage = (usedMB / totalMB) * 100;
        
        let status = 'healthy';
        if (percentage > 90) status = 'critical';
        else if (percentage > 75) status = 'warning';
        
        return {
            status,
            percentage: Math.round(percentage),
            used: Math.round(usedMB),
            total: Math.round(totalMB)
        };
    }

    // Проверка состояния диска
    async checkDiskHealth() {
        try {
            if (this.systemMonitor) {
                const diskMetrics = await this.systemMonitor.getDiskMetrics();
                
                let status = 'healthy';
                if (diskMetrics.percentage > 95) status = 'critical';
                else if (diskMetrics.percentage > 85) status = 'warning';
                
                return {
                    status,
                    ...diskMetrics
                };
            }
            
            return { status: 'unknown' };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    // Проверка подключения к базе данных
    async checkDatabaseConnection() {
        // Эта проверка будет выполнена через systemMonitor
        return { status: 'healthy' };
    }

    // Проверка API endpoints
    async checkAPIEndpoints() {
        // Базовая проверка - можно расширить
        return { status: 'healthy' };
    }

    // Генерация рекомендаций
    generateRecommendations(checks) {
        const recommendations = [];
        
        if (checks.memory.status === 'warning') {
            recommendations.push('Рассмотрите возможность увеличения RAM или оптимизации приложения');
        }
        
        if (checks.disk.status === 'warning') {
            recommendations.push('Освободите дисковое пространство или увеличьте размер диска');
        }
        
        return recommendations;
    }
}

module.exports = ServerManager; 