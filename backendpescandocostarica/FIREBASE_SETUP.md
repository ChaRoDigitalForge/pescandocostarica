# 🔥 Firebase Configuration Guide

## Configurar Firebase Authentication

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" (Agregar proyecto)
3. Nombre del proyecto: `pescando-costarica` (o el que prefieras)
4. Acepta los términos y click "Continue"
5. Deshabilita Google Analytics (opcional)
6. Click "Create project"

### Paso 2: Obtener Credenciales del Service Account

1. En Firebase Console, ve a **Project Settings** (⚙️ > Project Settings)
2. Click en la pestaña **"Service accounts"**
3. Click en **"Generate new private key"**
4. Se descargará un archivo JSON con tus credenciales

### Paso 3: Configurar Variables de Entorno

Abre el archivo JSON descargado y copia los valores al archivo `.env`:

**Archivo JSON de Firebase:**
```json
{
  "type": "service_account",
  "project_id": "pescando-costarica-xxxxx",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@pescando-costarica-xxxxx.iam.gserviceaccount.com",
  ...
}
```

**Copiar a `.env`:**
```env
FIREBASE_PROJECT_ID=pescando-costarica-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pescando-costarica-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:**
- La `FIREBASE_PRIVATE_KEY` debe estar entre comillas dobles
- NO remuevas los `\n` del private key

### Paso 4: Habilitar Authentication en Firebase

1. En Firebase Console, ve a **Build > Authentication**
2. Click en **"Get started"**
3. En la pestaña **"Sign-in method"**, habilita:
   - ✅ **Email/Password**
   - ✅ **Google** (opcional)
   - ✅ Otros providers según necesites

### Paso 5: Configurar Dominios Autorizados

1. En **Authentication > Settings**
2. En **"Authorized domains"**, agrega:
   - `localhost` (ya está por defecto)
   - Tu dominio de producción (ej: `pescandocostarica.com`)

### Paso 6: Reiniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Firebase Admin initialized successfully
✅ Connected to Neon PostgreSQL database
```

## Configurar Firebase en el Frontend (Next.js)

### 1. Instalar Firebase SDK

```bash
cd ..
npm install firebase
```

### 2. Crear Configuración de Firebase

Crea `lib/firebase.js`:

```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export default app;
```

### 3. Obtener Credenciales del Frontend

1. En Firebase Console, ve a **Project Settings**
2. En **"Your apps"**, click en el ícono web `</>`
3. Registra tu app con el nombre "Pescando Costa Rica Web"
4. Copia la configuración

### 4. Agregar al `.env.local` del Frontend

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pescando-costarica-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pescando-costarica-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pescando-costarica-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Probar la Autenticación

### Crear un Usuario de Prueba

En Firebase Console:
1. Ve a **Authentication > Users**
2. Click en **"Add user"**
3. Email: `test@pescandocostarica.com`
4. Password: `test123456`
5. Click "Add user"

### Probar desde el Frontend

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'test@pescandocostarica.com',
      'test123456'
    );

    const token = await userCredential.user.getIdToken();
    console.log('Token:', token);

    // Crear usuario en tu backend
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebase_uid: userCredential.user.uid,
        email: userCredential.user.email,
        first_name: 'Test',
        last_name: 'User',
        role: 'cliente'
      })
    });

    console.log('User created:', await response.json());
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## Probar Endpoints Protegidos

Una vez autenticado, usa el token en las peticiones:

```javascript
const token = await auth.currentUser.getIdToken();

const response = await fetch('http://localhost:5000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const profile = await response.json();
```

## Troubleshooting

### Error: "Failed to parse private key"

- Asegúrate de que `FIREBASE_PRIVATE_KEY` esté entre comillas dobles
- NO remuevas los `\n` del private key
- Verifica que no haya espacios extras

### Error: "Invalid token"

- El token puede haber expirado (válido por 1 hora)
- Obtén un nuevo token: `await auth.currentUser.getIdToken(true)`

### Error: "User not found"

- El usuario existe en Firebase pero no en tu base de datos
- Crea el usuario con `POST /api/users`

## Seguridad en Producción

⚠️ **IMPORTANTE:**

1. **Nunca** commitees el archivo `.env` al repositorio
2. Agrega `.env` a `.gitignore`
3. En producción, usa variables de entorno del servidor
4. Habilita **App Check** en Firebase para protección extra
5. Configura **Security Rules** apropiadas

## Recursos

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Auth REST API](https://firebase.google.com/docs/reference/rest/auth)

¡Listo! Ahora tienes autenticación completa con Firebase 🔥
