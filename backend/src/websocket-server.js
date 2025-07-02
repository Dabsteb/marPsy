const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class WebSocketServer {
    constructor(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.adminNamespace = this.io.of('/admin');
        this.connectedClients = new Map();
        this.realtimeStats = {
            activeUsers: 0,
            totalPageViews: 0,
            todayEvents: 0,
            onlineAdmins: 0
        };

        this.setupAdminNamespace();
        this.setupMainNamespace();
        
        console.log('🌐 WebSocket сервер инициализирован');
    }

    setupMainNamespace() {
        // Основное пространство имен для обычных пользователей
        this.io.on('connection', (socket) => {
            const clientId = uuidv4();
            const clientInfo = {
                id: clientId,
                ip: socket.handshake.address,
                userAgent: socket.handshake.headers['user-agent'],
                connectedAt: new Date(),
                currentPage: null,
                isActive: true
            };

            this.connectedClients.set(socket.id, clientInfo);
            this.realtimeStats.activeUsers++;

            console.log(`👤 Новый пользователь подключился: ${clientId} (${socket.handshake.address})`);
            
            // Уведомляем админов о новом подключении
            this.emitToAdmins('user_connected', {
                clientId,
                ip: clientInfo.ip,
                userAgent: clientInfo.userAgent,
                timestamp: new Date().toISOString()
            });

            // Обработка просмотра страниц
            socket.on('page_view', (data) => {
                this.handlePageView(socket, data);
            });

            // Обработка активности пользователя
            socket.on('user_activity', (data) => {
                this.handleUserActivity(socket, data);
            });

            // Отключение пользователя
            socket.on('disconnect', () => {
                this.handleUserDisconnect(socket);
            });
        });
    }

    setupAdminNamespace() {
        // Пространство имен для администраторов
        this.adminNamespace.on('connection', (socket) => {
            console.log('🔧 Администратор подключился к мониторингу');
            this.realtimeStats.onlineAdmins++;

            // Отправляем текущую статистику при подключении
            socket.emit('initial_stats', this.realtimeStats);
            socket.emit('connected_users', Array.from(this.connectedClients.values()));

            // Запрос статистики
            socket.on('request_stats', () => {
                socket.emit('stats_update', this.realtimeStats);
            });

            // Отключение админа
            socket.on('disconnect', () => {
                this.realtimeStats.onlineAdmins--;
                console.log('🔧 Администратор отключился от мониторинга');
            });
        });
    }

    handlePageView(socket, data) {
        const client = this.connectedClients.get(socket.id);
        if (client) {
            client.currentPage = data.page;
            client.lastActivity = new Date();
            this.realtimeStats.totalPageViews++;

            const pageViewEvent = {
                eventType: 'page_view',
                clientId: client.id,
                page: data.page,
                title: data.title,
                referrer: data.referrer,
                timestamp: new Date().toISOString(),
                userAgent: client.userAgent,
                ip: client.ip
            };

            console.log(`📄 Просмотр страницы: ${data.page} от ${client.id}`);
            
            // Отправляем админам
            this.emitToAdmins('page_view', pageViewEvent);
            this.emitToAdmins('stats_update', this.realtimeStats);
        }
    }

    handleUserActivity(socket, data) {
        const client = this.connectedClients.get(socket.id);
        if (client) {
            client.lastActivity = new Date();
            client.isActive = true;

            const activityEvent = {
                eventType: 'user_activity',
                clientId: client.id,
                activity: data.activity,
                details: data.details,
                timestamp: new Date().toISOString()
            };

            // Отправляем админам только важные активности
            if (['form_interaction', 'button_click', 'scroll_milestone'].includes(data.activity)) {
                this.emitToAdmins('user_activity', activityEvent);
            }
        }
    }

    handleUserDisconnect(socket) {
        const client = this.connectedClients.get(socket.id);
        if (client) {
            const sessionDuration = new Date() - client.connectedAt;
            
            console.log(`👋 Пользователь отключился: ${client.id} (сессия: ${Math.round(sessionDuration / 1000)}с)`);
            
            this.emitToAdmins('user_disconnected', {
                clientId: client.id,
                sessionDuration: Math.round(sessionDuration / 1000),
                pagesViewed: client.currentPage ? 1 : 0,
                timestamp: new Date().toISOString()
            });

            this.connectedClients.delete(socket.id);
            this.realtimeStats.activeUsers--;
            this.emitToAdmins('stats_update', this.realtimeStats);
        }
    }

    // Методы для эмиссии событий от бэкенда
    emitNewUserRegistration(userData) {
        const event = {
            eventType: 'new_user_registration',
            userId: userData.id,
            email: userData.email,
            registrationMethod: userData.method || 'standard',
            timestamp: new Date().toISOString()
        };

        console.log(`🎉 Новая регистрация: ${userData.email}`);
        this.realtimeStats.todayEvents++;
        this.emitToAdmins('new_user_registration', event);
        this.emitToAdmins('stats_update', this.realtimeStats);
    }

    emitNewConsultationRequest(requestData) {
        const event = {
            eventType: 'new_consultation_request',
            requestId: requestData.id,
            name: requestData.name,
            contactInfo: requestData.email || requestData.phone,
            serviceRequested: requestData.service,
            timestamp: new Date().toISOString()
        };

        console.log(`📅 Новая заявка на консультацию: ${requestData.name}`);
        this.realtimeStats.todayEvents++;
        this.emitToAdmins('new_consultation_request', event);
        this.emitToAdmins('stats_update', this.realtimeStats);
    }

    emitNewReviewSubmission(reviewData) {
        const event = {
            eventType: 'new_review_submission',
            reviewId: reviewData.id,
            authorName: reviewData.name,
            rating: reviewData.rating,
            reviewText: reviewData.text?.substring(0, 100) + '...',
            timestamp: new Date().toISOString()
        };

        console.log(`⭐ Новый отзыв: ${reviewData.name} (${reviewData.rating}/5)`);
        this.realtimeStats.todayEvents++;
        this.emitToAdmins('new_review_submission', event);
        this.emitToAdmins('stats_update', this.realtimeStats);
    }

    emitContactFormSubmission(formData) {
        const event = {
            eventType: 'contact_form_submission',
            formId: uuidv4(),
            name: formData.name,
            email: formData.email,
            message: formData.message?.substring(0, 100) + '...',
            timestamp: new Date().toISOString()
        };

        console.log(`📧 Новое сообщение: ${formData.name} (${formData.email})`);
        this.realtimeStats.todayEvents++;
        this.emitToAdmins('contact_form_submission', event);
        this.emitToAdmins('stats_update', this.realtimeStats);
    }

    // Вспомогательный метод для отправки сообщений админам
    emitToAdmins(eventName, data) {
        this.adminNamespace.emit(eventName, data);
        
        // Дублируем в консоль для разработчика
        console.log(`🔔 [ADMIN EVENT] ${eventName}:`, JSON.stringify(data, null, 2));
    }

    // Получение статистики
    getRealtimeStats() {
        return {
            ...this.realtimeStats,
            connectedUsers: Array.from(this.connectedClients.values()).map(client => ({
                id: client.id,
                ip: client.ip,
                currentPage: client.currentPage,
                connectedAt: client.connectedAt,
                lastActivity: client.lastActivity,
                isActive: client.isActive
            }))
        };
    }
}

module.exports = WebSocketServer; 