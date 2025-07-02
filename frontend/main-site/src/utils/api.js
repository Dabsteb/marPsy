// Утилиты для работы с API

// Базовый URL для API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://backend-production-2c24.up.railway.app/api' 
    : 'http://localhost:3000/api';

// Класс для работы с HTTP запросами
class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // Обработка ответа
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: 'Произошла ошибка при обработке запроса'
            }));
            throw new Error(error.message || `HTTP Error: ${response.status}`);
        }
        return response.json();
    }

    // GET запрос
    async get(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    // POST запрос
    async post(endpoint, data = {}, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    // PUT запрос
    async put(endpoint, data = {}, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }

    // DELETE запрос
    async delete(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    // Загрузка файлов
    async uploadFile(endpoint, file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                body: formData,
                ...options
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
}

// Создаем экземпляр API клиента
const apiClient = new ApiClient();

// Экспортируем для использования
export { apiClient, ApiClient, API_BASE_URL };

// Быстрые методы для частых операций
export const api = {
    // Проверка статуса сервера
    checkStatus: () => apiClient.get('/status'),
    
    // Отправка контактной формы
    sendContactForm: (data) => apiClient.post('/contact', data),
    
    // Аутентификация
    auth: {
        login: (credentials) => apiClient.post('/auth/login', credentials),
        logout: () => apiClient.post('/auth/logout'),
        register: (userData) => apiClient.post('/auth/register', userData),
        getProfile: () => apiClient.get('/auth/profile')
    }
}; 