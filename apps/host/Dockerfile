FROM node:20-alpine AS build

WORKDIR /workspace

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY shared ./shared
COPY tailwind.config.js tsconfig.base.json ./

ARG REMOTE_MAIN_URL=http://localhost:3004
ARG REMOTE_ADMIN_URL=http://localhost:3005
ARG REMOTE_LIKED_URL=http://localhost:3006

ENV REMOTE_MAIN_URL=$REMOTE_MAIN_URL
ENV REMOTE_ADMIN_URL=$REMOTE_ADMIN_URL
ENV REMOTE_LIKED_URL=$REMOTE_LIKED_URL

RUN npm install
RUN npm run build -w @fwa/host

FROM nginx:alpine

COPY --from=build /workspace/apps/host/dist /usr/share/nginx/html
COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
