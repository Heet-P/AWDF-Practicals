# Shared image for every React practical (build context = that practical's frontend folder).
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# The URL the browser uses to reach this practical's API (empty for practicals 1-3)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
# SPA fallback so refreshing /tasks or /contact serves index.html
COPY <<'CONF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  location / { try_files $uri $uri/ /index.html; }
}
CONF
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
