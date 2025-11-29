# Pescando Costa Rica - Backend API

Backend de microservicios para la plataforma de tours de pesca en Costa Rica.

## 🚀 Características

- **Arquitectura de Microservicios**: Servicios independientes para Tours, Bookings y Users
- **Base de Datos**: PostgreSQL en Neon Tech (serverless)
- **Autenticación**: Firebase Authentication
- **API RESTful**: Endpoints bien documentados
- **Validación**: Joi para validación de datos
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan para desarrollo

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Conexión a Neon PostgreSQL
│   │   └── firebase.js       # Configuración de Firebase
│   ├── middleware/
│   │   ├── auth.js           # Autenticación y autorización
│   │   ├── errorHandler.js   # Manejo de errores
│   │   └── validator.js      # Validación de datos
│   ├── services/
│   │   ├── tours/
│   │   │   ├── controller.js
│   │   │   └── routes.js
│   │   ├── bookings/
│   │   │   ├── controller.js
│   │   │   └── routes.js
│   │   └── users/
│   │       ├── controller.js
│   │       └── routes.js
│   └── server.js             # API Gateway principal
├── .env                      # Variables de entorno
├── .env.example              # Ejemplo de variables
└── package.json
```

## 🛠️ Instalación

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
NODE_ENV=development
PORT=5000

# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_1ElCPWV4xLjr@ep-quiet-feather-a4efkuis-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Firebase
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_CLIENT_EMAIL=tu_email
FIREBASE_PRIVATE_KEY=tu_private_key

# JWT
JWT_SECRET=pescando_costarica_secret_2025
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Iniciar el Servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Tours Service (`/api/tours`)

#### GET `/api/tours`
Obtener todos los tours con filtros y paginación

**Query Parameters:**
- `provincia` - Filtrar por provincia (guanacaste, puntarenas, etc.)
- `fishing_type` - Tipo de pesca (altaMar, costera, rio, lago)
- `min_price` - Precio mínimo
- `max_price` - Precio máximo
- `min_capacity` - Capacidad mínima
- `min_rating` - Rating mínimo
- `featured` - Solo tours destacados (true/false)
- `sort` - Campo para ordenar (price, average_rating, total_bookings, created_at)
- `order` - Orden (ASC/DESC)
- `page` - Página (default: 1)
- `limit` - Items por página (default: 12)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 21,
    "totalPages": 2,
    "hasMore": true
  }
}
```

#### GET `/api/tours/featured`
Obtener tours destacados

**Query Parameters:**
- `limit` - Número de tours (default: 6)

#### GET `/api/tours/:slug`
Obtener un tour específico por slug

**Response:** Tour completo con servicios, inclusiones y requisitos

#### GET `/api/tours/:slug/availability`
Obtener disponibilidad de un tour

**Query Parameters:**
- `start_date` - Fecha de inicio (YYYY-MM-DD)
- `end_date` - Fecha de fin (YYYY-MM-DD)

#### GET `/api/tours/:slug/reviews`
Obtener reseñas de un tour

**Query Parameters:**
- `page` - Página (default: 1)
- `limit` - Items por página (default: 10)

#### GET `/api/tours/search`
Buscar tours

**Query Parameters:**
- `q` - Término de búsqueda (requerido)
- `page` - Página (default: 1)
- `limit` - Items por página (default: 12)

### Bookings Service (`/api/bookings`)

#### POST `/api/bookings`
Crear una reservación

**Headers:**
- `Authorization: Bearer <token>` (opcional)

**Body:**
```json
{
  "tour_id": "uuid",
  "booking_date": "2025-02-15",
  "number_of_people": 2,
  "customer_name": "Juan Pérez",
  "customer_email": "juan@example.com",
  "customer_phone": "+506-8888-8888",
  "customer_notes": "Notas opcionales",
  "promocion_code": "WELCOME25"
}
```

#### GET `/api/bookings/my-bookings`
Obtener mis reservaciones (requiere autenticación)

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Query Parameters:**
- `status` - Filtrar por estado (pending, confirmed, cancelled, completed)
- `page` - Página
- `limit` - Items por página

