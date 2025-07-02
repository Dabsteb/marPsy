// Интерактивные функции для психологического кабинета

// Глобальные переменные
let currentQuizStep = 1;
const totalQuizSteps = 4;

// Система переключения тем с красивыми анимациями
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Добавляем класс анимации перехода
    document.body.classList.add('theme-transition');
    
    // Создаем эффект переключения
    createThemeTransitionEffect(newTheme);
    
    // Небольшая задержка для плавности
    setTimeout(() => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Убираем класс анимации после завершения
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 400);
    }, 100);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    updateThemeIcon(theme, true);
}

function updateThemeIcon(theme, animated = false) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    
    // Анимация иконки
    if (animated) {
        themeIcon.style.transform = 'rotate(180deg) scale(0.8)';
        
        setTimeout(() => {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-moon';
                themeIcon.style.color = '#ffd43b';
            } else {
                themeIcon.className = 'fas fa-sun';
                themeIcon.style.color = '#ff6b35';
            }
            
            themeIcon.style.transform = 'rotate(0deg) scale(1)';
        }, 200);
    } else {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
            themeIcon.style.color = '#ffd43b';
        } else {
            themeIcon.className = 'fas fa-sun';
            themeIcon.style.color = '#ff6b35';
        }
    }
}

// Создание эффекта перехода темы
function createThemeTransitionEffect(newTheme) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '99999';
    overlay.style.opacity = '0';
    
    if (newTheme === 'dark') {
        overlay.style.background = 'radial-gradient(circle at center, rgba(102, 126, 234, 0.3) 0%, rgba(15, 15, 26, 0.8) 70%)';
        overlay.style.animation = 'darkThemeWave 0.6s ease-out forwards';
    } else {
        overlay.style.background = 'radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 70%)';
        overlay.style.animation = 'lightThemeWave 0.6s ease-out forwards';
    }
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 600);
}

// Инициализация системы тем
function initThemeSystem() {
    // Загрузка сохраненной темы или автоопределение
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    // Применение темы без анимации при загрузке
    setTheme(currentTheme);
    
    // Слушатель изменения системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
}

