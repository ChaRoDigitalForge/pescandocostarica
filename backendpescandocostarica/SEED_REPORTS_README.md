# 🌱 Seed de Datos para Reportes de Pesca

Este script genera datos de prueba para demostrar la funcionalidad de los reportes de pesca en la página principal.

## 📋 ¿Qué hace el script?

El script `seed-reports-data.js` crea automáticamente:

1. **Tours de prueba** (si no existen):
   - 4 tours con diferentes tipos de pesca (offshore, inshore, river, lake)
   - Con precios, duración y capacidad variados

2. **Usuarios de prueba** (si no existen):
   - 5 usuarios con rol "user" para hacer reservas

3. **Reservas (Bookings)**:
   - ~60-90 reservas distribuidas en los últimos 30 días
   - Más reservas en los días recientes (últimos 7 días)
   - Estados: 'confirmed' y 'completed'

4. **Reviews**:
   - ~30 reviews para reservas completadas
   - Ratings entre 3-5 estrellas (mayoría 4-5 para mejor probabilidad)
   - Comentarios realistas de clientes

5. **Actualización de estadísticas**:
   - Average rating por tour
   - Total de reviews
   - Total de bookings

## 🚀 Cómo ejecutar

### Opción 1: Usando npm script (Recomendado)

```bash
cd backendpescandocostarica
npm run seed:reports
```

### Opción 2: Ejecutar directamente

```bash
cd backendpescandocostarica
node src/database/migrations/seed-reports-data.js
```

## ⚙️ Requisitos previos

Antes de ejecutar el seed, asegúrate de tener:

1. **Base de datos configurada** con las siguientes tablas:
   - `provincias`
   - `locations`
   - `users` (al menos 1 usuario con rol 'captain')
   - `tours`
   - `bookings`
   - `reviews`

2. **Variable de entorno configurada**:
   ```
   DATABASE_URL=tu_connection_string_de_neon
   ```

3. **Backend corriendo**:
   ```bash
   npm run dev
   ```

## 📊 Datos generados

Después de ejecutar el seed, tendrás:

- ✅ **60-90 reservas** en los últimos 30 días
- ✅ **~30 reviews** con ratings de 3-5 estrellas
- ✅ **4 tours** activos (si no existían)
- ✅ **5 usuarios** de prueba (si no existían)

## 🎯 Prueba los reportes

Una vez ejecutado el seed, ve a la página principal:

```
http://localhost:3000
```

Verás la sección de **"Reportes de Pesca"** con:

1. **Reporte Diario**: Cantidad de reservas de hoy y marinas activas
2. **Especies Activas**: Top 3 tipos de pesca más populares del mes
3. **Probabilidad de Éxito**: Porcentaje calculado basado en datos históricos

## 🔄 Ejecutar múltiples veces

- El script es **seguro de ejecutar múltiples veces**
- No crea datos duplicados
- Solo agrega más reservas y reviews si es necesario

## ⚠️ Notas importantes

- El script usa transacciones, si algo falla se hace ROLLBACK automático
- Las fechas de las reservas son relativas (últimos 30 días desde hoy)
- Los datos son aleatorios pero realistas
- Se priorizan ratings altos (4-5 estrellas) para mostrar buena probabilidad

## 🧹 Limpiar datos de prueba

Si quieres eliminar los datos de prueba:

```sql
-- Eliminar solo datos de prueba (usuarios test-user-*)
DELETE FROM reviews WHERE user_id IN (
  SELECT id FROM users WHERE firebase_uid LIKE 'test-user-%'
);

DELETE FROM bookings WHERE user_id IN (
  SELECT id FROM users WHERE firebase_uid LIKE 'test-user-%'
);

DELETE FROM users WHERE firebase_uid LIKE 'test-user-%';

-- O eliminar tours de prueba
DELETE FROM tours WHERE slug LIKE 'tour-prueba-%';
```

## 📞 Soporte

Si tienes problemas ejecutando el seed:

1. Verifica que la conexión a la base de datos funcione
2. Asegúrate de tener al menos 1 provincia, 1 location y 1 usuario capitán
3. Revisa los logs para ver el error específico
