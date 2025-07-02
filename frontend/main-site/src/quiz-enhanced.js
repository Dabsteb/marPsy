// Улучшенная анкета для подбора психолога
class EnhancedQuiz {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 7;
        this.quizData = {
            supportFor: '',
            reasonForSupport: '',
            availableDays: [],
            goals: [],
            age: '',
            urgency: '',
            consultationFormat: ''
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateStepIndicator();
        this.setupThemeDetection();
    }
    
    setupThemeDetection() {
        // Автоматическое определение темы
        if (document.documentElement.classList.contains('dark')) {
            document.body.classList.add('dark-theme');
        }
        
        // Отслеживание изменений темы
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    document.body.classList.toggle('dark-theme', isDark);
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    bindEvents() {
        // Навигация
        document.getElementById('prevBtn').addEventListener('click', () => this.goToPrevStep());
        document.getElementById('nextBtn').addEventListener('click', () => this.goToNextStep());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitQuiz());
        
        // Опции выбора
        document.querySelectorAll('.option-base').forEach(option => {
            option.addEventListener('click', (e) => this.handleOptionClick(e));
        });
        
        // Текстовое поле
        const textarea = document.getElementById('reasonForSupport');
        if (textarea) {
            textarea.addEventListener('input', () => this.checkNextButtonValidity());
            textarea.addEventListener('focus', () => this.addTextareaFocusEffect());
            textarea.addEventListener('blur', () => this.removeTextareaFocusEffect());
        }
        
        // Перезапуск анкеты
        document.getElementById('startNewQuizBtn')?.addEventListener('click', () => this.resetQuiz());
        
        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }
    
    handleOptionClick(e) {
        const option = e.currentTarget;
        const input = option.querySelector('input');
        
        if (input.type === 'radio') {
            // Радио кнопки - только одна может быть выбрана
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(radio => {
                radio.closest('.option-base').classList.remove('selected');
                radio.checked = false;
            });
            
            option.classList.add('selected');
            input.checked = true;
            
            // Добавляем эффект пульсации
            this.addPulseEffect(option);
            
        } else if (input.type === 'checkbox') {
            // Чекбоксы - можно выбрать несколько
            input.checked = !input.checked;
            option.classList.toggle('selected', input.checked);
            
            // Анимация при выборе/снятии
            this.addCheckboxAnimation(option, input.checked);
        }
        
        this.checkNextButtonValidity();
    }
    
