# Use Node.js LTS (Node 20)
FROM node:20-alpine AS base

FROM base AS deps
# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Pass build-time environment variable
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

ENV  NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package.json ./package.json

# Set the correct permissions
USER nextjs

# Expose the port
EXPOSE 3000

# Define environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Command to start the application - server.js should be in the root after copying from standalone
CMD ["node", "start"]