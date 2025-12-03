-- ============================================================
-- CLEANUP & COMPLETE MIGRATION
-- Finishes the international location migration
-- ============================================================

-- Step 1: Complete zone_id migration for remaining tours
-- ============================================================
DO $$
DECLARE
    tour_record RECORD;
    target_zone_id INTEGER;
BEGIN
    RAISE NOTICE 'Starting tour zone_id completion...';

    -- Process tours that have country_id but no zone_id
    FOR tour_record IN
        SELECT id, country_id, provincia_id, location_id
        FROM tours
        WHERE country_id IS NOT NULL AND zone_id IS NULL
    LOOP
        -- First, try to match by location_id (most specific)
        IF tour_record.location_id IS NOT NULL THEN
            SELECT z.id INTO target_zone_id
            FROM zones z
            INNER JOIN locations l ON LOWER(TRIM(l.name)) = LOWER(TRIM(z.name))
            WHERE l.id = tour_record.location_id
            AND z.country_id = tour_record.country_id
            LIMIT 1;

            IF target_zone_id IS NOT NULL THEN
                UPDATE tours SET zone_id = target_zone_id WHERE id = tour_record.id;
                RAISE NOTICE 'Tour % updated with zone_id % (from location_id)', tour_record.id, target_zone_id;
                CONTINUE;
            END IF;
        END IF;

        -- If no match from location, try provincia
        IF tour_record.provincia_id IS NOT NULL THEN
            SELECT z.id INTO target_zone_id
            FROM zones z
            INNER JOIN provincias p ON LOWER(TRIM(p.name)) = LOWER(TRIM(z.name))
            WHERE p.id = tour_record.provincia_id
            AND z.country_id = tour_record.country_id
            LIMIT 1;

            IF target_zone_id IS NOT NULL THEN
                UPDATE tours SET zone_id = target_zone_id WHERE id = tour_record.id;
                RAISE NOTICE 'Tour % updated with zone_id % (from provincia_id)', tour_record.id, target_zone_id;
                CONTINUE;
            END IF;
        END IF;

        -- If still no match, get ANY popular zone from the country
        IF target_zone_id IS NULL THEN
            SELECT z.id INTO target_zone_id
            FROM zones z
            WHERE z.country_id = tour_record.country_id
            AND z.is_popular = true
            LIMIT 1;

            IF target_zone_id IS NOT NULL THEN
                UPDATE tours SET zone_id = target_zone_id WHERE id = tour_record.id;
                RAISE NOTICE 'Tour % updated with zone_id % (default popular zone)', tour_record.id, target_zone_id;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE 'Tour zone_id migration completed';
END $$;

-- Step 2: Drop old views
-- ============================================================
DROP VIEW IF EXISTS vw_tours_complete CASCADE;
DROP VIEW IF EXISTS vw_bookings_complete CASCADE;

-- Step 3: Remove old columns and tables
-- ============================================================
DO $$
BEGIN
    -- Remove old columns from tours
    ALTER TABLE tours
        DROP COLUMN IF EXISTS provincia_id CASCADE,
        DROP COLUMN IF EXISTS location_id CASCADE;
    RAISE NOTICE 'Removed old columns from tours table';

    -- Remove old column from users
    ALTER TABLE users
        DROP COLUMN IF EXISTS provincia CASCADE;
    RAISE NOTICE 'Removed old provincia column from users table';

    -- Drop old tables
    DROP TABLE IF EXISTS locations CASCADE;
    DROP TABLE IF EXISTS provincias CASCADE;
    RAISE NOTICE 'Dropped old tables: locations, provincias';

    -- Drop old enum type
    DROP TYPE IF EXISTS provincia_type CASCADE;
    RAISE NOTICE 'Dropped old provincia_type enum';
END $$;

-- Step 4: Recreate views and drop old indexes
-- ============================================================
DO $$
BEGIN
    -- Recreate views
    CREATE OR REPLACE VIEW vw_tours_complete AS
    SELECT
        t.*,
        c.name as country_name,
        c.code as country_code,
        z.name as zone_name,
        z.latitude,
        z.longitude,
        z.is_popular as zone_is_popular,
        u.first_name || ' ' || u.last_name as capitan_name,
        u.years_of_experience as capitan_experience,
        u.avatar_url as capitan_avatar
    FROM tours t
    LEFT JOIN countries c ON t.country_id = c.id
    LEFT JOIN zones z ON t.zone_id = z.id
    LEFT JOIN users u ON t.capitan_id = u.id
    WHERE t.deleted_at IS NULL;

    CREATE OR REPLACE VIEW vw_bookings_complete AS
    SELECT
        b.*,
        t.title as tour_title,
        t.main_image_url as tour_image,
        u.first_name || ' ' || u.last_name as customer_full_name,
        pr.code as promocion_code,
        pr.name as promocion_name
    FROM bookings b
    LEFT JOIN tours t ON b.tour_id = t.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN promociones pr ON b.promocion_id = pr.id;

    RAISE NOTICE 'Recreated views with new structure';

    -- Drop old indexes
    DROP INDEX IF EXISTS idx_tours_provincia_id;
    RAISE NOTICE 'Dropped old indexes';
END $$;

-- Step 5: Verify migration
-- ============================================================
DO $$
DECLARE
    country_count INTEGER;
    zone_count INTEGER;
    tour_with_country INTEGER;
    tour_with_zone INTEGER;
    tour_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO country_count FROM countries;
    SELECT COUNT(*) INTO zone_count FROM zones;
    SELECT COUNT(*) INTO tour_total FROM tours;
    SELECT COUNT(*) INTO tour_with_country FROM tours WHERE country_id IS NOT NULL;
    SELECT COUNT(*) INTO tour_with_zone FROM tours WHERE zone_id IS NOT NULL;

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'MIGRATION CLEANUP COMPLETE';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Countries: %', country_count;
    RAISE NOTICE 'Zones: %', zone_count;
    RAISE NOTICE 'Total tours: %', tour_total;
    RAISE NOTICE 'Tours with country_id: % (%.1f%%)', tour_with_country, (tour_with_country::FLOAT / tour_total * 100);
    RAISE NOTICE 'Tours with zone_id: % (%.1f%%)', tour_with_zone, (tour_with_zone::FLOAT / tour_total * 100);
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Old tables removed: provincias, locations';
    RAISE NOTICE 'Old columns removed: provincia_id, location_id, provincia';
    RAISE NOTICE 'System is now fully international!';
    RAISE NOTICE '============================================================';
END $$;
