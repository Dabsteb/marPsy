# 🍃 Настройка MongoDB Atlas (Бесплатная база данных)

## 🎯 Почему MongoDB Atlas:
- ✅ **512MB бесплатно навсегда**
- ✅ Автоматические бэкапы
- ✅ Высокая надежность
- ✅ Не нужно настраивать сервер

## 📋 Пошаговая настройка:

### 1️⃣ Регистрация
1. Идите на [cloud.mongodb.com](https://cloud.mongodb.com)
2. Нажмите "Try Free"
3. Зарегистрируйтесь (лучше через Google/GitHub)

### 2️⃣ Создание кластера
1. Выберите "M0 Sandbox" (FREE tier)
2. Провайдер: AWS
3. Регион: ближайший к вам (например, Frankfurt для Европы)
4. Название кластера: `psychology-cluster`
5. Нажмите "Create"

### 3️⃣ Настройка доступа
**Database Access:**
1. Перейдите в "Database Access"
2. Нажмите "Add New Database User"
3. Username: `psychology_user`
4. Password: сгенерируйте сложный пароль (СОХРАНИТЕ!)
5. Роль: "Atlas admin"
6. Нажмите "Add User"

**Network Access:**
1. Перейдите в "Network Access" 
2. Нажмите "Add IP Address"
3. Нажмите "Allow access from anywhere" (для начала)
4. Нажмите "Confirm"

### 4️⃣ Получение строки подключения
1. Перейдите в "Database" → "Connect"
2. Выберите "Connect your application"
3. Driver: Node.js
4. Версия: 5.5 or later
5. Скопируйте connection string:

```
mongodb+srv://psychology_user:<password>@psychology-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **ВАЖНО**: Замените `<password>` на реальный пароль пользователя

### 5️⃣ Добавление в Railway
В вашем Railway проекте:
1. Variables → Add Variable
2. Имя: `MONGODB_URI`
3. Значение: ваша строка подключения из п.4
4. Сохранить

## 🔐 Пример готовой строки:
```
mongodb+srv://psychology_user:MySecret123@psychology-cluster.abc12.mongodb.net/psychology_cabinet?retryWrites=true&w=majority
```

## 📊 Ограничения бесплатного плана:
- ✅ 512MB хранилища (достаточно для тысяч записей)
- ✅ Общий кластер (подходит для разработки)
- ✅ Нет ограничений по запросам в секунду
- ❌ Нет автоматической настройки производительности

## 🚀 Результат:
После настройки ваше приложение сможет:
- Сохранять пользователей
- Хранить сессии
- Работать с любыми данными

## 🆘 Troubleshooting:
**Ошибка подключения?**
1. Проверьте правильность пароля в строке
2. Убедитесь что IP разрешен в Network Access
3. Проверьте что пользователь создан в Database Access

**Медленная работа?**
- Бесплатный кластер может быть медленным - это нормально
- Для production рассмотрите платный план от $9/месяц 