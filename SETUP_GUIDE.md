# Guía de Configuración - Dashboard de Capitanes

## Paso 1: Actualizar la Base de Datos

Ejecuta este SQL en tu base de datos Neon:

```sql
-- Add password_hash column to users table for JWT authentication
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Make firebase_uid nullable since users can now register without Firebase
ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Add index for last_login_at for analytics
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
```

## Paso 2: Configurar Variables de Entorno

### Backend (.env en backendpescandocostarica/)
```env
JWT_SECRET=tu-clave-super-secreta-cambiar-en-produccion
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local ya existe)
Verifica que tenga:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

## Paso 3: Instalar Dependencias del Backend

El backend ya tiene las dependencias en package.json, solo asegúrate de que estén instaladas:

```bash
cd backendpescandocostarica
npm install
```

## Paso 4: Iniciar el Backend

```bash
cd backendpescandocostarica
npm start
```

Deberías ver:
```
🎣 PESCANDO COSTA RICA API
Server running on port 5000
```

## Paso 5: Actualizar el Layout Principal del Frontend

Necesitamos agregar el AuthProvider al layout principal.

Edita `app/layout.js` y envuelve los children con AuthProvider.

## Paso 6: Iniciar el Frontend

```bash
# En la raíz del proyecto frontend
npm run dev
```

## Paso 7: Registrar un Capitán

1. Ve a: http://localhost:3000/register
2. Selecciona "Capitán"
3. Llena el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: capitan@test.com
   - Teléfono: +506 1234-5678
   - Contraseña: 123456
   - Número de Licencia: CAP-12345
   - Años de Experiencia: 10
   - Especializaciones: Pesca deportiva, mar abierto

4. Haz clic en "Crear Cuenta"

## Paso 8: Acceder al Dashboard

Después de registrarte, serás redirigido automáticamente a:
**http://localhost:3000/dashboard/capitan**

## Qué Verás en el Dashboard

### Vista General (Tab Overview)
- **4 Tarjetas de Estadísticas:**
  - Total de Tours
  - Reservas Pendientes
  - Próximos Tours
  - Ingresos Totales

- **Reservas Recientes:**
  - Lista de las últimas 5 reservas
  - Nombre del cliente
  - Tour reservado
  - Fecha
  - Estado
  - Monto

### Gestión de Reservas (Tab Bookings)
- **Tabla completa** con todas las reservas
- **Filtros:** Todas, Pendientes, Confirmadas
- **Acciones:**
  - Confirmar reservas pendientes
  - Cancelar reservas
  - Marcar como completadas
- **Información mostrada:**
  - Datos del cliente (nombre, email, teléfono)
  - Tour reservado
  - Fecha del tour
  - Número de personas
  - Monto total
  - Estado actual

### Mis Tours (Tab Tours)
- Próximamente

### Perfil (Tab Profile)
- Información del capitán
- Nombre, email, teléfono
- Número de licencia
- Años de experiencia

## Rutas Creadas

### Páginas Públicas:
- `/` - Homepage
- `/login` - Iniciar sesión
- `/register` - Crear cuenta
- `/tours/[slug]` - Detalle del tour

### Páginas Protegidas:
- `/dashboard/capitan` - Dashboard del capitán (solo capitanes)
- `/dashboard` - Dashboard del cliente (próximamente)

## API Endpoints del Backend

### Autenticación:
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Capitán (requiere autenticación):
- `GET /api/captain/tours` - Obtener tours del capitán
- `GET /api/captain/bookings` - Obtener reservas
- `GET /api/captain/statistics` - Obtener estadísticas
- `PATCH /api/captain/bookings/:booking_number/status` - Actualizar estado de reserva

## Testing Rápido con cURL

### 1. Registrar un capitán:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "capitan@test.com",
    "password": "123456",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+506 1234-5678",
    "role": "capitan",
    "license_number": "CAP-12345",
    "years_of_experience": 10,
    "specializations": "Pesca deportiva"
  }'
```

### 2. Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "capitan@test.com",
    "password": "123456"
  }'
```

Guarda el token que te devuelve.

### 3. Ver estadísticas:
```bash
curl -X GET http://localhost:5000/api/captain/statistics \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Solución de Problemas

### Error: "Cannot find module 'jsonwebtoken'"
```bash
cd backendpescandocostarica
npm install jsonwebtoken bcryptjs
```

### Error: "Cannot find module '@/contexts/AuthContext'"
Asegúrate de que el archivo `contexts/AuthContext.js` existe y que el layout principal importa el AuthProvider.

### Error: "Failed to fetch"
1. Verifica que el backend esté corriendo en el puerto 5000
2. Verifica que NEXT_PUBLIC_API_URL esté configurado correctamente
3. Verifica CORS en el backend

### No veo datos en el dashboard
Es normal si acabas de registrarte. Necesitas:
1. Crear tours como capitán
2. Que alguien haga reservas en tus tours
3. O crear datos de prueba en la base de datos

## Crear Datos de Prueba (Opcional)

Para ver el dashboard con datos, puedes ejecutar esto en tu base de datos:

```sql
-- Insertar una reserva de prueba para el capitán
-- (Reemplaza 1 con el ID de tu usuario capitán y 1 con el ID de un tour)
INSERT INTO bookings (
  tour_id,
  booking_date,
  number_of_people,
  customer_name,
  customer_email,
  customer_phone,
  subtotal,
  tax_amount,
  total_amount,
  status,
  booking_number
) VALUES (
  1,  -- ID del tour (ajusta según tus datos)
  CURRENT_DATE + INTERVAL '7 days',
  2,
  'Cliente de Prueba',
  'cliente@test.com',
  '+506 9876-5432',
  200.00,
  26.00,
  226.00,
  'pending',
  'BK-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')
);
```

## Próximos Pasos

Una vez que veas el dashboard funcionando, continuaremos con:
1. Dashboard del cliente/pescador
2. Sistema de notificaciones por email
3. Sistema de notificaciones SMS/WhatsApp
4. Gestión de tours desde el dashboard del capitán
5. Sistema de reviews y calificaciones
