// Импорт стилей
import './styles/global.css';

// Современный JavaScript для психологического кабинета 2025

class PsychologyWebsite {
    constructor() {
        this.init();
    }

    init() {
        console.log('Психологический кабинет v2.0 загружен');
        
        this.initNavigation();
        this.initScrollEffects();
        this.initFormHandling();
        this.initReviewForm();
        this.initThemeToggle();
        this.initSidebar();
        this.initStarRating();
        this.initQuiz();
        this.initAnimations();
        this.checkApiStatus();
        
        // Инициализация переменных
        this.currentQuizStep = 1;
        this.totalQuizSteps = 4;
        
        // Запускаем после загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        this.addScrollListeners();
        this.initIntersectionObserver();
        this.addInteractivity();
    }

    // Навигация
    initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Мобильное меню
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                this.toggleNavIcon(navToggle);
            });
        }

        // Плавная прокрутка
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollTo(href.substring(1));
                    
                    // Закрыть мобильное меню
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        this.toggleNavIcon(navToggle, false);
                    }
                }
            });
        });

        // Скролл навбара
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }
    }

    toggleNavIcon(toggle, forceClose = null) {
        if (!toggle) return;
        
        const spans = toggle.querySelectorAll('span');
        const isOpen = forceClose !== null ? !forceClose : toggle.classList.contains('active');
        
        if (isOpen) {
            toggle.classList.remove('active');
            spans[0].style.transform = 'rotate(0deg) translateY(0px)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0deg) translateY(0px)';
        } else {
            toggle.classList.add('active');
            spans[0].style.transform = 'rotate(45deg) translateY(7px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
        }
    }

    smoothScrollTo(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Учитываем высоту навбара
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Эффекты прокрутки
    initScrollEffects() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
    }

    initIntersectionObserver() {
        if (!window.IntersectionObserver) {
            // Fallback для старых браузеров
            document.querySelectorAll('.slide-up').forEach(el => {
                el.classList.add('visible');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Добавляем задержку для последовательной анимации
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }, 100);
                }
            });
        }, this.observerOptions);

        // Наблюдаем за элементами
        document.querySelectorAll('.slide-up, .service-card, .testimonial-card').forEach((el, index) => {
            el.dataset.delay = index * 100; // Задержка для каждого элемента
            observer.observe(el);
        });
    }

    // Обработка формы
    initFormHandling() {
        const contactForm = document.getElementById('contact-form');
        
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmission(contactForm);
            });
        }

        // Валидация в реальном времени
        this.addRealTimeValidation();
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Отправка формы:', data);
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Отправляем...</span>';
        submitBtn.disabled = true;

        try {
            // Имитация отправки (заменить на реальный API)
            const response = await this.submitToAPI(data);
            
            if (response.success) {
                this.showNotification('<i class="fas fa-check-circle"></i> Спасибо за заявку! Мы свяжемся с вами в ближайшее время.', 'success');
                form.reset();
                
                // Отправляем в WhatsApp (опционально)
                this.sendToWhatsApp(data);
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            this.showNotification('<i class="fas fa-times-circle"></i> Произошла ошибка. Попробуйте связаться с нами по телефону.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async submitToAPI(data) {
        // Реальный API запрос
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }

        return response.json();
    }

    sendToWhatsApp(data) {
        // Генерируем WhatsApp ссылку
        const phone = '79197448522';
        const message = `Заявка с сайта:
Имя: ${data.name}
Телефон: ${data.phone}
Услуга: ${data.service}
${data.email ? `Email: ${data.email}` : ''}
${data.message ? `Сообщение: ${data.message}` : ''}`;
        
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        
        // Открываем WhatsApp через 2 секунды
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000);
    }

    addRealTimeValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                // Убираем ошибку при вводе
                if (field.classList.contains('error')) {
                    field.classList.remove('error');
                    const errorElement = field.parentNode.querySelector('.field-error');
                    if (errorElement) {
                        errorElement.remove();
                    }
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Убираем предыдущие ошибки
            field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Валидация в зависимости от типа поля
        if (field.name === 'name' && value.length < 2) {
            isValid = false;
            errorMessage = 'Введите ваше имя';
        } else if (field.name === 'phone') {
            const phoneRegex = /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введите корректный номер телефона';
            }
        } else if (field.name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Введите корректный email';
            }
        } else if (field.name === 'service' && !value) {
            isValid = false;
            errorMessage = 'Выберите тип консультации';
        }

        if (!isValid) {
            field.classList.add('error');
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = errorMessage;
            errorElement.style.color = '#e53e3e';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorElement);
        }
        
        return isValid;
    }

    // Анимации и интерактивность
    initAnimations() {
        // Добавляем класс для анимаций после загрузки
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }

    addScrollListeners() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollProgress();
                    this.handleParallax();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxScroll) * 100;
        
        // Можно добавить индикатор прогресса
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    handleParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-shapes');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    addInteractivity() {
        // Анимация кнопок при наведении
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });

        // Анимация карточек услуг
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) rotateX(5deg)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // Проверка статуса API
    async checkApiStatus() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
                if (data.success) {
                console.log('API подключен:', data.message);
                
                // Показываем индикатор работы API
                this.showApiStatus(true);
                } else {
                throw new Error('API недоступно');
            }
        } catch (error) {
            console.warn('⚠️ API недоступно:', error.message);
            this.showApiStatus(false);
        }
    }

    showApiStatus(isConnected) {
        // Создаем индикатор статуса API
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'api-status';
        statusIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            transition: all 0.3s ease;
            ${isConnected 
                ? 'background: #48bb78; color: white;' 
                : 'background: #f56565; color: white;'
            }
        `;
        
        statusIndicator.innerHTML = isConnected 
            ? '<i class="fas fa-check-circle" style="color: green"></i> Онлайн' 
            : '<i class="fas fa-times-circle" style="color: red"></i> Офлайн';
        
        // Удаляем предыдущий индикатор
        const existing = document.getElementById('api-status');
        if (existing) {
            existing.remove();
        }
        
        document.body.appendChild(statusIndicator);
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            if (statusIndicator.parentNode) {
                statusIndicator.style.opacity = '0';
                setTimeout(() => {
                    statusIndicator.remove();
                }, 300);
            }
        }, 3000);
    }

    // Система уведомлений
    showNotification(message, type = 'success') {
        // Удаляем существующие уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Утилиты
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Переключатель темы
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle-button');
        const themeIcon = document.getElementById('theme-icon');
        
        if (!themeToggle || !themeIcon) return;
        
        // Определяем начальную тему
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        this.setTheme(initialTheme);
        
        themeToggle.addEventListener('click', () => {
            const htmlElement = document.documentElement;
            const isDark = htmlElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            this.setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
        
        // Слушаем системные изменения темы
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        const htmlElement = document.documentElement;
        const themeIcon = document.getElementById('theme-icon');
        
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        } else {
            htmlElement.classList.remove('dark');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
    }

    // Боковое меню
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (!sidebarToggle || !sidebar) return;
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarToggle.classList.toggle('active');
            
            // Скрываем уведомления при открытии
            if (sidebar.classList.contains('open')) {
                const badge = document.getElementById('notification-badge');
                if (badge) badge.style.display = 'none';
            }
        });
        
        // Закрыть при клике вне меню
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                sidebarToggle.classList.remove('active');
            }
        });
    }

    // Интерактивные звезды
    initStarRating() {
        const starRating = document.getElementById('review-rating');
        if (!starRating) return;
        
        const stars = starRating.querySelectorAll('.star');
        const ratingValue = document.getElementById('rating-value');
        
        let currentRating = 0;
        
        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(stars, index + 1);
            });
            
            star.addEventListener('mouseleave', () => {
                this.highlightStars(stars, currentRating);
            });
            
            star.addEventListener('click', () => {
                currentRating = index + 1;
                ratingValue.value = currentRating;
                this.highlightStars(stars, currentRating);
            });
        });
    }
    
    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Форма отзывов
    initReviewForm() {
        const reviewForm = document.getElementById('review-form');
        const reviewCounter = document.getElementById('review-counter');
        const reviewText = document.getElementById('review-text');
        
        if (reviewText && reviewCounter) {
            reviewText.addEventListener('input', () => {
                const length = reviewText.value.length;
                reviewCounter.textContent = length;
                
                if (length > 1000) {
                    reviewCounter.style.color = '#ff4757';
                } else {
                    reviewCounter.style.color = 'var(--text-secondary)';
                }
            });
        }
        
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleReviewSubmission(reviewForm);
            });
        }
    }
    
    async handleReviewSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Проверяем оценку
        if (data.rating === '0') {
            this.showNotification('<i class="fas fa-star"></i> Пожалуйста, поставьте оценку', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
        submitBtn.disabled = true;
        
        try {
            // Имитация отправки отзыва
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification(
                '<i class="fas fa-check-circle"></i> Отзыв успешно отправлен! Он будет опубликован после модерации.',
                'success'
            );
            
            form.reset();
            document.getElementById('rating-value').value = '0';
            document.getElementById('review-counter').textContent = '0';
            this.highlightStars(document.querySelectorAll('#review-rating .star'), 0);
            
        } catch (error) {
            this.showNotification('<i class="fas fa-times-circle"></i> Ошибка при отправке отзыва', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Анкета
    initQuiz() {
        const quizModal = document.getElementById('quiz-modal');
        if (!quizModal) return;
        
        // Показываем анкету для новых пользователей
        setTimeout(() => {
            if (!localStorage.getItem('quiz-completed')) {
                this.showQuizPrompt();
            }
        }, 5000);
    }
    
    showQuizPrompt() {
        const quizModal = document.getElementById('quiz-modal');
        if (quizModal) {
            quizModal.classList.add('active');
        }
    }
    
    nextQuizStep() {
        if (this.currentQuizStep < this.totalQuizSteps) {
            // Валидация текущего шага
            if (!this.validateQuizStep(this.currentQuizStep)) {
                return;
            }
            
            // Скрываем текущий шаг
            document.querySelector(`[data-step="${this.currentQuizStep}"]`).style.display = 'none';
            
            this.currentQuizStep++;
            
            // Показываем следующий шаг
            document.querySelector(`[data-step="${this.currentQuizStep}"]`).style.display = 'block';
            
            // Обновляем кнопки
            document.getElementById('quiz-prev').style.display = 'inline-flex';
            
            if (this.currentQuizStep === this.totalQuizSteps) {
                document.getElementById('quiz-next').style.display = 'none';
                document.getElementById('quiz-submit').style.display = 'inline-flex';
            }
        }
    }
    
    prevQuizStep() {
        if (this.currentQuizStep > 1) {
            // Скрываем текущий шаг
            document.querySelector(`[data-step="${this.currentQuizStep}"]`).style.display = 'none';
            
            this.currentQuizStep--;
            
            // Показываем предыдущий шаг
            document.querySelector(`[data-step="${this.currentQuizStep}"]`).style.display = 'block';
            
            // Обновляем кнопки
            if (this.currentQuizStep === 1) {
                document.getElementById('quiz-prev').style.display = 'none';
            }
            
            document.getElementById('quiz-next').style.display = 'inline-flex';
            document.getElementById('quiz-submit').style.display = 'none';
        }
    }
    
    validateQuizStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        const requiredFields = stepElement.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (field.type === 'radio' || field.type === 'checkbox') {
                const name = field.name;
                const checkedBoxes = stepElement.querySelectorAll(`[name="${name}"]:checked`);
                if (checkedBoxes.length === 0) {
                    this.showNotification('<i class="fas fa-exclamation-circle"></i> Пожалуйста, заполните все обязательные поля', 'error');
                    return false;
                }
            } else if (!field.value.trim()) {
                this.showNotification('<i class="fas fa-exclamation-circle"></i> Пожалуйста, заполните все обязательные поля', 'error');
                field.focus();
                return false;
            }
        }
        return true;
    }
    
    async submitQuiz() {
        if (!this.validateQuizStep(this.currentQuizStep)) {
            return;
        }
        
        const form = document.getElementById('client-quiz');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Имитация отправки анкеты
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification(
                '<i class="fas fa-check-circle"></i> Анкета успешно отправлена! Мы свяжемся с вами в ближайшее время.',
                'success'
            );
            
            localStorage.setItem('quiz-completed', 'true');
            this.closeQuiz();
            
        } catch (error) {
            this.showNotification('<i class="fas fa-times-circle"></i> Ошибка при отправке анкеты', 'error');
        }
    }
    
    closeQuiz() {
        const quizModal = document.getElementById('quiz-modal');
        if (quizModal) {
            quizModal.classList.remove('active');
        }
    }
    
    startQuiz() {
        this.currentQuizStep = 1;
        // Сброс формы
        document.getElementById('client-quiz').reset();
        // Показываем первый шаг
        document.querySelectorAll('.quiz-step').forEach((step, index) => {
            step.style.display = index === 0 ? 'block' : 'none';
        });
        // Сброс кнопок
        document.getElementById('quiz-prev').style.display = 'none';
        document.getElementById('quiz-next').style.display = 'inline-flex';
        document.getElementById('quiz-submit').style.display = 'none';
        
        this.showQuizPrompt();
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarToggle) sidebarToggle.classList.remove('active');
    }
}

// Глобальные функции для HTML
window.startQuiz = function() {
    if (window.website) {
        window.website.startQuiz();
    }
};

window.closeQuiz = function() {
    if (window.website) {
        window.website.closeQuiz();
    }
};

window.nextQuizStep = function() {
    if (window.website) {
        window.website.nextQuizStep();
    }
};

window.prevQuizStep = function() {
    if (window.website) {
        window.website.prevQuizStep();
    }
};

window.closeSidebar = function() {
    if (window.website) {
        window.website.closeSidebar();
    }
};

// Инициализация
const website = new PsychologyWebsite();
window.website = website;

// Экспорт для использования в других модулях
export default website;

console.log('Современный психологический кабинет готов к работе!'); 