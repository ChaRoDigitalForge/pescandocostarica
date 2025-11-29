# Backend Integration - Google Login Endpoint

## Estado Actual

✅ **Google Sign-In funcionando con modo fallback**

El sistema ahora permite iniciar sesión con Google incluso sin el backend configurado. Los usuarios pueden autenticarse y la aplicación guardará sus datos temporalmente usando solo Firebase.

**Nota:** Mientras el backend no esté configurado, algunas funciones como reservas y gestión de tours estarán limitadas.

## Endpoint Requerido

Para integración completa con el backend, necesitas crear el siguiente endpoint:

### POST `/api/auth/google-login`

**Descripción:** Recibe los datos de autenticación de Google/Firebase y crea o actualiza el usuario en la base de datos.

#### Request Body

```json
{
  "firebase_uid": "string",      // UID único de Firebase
  "email": "string",              // Email del usuario de Google
  "display_name": "string",       // Nombre completo del usuario
  "photo_url": "string",          // URL de la foto de perfil de Google
  "firebase_token": "string"      // Token de Firebase (opcional, para verificación)
}
```

#### Response Success (200)

```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "",
      "role": "cliente",
      "photo_url": "https://lh3.googleusercontent.com/...",
      "firebase_uid": "firebase_uid_here",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

#### Response Error (400/401/500)

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## Implementación en Node.js/Express (Ejemplo)

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase-admin'); // Firebase Admin SDK

router.post('/google-login', async (req, res) => {
  try {
    const { firebase_uid, email, display_name, photo_url, firebase_token } = req.body;

    // Validación básica
    if (!firebase_uid || !email) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID y email son requeridos'
      });
    }

    // Opcional: Verificar el token de Firebase usando Firebase Admin SDK
    if (firebase_token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(firebase_token);
        if (decodedToken.uid !== firebase_uid) {
          return res.status(401).json({
            success: false,
            message: 'Token de Firebase inválido'
          });
        }
      } catch (error) {
        console.error('Error verificando token de Firebase:', error);
        return res.status(401).json({
          success: false,
          message: 'Token de Firebase inválido'
        });
      }
    }

    // Dividir el nombre completo
    const nameParts = display_name ? display_name.split(' ') : ['', ''];
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Buscar o crear usuario en la base de datos
    let user = await db.query(
      'SELECT * FROM users WHERE firebase_uid = ? OR email = ?',
      [firebase_uid, email]
    );

    if (user.length === 0) {
      // Crear nuevo usuario
      const result = await db.query(
        `INSERT INTO users
        (email, first_name, last_name, role, firebase_uid, photo_url, created_at, updated_at)
        VALUES (?, ?, ?, 'cliente', ?, ?, NOW(), NOW())`,
        [email, first_name, last_name, firebase_uid, photo_url]
      );

      user = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = user[0];
    } else {
      user = user[0];

      // Actualizar datos si es necesario
      await db.query(
        `UPDATE users
        SET firebase_uid = ?, photo_url = ?, first_name = ?, last_name = ?, updated_at = NOW()
        WHERE id = ?`,
        [firebase_uid, photo_url, first_name || user.first_name, last_name || user.last_name, user.id]
      );

      // Recargar usuario actualizado
      user = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
      user = user[0];
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remover campos sensibles
    delete user.password;

    res.json({
      success: true,
      data: {
        token,
        user
      }
    });

  } catch (error) {
    console.error('Error en google-login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
```

## Migración de Base de Datos

Si necesitas agregar soporte para Firebase UID en tu tabla de usuarios:

```sql
-- Agregar columna firebase_uid a la tabla users
ALTER TABLE users
ADD COLUMN firebase_uid VARCHAR(128) UNIQUE AFTER email,
ADD COLUMN photo_url TEXT AFTER phone;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_firebase_uid ON users(firebase_uid);
```

## Configuración de Firebase Admin SDK (Opcional pero recomendado)

Para verificar tokens de Firebase en el backend:

### 1. Instalar Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Obtener credenciales de servicio

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "pescandocostarica-b3ed9"
3. Ve a **Project Settings > Service Accounts**
4. Click en "Generate new private key"
5. Guarda el archivo JSON en una ubicación segura (NO lo subas a git)

### 3. Configurar Firebase Admin

```javascript
// config/firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = { admin };
```

### 4. Variables de entorno (Alternativa más segura)

En lugar de un archivo JSON, puedes usar variables de entorno:

```bash
# .env en el backend
FIREBASE_PROJECT_ID=pescandocostarica-b3ed9
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pescandocostarica-b3ed9.iam.gserviceaccount.com
```

```javascript
// config/firebase-admin.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

module.exports = { admin };
```

## Testing

Puedes probar el endpoint con este curl:

```bash
curl -X POST http://localhost:5000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_firebase_uid",
    "email": "test@example.com",
    "display_name": "Test User",
    "photo_url": "https://example.com/photo.jpg"
  }'
```

## Modo Actual (Sin Backend)

Mientras no implementes el endpoint, la aplicación funcionará en "modo Firebase-only":

✅ **Funciona:**
- Login con Google
- Registro con Google
- Visualización del perfil del usuario
- Menú de usuario con avatar de Google
- Logout

⚠️ **Limitado:**
- Creación de reservas
- Gestión de tours (solo para capitanes)
- Sincronización con la base de datos
- Funciones que requieren datos del backend

## Próximos Pasos

1. ✅ Firebase está configurado y funcionando
2. ⏳ Implementar endpoint `/auth/google-login` en el backend
3. ⏳ Agregar columnas `firebase_uid` y `photo_url` a la tabla users
4. ⏳ Probar la integración completa
5. ⏳ Opcional: Configurar Firebase Admin SDK para verificación de tokens

## Recursos

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [JWT Best Practices](https://jwt.io/introduction)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
