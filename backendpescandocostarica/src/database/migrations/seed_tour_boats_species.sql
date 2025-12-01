-- Vincular tours existentes con botes y especies objetivo

DO $$
DECLARE
    tour_rec RECORD;
    boat_rec RECORD;
    marlin_azul_id INTEGER;
    marlin_negro_id INTEGER;
    pez_vela_id INTEGER;
    dorado_id INTEGER;
    atun_id INTEGER;
    wahoo_id INTEGER;
    robalo_id INTEGER;
    sabalo_id INTEGER;
    pargo_id INTEGER;
    corvina_id INTEGER;
    jurel_id INTEGER;
    guapote_id INTEGER;
BEGIN
    -- Obtener IDs de especies
    SELECT id INTO marlin_azul_id FROM fish_species WHERE name_es = 'Marlín Azul';
    SELECT id INTO marlin_negro_id FROM fish_species WHERE name_es = 'Marlín Negro';
    SELECT id INTO pez_vela_id FROM fish_species WHERE name_es = 'Pez Vela';
    SELECT id INTO dorado_id FROM fish_species WHERE name_es = 'Dorado';
    SELECT id INTO atun_id FROM fish_species WHERE name_es = 'Atún Aleta Amarilla';
    SELECT id INTO wahoo_id FROM fish_species WHERE name_es = 'Wahoo';
    SELECT id INTO robalo_id FROM fish_species WHERE name_es = 'Róbalo';
    SELECT id INTO sabalo_id FROM fish_species WHERE name_es = 'Sábalo';
    SELECT id INTO pargo_id FROM fish_species WHERE name_es = 'Pargo';
    SELECT id INTO corvina_id FROM fish_species WHERE name_es = 'Corvina';
    SELECT id INTO jurel_id FROM fish_species WHERE name_es = 'Jurel';
    SELECT id INTO guapote_id FROM fish_species WHERE name_es = 'Guapote';

    -- Vincular tours de alta mar con botes y especies
    FOR tour_rec IN
        SELECT id, slug, fishing_type, capitan_id
        FROM tours
        WHERE fishing_type = 'altaMar' AND deleted_at IS NULL
    LOOP
        -- Vincular con bote del capitán (si existe)
        SELECT id INTO boat_rec
        FROM boats
        WHERE capitan_id = tour_rec.capitan_id
            AND deleted_at IS NULL
            AND (boat_type = 'Centro Console' OR boat_type = 'Yate Deportivo')
        LIMIT 1;

        IF boat_rec.id IS NOT NULL THEN
            INSERT INTO tour_boats (tour_id, boat_id, is_primary)
            VALUES (tour_rec.id, boat_rec.id, true)
            ON CONFLICT (tour_id, boat_id) DO NOTHING;
        END IF;

        -- Agregar especies de alta mar
        IF marlin_azul_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, marlin_azul_id, 75, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF pez_vela_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, pez_vela_id, 85, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF dorado_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, dorado_id, 90, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF atun_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, atun_id, 70, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF wahoo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, wahoo_id, 65, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;
    END LOOP;

    -- Vincular tours costeros con botes y especies
    FOR tour_rec IN
        SELECT id, slug, fishing_type, capitan_id
        FROM tours
        WHERE fishing_type = 'costera' AND deleted_at IS NULL
    LOOP
        -- Vincular con bote del capitán
        SELECT id INTO boat_rec
        FROM boats
        WHERE capitan_id = tour_rec.capitan_id
            AND deleted_at IS NULL
        LIMIT 1;

        IF boat_rec.id IS NOT NULL THEN
            INSERT INTO tour_boats (tour_id, boat_id, is_primary)
            VALUES (tour_rec.id, boat_rec.id, true)
            ON CONFLICT (tour_id, boat_id) DO NOTHING;
        END IF;

        -- Agregar especies costeras
        IF robalo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, robalo_id, 80, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF corvina_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, corvina_id, 85, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF pargo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, pargo_id, 75, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF jurel_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, jurel_id, 90, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF dorado_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, dorado_id, 60, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;
    END LOOP;

    -- Vincular tours de río con botes y especies
    FOR tour_rec IN
        SELECT id, slug, fishing_type, capitan_id
        FROM tours
        WHERE fishing_type = 'rio' AND deleted_at IS NULL
    LOOP
        -- Vincular con bote del capitán
        SELECT id INTO boat_rec
        FROM boats
        WHERE capitan_id = tour_rec.capitan_id
            AND deleted_at IS NULL
            AND (boat_type = 'Lancha' OR boat_type = 'Jon Boat')
        LIMIT 1;

        IF boat_rec.id IS NOT NULL THEN
            INSERT INTO tour_boats (tour_id, boat_id, is_primary)
            VALUES (tour_rec.id, boat_rec.id, true)
            ON CONFLICT (tour_id, boat_id) DO NOTHING;
        END IF;

        -- Agregar especies de río
        IF sabalo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, sabalo_id, 70, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF robalo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, robalo_id, 75, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF guapote_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, guapote_id, 80, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;
    END LOOP;

    -- Vincular tours de manglar con botes y especies
    FOR tour_rec IN
        SELECT id, slug, fishing_type, capitan_id
        FROM tours
        WHERE fishing_type = 'manglar' AND deleted_at IS NULL
    LOOP
        -- Vincular con bote del capitán
        SELECT id INTO boat_rec
        FROM boats
        WHERE capitan_id = tour_rec.capitan_id
            AND deleted_at IS NULL
        LIMIT 1;

        IF boat_rec.id IS NOT NULL THEN
            INSERT INTO tour_boats (tour_id, boat_id, is_primary)
            VALUES (tour_rec.id, boat_rec.id, true)
            ON CONFLICT (tour_id, boat_id) DO NOTHING;
        END IF;

        -- Agregar especies de manglar
        IF robalo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, robalo_id, 85, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF sabalo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, sabalo_id, 80, true)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;

        IF pargo_id IS NOT NULL THEN
            INSERT INTO tour_target_species (tour_id, species_id, probability_percentage, is_featured)
            VALUES (tour_rec.id, pargo_id, 70, false)
            ON CONFLICT (tour_id, species_id) DO NOTHING;
        END IF;
    END LOOP;

    RAISE NOTICE 'Tours vinculados con botes y especies exitosamente';
END $$;
