// Интерактивные функции для психологического кабинета

// Глобальные переменные
let currentQuizStep = 1;
const totalQuizSteps = 4;

// Переключение темы
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
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
    // Определяем начальную тему
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
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
    
    // Слушаем системные изменения темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
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