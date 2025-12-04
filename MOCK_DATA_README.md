# Tours de Ejemplo - Modo Mock

Este proyecto incluye **22 tours de ejemplo** con datos variados para desarrollo y pruebas locales sin necesidad de conectarse al backend.

## 🎣 Tours Incluidos

### Tours Premium de Alta Mar ($950 - $2,400)
- Pesca de Marlín Azul Premium - Quepos ($1,250)
- Aventura de Pez Vela - Flamingo ($1,100)
- Pesca de Dorado - Golfito ($950)
- Expedición de Lujo 2 Días - Flamingo ($2,400)
- VIP Marlín Experience - Papagayo ($1,800)

### Tours Costeros ($240 - $620)
- Pesca Costera Familiar - Tamarindo ($380)
- Pesca al Atardecer - Playa del Coco ($420)
- Pesca de Pargo - Playa Herradura ($550)
- Pesca Caribeña - Puerto Viejo ($390)
- Pesca Nocturna - Quepos ($620)
- Tours básicos desde $240

### Tours de Río y Manglar ($250 - $680)
- Pesca de Róbalo en Manglar Sierpe ($480)
- Pesca de Tarpón - Tortuguero ($680)
- Pesca en Río Sarapiquí ($420)
- Pesca de Trucha - Río Virilla ($250)

### Tours de Lago ($320 - $580)
- Pesca de Guapote - Lago Arenal ($520)
- Pesca en Embalse Cachí ($320)
- Tour de Pesca - Lago Cote ($450)
- Fly Fishing de Montaña ($580)

### Tours Especializados
- Pesca en Kayak - Golfo de Nicoya ($340)
- Pesca + Snorkeling Combo - Playa Carrillo ($480)

## 📍 Provincias Representadas

Los tours cubren todas las provincias principales:
- **Guanacaste**: 7 tours (Tamarindo, Flamingo, Coco, Papagayo)
- **Puntarenas**: 9 tours (Quepos, Golfito, Sierpe, Jacó)
- **Limón**: 2 tours (Tortuguero, Puerto Viejo)
- **Alajuela**: 3 tours (Arenal, Cote, San Carlos)
- **Heredia**: 1 tour (Sarapiquí)
- **Cartago**: 1 tour (Cachí)

## 🎯 Variedad de Opciones

### Por Tipo de Pesca
- Alta Mar: 5 tours
- Costera: 9 tours
- Río: 6 tours
- Lago: 4 tours

### Por Nivel de Dificultad
- Nivel 1 (Principiante): 5 tours
- Nivel 2 (Fácil): 8 tours
- Nivel 3 (Intermedio): 4 tours
- Nivel 4 (Avanzado): 3 tours
- Nivel 5 (Experto): 2 tours

### Por Duración
- 3-4 horas: 6 tours
- 5-6 horas: 10 tours
- 7-8 horas: 5 tours
- 10+ horas: 1 tour

### Por Capacidad
- 2-3 personas: 3 tours
- 4 personas: 9 tours
- 5 personas: 5 tours
- 6 personas: 5 tours

## 🚀 Cómo Usar el Modo Mock

### Opción 1: Habilitar en `.env.local` (Recomendado)

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Establece la variable:
   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Opción 2: Modificar Directamente en el Código

Edita `lib/api.js` y cambia:
```javascript
const USE_MOCK_DATA = true; // Forzar modo mock
```

## 🔄 Cambiar entre Modo Mock y Backend Real

### Usar Datos Mock (Sin Backend)
```bash
# En .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Usar Backend Real
```bash
# En .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Recuerda reiniciar el servidor después de cambiar estas variables.

## 📂 Estructura de Archivos

- **`lib/mockTours.js`**: Contiene los 22 tours de ejemplo y funciones helper
- **`lib/api.js`**: API wrapper que decide entre datos mock o backend real
- **`.env.local`**: Configuración del modo mock

## 🎨 Características de los Tours Mock

Cada tour incluye:
- ✅ Título y slug únicos
- ✅ Descripciones detalladas
- ✅ Tipo de pesca (altaMar, costera, río, lago)
- ✅ Ubicación (provincia y localidad)
- ✅ Precio y precio original (algunos con descuento)
- ✅ Duración en horas y formato display
- ✅ Capacidad de personas
- ✅ Nivel de dificultad (1-5)
- ✅ Rating promedio y número de reviews
- ✅ Galería de imágenes
- ✅ Estado activo
- ✅ Tours destacados (featured)

## 🔍 Filtrado y Búsqueda

Los datos mock soportan filtrado por:
- Provincia
- Tipo de pesca
- Rango de precios
- Tours destacados
- Ordenamiento por precio o rating
- Paginación

Ejemplo de uso:
```javascript
import { getMockTours } from '@/lib/mockTours';

// Obtener tours de Guanacaste
const tours = getMockTours({ provincia: 'guanacaste' });

// Tours de alta mar ordenados por precio
const toursAltaMar = getMockTours({
  fishing_type: 'altaMar',
  sort: 'price',
  order: 'ASC'
});

// Tours destacados baratos
const toursFeatured = getMockTours({
  featured: true,
  max_price: 600
});
```

## 💡 Ventajas del Modo Mock

- ✅ No necesitas levantar el backend
- ✅ No necesitas base de datos
- ✅ Desarrollo frontend independiente
- ✅ Datos consistentes para pruebas
- ✅ Rápido para demos y presentaciones
- ✅ Incluye variedad de precios, ubicaciones y tipos
- ✅ Permite probar filtros y búsquedas

## 🎯 Casos de Uso

### Para Desarrollo
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```
Trabaja en el frontend sin preocuparte por el backend.

### Para Testing
Los datos mock son perfectos para pruebas E2E y visuales.

### Para Demos
Muestra el proyecto funcionando sin configurar infraestructura.

### Para Producción
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```
Usa el backend real con la base de datos PostgreSQL.

## 📝 Notas Importantes

- Los tours mock tienen IDs numéricos simples ('1', '2', etc.)
- Las imágenes usan las rutas existentes en `/public`
- Los datos no se guardan entre sesiones (son estáticos)
- Las funciones de booking y reviews aún requieren el backend
- El modo mock solo afecta las funciones de lectura de tours

## 🔧 Personalización

Para agregar más tours o modificar los existentes, edita el archivo:
```
lib/mockTours.js
```

Cada tour sigue esta estructura:
```javascript
{
  id: 'unique-id',
  slug: 'tour-slug',
  title: 'Título del Tour',
  description: 'Descripción completa...',
  fishing_type: 'altaMar' | 'costera' | 'rio' | 'lago',
  provincia_code: 'codigo-provincia',
  price: 500.00,
  capacity: 4,
  // ... más campos
}
```

## ⚡ Rendimiento

Los datos mock simulan una latencia de red de 300ms para hacer la experiencia más realista. Puedes ajustar esto en `lib/api.js`:

```javascript
setTimeout(() => resolve(getMockTours(filters)), 300); // 300ms
```

---

¡Disfruta desarrollando con datos de ejemplo realistas! 🎣🚤
