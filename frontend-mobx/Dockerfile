FROM node:20-alpine AS build

WORKDIR /workspace/frontend-mobx

COPY frontend-mobx/package*.json ./
COPY shared /workspace/shared
COPY frontend/src /workspace/frontend/src
COPY frontend/static /workspace/frontend/static
COPY frontend/tsconfig.app.json /workspace/frontend/tsconfig.app.json

RUN npm install
RUN mkdir -p /workspace/frontend && ln -s /workspace/frontend-mobx/node_modules /workspace/frontend/node_modules

COPY frontend-mobx/ ./

RUN npx vite build

FROM nginx:alpine

COPY --from=build /workspace/frontend-mobx/dist /usr/share/nginx/html
COPY ./backend/static/videos /usr/share/nginx/html/videos
COPY ./backend/static/avatars /usr/share/nginx/html/avatars
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
