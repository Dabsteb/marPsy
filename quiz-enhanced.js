// Улучшенная анкета - современная версия с анимациями и темной темой
class PsychologyQuiz {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 7;
        this.quizData = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.detectTheme();
    }
    
    detectTheme() {
        // Автоматическое определение темы
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
        
        // Отслеживание изменений темы
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            document.body.classList.toggle('dark-mode', isDark);
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    setupEventListeners() {
        // Навигация
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
        
        // Опции
        document.querySelectorAll('.option-base').forEach(option => {
            option.addEventListener('click', () => this.handleOptionClick(option));
        });
        
        // Текстовые поля
        document.getElementById('reasonForSupport')?.addEventListener('input', () => {
            this.validateStep();
        });
    }
    
    handleOptionClick(option) {
        const input = option.querySelector('input');
        
        if (input.type === 'radio') {
            // Убираем выделение с других радио
            document.querySelectorAll(`input[name="${input.name}"]`).forEach(radio => {
                radio.closest('.option-base').classList.remove('selected');
            });
        }
        
        option.classList.toggle('selected');
        input.checked = !input.checked;
        
        // Анимация клика
        option.style.transform = 'scale(0.98)';
        setTimeout(() => {
            option.style.transform = '';
        }, 150);
        
        this.validateStep();
    }
    
    validateStep() {
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        let isValid = false;
        
        switch (this.currentStep) {
            case 0:
                isValid = document.querySelector('input[name="supportFor"]:checked');
                break;
            case 1:
                const text = document.getElementById('reasonForSupport')?.value || '';
                isValid = text.trim().length >= 10;
                break;
            // Добавьте другие случаи...
        }
        
        if (nextBtn) nextBtn.disabled = !isValid;
        if (submitBtn) submitBtn.disabled = !isValid;
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateDisplay();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        // Обновляем шаги
        document.querySelectorAll('.quiz-step').forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });
        
        // Обновляем прогресс
        const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Шаг ${this.currentStep + 1} из ${this.totalSteps}`;
        
        // Обновляем кнопки
        document.getElementById('prevBtn').disabled = this.currentStep === 0;
        
        const isLastStep = this.currentStep === this.totalSteps - 1;
        document.getElementById('nextBtn').style.display = isLastStep ? 'none' : 'flex';
        document.getElementById('submitBtn').style.display = isLastStep ? 'flex' : 'none';
        
        this.validateStep();
    }
    
    async submit() {
        try {
            // Собираем данные
            this.collectData();
            
            // Показываем загрузку
            this.showLoading();
            
            // Имитируем отправку
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Показываем успех
            this.showSuccess();
            
        } catch (error) {
            this.showError('Ошибка при отправке анкеты');
        }
    }
    
    collectData() {
        // Собираем все данные формы
        this.quizData = {
            supportFor: document.querySelector('input[name="supportFor"]:checked')?.value,
            reasonForSupport: document.getElementById('reasonForSupport')?.value,
            // Добавьте остальные поля...
            timestamp: new Date().toISOString()
        };
    }
    
    showLoading() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
    }
    
    showSuccess() {
        // Показываем экран завершения
        document.getElementById('completionMenu').style.display = 'block';
        document.querySelector('.quiz-navigation').style.display = 'none';
        
        // Тост уведомление
        this.showToast('Анкета успешно отправлена!', 'success');
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new PsychologyQuiz();
}); 