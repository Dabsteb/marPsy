// Импорт стилей
import './styles/global.css';

// Конфигурация приложения
const APP_CONFIG = {
    name: 'Психологический кабинет',
    version: '2.0',
    apiUrl: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api'
};

// Основная функция инициализации
function initApp() {
    console.log(`🚀 ${APP_CONFIG.name} v${APP_CONFIG.version} запущен`);
    console.log(`🌐 API URL: ${APP_CONFIG.apiUrl}`);
    
    // Скрываем загрузчик
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Создаем основную структуру приложения
    renderMainApp();
    
    // Инициализируем навигацию
    initNavigation();
    
    console.log('✅ Приложение успешно инициализировано');
}

// Рендер основного приложения
function renderMainApp() {
    const root = document.getElementById('root');
    
    root.innerHTML = `
        <div class="app-wrapper">
            <!-- Навигация -->
            <nav class="navbar">
                <div class="container d-flex justify-between align-center">
                    <div class="nav-brand">
                        <h3 class="text-primary">🧠 Психологический кабинет</h3>
                    </div>
                    <div class="nav-menu" id="navMenu">
                        <a href="#home" class="nav-link active">Главная</a>
                        <a href="#services" class="nav-link">Услуги</a>
                        <a href="#about" class="nav-link">О нас</a>
                        <a href="#contact" class="nav-link">Контакты</a>
                    </div>
                    <button class="nav-toggle" id="navToggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

            <!-- Основной контент -->
            <main class="main-content" id="mainContent">
                <!-- Hero секция -->
                <section id="home" class="hero-section">
                    <div class="container text-center">
                        <div class="hero-content fade-in">
                            <h1 class="hero-title">Добро пожаловать в новый психологический кабинет</h1>
                            <p class="hero-subtitle">Профессиональная психологическая помощь и поддержка</p>
                            <div class="hero-actions mt-4">
                                <button class="btn btn-primary">Записаться на консультацию</button>
                                <button class="btn btn-outline">Узнать больше</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Секция услуг -->
                <section id="services" class="services-section">
                    <div class="container">
                        <h2 class="text-center mb-5">Наши услуги</h2>
                        <div class="services-grid">
                            <div class="card service-card">
                                <h3>Индивидуальные консультации</h3>
                                <p>Персональный подход к решению ваших психологических задач</p>
                                <button class="btn btn-outline">Подробнее</button>
                            </div>
                            <div class="card service-card">
                                <h3>Семейная терапия</h3>
                                <p>Работа с семейными отношениями и конфликтами</p>
                                <button class="btn btn-outline">Подробнее</button>
                            </div>
                            <div class="card service-card">
                                <h3>Групповые занятия</h3>
                                <p>Работа в группе для решения общих проблем</p>
                                <button class="btn btn-outline">Подробнее</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Секция контактов -->
                <section id="contact" class="contact-section bg-light">
                    <div class="container">
                        <h2 class="text-center mb-5">Связаться с нами</h2>
                        <div class="contact-content">
                            <div class="contact-info">
                                <h3>Контактная информация</h3>
                                <p>📧 Email: info@psychology-cabinet.ru</p>
                                <p>📞 Телефон: +7 (999) 123-45-67</p>
                                <p>📍 Адрес: г. Москва, ул. Примерная, д. 123</p>
                            </div>
                            <div class="contact-form">
                                <h3>Напишите нам</h3>
                                <form id="contactForm">
                                    <div class="form-group">
                                        <label class="form-label">Имя</label>
                                        <input type="text" class="form-control" id="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Сообщение</label>
                                        <textarea class="form-control" id="message" rows="4" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Отправить</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Футер -->
            <footer class="footer bg-dark text-light">
                <div class="container text-center">
                    <p>&copy; 2025 Психологический кабинет. Все права защищены.</p>
                    <p class="text-secondary">Создано с ❤️ для вашего благополучия</p>
                </div>
            </footer>
        </div>
    `;
}

// Инициализация навигации
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Мобильное меню
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Плавная прокрутка к секциям
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Обновляем активную ссылку
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Закрываем мобильное меню
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });

    // Обработка формы контактов
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Обработка формы контактов
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };
    
    console.log('📧 Отправка сообщения:', formData);
    
    // Здесь будет отправка на сервер
    alert('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.');
    
    // Очищаем форму
    e.target.reset();
}

// Добавляем CSS стили для компонентов
function addComponentStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .app-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .navbar {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 1rem 0;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
        }

        .nav-link {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: all 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
            background: #007bff;
            color: white !important;
            text-decoration: none;
        }

        .nav-toggle {
            display: none;
            flex-direction: column;
            background: none;
            border: none;
            cursor: pointer;
            gap: 4px;
        }

        .nav-toggle span {
            width: 25px;
            height: 3px;
            background: #333;
            transition: 0.3s;
        }

        .main-content {
            margin-top: 80px;
            flex: 1;
        }

        .hero-section {
            padding: 100px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .hero-title {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
        }

        .hero-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .services-section {
            padding: 80px 0;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .service-card {
            text-align: center;
        }

        .contact-section {
            padding: 80px 0;
        }

        .contact-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            max-width: 800px;
            margin: 0 auto;
        }

        .footer {
            padding: 2rem 0;
            margin-top: auto;
        }

        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 80px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 2rem;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .nav-menu.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }

            .nav-toggle {
                display: flex;
            }

            .hero-title {
                font-size: 2rem;
            }

            .hero-actions {
                flex-direction: column;
                align-items: center;
            }

            .contact-content {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    addComponentStyles();
    initApp();
});

// Экспорт для использования в других модулях
export { APP_CONFIG, initApp }; 