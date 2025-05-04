# Use Node.js LTS (Node 20)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set the correct permissions
USER nextjs

# Expose the port
EXPOSE 3000

# Define environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Command to start the application - server.js should be in the root after copying from standalone
CMD ["node", "server.js"]