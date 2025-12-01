# Dockerfile para Backend Principal (Monolito Modular)
# Servicios incluidos: tours, bookings, users, site, captain

FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
FROM base AS deps
RUN npm ci --only=production

# Instalar todas las dependencias (incluyendo dev)
FROM base AS builder
RUN npm ci
COPY . .

# Construcción (si necesitas transpilación o build)
# RUN npm run build

# Imagen de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Cambiar permisos
RUN chown -R express:nodejs /app

# Cambiar a usuario no-root
USER express

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "src/server.js"]
