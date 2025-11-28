# Base de Datos - Pescando Costa Rica

## Descripción

Este directorio contiene los scripts SQL para crear y poblar la base de datos PostgreSQL de la aplicación Pescando Costa Rica.

## Estructura de Archivos

- **schema.sql**: Script principal para crear todas las tablas, índices, funciones y triggers
- **seed.sql**: Datos de prueba para desarrollo
- **queries.sql**: Consultas SQL útiles para operaciones comunes
- **migrations/**: Carpeta para migraciones futuras

## Entidades Principales

### 1. **users**
Usuarios del sistema integrados con Firebase Authentication
- Roles: admin, capitan, pescador, cliente
- Estados: active, inactive, suspended, pending_verification
- Información adicional para capitanes (licencia, experiencia, especializaciones)

### 2. **tours**
Tours de pesca disponibles
- Información completa del tour (título, descripción, precios)
- Relación con capitán, provincia y ubicación
- Estadísticas (reviews, bookings, rating promedio)
- Estado y featured flag

### 3. **bookings**
Reservaciones de tours
- Generación automática de número de booking (PCR-YYYYMMDD-XXXXXX)
- Estados: pending, confirmed, cancelled, completed, refunded
- Integración con promociones y pagos

### 4. **promociones**
Códigos promocionales y descuentos
- Tipos: percentage, fixed_amount, buy_one_get_one, early_bird
- Límites de uso global y por usuario
- Fechas de validez

### 5. **reviews**
Reseñas y calificaciones
- Rating general y ratings específicos (guía, equipo, valor)
- Estados: pending, approved, rejected
- Actualización automática de estadísticas del tour

### 6. **payments**
Registro de pagos
- Múltiples métodos de pago
- Integración con procesadores de pago (Stripe, PayPal, etc.)
- Soporte para reembolsos

### Otras Entidades
- **provincias**: 7 provincias de Costa Rica
- **locations**: Ubicaciones específicas dentro de las provincias
- **tour_services**: Servicios incluidos en tours
- **tour_availability**: Disponibilidad por fecha
- **tour_inclusions**: Lo que incluye cada tour
- **tour_requirements**: Requisitos para cada tour
- **favorites**: Tours favoritos de usuarios
- **notifications**: Notificaciones del sistema
- **blog_posts**: Blog y contenido
- **contact_messages**: Mensajes de contacto
- **activity_logs**: Registro de actividades

## Instalación

### 1. Crear la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE pescando_costarica;

# Conectarse a la base de datos
\c pescando_costarica
```

### 2. Ejecutar el Schema

```bash
psql -U postgres -d pescando_costarica -f schema.sql
```

### 3. Cargar Datos de Prueba (Opcional)

```bash
psql -U postgres -d pescando_costarica -f seed.sql
```

## Variables de Entorno

Configura estas variables en tu archivo `.env`:

```env
# PostgreSQL Database
DATABASE_URL=postgresql://usuario:password@localhost:5432/pescando_costarica
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pescando_costarica
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## Características Especiales

### Triggers Automáticos

1. **update_updated_at_column**: Actualiza automáticamente el campo `updated_at`
2. **update_tour_stats_on_review**: Actualiza estadísticas del tour cuando se aprueban/eliminan reviews
3. **update_promocion_usage_count**: Incrementa contador de uso de promociones
4. **generate_booking_number**: Genera número único de booking (PCR-YYYYMMDD-XXXXXX)

### Vistas Útiles

1. **vw_tours_complete**: Tours con toda la información relacionada (provincia, ubicación, capitán)
2. **vw_bookings_complete**: Bookings con información completa del tour, usuario y promoción

### Funciones de Seguridad

- Uso de UUID para IDs principales
- Soft deletes con campo `deleted_at`
- Índices optimizados para búsquedas frecuentes
- Constraints para validación de datos

## Integración con Firebase

La tabla `users` está diseñada para integrarse con Firebase Authentication:

- `firebase_uid`: UID único de Firebase
- `email`: Email sincronizado con Firebase
- `email_verified`: Estado de verificación desde Firebase

### Flujo de Autenticación

1. Usuario se registra/inicia sesión en Firebase
2. Se obtiene el UID de Firebase
3. Se crea/actualiza el registro en la tabla `users` con el `firebase_uid`
4. Se usa el `firebase_uid` para todas las operaciones relacionadas con el usuario

## Migraciones

Para crear una nueva migración:

```bash
# Crear archivo en database/migrations/
# Nombrar como: YYYY_MM_DD_descripcion.sql

# Ejemplo: 2025_01_15_add_tour_rating_index.sql
```

## Backup y Restauración

### Crear Backup

```bash
pg_dump -U postgres pescando_costarica > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
psql -U postgres pescando_costarica < backup_20250115.sql
```

## Consideraciones de Seguridad

1. **Nunca commites credenciales** en el repositorio
2. Usa **variables de entorno** para configuración sensible
3. Implementa **Row Level Security (RLS)** en producción
4. Configura **SSL/TLS** para conexiones a la base de datos
5. Usa **prepared statements** para prevenir SQL injection

## Optimización

- Todos los índices necesarios ya están creados
- Las vistas materializadas pueden agregarse para reportes complejos
- Considera particionamiento de tablas para `activity_logs` y `notifications`

## Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.
