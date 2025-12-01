-- Actualizar la vista vw_tours_complete para incluir información de botes y especies

-- Eliminar la vista existente
DROP VIEW IF EXISTS vw_tours_complete;

-- Crear la vista actualizada con botes y especies
CREATE OR REPLACE VIEW vw_tours_complete AS
SELECT
    t.*,
    p.name as provincia_name,
    p.code as provincia_code,
    l.name as location_name,
    l.latitude,
    l.longitude,
    u.first_name || ' ' || u.last_name as capitan_name,
    u.years_of_experience as capitan_experience,
    u.avatar_url as capitan_avatar,
    -- Información de botes
    COALESCE(
        (
            SELECT json_agg(
                jsonb_build_object(
                    'id', b.id,
                    'name', b.name,
                    'boat_type', b.boat_type,
                    'brand', b.brand,
                    'model', b.model,
                    'year', b.year,
                    'length_feet', b.length_feet,
                    'capacity', b.capacity,
                    'description', b.description,
                    'features', b.features,
                    'images', b.images,
                    'is_primary', tb.is_primary
                )
            )
            FROM tour_boats tb
            JOIN boats b ON tb.boat_id = b.id
            WHERE tb.tour_id = t.id AND b.deleted_at IS NULL
        ),
        '[]'::json
    ) as boats,
    -- Información de especies objetivo
    COALESCE(
        (
            SELECT json_agg(
                jsonb_build_object(
                    'id', fs.id,
                    'name_es', fs.name_es,
                    'name_en', fs.name_en,
                    'scientific_name', fs.scientific_name,
                    'description', fs.description,
                    'image_url', fs.image_url,
                    'average_weight_lbs', fs.average_weight_lbs,
                    'max_weight_lbs', fs.max_weight_lbs,
                    'probability_percentage', tts.probability_percentage,
                    'is_featured', tts.is_featured
                )
                ORDER BY tts.is_featured DESC, tts.probability_percentage DESC
            )
            FROM tour_target_species tts
            JOIN fish_species fs ON tts.species_id = fs.id
            WHERE tts.tour_id = t.id
        ),
        '[]'::json
    ) as target_species
FROM tours t
LEFT JOIN provincias p ON t.provincia_id = p.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN users u ON t.capitan_id = u.id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW vw_tours_complete IS 'Vista completa de tours con información de provincia, ubicación, capitán, botes y especies objetivo';
