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

## Configuración en Netlify

### Paso 1: Deploy inicial
1. Sube tu código a GitHub
2. Conecta tu repositorio con Netlify
3. Netlify detectará automáticamente Next.js

### Paso 2: Configurar variables de entorno
En Netlify Dashboard:
1. Ve a `Site settings` → `Environment variables`
2. Agrega la siguiente variable:

```
NETLIFY_DATABASE_URL = postgresql://neondb_owner:npg_1ElCPWV4xLjr@ep-quiet-feather-a4efkuis-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Paso 3: También agrega otras variables necesarias:
```
NEXT_PUBLIC_FIREBASE_API_KEY = tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID = tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = tu_app_id
```

### Paso 4: Deploy
Netlify automáticamente:
- Instala dependencias
- Ejecuta `npm run build`
- Despliega tu aplicación

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

### Error: DATABASE_URL no definida
- Verifica que la variable esté en Netlify Dashboard
- Redeploy después de agregar variables

### Error de conexión
- Verifica que la URL de Neon sea correcta
- Asegúrate de incluir `?sslmode=require`

### Build falla
- Verifica que `@neondatabase/serverless` esté en dependencies
- Ejecuta `npm install` localmente primero

## Recursos

- [Neon Documentation](https://neon.tech/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