// Добавление CSS анимаций для эффектов перехода тем
function addThemeTransitionStyles() {
    if (!document.querySelector('#theme-transition-styles')) {
        const style = document.createElement('style');
        style.id = 'theme-transition-styles';
        style.textContent = `
            /* Анимации для переходов между темами */
            @keyframes darkThemeWave {
                0% {
                    opacity: 0;
                    transform: scale(0) rotate(0deg);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.2) rotate(180deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(2.5) rotate(360deg);
                }
            }
            
            @keyframes lightThemeWave {
                0% {
                    opacity: 0;
                    transform: scale(0);
                    filter: brightness(0.5);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.2);
                    filter: brightness(1.2);
                }
                100% {
                    opacity: 0;
                    transform: scale(2.5);
                    filter: brightness(2);
                }
            }
            
            /* Дополнительные анимации для элементов */
            .theme-transition .btn,
            .theme-transition .sidebar,
            .theme-transition .theme-toggle,
            .theme-transition .toast {
                animation: elementGlow 0.6s ease-in-out;
            }
            
            @keyframes elementGlow {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }
            
            /* Плавная анимация для иконок */
            .fas, .fab, .far {
                transition: transform 0.3s ease, color 0.3s ease, filter 0.3s ease !important;
            }
            
            /* Анимация свечения для темной темы */
            [data-theme="dark"] .btn:hover,
            [data-theme="dark"] .theme-toggle:hover {
                animation: darkGlow 2s ease-in-out infinite;
            }
            
            @keyframes darkGlow {
                0%, 100% { box-shadow: var(--shadow-elevated), var(--glow-button); }
                50% { box-shadow: var(--shadow-elevated), var(--glow-accent); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Боковое меню
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    sidebar.classList.toggle('open');
    sidebarToggle.classList.toggle('active');
    
    // Скрываем уведомления при открытии
    if (sidebar.classList.contains('open')) {
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = 'none';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarToggle) sidebarToggle.classList.remove('active');
}

// Анкета
function startQuiz() {
    currentQuizStep = 1;
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
    
    showQuizPrompt();
}

function showQuizPrompt() {
    const quizModal = document.getElementById('quiz-modal');
    if (quizModal) {
        quizModal.classList.add('active');
    }
}

function closeQuiz() {
    const quizModal = document.getElementById('quiz-modal');
    if (quizModal) {
        quizModal.classList.remove('active');
    }
}

function nextQuizStep() {
    if (currentQuizStep < totalQuizSteps) {
        // Валидация текущего шага
        if (!validateQuizStep(currentQuizStep)) {
            return;
        }
        
        // Скрываем текущий шаг
        document.querySelector(`[data-step="${currentQuizStep}"]`).style.display = 'none';
        
        currentQuizStep++;
        
        // Показываем следующий шаг
        document.querySelector(`[data-step="${currentQuizStep}"]`).style.display = 'block';
        
        // Обновляем кнопки
        document.getElementById('quiz-prev').style.display = 'inline-flex';
        
        if (currentQuizStep === totalQuizSteps) {
            document.getElementById('quiz-next').style.display = 'none';
            document.getElementById('quiz-submit').style.display = 'inline-flex';
        }
    }
}

function prevQuizStep() {
    if (currentQuizStep > 1) {
        // Скрываем текущий шаг
        document.querySelector(`[data-step="${currentQuizStep}"]`).style.display = 'none';
        
        currentQuizStep--;
        
        // Показываем предыдущий шаг
        document.querySelector(`[data-step="${currentQuizStep}"]`).style.display = 'block';
        
        // Обновляем кнопки
        if (currentQuizStep === 1) {
            document.getElementById('quiz-prev').style.display = 'none';
        }
        
        document.getElementById('quiz-next').style.display = 'inline-flex';
        document.getElementById('quiz-submit').style.display = 'none';
    }
}

function validateQuizStep(step) {
    const stepElement = document.querySelector(`[data-step="${step}"]`);
    const requiredFields = stepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (field.type === 'radio' || field.type === 'checkbox') {
            const name = field.name;
            const checkedBoxes = stepElement.querySelectorAll(`[name="${name}"]:checked`);
            if (checkedBoxes.length === 0) {
                showToast('<i class="fas fa-exclamation-circle"></i> Пожалуйста, заполните все обязательные поля', 'error');
                return false;
            }
        } else if (!field.value.trim()) {
            showToast('<i class="fas fa-exclamation-circle"></i> Пожалуйста, заполните все обязательные поля', 'error');
            field.focus();
            return false;
        }
    }
    return true;
}

async function submitQuiz() {
    if (!validateQuizStep(currentQuizStep)) {
        return;
    }
    
    const form = document.getElementById('client-quiz');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // Имитация отправки анкеты
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showToast(
            '<i class="fas fa-check-circle"></i> Анкета успешно отправлена! Мы свяжемся с вами в ближайшее время.',
            'success'
        );
        
        localStorage.setItem('quiz-completed', 'true');
        closeQuiz();
        
    } catch (error) {
        showToast('<i class="fas fa-times-circle"></i> Ошибка при отправке анкеты', 'error');
    }
}

// Система уведомлений
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button data-close-toast style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; margin-left: 10px;">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Добавляем обработчик закрытия
    toast.querySelector('[data-close-toast]').addEventListener('click', function() {
        toast.remove();
    });
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Звезды рейтинга
function initStarRating() {
    const starRating = document.getElementById('review-rating');
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('.star');
    const ratingValue = document.getElementById('rating-value');
    
    let currentRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            highlightStars(stars, index + 1);
        });
        
        star.addEventListener('mouseleave', () => {
            highlightStars(stars, currentRating);
        });
        
        star.addEventListener('click', () => {
            currentRating = index + 1;
            ratingValue.value = currentRating;
            highlightStars(stars, currentRating);
        });
    });
}

function highlightStars(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем систему тем
    initThemeSystem();
    
    // Добавляем CSS анимации для эффектов перехода
    addThemeTransitionStyles();
    
    // Инициализируем звезды
    initStarRating();
    
    // Обработчики событий
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Обработчики для анкеты
    const quizNext = document.getElementById('quiz-next');
    if (quizNext) {
        quizNext.addEventListener('click', nextQuizStep);
    }
    
    const quizPrev = document.getElementById('quiz-prev');
    if (quizPrev) {
        quizPrev.addEventListener('click', prevQuizStep);
    }
    
    const quizSubmit = document.getElementById('quiz-submit');
    if (quizSubmit) {
        quizSubmit.addEventListener('click', submitQuiz);
    }
    
    // Кнопки закрытия
    document.querySelectorAll('[data-close-quiz]').forEach(btn => {
        btn.addEventListener('click', closeQuiz);
    });
    
    document.querySelectorAll('[data-close-sidebar]').forEach(btn => {
        btn.addEventListener('click', closeSidebar);
    });
    
    document.querySelectorAll('[data-start-quiz]').forEach(btn => {
        btn.addEventListener('click', startQuiz);
    });
    
    // Закрыть боковое меню при клике вне его
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebar && sidebarToggle && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Форма отзывов
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
            
            const formData = new FormData(reviewForm);
            const data = Object.fromEntries(formData.entries());
            
            // Проверяем оценку
            if (data.rating === '0') {
                showToast('<i class="fas fa-star"></i> Пожалуйста, поставьте оценку', 'error');
                return;
            }
            
            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
            submitBtn.disabled = true;
            
            try {
                // Имитация отправки отзыва
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                showToast(
                    '<i class="fas fa-check-circle"></i> Отзыв успешно отправлен! Он будет опубликован после модерации.',
                    'success'
                );
                
                reviewForm.reset();
                document.getElementById('rating-value').value = '0';
                document.getElementById('review-counter').textContent = '0';
                highlightStars(document.querySelectorAll('#review-rating .star'), 0);
                
            } catch (error) {
                showToast('<i class="fas fa-times-circle"></i> Ошибка при отправке отзыва', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Показываем анкету для новых пользователей
    setTimeout(() => {
        if (!localStorage.getItem('quiz-completed')) {
            showQuizPrompt();
        }
    }, 3000);
});

// Экспорт для совместимости
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.startQuiz = startQuiz;
window.closeQuiz = closeQuiz;
window.nextQuizStep = nextQuizStep;
window.prevQuizStep = prevQuizStep;
window.submitQuiz = submitQuiz;
window.showToast = showToast; 