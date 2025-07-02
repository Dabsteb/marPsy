// Импорт стилей
import './styles/global.css';

// Современный JavaScript для психологического кабинета 2025

class PsychologyWebsite {
    constructor() {
        this.init();
    }

    init() {
        console.log('🧠 Психологический кабинет v2.0 загружен');
        
        this.initNavigation();
        this.initScrollEffects();
        this.initFormHandling();
        this.initAnimations();
        this.checkApiStatus();
        
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
        
        console.log('📧 Отправка формы:', data);
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳ Отправляем...</span>';
        submitBtn.disabled = true;

        try {
            // Имитация отправки (заменить на реальный API)
            const response = await this.submitToAPI(data);
            
            if (response.success) {
                this.showNotification('✅ Спасибо за заявку! Мы свяжемся с вами в ближайшее время.', 'success');
                form.reset();
                
                // Отправляем в WhatsApp (опционально)
                this.sendToWhatsApp(data);
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            this.showNotification('❌ Произошла ошибка. Попробуйте связаться с нами по телефону.', 'error');
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
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }

        return await response.json();
    }

    sendToWhatsApp(data) {
        const phone = '79197448522';
        const message = `Новая заявка с сайта:
Имя: ${data.name}
Телефон: ${data.phone}
Email: ${data.email || 'не указан'}
Услуга: ${data.service}
Сообщение: ${data.message || 'не указано'}`;
        
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        // Открываем в новом окне через небольшую задержку
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000);
    }

    addRealTimeValidation() {
        const inputs = document.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
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
            
            const statusElement = document.getElementById('api-status');
            if (statusElement) {
                if (data.success) {
                    statusElement.textContent = '🟢 Система работает';
                    statusElement.style.color = '#00D4AA';
                } else {
                    throw new Error('API недоступен');
                }
            }
        } catch (error) {
            const statusElement = document.getElementById('api-status');
            if (statusElement) {
                statusElement.textContent = '🟡 Техническое обслуживание';
                statusElement.style.color = '#FFB347';
            }
            console.warn('API недоступен:', error);
        }
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
}

// Инициализация
const website = new PsychologyWebsite();

// Экспорт для использования в других модулях
export default website;

console.log('✅ Современный психологический кабинет готов к работе!'); 