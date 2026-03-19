# Stage 1: build React app
FROM node:20-alpine as build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Собираем React приложение
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine

# Копируем билд в папку Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Экспонируем порт
EXPOSE 80

# Запуск Nginx на переднем плане
CMD ["nginx", "-g", "daemon off;"]