FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY . .

# Set API Base URL for build to use relative path (proxied by Nginx)
ENV VITE_API_BASE_URL=/api

RUN pnpm install --frozen-lockfile
RUN pnpm --filter front build

FROM nginx:alpine
COPY --from=builder /app/front/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]