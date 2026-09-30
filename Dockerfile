FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.28-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/proxy-backend.conf /etc/nginx/proxy-backend.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
