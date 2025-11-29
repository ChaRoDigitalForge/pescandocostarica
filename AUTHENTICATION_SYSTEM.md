# Sistema de Autenticación y Dashboards

## Resumen Ejecutivo

Se ha implementado un sistema completo de autenticación con JWT y dashboards administrativos diferenciados para Pescadores (Clientes) y Capitanes.

## Backend Implementado

### 1. Servicio de Autenticación (`/api/auth`)

**Endpoints:**
- `POST /api/auth/register` - Registro de nuevos usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere autenticación)
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/password/change` - Cambiar contraseña
- `POST /api/auth/password-reset/request` - Solicitar reseteo de contraseña

**Características:**
- Soporte dual: JWT y Firebase Authentication
- Contraseñas hasheadas con bcryptjs
- Tokens JWT con expiración de 7 días
- Roles: `cliente` y `capitan`
- Validación de campos requeridos

### 2. Servicio de Capitán (`/api/captain`)

**Endpoints:**
- `GET /api/captain/tours` - Obtener tours del capitán
- `GET /api/captain/bookings` - Obtener reservas del capitán
- `GET /api/captain/statistics` - Obtener estadísticas
- `PATCH /api/captain/bookings/:booking_number/status` - Actualizar estado de reserva

**Estadísticas Incluidas:**
- Total de tours (activos e inactivos)
- Total de reservas por estado
- Ingresos totales y últimos 30 días
- Reservas pendientes
- Tendencias mensuales (últimos 6 meses)

### 3. Middleware de Autenticación

**Archivo:** `src/middleware/auth.js`

**Funciones:**
- `authenticate` - Verifica JWT o Firebase token
- `authorize(...roles)` - Autorización por roles
- `optionalAuth` - Autenticación opcional

**Flujo de Autenticación:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Intenta decodificar como JWT primero
3. Si falla JWT, intenta Firebase
4. Carga datos del usuario desde la base de datos
5. Adjunta `req.user` con información del usuario

### 4. Base de Datos

**Migración:** `database/add_password_auth.sql`

```sql
-- Nuevas columnas
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255),
ADD COLUMN last_login_at TIMESTAMP;

-- firebase_uid ahora es nullable
ALTER TABLE users ALTER COLUMN firebase_uid DROP NOT NULL;

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login_at);
```

## Frontend Implementado

### 1. Contexto de Autenticación

**Archivo:** `contexts/AuthContext.js`

**Funciones Disponibles:**
```javascript
const {
  user,              // Usuario actual
  loading,           // Estado de carga
  login,             // Función de login
  register,          // Función de registro
  logout,            // Función de logout
  getAuthHeader,     // Obtener header de autenticación
  isAuthenticated,   // Boolean si está autenticado
  isCapitan,         // Boolean si es capitán
  isCliente          // Boolean si es cliente
} = useAuth();
```

**Almacenamiento:**
- Token: `localStorage.getItem('auth_token')`
- Usuario: `localStorage.getItem('user_data')`

### 2. Página de Login

**Ruta:** `/login`
**Archivo:** `app/login/page.js`

**Características:**
- Formulario de email y contraseña
- Validación de campos
- Manejo de errores
- Checkbox "Recordarme"
- Link a recuperación de contraseña
- Redirección automática según rol:
  - Capitán → `/dashboard/capitan`
  - Cliente → `/dashboard`

### 3. Página de Registro

**Ruta:** `/register`
**Archivo:** `app/register/page.js`

**Características:**
- Selección de tipo de cuenta (Pescador/Capitán)
- Formulario adaptativo según rol seleccionado
- Campos para clientes:
  - Nombre, apellido
  - Email, teléfono
  - Contraseña
- Campos adicionales para capitanes:
  - Número de licencia (requerido)
  - Años de experiencia
  - Especializaciones
- Validación de contraseñas coincidentes
- Validación de longitud mínima (6 caracteres)

## Pendiente de Implementar

### 1. Dashboard del Capitán
**Ruta:** `/dashboard/capitan`
**Características a incluir:**
- Vista general con estadísticas
- Lista de reservas con filtros
- Gestión de tours
- Calendario de disponibilidad
- Perfil del capitán

### 2. Dashboard del Cliente
**Ruta:** `/dashboard`
**Características a incluir:**
- Mis reservas
- Tours favoritos
- Historial de reservas
- Perfil del usuario
- Dejar reseñas

### 3. Sistema de Notificaciones
**Email:**
- Confirmación de registro
- Confirmación de reserva
- Recordatorio 24h antes del tour
- Notificación al capitán de nueva reserva

**SMS/WhatsApp:**
- Confirmación de reserva
- Recordatorio del tour
- Cambios de estado

## Uso del Sistema

### 1. Iniciar Sesión como Usuario

```javascript
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();

  const handleLogin = async () => {
    const result = await login('email@example.com', 'password');
    if (result.success) {
      // Login exitoso, redirección automática
    } else {
      // Mostrar error
      console.error(result.error);
    }
  };
}
```

### 2. Registrar Nuevo Usuario

```javascript
const { register } = useAuth();

const handleRegister = async () => {
  const result = await register({
    email: 'capitan@example.com',
    password: 'securepassword',
    first_name: 'Juan',
    last_name: 'Pérez',
    phone: '+506 1234-5678',
    role: 'capitan',
    license_number: 'CAP-12345',
    years_of_experience: 10,
    specializations: 'Pesca deportiva, mar abierto'
  });
};
```

### 3. Hacer Request Autenticado

```javascript
const { getAuthHeader } = useAuth();

const fetchProtectedData = async () => {
  const response = await fetch('/api/captain/statistics', {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return data;
};
```

### 4. Proteger Rutas

```javascript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

## Variables de Entorno

### Backend (.env)
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Seguridad

### Implementadas
✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
✅ Tokens JWT con expiración
✅ Validación de roles en middleware
✅ Protección contra inyección SQL (prepared statements)
✅ Headers de seguridad con Helmet
✅ Rate limiting en API
✅ CORS configurado

### Recomendaciones Adicionales
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Añadir límite de intentos de login
- [ ] Implementar refresh tokens
- [ ] Añadir HTTPS en producción
- [ ] Implementar logout en todos los dispositivos
- [ ] Añadir logs de auditoría

## Testing

### Probar Registro
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+506 1234-5678",
    "role": "cliente"
  }'
```

### Probar Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Probar Endpoint Protegido
```bash
curl -X GET http://localhost:5000/api/captain/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Próximos Pasos

1. ✅ Sistema de autenticación JWT
2. ✅ Páginas de login y registro
3. 🔄 Dashboard del Capitán (en progreso)
4. ⏳ Dashboard del Cliente
5. ⏳ Sistema de notificaciones por email
6. ⏳ Sistema de notificaciones SMS/WhatsApp
7. ⏳ Recuperación de contraseña
8. ⏳ Verificación de email
9. ⏳ Perfil de usuario editable
10. ⏳ Cambio de contraseña desde dashboard
