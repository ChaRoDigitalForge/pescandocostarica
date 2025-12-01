# Dockerfile para Auth Service (Microservicio de Autenticación)

FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

FROM base AS deps
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

RUN chown -R express:nodejs /app

USER express

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/index.js"]
