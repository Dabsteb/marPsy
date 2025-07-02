// Интерактивные функции для психологического кабинета

// Глобальные переменные
let currentQuizStep = 1;
const totalQuizSteps = 4;

// Система переключения тем (как в примере - простая и надежная)
function setTheme(theme) {
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
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeButton = document.getElementById('theme-toggle-button');
    
    if (htmlElement.classList.contains('dark')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
    
    // Добавляем эффект при нажатии
    if (themeButton) {
        themeButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeButton.style.transform = '';
        }, 150);
    }
}

// Инициализация темы при загрузке
function initThemeSystem() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light'); // Тема по умолчанию
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
    
    // Инициализируем звезды
    initStarRating();
    
    // Инициализируем чат
    initChatSystem();
    
    // Обработчики событий
    const themeToggleButton = document.getElementById('theme-toggle-button');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
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

// ===== СИСТЕМА ЧАТА И УВЕДОМЛЕНИЙ =====

let unreadMessagesCount = 0;
let chatOpen = false;
let userId = 'user_' + Math.random().toString(36).substr(2, 9);
let userName = 'Клиент';

// Открытие/закрытие чата
function toggleChat() {
    const chatSidebar = document.getElementById('chat-sidebar');
    const chatButton = document.getElementById('chat-notification-button');
    
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatSidebar.classList.add('open');
        // Сбрасываем счетчик при открытии
        unreadMessagesCount = 0;
        updateNotificationBadge();
        scrollChatToBottom();
    } else {
        chatSidebar.classList.remove('open');
    }
    
    // Анимация кнопки
    if (chatButton) {
        chatButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            chatButton.style.transform = '';
        }, 150);
    }
}

function closeChat() {
    const chatSidebar = document.getElementById('chat-sidebar');
    chatSidebar.classList.remove('open');
    chatOpen = false;
}

// Обновление счетчика уведомлений
function updateNotificationBadge() {
    const badge = document.getElementById('chat-notification-badge');
    if (badge) {
        if (unreadMessagesCount > 0) {
            badge.textContent = unreadMessagesCount > 99 ? '99+' : unreadMessagesCount;
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }
}

// Отображение сообщения
function displayChatMessage(message, isOwn = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message-bubble ${isOwn ? 'message-self' : 'message-other'}`;
    
    const currentTime = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        ${!isOwn ? '<div class="message-info">Марина Чикаидзе • Психолог</div>' : ''}
        <div class="message-text">${message}</div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollChatToBottom();
    
    // Увеличиваем счетчик если чат закрыт и сообщение не наше
    if (!chatOpen && !isOwn) {
        unreadMessagesCount++;
        updateNotificationBadge();
    }
}

// Прокрутка чата вниз
function scrollChatToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

// Отправка сообщения
function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (message === '') return;
    
    // Отображаем сообщение пользователя
    displayChatMessage(message, true);
    input.value = '';
    
    // Имитируем ответ психолога через 1-3 секунды
    const responses = [
        "Понимаю ваши чувства. Расскажите подробнее, что именно вас беспокоит? 🤗",
        "Это действительно важная тема. Как долго вы с этим сталкиваетесь?",
        "Спасибо, что поделились. Давайте разберем эту ситуацию вместе.",
        "Я вижу, что это для вас значимо. Какие эмоции вы испытываете?",
        "Хорошо, что вы обратились за помощью. Это первый шаг к решению! 💪",
        "Интересная ситуация. А как вы сами видите возможные пути решения?",
        "Давайте попробуем посмотреть на это с другой стороны...",
        "Я готова помочь вам в этом. Хотели бы записаться на полноценную консультацию? 📅"
    ];
    
    setTimeout(() => {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        displayChatMessage(randomResponse, false);
        
        // Показываем уведомление если чат закрыт
        if (!chatOpen) {
            showToast('<i class="fas fa-comments"></i> Новое сообщение от психолога', 'success');
        }
    }, 1000 + Math.random() * 2000);
}

// Инициализация чата
function initChatSystem() {
    const chatButton = document.getElementById('chat-notification-button');
    const closeChatButton = document.getElementById('close-chat-button');
    const sendButton = document.getElementById('chat-send-button');
    const chatInput = document.getElementById('chat-message-input');
    
    // События
    if (chatButton) {
        chatButton.addEventListener('click', toggleChat);
    }
    
    if (closeChatButton) {
        closeChatButton.addEventListener('click', closeChat);
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Закрытие чата при клике вне его
    document.addEventListener('click', (e) => {
        const chatSidebar = document.getElementById('chat-sidebar');
        const chatButton = document.getElementById('chat-notification-button');
        
        if (chatSidebar && chatButton && 
            !chatSidebar.contains(e.target) && 
            !chatButton.contains(e.target) && 
            chatOpen) {
            closeChat();
        }
    });
    
    // Имитация активности психолога
    setTimeout(() => {
        if (unreadMessagesCount === 0) {
            displayChatMessage("Если у вас есть вопросы - пишите! Я онлайн и готова помочь 😊", false);
        }
    }, 8000);
    
    // Дополнительные советы через случайные интервалы
    setTimeout(() => {
        if (unreadMessagesCount === 0) {
            displayChatMessage("💡 Совет дня: Выделите 5 минут на глубокое дыхание - это поможет снизить стресс", false);
        }
    }, 20000);
    
    setTimeout(() => {
        if (unreadMessagesCount === 0) {
            displayChatMessage("📖 Помните: каждый маленький шаг к психологическому здоровью важен!", false);
        }
    }, 45000);
}

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
window.toggleChat = toggleChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage; 