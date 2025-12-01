# 🚀 Guía de Instalación - Pescando Costa Rica

## Estado Actual

Has completado:
- ✅ npm install en services/auth-service

## Siguiente: Instalar Docker Desktop

### Para Windows:

1. **Descargar Docker Desktop**:
   - Ve a: https://www.docker.com/products/docker-desktop/
   - Descarga "Docker Desktop for Windows"

2. **Requisitos del sistema**:
   - Windows 10 64-bit: Pro, Enterprise o Education (Build 19041 o superior)
   - O Windows 11 64-bit
   - WSL 2 habilitado (Docker lo instalará automáticamente)
   - Al menos 4GB de RAM

3. **Instalar**:
   - Ejecuta el instalador descargado
   - Sigue el asistente de instalación
   - **IMPORTANTE**: Selecciona "Use WSL 2 instead of Hyper-V"
   - Reinicia tu computadora cuando se solicite

4. **Verificar instalación**:
   - Abre Docker Desktop
   - Espera a que inicie completamente (el ícono de la ballena dejará de parpadear)
   - Abre PowerShell o CMD y ejecuta:
     ```bash
     docker --version
     docker-compose --version
     ```

## Opción Recomendada: Solo PostgreSQL y Redis en Docker

Esta es la mejor opción para empezar. Solo levantamos la base de datos y Redis en Docker, mientras tu código corre localmente (más rápido para desarrollo).

### Paso 1: Iniciar PostgreSQL y Redis

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Paso 2: Verificar que estén corriendo

```bash
docker-compose -f docker-compose.dev.yml ps
```

### Paso 3: Configurar tu backend

Edita `backendpescandocostarica/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pescando_costarica
REDIS_URL=redis://:redispassword@localhost:6379
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

### Paso 4: Ejecutar migraciones

```bash
cd backendpescandocostarica
npm run migrate
```

### Paso 5: Iniciar tu backend

```bash
npm run dev
```

### Paso 6: Iniciar Auth Service

En otra terminal:
```bash
cd services/auth-service
npm run dev
```

## Comandos Útiles

### Detener servicios Docker
```bash
docker-compose -f docker-compose.dev.yml down
```

### Ver logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Conectar a PostgreSQL
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d pescando_costarica
```

## ¿Tienes Docker instalado ya?

Si ya tienes Docker Desktop instalado y corriendo, puedes empezar directamente con:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

**¡Avísame cuando tengas Docker instalado para continuar! 🎣**
