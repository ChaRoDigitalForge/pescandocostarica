# Implementación de Botes y Especies Objetivo

Esta actualización agrega información detallada de botes y especies objetivo a los tours de pesca.

## Nuevas Características

### 1. Información de Botes
- Cada tour puede tener uno o más botes asociados
- Detalles incluyen: nombre, tipo, marca, modelo, año, longitud, capacidad
- Características del bote (GPS, Sonar, Baño, etc.)
- Imágenes del bote
- Indicador de bote principal

### 2. Especies Objetivo
- Catálogo de 12 especies de pesca comunes en Costa Rica
- Cada tour puede tener múltiples especies objetivo
- Información incluye:
  - Nombres en español, inglés y científico
  - Descripción
  - Peso promedio y máximo
  - Probabilidad de captura (%)
  - Especies destacadas

### 3. Vistas Actualizadas

#### Vista de Detalle del Tour (`/tours/[slug]`)
Nuevas pestañas:
- **Bote**: Muestra información completa del bote utilizado
- **Especies Objetivo**: Lista de especies que se pueden capturar con probabilidades

#### Vista de Listado (`/tours`)
Las cards de tours ahora muestran:
- Nombre y tipo del bote principal
- Hasta 3 especies objetivo principales (con badges)

## Instalación

### Paso 1: Ejecutar Migraciones de Base de Datos

Las migraciones deben ejecutarse en este orden:

```bash
cd backendpescandocostarica
```

**1. Crear tablas de botes y especies:**
```sql
psql $DATABASE_URL -f src/database/migrations/add_boats_and_species.sql
```

Esta migración crea:
- Tabla `boats` (información de botes)
- Tabla `fish_species` (catálogo de especies)
- Tabla `tour_boats` (relación tour-bote)
- Tabla `tour_target_species` (relación tour-especies)
- 12 especies predefinidas de Costa Rica
- 6 botes de ejemplo para los capitanes existentes

**2. Actualizar vista de tours:**
```sql
psql $DATABASE_URL -f src/database/migrations/update_tours_view.sql
```

Esta migración actualiza la vista `vw_tours_complete` para incluir información de botes y especies.

**3. Vincular tours existentes (Opcional pero recomendado):**
```sql
psql $DATABASE_URL -f src/database/migrations/seed_tour_boats_species.sql
```

Esta migración automáticamente:
- Vincula los tours existentes con los botes de sus capitanes
- Asigna especies apropiadas según el tipo de pesca:
  - **Alta Mar**: Marlín Azul, Pez Vela, Dorado, Atún, Wahoo
  - **Costera**: Róbalo, Corvina, Pargo, Jurel, Dorado
  - **Río**: Sábalo, Róbalo, Guapote
  - **Manglar**: Róbalo, Sábalo, Pargo

### Paso 2: Reiniciar el Backend

```bash
npm run dev
```

### Paso 3: Verificar el Frontend

El frontend ya está actualizado con los cambios. Solo necesitas reiniciar el servidor de desarrollo si está corriendo:

```bash
cd ..
npm run dev
```

## Estructura de Base de Datos

### Tabla `boats`
```sql
- id: SERIAL PRIMARY KEY
- capitan_id: UUID (referencia a users)
- name: VARCHAR(255) - Nombre del bote
- boat_type: VARCHAR(100) - Tipo (Centro Console, Yate, Panga, etc.)
- brand: VARCHAR(100) - Marca
- model: VARCHAR(100) - Modelo
- year: INTEGER - Año
- length_feet: DECIMAL - Longitud en pies
- capacity: INTEGER - Capacidad de personas
- description: TEXT - Descripción
- features: TEXT[] - Array de características
- images: TEXT[] - Array de URLs de imágenes
```

### Tabla `fish_species`
```sql
- id: SERIAL PRIMARY KEY
- name_es: VARCHAR(255) - Nombre en español
- name_en: VARCHAR(255) - Nombre en inglés
- scientific_name: VARCHAR(255) - Nombre científico
- description: TEXT - Descripción
- image_url: TEXT - URL de imagen
- average_weight_lbs: DECIMAL - Peso promedio en libras
- max_weight_lbs: DECIMAL - Peso máximo en libras
- fishing_seasons: INTEGER[] - Meses de temporada
```

