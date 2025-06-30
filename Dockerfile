# Multi-stage Dockerfile для Psychology Monorepo на Railway

# === BACKEND STAGE ===
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# === FRONTEND MAIN-SITE STAGE ===
FROM node:18-alpine AS main-site-builder
WORKDIR /app/frontend/main-site
COPY frontend/main-site/package*.json ./
RUN npm ci --only=production

# === FRONTEND ADMIN-PANEL STAGE ===
FROM node:18-alpine AS admin-panel-builder
WORKDIR /app/frontend/admin-panel
COPY frontend/admin-panel/package*.json ./
RUN npm ci --only=production

# === RUNTIME STAGE ===
FROM node:18-alpine AS runtime

# Установка системных зависимостей
RUN apk add --no-cache \
    tini \
    dumb-init

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S app -u 1001

# Установка рабочей директории
WORKDIR /app

# Копирование зависимостей
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=main-site-builder /app/frontend/main-site/node_modules ./frontend/main-site/node_modules
COPY --from=admin-panel-builder /app/frontend/admin-panel/node_modules ./frontend/admin-panel/node_modules

# Копирование исходного кода
COPY backend ./backend
COPY frontend ./frontend
COPY package*.json ./

# Создание необходимых директорий
RUN mkdir -p backend/uploads backend/logs
RUN chown -R app:nodejs /app

# Переключение на пользователя app
USER app

# Настройка переменных окружения
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/src/healthcheck.js || exit 1

# Запуск с помощью tini для правильной обработки сигналов
ENTRYPOINT ["/sbin/tini", "--"]

# По умолчанию запускается backend
CMD ["npm", "run", "start:backend"] 