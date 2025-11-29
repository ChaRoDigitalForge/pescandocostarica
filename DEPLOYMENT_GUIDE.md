# Guía de Deployment - Pescando Costa Rica

## Arquitectura Actual

Tu aplicación tiene **dos partes separadas**:

1. **Frontend**: Next.js en la raíz del proyecto
2. **Backend**: Express API en `backendpescandocostarica/`

## Desarrollo Local

### Iniciar Backend (Puerto 5000)
```bash
cd backendpescandocostarica
npm run dev
```

El backend estará disponible en: `http://localhost:5000/api`

Endpoints:
- `http://localhost:5000/api/tours`
- `http://localhost:5000/api/bookings`
- `http://localhost:5000/api/site`
- `http://localhost:5000/api/health`

### Iniciar Frontend (Puerto 3000)
```bash
# En otra terminal, desde la raíz
npm run dev
```

El frontend estará en: `http://localhost:3000`
El frontend se conectará automáticamente al backend en `http://localhost:5000/api`

---

## Deployment en Producción

### ⚠️ PROBLEMA: Netlify no soporta backend Express separado

Netlify solo puede hostear aplicaciones **frontend** (Next.js, React, etc.) y **API Routes de Next.js**.
**NO puede correr un servidor Express separado** como el que tienes en `backendpescandocostarica/`.

### Opciones de Deployment

#### **Opción 1: Backend y Frontend Separados** (Recomendado para flexibilidad)

**Backend en Render/Railway/Fly.io:**
1. Hostea el backend Express en un servicio que soporte Node.js:
   - [Render.com](https://render.com) (Gratis con limitaciones)
   - [Railway.app](https://railway.app) (Gratis $5 crédito mensual)
   - [Fly.io](https://fly.io) (Gratis con limitaciones)

2. Configura variables de entorno en el servicio elegido (ver `.env.example`)

3. Obtén la URL de tu backend deployado, por ejemplo:
   - `https://tu-backend.onrender.com`

**Frontend en Netlify:**
1. Ve a [Netlify](https://app.netlify.com)
2. Conecta el repositorio `javchave/pescandocostarica`
3. Configura variables de entorno:
   ```
   NEXT_PUBLIC_API_URL = https://tu-backend.onrender.com/api
   NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDXuRJ-Mp9tOSLHVkOENXzKoI499HyxAh4
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = pescandocostarica-b3ed9.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = pescandocostarica-b3ed9
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = pescandocostarica-b3ed9.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 680583036350
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:680583036350:web:818dcba39e0e618f850def
   ```
4. Deploy

**Ventajas:**
- ✅ Backend y frontend independientes
- ✅ Puedes escalar cada uno por separado
- ✅ Backend puede tener su propia base de datos, cronjobs, etc.

**Desventajas:**
- ❌ Dos servicios separados para mantener
- ❌ Necesitas configurar CORS correctamente

---

#### **Opción 2: Todo en Netlify con API Routes** (Más simple)

Migrar tu backend Express a Next.js API Routes (ya creadas en `app/api/`).

**Ventajas:**
- ✅ Un solo deploy
- ✅ Todo en Netlify
- ✅ Más simple de mantener

**Desventajas:**
- ❌ Pierdes la arquitectura de microservicios actual
- ❌ Limitaciones de serverless (timeouts, cold starts)

**Para usar esta opción:**
1. Elimina la carpeta `backendpescandocostarica/`
2. Cambia en `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=/api
   ```
3. Usa las API Routes que ya están en `app/api/`
4. Deploy en Netlify

---

#### **Opción 3: Todo en Vercel** (Alternativa a Netlify)

Vercel soporta Next.js de forma nativa y podría manejar mejor las API Routes.

Similar a la Opción 2, pero deployado en Vercel en lugar de Netlify.

---

## Recomendación

Para tu caso, **Opción 1** es la mejor:

1. **Backend Express en Render** (gratis):
   - Mantiene tu arquitectura actual
   - No necesitas cambiar código
   - Render tiene deploy automático desde Git

2. **Frontend Next.js en Netlify** (gratis):
   - Excelente para Next.js
   - CDN global
   - Deploy automático

### Pasos para Opción 1:

#### A. Deploy Backend en Render

1. Ve a [https://render.com](https://render.com) y crea cuenta
2. Click "New +" → "Web Service"
3. Conecta tu repositorio GitHub `javchave/pescandocostarica`
4. Configura:
   - **Root Directory**: `backendpescandocostarica`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Agrega variables de entorno (desde `backendpescandocostarica/.env.example`)
6. Click "Create Web Service"
7. Copia la URL que te dan (ej: `https://pescandocostarica-backend.onrender.com`)

#### B. Deploy Frontend en Netlify

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. "Add new site" → "Import an existing project"
3. Conecta GitHub → `javchave/pescandocostarica`
4. Netlify detectará Next.js automáticamente
5. **IMPORTANTE**: En "Environment variables" agrega:
   ```
   NEXT_PUBLIC_API_URL = https://pescandocostarica-backend.onrender.com/api
   ```
   (Reemplaza con tu URL de Render)
6. También agrega las variables de Firebase (ver arriba)
7. Deploy

#### C. Resolver Problema de Contribuidores Git

Como mencionamos antes:
- Ve a [Netlify User Settings → Git contributors](https://app.netlify.com/user/applications#git)
- Vincula tus emails: `jpablochr@gmail.com`, `marcovcr11@gmail.com`, `developer@pescandocostarica.com`
- O haz el repo público

---

## Configuración CORS en el Backend

Si despliegas backend separado, asegúrate de configurar CORS en `backendpescandocostarica/src/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',           // Desarrollo local
    'https://tu-sitio.netlify.app',    // Producción Netlify
    'https://pescandocostarica.com'    // Tu dominio personalizado
  ],
  credentials: true
}));
```

---

## Resumen

| Opción | Backend | Frontend | Complejidad | Costo |
|--------|---------|----------|-------------|-------|
| 1. Backend + Frontend separados | Render/Railway | Netlify | Media | Gratis |
| 2. Todo en Netlify con API Routes | Netlify (API Routes) | Netlify | Baja | Gratis |
| 3. Todo en Vercel | Vercel (API Routes) | Vercel | Baja | Gratis |

**Recomendado**: Opción 1 para mantener tu arquitectura actual.

---

## Troubleshooting

### Backend en Render no inicia
- Revisa logs en Render Dashboard
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que `DATABASE_URL` apunte a Neon

### Frontend no conecta con backend
- Verifica que `NEXT_PUBLIC_API_URL` esté correcta en Netlify
- Revisa CORS en el backend
- Verifica que el backend esté corriendo (visita `/api/health`)

### Error de Git contributors en Netlify
- Vincula todos tus emails en Netlify User Settings
- O haz el repositorio público en GitHub
