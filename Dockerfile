FROM node:22-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci

RUN npx ng build --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/labify-frontend/browser /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]