# Configuración de Netlify con Base de Datos Neon

Este documento describe cómo conectar tu aplicación Next.js con Netlify y la base de datos Neon.

## Archivos configurados

### 1. Package.json
Se instaló el paquete `@neondatabase/serverless` para la conexión con Neon:
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^1.0.2"
  }
}
```

### 2. netlify.toml
Archivo de configuración para el deployment en Netlify:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  node_bundler = "esbuild"
```

### 3. lib/db.js
Utilidad para conectar con la base de datos:
```javascript
import { neon } from '@neondatabase/serverless';

export function getSQL() {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL o NETLIFY_DATABASE_URL no está definida');
  }
  return neon(databaseUrl);
}

export const sql = getSQL();
```

## Uso en tu aplicación

### Ejemplo básico:
```javascript
import { sql } from '@/lib/db';

// En un API route o Server Component
export async function GET() {
  const tours = await sql`SELECT * FROM tours WHERE is_active = true`;
  return Response.json(tours);
}
```

### Con parámetros:
```javascript
import { sql } from '@/lib/db';

const tourId = 1;
const [tour] = await sql`SELECT * FROM tours WHERE id = ${tourId}`;
```

## API Routes de Next.js

La aplicación usa **Next.js API Routes** integradas (no backend separado). Todos los endpoints están en `app/api/`:

### Endpoints disponibles:
- **Tours**: `/api/tours`, `/api/tours/featured`, `/api/tours/search`, `/api/tours/[slug]`
- **Bookings**: `/api/bookings`, `/api/bookings/promo/[code]/validate`
- **Site**: `/api/site/settings`, `/api/site/hero-slides`, `/api/site/features`
- **Reviews**: `/api/tours/[slug]/reviews`
- **Disponibilidad**: `/api/tours/[slug]/availability`

Todas las rutas usan `@neondatabase/serverless` para conectar directamente con Neon.

## Configuración en Netlify

### Paso 1: Resolver problema de contribuidores Git

⚠️ **IMPORTANTE**: Netlify puede rechazar el deploy si detecta múltiples contribuidores en repo privado.

**Solución 1 (Recomendado)**: Vincular tus emails de Git en Netlify
1. Ve a [Netlify User Settings → Git contributors](https://app.netlify.com/user/applications#git)
2. Vincula todos tus emails de Git a tu cuenta de Netlify
3. Re-deploy

**Solución 2**: Hacer el repositorio público en GitHub
- Settings → General → Danger Zone → Change visibility → Make public

### Paso 2: Deploy inicial
1. Sube tu código a GitHub: `git push origin main`
2. Ve a [https://app.netlify.com](https://app.netlify.com)
3. Click en "Add new site" → "Import an existing project"
4. Selecciona "GitHub" y autoriza
5. Busca y selecciona: `javchave/pescandocostarica`
6. Netlify detectará automáticamente Next.js

### Paso 3: Configurar variables de entorno
En Netlify Dashboard → `Site settings` → `Environment variables`:

**Base de Datos (Requerido):**
```
NETLIFY_DATABASE_URL = postgresql://neondb_owner:npg_1ElCPWV4xLjr@ep-quiet-feather-a4efkuis-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Firebase (Requerido):**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDXuRJ-Mp9tOSLHVkOENXzKoI499HyxAh4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = pescandocostarica-b3ed9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = pescandocostarica-b3ed9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = pescandocostarica-b3ed9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 680583036350
NEXT_PUBLIC_FIREBASE_APP_ID = 1:680583036350:web:818dcba39e0e618f850def
```

**API URL (Opcional - ya usa rutas locales por defecto):**
```
NEXT_PUBLIC_API_URL = /api
```

### Paso 4: Deploy
Después de configurar variables:
1. Click en "Deploys" → "Trigger deploy" → "Deploy site"
2. Netlify automáticamente:
   - Instala dependencias (`npm install`)
   - Ejecuta `npm run build`
   - Despliega tu aplicación con todas las API Routes

### Paso 5: Verificar
Una vez completado el deploy:
- Netlify te dará una URL: `https://tu-sitio.netlify.app`
- Prueba las API routes: `https://tu-sitio.netlify.app/api/tours`
- Configura dominio personalizado si lo deseas

## Ventajas de @neondatabase/serverless

1. **Optimizado para Edge**: Funciona en Netlify Edge Functions
2. **Lightweight**: Paquete pequeño, carga rápida
3. **Compatible**: Funciona con Netlify, Vercel, Cloudflare Workers
4. **HTTP-based**: No necesita conexiones TCP persistentes
5. **Escalable**: Perfect para serverless

## Desarrollo local

Para desarrollo local:
1. Las variables están en `.env.local`
2. Usa `DATABASE_URL` (ya configurada)
3. Ejecuta: `npm run dev`

## Producción

En producción (Netlify):
1. Usa `NETLIFY_DATABASE_URL` (automáticamente)
2. La conexión es vía HTTPS
3. Sin límites de conexiones simultáneas

## Troubleshooting

### Error: "Unrecognized Git contributor"
**Problema**: Netlify detecta múltiples contribuidores en repo privado.
**Solución**:
1. Ve a [Netlify User Settings → Git contributors](https://app.netlify.com/user/applications#git)
2. Vincula todos tus emails de Git a tu cuenta
3. O haz el repositorio público en GitHub

### Error: "Backend se cae" o API no responde
**Problema**: El backend separado no existe en Netlify.
**Solución**: Ya está resuelto. Ahora usamos Next.js API Routes integradas en `/api/`.

### Error: DATABASE_URL no definida
- Verifica que `NETLIFY_DATABASE_URL` esté en Netlify Dashboard
- Redeploy después de agregar variables: Deploys → Trigger deploy → Clear cache and deploy

### Error de conexión a base de datos
- Verifica que la URL de Neon sea correcta
- Asegúrate de incluir `?sslmode=require`
- Verifica que tu plan de Neon esté activo

### Build falla
- Verifica que `@neondatabase/serverless` esté en dependencies del package.json
- Ejecuta `npm install` localmente primero para verificar
- Revisa los logs de build en Netlify para errores específicos

### API Routes retornan 404
- Verifica que los archivos estén en `app/api/` (no `pages/api/`)
- Asegúrate de que el build fue exitoso
- Verifica que las rutas usen la estructura correcta de Next.js App Router

## Recursos

- [Neon Documentation](https://neon.tech/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
