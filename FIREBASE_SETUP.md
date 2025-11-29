# Configuración de Firebase para Pescando Costa Rica

Este documento explica cómo configurar Firebase Authentication con Google Sign-In para el proyecto.

## Paso 1: Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Ingresa el nombre del proyecto: `Pescando Costa Rica`
4. Sigue los pasos del asistente de configuración

## Paso 2: Habilitar Authentication

1. En el panel de Firebase, ve a **Authentication** en el menú lateral
2. Haz clic en "Get Started" o "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Habilita los siguientes métodos de inicio de sesión:
   - **Email/Password**: Actívalo
   - **Google**: Actívalo
     - Configura el nombre público del proyecto
     - Ingresa el email de soporte del proyecto

## Paso 3: Registrar tu aplicación web

1. En la página de inicio del proyecto, haz clic en el ícono web `</>`
2. Ingresa un apodo para la app: `Pescando Costa Rica Web`
3. NO marques "Firebase Hosting" por ahora
4. Haz clic en "Registrar app"

## Paso 4: Obtener las credenciales de Firebase

Después de registrar la app, verás un objeto `firebaseConfig` similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Paso 5: Configurar las variables de entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores de Firebase con tus credenciales:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

## Paso 6: Configurar dominios autorizados

1. Ve a **Authentication > Settings > Authorized domains**
2. Agrega los siguientes dominios:
   - `localhost` (ya está por defecto)
   - Tu dominio de producción (ej: `pescandocostarica.com`)
   - Tu dominio de Vercel si usas Vercel (ej: `tu-app.vercel.app`)

## Paso 7: Configurar OAuth en Google Cloud Console

Para que Google Sign-In funcione en producción:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto de Firebase
3. Ve a **APIs & Services > Credentials**
4. Encuentra el OAuth 2.0 Client ID creado por Firebase
5. Edítalo y agrega:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://tu-dominio.com`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `https://tu-dominio.com`
     - `https://tu-proyecto.firebaseapp.com/__/auth/handler`

## Paso 8: Actualizar el Backend

El backend necesita un endpoint para manejar el login de Google. Asegúrate de tener un endpoint:

**POST** `/api/auth/google-login`

Que reciba:
```json
{
  "firebase_uid": "string",
  "email": "string",
  "display_name": "string",
  "photo_url": "string",
  "firebase_token": "string"
}
```

Y retorne:
```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "cliente"
    }
  }
}
```

## Paso 9: Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno:

```bash
npm run dev
```

## Características implementadas

### Componentes creados:
- ✅ **UserMenu**: Componente de menú de usuario con dropdown
- ✅ **Firebase Auth**: Servicio de autenticación con Firebase
- ✅ **Google Sign-In**: Botón de inicio de sesión con Google en login y registro

### Funcionalidades:
- ✅ Login con email y contraseña (existente)
- ✅ Login con Google (nuevo)
- ✅ Registro con email y contraseña (existente)
- ✅ Registro con Google (nuevo)
- ✅ Menú de usuario en navbar con opciones según rol
- ✅ Logout sincronizado con Firebase
- ✅ Estados de autenticación persistentes

### Rutas del menú de usuario:

**Para Pescadores (Clientes):**
- Mi Perfil: `/dashboard`
- Mis Reservas: `/dashboard/reservas`
- Favoritos: `/dashboard/favoritos`
- Configuración: `/dashboard/configuracion`

**Para Capitanes:**
- Dashboard: `/dashboard/capitan`
- Mis Tours: `/dashboard/capitan/tours`
- Reservas: `/dashboard/capitan/reservas`
- Configuración: `/dashboard/configuracion`

## Solución de problemas

### Error: "Firebase: Error (auth/popup-blocked)"
- El navegador está bloqueando popups. Permite popups para localhost

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Agrega el dominio a los dominios autorizados en Firebase Console

### Error: "Firebase: Error (auth/operation-not-allowed)"
- Asegúrate de habilitar Google Sign-In en Firebase Console

### El usuario no aparece en el menú después de login
- Verifica que el backend retorne correctamente los datos del usuario
- Revisa la consola del navegador para errores

## Siguientes pasos

1. Configurar el endpoint `/api/auth/google-login` en el backend
2. Crear las páginas del dashboard para usuarios y capitanes
3. Implementar la gestión de perfiles de usuario
4. Agregar más proveedores de autenticación si es necesario (Facebook, Apple, etc.)

## Recursos adicionales

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
