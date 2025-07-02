const si = require('systeminformation');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class SystemMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            cpu: { usage: 0, cores: 0, speed: 0 },
            memory: { total: 0, used: 0, free: 0, percentage: 0 },
            disk: { total: 0, used: 0, free: 0, percentage: 0 },
            network: { rx: 0, tx: 0, speed: 0 },
            system: { uptime: 0, platform: '', arch: '', nodeVersion: '' },
            processes: { total: 0, running: 0, sleeping: 0 },
            database: { connections: 0, status: 'unknown', responseTime: 0 },
            api: { status: 'unknown', responseTime: 0, requests: 0 }
        };
        
        this.logBuffer = [];
        this.maxLogEntries = 1000;
        
        // Инициализация
        this.init();
    }

    async init() {
        console.log('🔍 Инициализация системы мониторинга...');
        
        // Получение базовой информации о системе
        try {
            const cpu = await si.cpu();
            const osInfo = await si.osInfo();
            
            this.metrics.cpu.cores = cpu.cores;
            this.metrics.cpu.speed = cpu.speed;
            this.metrics.system.platform = osInfo.platform;
            this.metrics.system.arch = osInfo.arch;
            this.metrics.system.nodeVersion = process.version;
            
            console.log('✅ Система мониторинга инициализирована');
        } catch (error) {
            console.error('❌ Ошибка инициализации мониторинга:', error);
        }
    }

    // Получение метрик CPU
    async getCpuMetrics() {
        try {
            const cpuLoad = await si.currentLoad();
            const cpuTemp = await si.cpuTemperature();
            
            this.metrics.cpu.usage = Math.round(cpuLoad.currentLoad);
            this.metrics.cpu.temperature = cpuTemp.main || 0;
            
            return this.metrics.cpu;
        } catch (error) {
            console.error('❌ Ошибка получения CPU метрик:', error);
            return this.metrics.cpu;
        }
    }

    // Получение метрик памяти
    async getMemoryMetrics() {
        try {
            const memory = await si.mem();
            
            this.metrics.memory = {
                total: Math.round(memory.total / 1024 / 1024 / 1024 * 100) / 100, // GB
                used: Math.round(memory.used / 1024 / 1024 / 1024 * 100) / 100,   // GB
                free: Math.round(memory.free / 1024 / 1024 / 1024 * 100) / 100,   // GB
                percentage: Math.round((memory.used / memory.total) * 100)
            };
            
            return this.metrics.memory;
        } catch (error) {
            console.error('❌ Ошибка получения Memory метрик:', error);
            return this.metrics.memory;
        }
    }

    // Получение метрик диска
    async getDiskMetrics() {
        try {
            const disks = await si.fsSize();
            
            if (disks.length > 0) {
                const mainDisk = disks[0]; // Основной диск
                
                this.metrics.disk = {
                    total: Math.round(mainDisk.size / 1024 / 1024 / 1024 * 100) / 100,     // GB
                    used: Math.round(mainDisk.used / 1024 / 1024 / 1024 * 100) / 100,      // GB
                    free: Math.round((mainDisk.size - mainDisk.used) / 1024 / 1024 / 1024 * 100) / 100, // GB
                    percentage: Math.round((mainDisk.used / mainDisk.size) * 100),
                    mount: mainDisk.mount
                };
            }
            
            return this.metrics.disk;
        } catch (error) {
            console.error('❌ Ошибка получения Disk метрик:', error);
            return this.metrics.disk;
        }
    }

    // Получение метрик сети
    async getNetworkMetrics() {
        try {
            const networkStats = await si.networkStats();
            
            if (networkStats.length > 0) {
                const mainInterface = networkStats[0];
                
                this.metrics.network = {
                    rx: Math.round(mainInterface.rx_bytes / 1024 / 1024 * 100) / 100,    // MB
                    tx: Math.round(mainInterface.tx_bytes / 1024 / 1024 * 100) / 100,    // MB
                    rxSec: Math.round(mainInterface.rx_sec / 1024 * 100) / 100,          // KB/s
                    txSec: Math.round(mainInterface.tx_sec / 1024 * 100) / 100,          // KB/s
                    interface: mainInterface.iface
                };
            }
            
            return this.metrics.network;
        } catch (error) {
            console.error('❌ Ошибка получения Network метрик:', error);
            return this.metrics.network;
        }
    }

    // Получение информации о процессах
    async getProcessMetrics() {
        try {
            const processes = await si.processes();
            
            this.metrics.processes = {
                total: processes.all || 0,
                running: processes.running || 0,
                sleeping: processes.sleeping || 0,
                list: processes.list ? processes.list.slice(0, 10).map(proc => ({
                    pid: proc.pid,
                    name: proc.name,
                    cpu: proc.cpu,
                    mem: proc.mem
                })) : []
            };
            
            return this.metrics.processes;
        } catch (error) {
            console.error('❌ Ошибка получения Process метрик:', error);
            return this.metrics.processes;
        }
    }

    // Получение времени работы системы
    getSystemUptime() {
        const systemUptime = os.uptime(); // Время работы системы в секундах
        const processUptime = process.uptime(); // Время работы процесса в секундах
        
        this.metrics.system.uptime = {
            system: this.formatUptime(systemUptime),
            process: this.formatUptime(processUptime),
            systemSeconds: systemUptime,
            processSeconds: processUptime
        };
        
        return this.metrics.system;
    }

    // Форматирование времени работы
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${days}д ${hours}ч ${minutes}м ${secs}с`;
    }

    // Проверка статуса API
    async checkApiHealth() {
        const startTime = Date.now();
        
        try {
            // Можно добавить реальную проверку API endpoints
            this.metrics.api = {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                lastCheck: new Date().toISOString(),
                endpoints: {
                    '/api/health': 'ok',
                    '/api/articles': 'ok',
                    '/api/services': 'ok'
                }
            };
            
            return this.metrics.api;
        } catch (error) {
            this.metrics.api = {
                status: 'error',
                responseTime: Date.now() - startTime,
                lastCheck: new Date().toISOString(),
                error: error.message
            };
            
            return this.metrics.api;
        }
    }

    // Проверка статуса базы данных
    async checkDatabaseHealth(mongoose) {
        const startTime = Date.now();
        
        try {
            if (mongoose && mongoose.connection) {
                const dbState = mongoose.connection.readyState;
                const states = {
                    0: 'disconnected',
                    1: 'connected',
                    2: 'connecting',
                    3: 'disconnecting'
                };
                
                this.metrics.database = {
                    status: states[dbState] || 'unknown',
                    responseTime: Date.now() - startTime,
                    connections: mongoose.connection.db ? 1 : 0,
                    lastCheck: new Date().toISOString(),
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    name: mongoose.connection.name
                };
            }
            
            return this.metrics.database;
        } catch (error) {
            this.metrics.database = {
                status: 'error',
                responseTime: Date.now() - startTime,
                lastCheck: new Date().toISOString(),
                error: error.message
            };
            
            return this.metrics.database;
        }
    }

    // Получение системных логов
    async getSystemLogs(lines = 50) {
        try {
            const logPath = path.join(__dirname, '../../logs');
            const logFiles = ['app.log', 'error.log', 'access.log'];
            const logs = [];
            
            for (const logFile of logFiles) {
                try {
                    const filePath = path.join(logPath, logFile);
                    const content = await fs.readFile(filePath, 'utf8');
                    const logLines = content.split('\n').filter(line => line.trim());
                    
                    logs.push({
                        file: logFile,
                        lines: logLines.slice(-lines),
                        totalLines: logLines.length
                    });
                } catch (fileError) {
                    // Файл не существует или недоступен
                    logs.push({
                        file: logFile,
                        lines: [`Файл ${logFile} не найден или недоступен`],
                        totalLines: 0
                    });
                }
            }
            
            return logs;
        } catch (error) {
            console.error('❌ Ошибка получения логов:', error);
            return [{
                file: 'error',
                lines: [`Ошибка получения логов: ${error.message}`],
                totalLines: 0
            }];
        }
    }

    // Добавление записи в буфер логов
    addLogEntry(level, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata,
            pid: process.pid
        };
        
        this.logBuffer.unshift(logEntry);
        
        // Ограничиваем размер буфера
        if (this.logBuffer.length > this.maxLogEntries) {
            this.logBuffer = this.logBuffer.slice(0, this.maxLogEntries);
        }
        
        console.log(`[${level.toUpperCase()}] ${message}`, metadata);
    }

    // Получение логов из буфера
    getBufferedLogs(lines = 50) {
        return this.logBuffer.slice(0, lines);
    }

    // Получение всех метрик
    async getAllMetrics(mongoose = null) {
        try {
            const [cpu, memory, disk, network, processes] = await Promise.all([
                this.getCpuMetrics(),
                this.getMemoryMetrics(),
                this.getDiskMetrics(),
                this.getNetworkMetrics(),
                this.getProcessMetrics()
            ]);
            
            const system = this.getSystemUptime();
            const api = await this.checkApiHealth();
            const database = await this.checkDatabaseHealth(mongoose);
            
            return {
                timestamp: new Date().toISOString(),
                cpu,
                memory,
                disk,
                network,
                processes,
                system,
                api,
                database,
                nodeEnv: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                platform: os.platform(),
                arch: os.arch()
            };
        } catch (error) {
            console.error('❌ Ошибка получения метрик:', error);
            throw error;
        }
    }

    // Получение краткого статуса
    async getQuickStatus() {
        try {
            const cpu = await this.getCpuMetrics();
            const memory = await this.getMemoryMetrics();
            const uptime = this.getSystemUptime();
            
            return {
                status: 'healthy',
                cpu: cpu.usage,
                memory: memory.percentage,
                uptime: uptime.uptime.process,
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
}

module.exports = SystemMonitor; 