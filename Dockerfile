# Production-ready Node.js application container
# Stage 1: Base build environment with all tools
FROM node:18-alpine AS base

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Set working directory
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies including development dependencies
RUN npm ci --include=dev

# Copy application source code
COPY . .

# Create non-root user for security compliance
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Build application for production environment
RUN npm run build

# Stage 2: Minimal production runtime
FROM node:18-alpine AS production

# Install only runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl  # Required for health checks

# Create non-root user for production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application and required files from base stage
COPY --from=base --chown=nodejs:nodejs /app/src ./src
COPY --from=base --chown=nodejs:nodejs /app/uploads ./uploads
COPY --from=base --chown=nodejs:nodejs /app/firebase-admin-sdk.json ./firebase-admin-sdk.json

# Create and set permissions for log directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check to verify application is responding
# Tests root endpoint since curl is available and api/health may not exist
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start application process
CMD ["node", "src/index.js"]