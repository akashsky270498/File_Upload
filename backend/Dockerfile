# ==========================================
# STAGE 1: Build & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install package dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript (/app/dist)
RUN npm run build

# ==========================================
# STAGE 2: Production Lightweight Image
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Set Production Environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user security context
USER node

# Expose HTTP Server Port
EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start production server
CMD ["node", "dist/server.js"]
