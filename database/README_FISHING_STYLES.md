# Migración: Estilos de Pesca (Fishing Styles)

## Descripción

Esta migración agrega la funcionalidad de **Estilos de Pesca** al sistema. Los estilos de pesca son técnicas o modalidades de pesca que se practican en los tours, como:

- Equipo Ligero
- Equipo Pesado
- Fondo
- Pesca en Alta Mar
- Fly Fishing
- Cuerda de Mano
- Jigging
- Señuelo
- Orilla
- Spinning
- Baitcaster
- Trolling

## Archivos Modificados

### Base de Datos
- `database/add_fishing_styles.sql` - Script de migración SQL

### Backend
- `backendrepo/src/services/fishing-styles/controller.js` - Controlador de estilos de pesca
- `backendrepo/src/services/fishing-styles/routes.js` - Rutas API para estilos de pesca
- `backendrepo/src/services/tours/controller.js` - Actualizado para incluir fishing styles
- `backendrepo/src/server.js` - Agregada ruta de fishing-styles

### Frontend
- `lib/api.js` - Nuevas funciones API para fishing styles
- `components/dashboard/TourFishingStylesSelector.js` - Componente selector de estilos
- `app/tours/page.js` - Página de tours con filtro de estilos de pesca

## Aplicar la Migración

### 1. Ejecutar Script SQL

Ejecuta el siguiente comando en tu base de datos Neon PostgreSQL:

```bash
psql "postgresql://tu-usuario@tu-host.neon.tech/neondb?sslmode=require" -f database/add_fishing_styles.sql
```

O copia el contenido de `database/add_fishing_styles.sql` y ejecútalo en el editor SQL de Neon.

### 2. Verificar Tablas Creadas

Verifica que se crearon las tablas correctamente:

```sql
-- Verificar tabla fishing_styles
SELECT * FROM fishing_styles;

-- Verificar tabla tour_fishing_styles
SELECT * FROM tour_fishing_styles LIMIT 5;

-- Contar estilos de pesca
SELECT COUNT(*) FROM fishing_styles;
-- Debe devolver 12
```

### 3. Reiniciar Backend

```bash
cd backendrepo
npm run dev
```

### 4. Reiniciar Frontend

```bash
cd pescandocostarica
npm run dev
```

## Nuevos Endpoints API

### GET /api/fishing-styles
Obtiene todos los estilos de pesca.

**Query Parameters:**
- `active_only` (boolean) - Solo estilos activos (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Equipo Ligero",
      "slug": "equipo-ligero",
      "description": "Pesca con equipo ligero...",
      "icon": "🎣",
      "is_active": true,
      "display_order": 1
    }
  ]
}
```

### GET /api/fishing-styles/:id
Obtiene un estilo de pesca por ID.

### GET /api/fishing-styles/slug/:slug
Obtiene un estilo de pesca por slug.

### GET /api/fishing-styles/:id/tours
Obtiene tours que usan un estilo de pesca específico.

**Query Parameters:**
- `page` (number) - Número de página (default: 1)
- `limit` (number) - Tours por página (default: 12)

### GET /api/tours?fishing_style_id=X
Filtra tours por estilo de pesca.

**Ejemplo:**
```bash
curl "http://localhost:5000/api/tours?fishing_style_id=4&limit=10"
```

## Uso en el Frontend

### 1. Obtener Estilos de Pesca

```javascript
import { getFishingStyles } from '@/lib/api';

const styles = await getFishingStyles(true);
console.log(styles.data); // Array de estilos
```

### 2. Filtrar Tours por Estilo

```javascript
import { getTours } from '@/lib/api';

const tours = await getTours({
  fishing_style_id: 4, // Pesca en Alta Mar
  limit: 12
});
```

### 3. Usar Componente Selector

```javascript
import TourFishingStylesSelector from '@/components/dashboard/TourFishingStylesSelector';

function TourForm() {
  const [selectedStyles, setSelectedStyles] = useState([]);

  return (
    <TourFishingStylesSelector
      selectedStyles={selectedStyles}
      onChange={setSelectedStyles}
    />
  );
}
```

## Estructura de Datos

### Tabla: fishing_styles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| name | VARCHAR(100) | Nombre del estilo |
| slug | VARCHAR(100) | Slug para URLs |
| description | TEXT | Descripción |
| icon | VARCHAR(50) | Icono (emoji o clase) |
| is_active | BOOLEAN | Si está activo |
| display_order | INTEGER | Orden de visualización |

### Tabla: tour_fishing_styles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| tour_id | UUID | ID del tour |
| fishing_style_id | INTEGER | ID del estilo |

## Integración con Tours

Cuando recuperas un tour con `GET /api/tours/:slug`, ahora incluye:

```json
{
  "id": "...",
  "title": "Tour de Pesca",
  "fishing_styles": [
    {
      "id": 4,
      "name": "Pesca en Alta Mar",
      "slug": "pesca-alta-mar",
      "description": "...",
      "icon": "🎣"
    }
  ]
}
```

## Testing

### 1. Test Backend

```bash
# Obtener todos los estilos
curl http://localhost:5000/api/fishing-styles

# Obtener tours con estilo específico
curl "http://localhost:5000/api/tours?fishing_style_id=1"

# Obtener tours por estilo
curl http://localhost:5000/api/fishing-styles/1/tours
```

### 2. Test Frontend

1. Ve a http://localhost:3000/tours
2. Usa el filtro "Estilo de Pesca" en el sidebar
3. Los tours deben filtrarse según el estilo seleccionado

## Troubleshooting

### Error: "fishing_styles table does not exist"
- Ejecuta el script SQL de migración
- Verifica la conexión a la base de datos

### Error: "Cannot read property 'fishing_styles'"
- Verifica que el backend esté actualizado
- Reinicia el servidor backend

### Filtro no funciona
- Verifica que el frontend esté llamando a `getTours()` con los filtros correctos
- Revisa la consola del navegador para errores

## Notas Adicionales

- Los estilos de pesca son **opcionales** para un tour
- Un tour puede tener **múltiples estilos** de pesca
- Los estilos son **globales** y pueden reutilizarse en múltiples tours
- El orden de los estilos se controla con `display_order`

## Próximos Pasos

1. Agregar iconos personalizados para cada estilo
2. Crear página dedicada para cada estilo de pesca
3. Agregar estadísticas de tours por estilo
4. Implementar badges visuales de estilos en las tarjetas de tours