    addPulseEffect(element) {
        element.style.transform = 'scale(1.02)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    addCheckboxAnimation(element, isChecked) {
        const icon = element.querySelector('.option-icon');
        if (isChecked) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 200);
        } else {
            icon.style.transform = 'scale(0.8)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 200);
        }
    }
    
    addTextareaFocusEffect() {
        const textarea = document.getElementById('reasonForSupport');
        textarea.style.transform = 'scale(1.01)';
    }
    
    removeTextareaFocusEffect() {
        const textarea = document.getElementById('reasonForSupport');
        textarea.style.transform = '';
    }
    
    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            const nextBtn = document.getElementById('nextBtn');
            const submitBtn = document.getElementById('submitBtn');
            
            if (!nextBtn.classList.contains('hidden') && !nextBtn.disabled) {
                e.preventDefault();
                this.goToNextStep();
            } else if (!submitBtn.classList.contains('hidden') && !submitBtn.disabled) {
                e.preventDefault();
                this.submitQuiz();
            }
        }
        
        if (e.key === 'Escape') {
            const prevBtn = document.getElementById('prevBtn');
            if (!prevBtn.disabled) {
                this.goToPrevStep();
            }
        }
    }
    
    updateDisplay() {
        const steps = document.querySelectorAll('.quiz-step');
        
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === this.currentStep) {
                step.classList.add('active');
                // Анимация появления
                step.style.opacity = '0';
                step.style.transform = 'translateX(30px)';
                setTimeout(() => {
                    step.style.opacity = '1';
                    step.style.transform = 'translateX(0)';
                }, 50);
            }
        });
        
        this.updateNavigation();
        this.updateProgressBar();
        this.updateStepIndicator();
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        prevBtn.disabled = this.currentStep === 0;
        
        if (this.currentStep === this.totalSteps - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
        
        this.checkNextButtonValidity();
    }
    
    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        const percentage = ((this.currentStep + 1) / this.totalSteps) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Шаг ${this.currentStep + 1} из ${this.totalSteps}`;
    }
    
    updateStepIndicator() {
        const indicator = document.getElementById('stepIndicator');
        indicator.innerHTML = '';
        
        for (let i = 0; i < this.totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'step-dot';
            
            if (i < this.currentStep) {
                dot.classList.add('completed');
            }
            if (i === this.currentStep) {
                dot.classList.add('active');
            }
            
            indicator.appendChild(dot);
        }
    }
    
    checkNextButtonValidity() {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = false;
        
        switch (this.currentStep) {
            case 0:
                isValid = document.querySelector('input[name="supportFor"]:checked');
                break;
            case 1:
                const reason = document.getElementById('reasonForSupport').value.trim();
                isValid = reason.length >= 10;
                break;
            case 2:
                isValid = document.querySelectorAll('input[name="availableDays"]:checked').length > 0;
                break;
            case 3:
                isValid = document.querySelectorAll('input[name="goals"]:checked').length > 0;
                break;
            case 4:
                isValid = document.querySelector('input[name="age"]:checked');
                break;
            case 5:
                isValid = document.querySelector('input[name="urgency"]:checked');
                break;
            case 6:
                isValid = document.querySelector('input[name="consultationFormat"]:checked');
                break;
        }
        
        nextBtn.disabled = !isValid;
        submitBtn.disabled = !isValid;
        
        // Визуальная обратная связь
        if (isValid) {
            nextBtn.classList.add('btn-ready');
            submitBtn.classList.add('btn-ready');
        } else {
            nextBtn.classList.remove('btn-ready');
            submitBtn.classList.remove('btn-ready');
        }
    }
    
    validateCurrentStep() {
        let isValid = true;
        let errorMessage = '';
        
        switch (this.currentStep) {
            case 0:
                const supportFor = document.querySelector('input[name="supportFor"]:checked');
                if (!supportFor) {
                    errorMessage = 'Пожалуйста, выберите, кому нужна поддержка.';
                    isValid = false;
                } else {
                    this.quizData.supportFor = supportFor.value;
                }
                break;
                
            case 1:
                const reason = document.getElementById('reasonForSupport').value.trim();
                if (reason.length < 10) {
                    errorMessage = 'Пожалуйста, опишите вашу ситуацию подробнее (минимум 10 символов).';
                    isValid = false;
                } else {
                    this.quizData.reasonForSupport = reason;
                }
                break;
                
            case 2:
                const selectedDays = Array.from(document.querySelectorAll('input[name="availableDays"]:checked'))
                    .map(cb => cb.value);
                if (selectedDays.length === 0) {
                    errorMessage = 'Пожалуйста, выберите хотя бы один удобный день.';
                    isValid = false;
                } else {
                    this.quizData.availableDays = selectedDays;
                }
                break;
                
            // Добавьте остальные случаи валидации...
        }
        
        if (!isValid) {
            this.showToast(errorMessage, 'error');
        }
        
        return isValid;
    }
    
    goToNextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            this.updateDisplay();
        }
    }
    
    goToPrevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
        }
    }
    
    async submitQuiz() {
        if (this.validateCurrentStep()) {
            try {
                // Показываем индикатор загрузки
                this.showLoadingState();
                
                // Имитация отправки данных
                await this.saveToFirebase();
                
                // Переход к экрану завершения
                this.showCompletionScreen();
                
                this.showToast('Анкета успешно отправлена!', 'success');
                
            } catch (error) {
                console.error('Ошибка при отправке анкеты:', error);
                this.showToast('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.', 'error');
                this.hideLoadingState();
            }
        }
    }
    
    showLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
    }
    
    hideLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить';
        submitBtn.disabled = false;
    }
    
    showCompletionScreen() {
        const completionMenu = document.getElementById('completionMenu');
        const navigation = document.querySelector('.quiz-navigation');
        
        // Скрываем все шаги
        document.querySelectorAll('.quiz-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Показываем экран завершения
        completionMenu.style.display = 'block';
        setTimeout(() => {
            completionMenu.classList.add('active');
        }, 100);
        
        // Скрываем навигацию
        navigation.style.display = 'none';
        
        // Обновляем прогресс на 100%
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressText').textContent = 'Анкета завершена';
    }
    
    resetQuiz() {
        // Сброс данных
        this.currentStep = 0;
        this.quizData = {
            supportFor: '',
            reasonForSupport: '',
            availableDays: [],
            goals: [],
            age: '',
            urgency: '',
            consultationFormat: ''
        };
        
        // Сброс UI
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
            input.closest('.option-base')?.classList.remove('selected');
        });
        
        document.getElementById('reasonForSupport').value = '';
        
        // Скрытие экрана завершения
        document.getElementById('completionMenu').style.display = 'none';
        document.querySelector('.quiz-navigation').style.display = 'flex';
        
        // Обновление отображения
        this.updateDisplay();
    }
    
    showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        toast.innerHTML = `
            <i class="fas fa-${icon}" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    async saveToFirebase() {
        // Имитация сохранения в Firebase
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Данные анкеты:', this.quizData);
                resolve();
            }, 2000);
        });
    }
}

// Инициализация анкеты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedQuiz();
});

// Дополнительные стили для анимаций
const additionalStyles = `
    .btn-ready {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.3) !important;
    }
    
    .option-base {
        transform-origin: center;
    }
    
    .completion-screen {
        animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .toast {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
`;

// Добавляем дополнительные стили
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 