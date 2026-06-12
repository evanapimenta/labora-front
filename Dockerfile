FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN node set-env.js && npx ng build --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/labify-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]