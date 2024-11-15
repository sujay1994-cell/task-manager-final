# Build stage
FROM node:16-alpine as builder

# Set working directory
WORKDIR /app

# Add build arguments
ARG REACT_APP_API_URL
ARG NODE_ENV=production

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    NODE_ENV=$NODE_ENV \
    PATH=/app/node_modules/.bin:$PATH

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Install bash and curl for debugging and healthchecks
RUN apk add --no-cache bash curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Add environment variable handling script
COPY env.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/env.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 