### Tabla `tour_boats`
```sql
- tour_id: UUID (referencia a tours)
- boat_id: INTEGER (referencia a boats)
- is_primary: BOOLEAN - Si es el bote principal del tour
```

### Tabla `tour_target_species`
```sql
- tour_id: UUID (referencia a tours)
- species_id: INTEGER (referencia a fish_species)
- probability_percentage: DECIMAL - Probabilidad de captura (0-100)
- is_featured: BOOLEAN - Si es una especie destacada
```

## Especies Predefinidas

La migración incluye estas 12 especies:

1. **Marlín Azul** (Blue Marlin) - 300-1500 lbs
2. **Marlín Negro** (Black Marlin) - 350-1650 lbs
3. **Pez Vela** (Sailfish) - 100-220 lbs
4. **Dorado** (Mahi-Mahi) - 30-88 lbs
5. **Atún Aleta Amarilla** (Yellowfin Tuna) - 100-400 lbs
6. **Wahoo** - 40-180 lbs
7. **Róbalo** (Snook) - 10-50 lbs
8. **Sábalo** (Tarpon) - 80-280 lbs
9. **Pargo** (Snapper) - 10-50 lbs
10. **Corvina** - 15-80 lbs
11. **Jurel** (Jack Crevalle) - 20-65 lbs
12. **Guapote** (Rainbow Bass) - 5-15 lbs

## Gestión de Datos

### Agregar un Nuevo Bote

```sql
INSERT INTO boats (capitan_id, name, boat_type, brand, model, year, length_feet, capacity, description, features)
VALUES (
    'uuid-del-capitan',
    'Mi Bote',
    'Centro Console',
    'Contender',
    '35 ST',
    2023,
    35,
    6,
    'Bote moderno totalmente equipado',
    ARRAY['GPS', 'Sonar', 'Baño', 'Camarote']
);
```

### Vincular Bote con Tour

```sql
INSERT INTO tour_boats (tour_id, boat_id, is_primary)
VALUES ('tour-uuid', 1, true);
```

### Agregar Especies a un Tour

```sql
-- Agregar Marlín Azul como especie destacada con 75% de probabilidad
INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
VALUES ('tour-uuid', 1, 75, true);

-- Agregar Dorado como especie secundaria con 90% de probabilidad
INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
VALUES ('tour-uuid', 4, 90, false);
```

## API Response

El endpoint `/api/tours/:slug` ahora retorna:

```json
{
  "success": true,
  "data": {
    "id": "tour-uuid",
    "title": "Tour de Pesca",
    "boats": [
      {
        "id": 1,
        "name": "Mar Azul",
        "boat_type": "Centro Console",
        "brand": "Contender",
        "model": "35 ST",
        "year": 2020,
        "length_feet": 35,
        "capacity": 6,
        "description": "Bote moderno...",
        "features": ["GPS", "Sonar", "Radar"],
        "images": ["/boat1.jpg"],
        "is_primary": true
      }
    ],
    "target_species": [
      {
        "id": 1,
        "name_es": "Marlín Azul",
        "name_en": "Blue Marlin",
        "scientific_name": "Makaira nigricans",
        "description": "El marlín azul es...",
        "average_weight_lbs": 300,
        "max_weight_lbs": 1500,
        "probability_percentage": 75,
        "is_featured": true
      }
    ]
  }
}
```

## Próximos Pasos

### Para Capitanes
Los capitanes podrán gestionar sus botes desde el dashboard de capitán (próxima actualización).

### Para Administradores
Desde el panel de administración se podrá:
- Agregar nuevas especies
- Gestionar botes
- Asignar botes y especies a tours

## Soporte

Si encuentras algún problema:
1. Verifica que las migraciones se ejecutaron correctamente
2. Revisa que el backend esté conectado a la base de datos
3. Asegúrate de que existen usuarios con rol 'capitan'

## Notas Técnicas

- Todos los archivos del frontend ya están actualizados
- El backend ahora incluye las relaciones LEFT JOIN para botes y especies
- La vista `vw_tours_complete` se reconstruye automáticamente
- Los datos son opcionales - los tours sin botes o especies seguirán funcionando
