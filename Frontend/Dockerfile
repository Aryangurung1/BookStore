# syntax=docker/dockerfile:1.4

# Build stage
FROM --platform=$BUILDPLATFORM node:20-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Runtime stage
FROM --platform=$TARGETPLATFORM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
