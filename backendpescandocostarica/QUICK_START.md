# 🚀 Quick Start - Pescando Costa Rica Backend

## Instalación Rápida

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto o usa uno existente
3. Ve a "Project Settings" > "Service Accounts"
4. Click en "Generate New Private Key"
5. Descarga el archivo JSON
6. Copia los valores al `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

### 3. Iniciar el Servidor

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:5000`

## 🧪 Probar los Endpoints

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2025-01-27T..."
}
```

### 2. Obtener Tours

```bash
curl http://localhost:5000/api/tours
```

### 3. Obtener Tours Destacados

```bash
curl http://localhost:5000/api/tours/featured
```

### 4. Obtener un Tour Específico

```bash
curl http://localhost:5000/api/tours/pesca-deportiva-alta-mar-quepos
```

### 5. Buscar Tours

```bash
curl "http://localhost:5000/api/tours/search?q=marlín"
```

### 6. Filtrar Tours por Provincia

```bash
curl "http://localhost:5000/api/tours?provincia=guanacaste&page=1&limit=10"
```

### 7. Validar Código Promocional

```bash
curl "http://localhost:5000/api/bookings/promo/WELCOME25/validate?subtotal=850"
```

## 📝 Crear una Reservación

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "tour_id": "uuid-del-tour",
    "booking_date": "2025-02-15",
    "number_of_people": 2,
    "customer_name": "Juan Pérez",
    "customer_email": "juan@example.com",
    "customer_phone": "+506-8888-8888",
    "promocion_code": "WELCOME25"
  }'
```

## 🔐 Endpoints que Requieren Autenticación

Para usar endpoints protegidos, necesitas:

1. Autenticarte en Firebase desde tu frontend
2. Obtener el token de Firebase
3. Incluirlo en el header:

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Crear Usuario

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "firebase-uid-from-auth",
    "email": "newuser@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+506-8888-8888",
    "role": "cliente"
  }'
```

## 📊 Estructura de Respuestas

Todas las respuestas siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

**Con Paginación:**
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

## 🔍 Debugging

### Ver Logs de Base de Datos

Los logs muestran automáticamente:
- Queries ejecutados
- Tiempo de ejecución
- Número de filas afectadas

### Errores Comunes

#### 1. "Database connection failed"
- Verifica que `DATABASE_URL` esté correcta en `.env`
- Asegúrate de tener conexión a internet

#### 2. "Invalid Firebase token"
- El token de Firebase puede haber expirado
- Verifica la configuración de Firebase en `.env`

#### 3. "Tour not found"
- Verifica que el slug sea correcto
- Asegúrate de que el tour esté activo en la BD

## 📱 Integración con Frontend

### En Next.js (app directory)

```javascript
// app/api/tours.js
export async function getTours(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5000/api/tours?${params}`);
  const data = await response.json();
  return data;
}

// Uso:
const tours = await getTours({ provincia: 'guanacaste', limit: 12 });
```

### Con Autenticación

```javascript
// utils/api.js
import { auth } from './firebase';

export async function fetchWithAuth(url, options = {}) {
  const token = await auth.currentUser?.getIdToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}

// Uso:
const profile = await fetchWithAuth('http://localhost:5000/api/users/profile');
```

## 🎯 Próximos Pasos

1. ✅ Backend funcionando
2. 🔄 Integrar con tu frontend Next.js
3. 🔐 Configurar Firebase Authentication
4. 💳 Implementar pasarela de pagos (Stripe/PayPal)
5. 📧 Agregar envío de emails (SendGrid/Mailgun)
6. 📱 Implementar notificaciones push

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Verifica la configuración de `.env`
3. Asegúrate de que la base de datos esté funcionando
4. Revisa la documentación completa en `README.md`

¡Listo para desarrollar! 🎣🚀
