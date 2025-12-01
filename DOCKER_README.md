# 🐳 Docker & Microservicios - Pescando Costa Rica

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Inicio Rápido](#-inicio-rápido)
- [Servicios](#-servicios)
- [Configuración](#-configuración)
- [Comandos Útiles](#-comandos-útiles)
- [Desarrollo](#-desarrollo)
- [Troubleshooting](#-troubleshooting)
- [Migración a Producción](#-migración-a-producción)

## 🏗 Arquitectura

Este proyecto implementa una **arquitectura híbrida de microservicios**:

```
                    ┌──────────────────┐
                    │   API Gateway    │
                    │   (Nginx:8080)   │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌────────▼────────┐  ┌───▼────┐  ┌───────▼────────┐
   │  Auth Service   │  │Backend │  │Reports Service │
   │   (Port 5001)   │  │  Main  │  │  (Port 5002)   │
   │                 │  │ (5000) │  │                │
   │ - Login         │  │- Tours │  │ - Analytics    │
   │ - Register      │  │- Bookings│ │ - Stats       │
   │ - JWT Tokens    │  │- Users │  │ - Exports      │
   └────────┬────────┘  └───┬────┘  └───────┬────────┘
            │               │                │
            └───────┬───────┴────────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
    ┌────▼─────┐         ┌─────▼─────┐
    │PostgreSQL│         │   Redis   │
    │ (5432)   │         │   (6379)  │
    └──────────┘         └───────────┘
```

### Servicios

#### 🔐 Auth Service (Microservicio)
- **Puerto**: 5001
- **Función**: Autenticación y autorización
- **Stack**: Express + JWT + Redis + PostgreSQL
- **Features**:
  - Login/Register
  - JWT token generation & validation
  - Token blacklisting (logout)
  - Password reset
  - Refresh tokens en Redis

#### 🎣 Backend Main (Monolito Modular)
- **Puerto**: 5000
- **Función**: Lógica de negocio principal
- **Módulos**:
  - Tours (gestión de tours de pesca)
  - Bookings (reservas)
  - Users (perfiles de usuario)
  - Captain (dashboard del capitán)
  - Site (contenido del sitio)

#### 📊 Reports Service (Microservicio - Futuro)
- **Puerto**: 5002
- **Función**: Generación de reportes y analytics
- **Features**: Reportes de capturas, estadísticas, exports

#### 🌐 API Gateway (Nginx)
- **Puerto**: 8080
- **Función**: Punto de entrada único, routing, rate limiting
- **Features**:
  - Reverse proxy
  - Rate limiting
  - CORS headers
  - Load balancing
  - SSL termination (producción)

#### 🗄 PostgreSQL
- **Puerto**: 5432
- **Función**: Base de datos principal
- **Compatible con**: Neon PostgreSQL

#### 🔴 Redis
- **Puerto**: 6379
- **Función**: Cache, sesiones, blacklist de tokens

## 🔧 Requisitos Previos

1. **Docker Desktop** instalado y corriendo
   - [Descargar Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
   - Verificar: `docker --version` y `docker-compose --version`

2. **Git** (opcional, para clonar el repo)

## 🚀 Inicio Rápido

### Windows

1. **Iniciar servicios**:
   ```bash
   docker-start.bat
   ```

2. **Verificar que todo esté corriendo**:
   ```bash
   docker-compose ps
   ```

3. **Acceder a los servicios**:
   - API Gateway: http://localhost:8080
   - Backend Main: http://localhost:5000
   - Auth Service: http://localhost:5001
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Linux/Mac

```bash
# Copiar variables de entorno
cp .env.docker .env.local

# Iniciar servicios
docker-compose --env-file .env.local up -d

# Ver logs
docker-compose logs -f
```

## 🎯 Servicios

### Health Checks

Todos los servicios tienen endpoints de health check:

```bash
# Gateway
curl http://localhost:8080/health

# Backend Main
curl http://localhost:5000/api/health

# Auth Service
curl http://localhost:5001/health
```

### Endpoints Principales

#### Auth Service (`http://localhost:8080/api/auth`)

```bash
# Register
POST /api/auth/register
{
  "email": "usuario@example.com",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+506 8888-8888",
  "role": "cliente"
}

# Login
POST /api/auth/login
{
  "email": "usuario@example.com",
  "password": "password123"
}

# Get current user (requiere token)
GET /api/auth/me
Authorization: Bearer <token>

# Logout
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Backend Main (`http://localhost:8080/api`)

```bash
# Tours
GET /api/tours
GET /api/tours/:slug
POST /api/tours (requiere auth - capitan)

# Bookings
POST /api/bookings (requiere auth)
GET /api/bookings/my-bookings (requiere auth)

# Captain Dashboard
GET /api/captain/dashboard (requiere auth - capitan)
```

## ⚙ Configuración

### Variables de Entorno

Copia `.env.docker` a `.env.local` y ajusta según necesites:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_dev_password
POSTGRES_DB=pescando_costarica

# Redis
REDIS_PASSWORD=redis_dev_password

# JWT
JWT_SECRET=tu-clave-super-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# Puertos
BACKEND_PORT=5000
AUTH_SERVICE_PORT=5001
GATEWAY_PORT=8080
```

### Configuración de Neon

Para conectar con Neon PostgreSQL cloud:

```env
# En .env.local
DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/pescando_costarica?sslmode=require
```

## 🛠 Comandos Útiles

### Scripts de Windows

```bash
# Iniciar todos los servicios
docker-start.bat

# Detener todos los servicios
docker-stop.bat

# Ver logs de todos los servicios
docker-logs.bat

# Ver logs de un servicio específico
docker-logs.bat auth-service

# Reset completo (elimina volúmenes)
docker-reset.bat
```

### Comandos Docker Compose

```bash
# Ver servicios corriendo
docker-compose ps

# Ver logs
docker-compose logs -f [servicio]

# Reiniciar un servicio
docker-compose restart [servicio]

# Reconstruir un servicio
docker-compose build [servicio]
docker-compose up -d [servicio]

# Ejecutar comando en un contenedor
docker-compose exec [servicio] sh

# Ver recursos utilizados
docker stats
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d pescando_costarica

# Ejecutar migrations
docker-compose exec backend-main npm run migrate

# Crear backup
docker-compose exec postgres pg_dump -U postgres pescando_costarica > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres pescando_costarica < backup.sql
```

### Redis

```bash
# Conectar a Redis CLI
docker-compose exec redis redis-cli -a redis_dev_password

# Ver todas las keys
KEYS *

# Limpiar cache
FLUSHALL
```

## 💻 Desarrollo

### Desarrollo con Hot Reload

Los servicios están configurados con volúmenes para hot reload:

```yaml
volumes:
  - ./backendpescandocostarica/src:/app/src
  - /app/node_modules
```

Cualquier cambio en el código se reflejará automáticamente.

### Agregar Nuevo Microservicio

1. Crear directorio en `services/`:
   ```bash
   mkdir -p services/nuevo-servicio/src
   ```

2. Copiar estructura de `auth-service`:
   - package.json
   - Dockerfile
   - src/index.js
   - src/config/
   - src/controllers/
   - src/routes.js

3. Agregar al `docker-compose.yml`:
   ```yaml
   nuevo-servicio:
     build:
       context: ./services/nuevo-servicio
     ports:
       - "5003:5003"
     depends_on:
       - postgres
       - redis
   ```

4. Agregar routing en Nginx (`nginx/conf.d/api-gateway.conf`):
   ```nginx
   location /api/nuevo {
       proxy_pass http://nuevo-servicio:5003;
   }
   ```

### Testing

```bash
# Correr tests en un servicio
docker-compose exec auth-service npm test

# Con coverage
docker-compose exec auth-service npm run test:coverage
```

## 🐛 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :5000

# Matar proceso
taskkill /PID <PID> /F

# O cambiar puerto en .env.local
BACKEND_PORT=5010
```

### Problema: Cannot connect to Docker daemon

```bash
# Asegúrate de que Docker Desktop esté corriendo
# Reinicia Docker Desktop si es necesario
```

### Problema: Database connection failed

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar postgres
docker-compose restart postgres
```

### Problema: Out of memory

```bash
# Aumentar memoria en Docker Desktop
# Settings > Resources > Memory

# O limpiar recursos no utilizados
docker system prune -a --volumes
```

### Problema: Volúmenes con datos corruptos

```bash
# Resetear todo
docker-reset.bat

# O manualmente
docker-compose down -v
docker-compose up -d
```

## 🌐 Extensión de Neon

Para usar la extensión de Neon con Docker:

1. **Configurar PostgreSQL local** (ya incluido en docker-compose.yml)
2. **Usar Neon CLI** para sincronizar:
   ```bash
   # Instalar Neon CLI
   npm install -g @neondatabase/cli

   # Login
   neonctl auth

   # Pull schema desde Neon
   neonctl database pull
   ```

3. **Alternar entre local y cloud**:
   ```env
   # Local (Docker)
   DATABASE_URL=postgresql://postgres:postgres_dev_password@localhost:5432/pescando_costarica

   # Neon Cloud
   DATABASE_URL=postgresql://user:password@ep-xyz.region.aws.neon.tech/pescando_costarica
   ```

## 🚀 Migración a Producción

### 1. Build para producción

```bash
# Construir imágenes optimizadas
docker-compose -f docker-compose.prod.yml build

# Push a registry
docker-compose -f docker-compose.prod.yml push
```

### 2. Variables de entorno

Crea `.env.production` con valores seguros:

```env
NODE_ENV=production
JWT_SECRET=<generar-clave-segura-256-bits>
DATABASE_URL=<neon-production-url>
REDIS_PASSWORD=<generar-password-seguro>
```

### 3. Deploy

**Opciones recomendadas**:

- **AWS ECS/Fargate**: Usar docker-compose con ECS CLI
- **Google Cloud Run**: Servicios serverless con containers
- **DigitalOcean App Platform**: Deploy directo desde Git
- **Railway**: Deploy simple con soporte Docker Compose
- **Render**: Auto-deploy desde repo

### 4. SSL/HTTPS

Configurar SSL en Nginx:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    # ... resto de configuración
}
```

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas

- Esta configuración es híbrida: combina monolito modular con microservicios estratégicos
- Auth Service y Reports Service son microservicios independientes
- Backend Main contiene módulos relacionados (tours, bookings, users)
- Puedes extraer más servicios según necesites escalabilidad
- Redis se usa para cache y manejo de sesiones/tokens
- PostgreSQL es compartido entre servicios (mismo schema, diferentes tablas)

---

**Hecho con ❤️ para Pescando Costa Rica**