#### GET `/api/bookings/:booking_number`
Obtener reservación por número

**Headers:**
- `Authorization: Bearer <token>` (opcional)

#### PUT `/api/bookings/:booking_number/cancel`
Cancelar una reservación

**Headers:**
- `Authorization: Bearer <token>` (opcional)

**Body:**
```json
{
  "cancellation_reason": "Razón de cancelación"
}
```

#### PUT `/api/bookings/:booking_number/confirm`
Confirmar una reservación (solo admin/capitan)

**Headers:**
- `Authorization: Bearer <token>` (requerido)

#### GET `/api/bookings/promo/:code/validate`
Validar código promocional

**Query Parameters:**
- `tour_id` - ID del tour (opcional)
- `subtotal` - Subtotal para calcular descuento (opcional)

### Users Service (`/api/users`)

#### POST `/api/users`
Crear un usuario

**Body:**
```json
{
  "firebase_uid": "firebase-uid-here",
  "email": "user@example.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+506-8888-8888",
  "role": "cliente"
}
```

#### GET `/api/users/profile`
Obtener perfil del usuario autenticado

**Headers:**
- `Authorization: Bearer <token>` (requerido)

#### PUT `/api/users/profile`
Actualizar perfil del usuario

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+506-8888-8888",
  "bio": "Bio del usuario",
  "address": "Dirección",
  "city": "Ciudad",
  "provincia": "sanJose",
  "date_of_birth": "1990-01-01",
  "avatar_url": "https://..."
}
```

#### GET `/api/users/favorites`
Obtener tours favoritos

**Headers:**
- `Authorization: Bearer <token>` (requerido)

#### POST `/api/users/favorites`
Agregar tour a favoritos

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Body:**
```json
{
  "tour_id": "uuid"
}
```

#### DELETE `/api/users/favorites/:tour_id`
Eliminar tour de favoritos

**Headers:**
- `Authorization: Bearer <token>` (requerido)

#### POST `/api/users/reviews`
Crear una reseña

**Headers:**
- `Authorization: Bearer <token>` (requerido)

**Body:**
```json
{
  "tour_id": "uuid",
  "booking_id": "uuid",
  "rating": 5,
  "title": "Excelente experiencia",
  "comment": "El mejor tour que he tenido...",
  "guide_rating": 5,
  "equipment_rating": 5,
  "value_rating": 5
}
```

## 🔐 Autenticación

El backend usa Firebase Authentication. Para acceder a endpoints protegidos:

1. Obtener token de Firebase en el frontend
2. Incluir en el header: `Authorization: Bearer <firebase_token>`

### Roles de Usuario

- `admin` - Administrador del sistema
- `capitan` - Capitán de tours
- `pescador` - Usuario pescador
- `cliente` - Cliente regular (default)

## 🗄️ Base de Datos

La aplicación usa PostgreSQL en Neon Tech. La cadena de conexión está en `.env`:

```
DATABASE_URL=postgresql://neondb_owner:npg_1ElCPWV4xLjr@ep-quiet-feather-a4efkuis-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Conexión Configurada

- **SSL**: Habilitado
- **Connection Pool**: 20 conexiones máximas
- **Idle Timeout**: 30 segundos
- **Connection Timeout**: 2 segundos

## 🧪 Testing

```bash
npm test
```

## 📝 Logs

En desarrollo, se usan logs detallados con Morgan:
- Todas las peticiones HTTP
- Queries a la base de datos
- Errores y excepciones

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para frontend específico
- **Rate Limiting**: 100 requests por 15 minutos
- **Input Validation**: Joi schemas
- **SQL Injection**: Prepared statements
- **XSS Protection**: Sanitización de inputs

## 🚀 Despliegue

### Vercel (Recomendado para Next.js)

1. Instalar Vercel CLI: `npm i -g vercel`
2. Ejecutar: `vercel`
3. Configurar variables de entorno en Vercel Dashboard

### Railway / Render

1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

## 📄 Licencia

MIT

## 👥 Equipo

Pescando Costa Rica Development Team
