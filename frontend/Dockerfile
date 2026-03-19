FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./

COPY shared ./shared

RUN npm install

COPY frontend/ .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/static /usr/share/nginx/html/static
RUN mkdir -p /usr/share/nginx/html/videos
COPY ./backend/static/videos /usr/share/nginx/html/videos
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
