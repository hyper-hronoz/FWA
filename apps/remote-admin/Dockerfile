FROM node:20-alpine AS build

WORKDIR /workspace

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages
COPY shared ./shared
COPY tailwind.config.js tsconfig.base.json ./

RUN npm install
RUN npm run build -w @fwa/remote-admin

FROM nginx:alpine

COPY --from=build /workspace/apps/remote-admin/dist /usr/share/nginx/html
COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
