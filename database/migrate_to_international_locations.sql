-- ============================================================
-- MIGRATION: International Location System
-- Description: Migrates from Costa Rica-only (provincias/locations)
--              to international countries/zones system
-- Date: 2025-12-02
-- ============================================================

-- Step 1: Create new countries table
-- ============================================================
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3 code
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    phone_code VARCHAR(10),
    currency_code VARCHAR(3),
    currency_symbol VARCHAR(5),
    flag_emoji VARCHAR(10),
    continent VARCHAR(50),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create new zones table (replaces both provincias and locations)
-- ============================================================
CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    parent_zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    native_name VARCHAR(255),
    zone_type VARCHAR(50), -- 'state', 'province', 'city', 'beach', 'marina', etc.
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    metadata JSONB, -- For additional flexible data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_countries_is_popular ON countries(is_popular);
CREATE INDEX IF NOT EXISTS idx_zones_country_id ON zones(country_id);
CREATE INDEX IF NOT EXISTS idx_zones_parent_zone_id ON zones(parent_zone_id);
CREATE INDEX IF NOT EXISTS idx_zones_is_popular ON zones(is_popular);
CREATE INDEX IF NOT EXISTS idx_zones_is_active ON zones(is_active);
CREATE INDEX IF NOT EXISTS idx_zones_zone_type ON zones(zone_type);

-- Step 4: Add trigger for updated_at
-- ============================================================
CREATE TRIGGER update_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at
BEFORE UPDATE ON zones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Insert countries (Americas)
-- ============================================================

-- Central America
INSERT INTO countries (code, name, native_name, phone_code, currency_code, currency_symbol, flag_emoji, continent, description, is_active, is_popular) VALUES
('CRI', 'Costa Rica', 'Costa Rica', '+506', 'CRC', '₡', '🇨🇷', 'Central America', 'Paraíso tropical con la mejor pesca deportiva del Pacífico y el Caribe', true, true),
('PAN', 'Panama', 'Panamá', '+507', 'PAB', 'B/.', '🇵🇦', 'Central America', 'Excelente pesca en dos océanos', true, true),
('NIC', 'Nicaragua', 'Nicaragua', '+505', 'NIO', 'C$', '🇳🇮', 'Central America', 'Lagos y costa del Pacífico con gran biodiversidad', true, false),
('GTM', 'Guatemala', 'Guatemala', '+502', 'GTQ', 'Q', '🇬🇹', 'Central America', 'Pesca en el Pacífico y lago Atitlán', true, false),
('HND', 'Honduras', 'Honduras', '+504', 'HNL', 'L', '🇭🇳', 'Central America', 'Costa caribeña y pesca de altura', true, false),
('SLV', 'El Salvador', 'El Salvador', '+503', 'USD', '$', '🇸🇻', 'Central America', 'Pesca costera en el Pacífico', true, false),
('BLZ', 'Belize', 'Belice', '+501', 'BZD', 'BZ$', '🇧🇿', 'Central America', 'Arrecife de coral y pesca deportiva caribeña', true, false);

-- North America
INSERT INTO countries (code, name, native_name, phone_code, currency_code, currency_symbol, flag_emoji, continent, description, is_active, is_popular) VALUES
('MEX', 'Mexico', 'México', '+52', 'MXN', '$', '🇲🇽', 'North America', 'Destino premium de pesca deportiva: Baja, Cabo, Cancún', true, true),
('USA', 'United States', 'United States', '+1', 'USD', '$', '🇺🇸', 'North America', 'Florida, California, Alaska - pesca de clase mundial', true, true),
('CAN', 'Canada', 'Canada', '+1', 'CAD', 'C$', '🇨🇦', 'North America', 'Pesca de salmón y truchas en lagos y ríos', true, false);

-- South America
INSERT INTO countries (code, name, native_name, phone_code, currency_code, currency_symbol, flag_emoji, continent, description, is_active, is_popular) VALUES
('COL', 'Colombia', 'Colombia', '+57', 'COP', '$', '🇨🇴', 'South America', 'Pacífico y Caribe con gran variedad de especies', true, false),
('VEN', 'Venezuela', 'Venezuela', '+58', 'VES', 'Bs.', '🇻🇪', 'South America', 'Pesca de pavón y tarpon en Los Roques', true, false),
('ECU', 'Ecuador', 'Ecuador', '+593', 'USD', '$', '🇪🇨', 'South America', 'Galápagos y costa continental', true, true),
('PER', 'Peru', 'Perú', '+51', 'PEN', 'S/', '🇵🇪', 'South America', 'Pesca en Amazonas y costa del Pacífico', true, false),
('BRA', 'Brazil', 'Brasil', '+55', 'BRL', 'R$', '🇧🇷', 'South America', 'Amazonas y costa atlántica con peacock bass', true, true),
('ARG', 'Argentina', 'Argentina', '+54', 'ARS', '$', '🇦🇷', 'South America', 'Patagonia - trucha y dorado de río', true, true),
('CHL', 'Chile', 'Chile', '+56', 'CLP', '$', '🇨🇱', 'South America', 'Pesca de salmón en Patagonia chilena', true, false);

-- Caribbean
INSERT INTO countries (code, name, native_name, phone_code, currency_code, currency_symbol, flag_emoji, continent, description, is_active, is_popular) VALUES
('CUB', 'Cuba', 'Cuba', '+53', 'CUP', '$', '🇨🇺', 'Caribbean', 'Pesca de tarpon y bonefish en cayos', true, false),
('DOM', 'Dominican Republic', 'República Dominicana', '+1-809', 'DOP', 'RD$', '🇩🇴', 'Caribbean', 'Pesca de marlin y pez vela', true, false),
('JAM', 'Jamaica', 'Jamaica', '+1-876', 'JMD', 'J$', '🇯🇲', 'Caribbean', 'Pesca caribeña en aguas cristalinas', true, false),
('BHS', 'Bahamas', 'Bahamas', '+1-242', 'BSD', '$', '🇧🇸', 'Caribbean', 'Destino premium de fly fishing', true, true);

-- Step 6: Migrate provincias to zones (as provinces of Costa Rica)
-- ============================================================
DO $$
DECLARE
    costa_rica_id INTEGER;
BEGIN
    -- Get Costa Rica ID
    SELECT id INTO costa_rica_id FROM countries WHERE code = 'CRI';

    -- Migrate provincias to zones
    INSERT INTO zones (
        country_id,
        name,
        zone_type,
        description,
        is_active,
        is_popular,
        image_url,
        created_at,
        updated_at
    )
    SELECT
        costa_rica_id,
        name,
        'province',
        description,
        is_active,
        TRUE, -- All provinces are popular
        image_url,
        created_at,
        updated_at
    FROM provincias;

    RAISE NOTICE 'Migrated % provincias to zones', (SELECT COUNT(*) FROM provincias);
END $$;

-- Step 7: Migrate locations to zones (as cities/beaches within provinces)
-- ============================================================
DO $$
DECLARE
    location_record RECORD;
    parent_zone_id INTEGER;
    costa_rica_id INTEGER;
BEGIN
    -- Get Costa Rica ID
    SELECT id INTO costa_rica_id FROM countries WHERE code = 'CRI';

    -- Migrate each location
    FOR location_record IN SELECT * FROM locations LOOP
        -- Find the parent zone (province) by matching provincia_id
        SELECT z.id INTO parent_zone_id
        FROM zones z
        INNER JOIN provincias p ON p.name = z.name
        WHERE p.id = location_record.provincia_id
        AND z.country_id = costa_rica_id
        AND z.zone_type = 'province'
        LIMIT 1;

        -- Insert location as a zone
        INSERT INTO zones (
            country_id,
            parent_zone_id,
            name,
            zone_type,
            description,
            latitude,
            longitude,
            is_popular,
            is_active,
            image_url,
            created_at,
            updated_at
        ) VALUES (
            costa_rica_id,
            parent_zone_id,
            location_record.name,
            'city', -- or 'beach' depending on the location
            location_record.description,
            location_record.latitude,
            location_record.longitude,
            location_record.is_popular,
            TRUE,
            location_record.image_url,
            location_record.created_at,
            location_record.updated_at
        );
    END LOOP;

    RAISE NOTICE 'Migrated % locations to zones', (SELECT COUNT(*) FROM locations);
END $$;

-- Step 8: Add new columns to tours table
-- ============================================================
ALTER TABLE tours
    ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL;

-- Step 9: Migrate tour references from provincias/locations to countries/zones
-- ============================================================
DO $$
DECLARE
    tour_record RECORD;
    costa_rica_id INTEGER;
    new_zone_id INTEGER;
BEGIN
    -- Get Costa Rica ID
    SELECT id INTO costa_rica_id FROM countries WHERE code = 'CRI';

    -- Update all tours with Costa Rica as country
    UPDATE tours SET country_id = costa_rica_id WHERE country_id IS NULL;

    -- Migrate tour zone references
    FOR tour_record IN SELECT id, provincia_id, location_id FROM tours LOOP
        -- If tour has a location_id, find the corresponding zone
        IF tour_record.location_id IS NOT NULL THEN
            SELECT z.id INTO new_zone_id
            FROM zones z
            INNER JOIN locations l ON l.name = z.name
            WHERE l.id = tour_record.location_id
            AND z.country_id = costa_rica_id
            AND z.zone_type = 'city'
            LIMIT 1;

            UPDATE tours SET zone_id = new_zone_id WHERE id = tour_record.id;

        -- If no location but has provincia, use the province zone
        ELSIF tour_record.provincia_id IS NOT NULL THEN
            SELECT z.id INTO new_zone_id
            FROM zones z
            INNER JOIN provincias p ON p.name = z.name
            WHERE p.id = tour_record.provincia_id
            AND z.country_id = costa_rica_id
            AND z.zone_type = 'province'
            LIMIT 1;

            UPDATE tours SET zone_id = new_zone_id WHERE id = tour_record.id;
        END IF;
    END LOOP;

    RAISE NOTICE 'Migrated tour references to new zone system';
END $$;

-- Step 10: Add indexes for new tour columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tours_country_id ON tours(country_id);
CREATE INDEX IF NOT EXISTS idx_tours_zone_id ON tours(zone_id);

-- Step 11: Update users table to use country reference
-- ============================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL;

-- Set all existing users to Costa Rica
DO $$
DECLARE
    costa_rica_id INTEGER;
BEGIN
    SELECT id INTO costa_rica_id FROM countries WHERE code = 'CRI';
    UPDATE users SET country_id = costa_rica_id WHERE country_id IS NULL;
END $$;

-- Step 12: Drop old views and create new ones
-- ============================================================
DROP VIEW IF EXISTS vw_tours_complete;
DROP VIEW IF EXISTS vw_bookings_complete;

-- New tour view with international zones
CREATE OR REPLACE VIEW vw_tours_complete AS
SELECT
    t.*,
    c.name as country_name,
    c.code as country_code,
    c.flag_emoji as country_flag,
    z.name as zone_name,
    z.zone_type,
    z.latitude,
    z.longitude,
    pz.name as parent_zone_name,
    u.first_name || ' ' || u.last_name as capitan_name,
    u.years_of_experience as capitan_experience,
    u.avatar_url as capitan_avatar
FROM tours t
LEFT JOIN countries c ON t.country_id = c.id
LEFT JOIN zones z ON t.zone_id = z.id
LEFT JOIN zones pz ON z.parent_zone_id = pz.id
LEFT JOIN users u ON t.capitan_id = u.id
WHERE t.deleted_at IS NULL;

-- New bookings view (unchanged but recreated for consistency)
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

-- Step 13: Drop old columns from tours table
-- ============================================================
ALTER TABLE tours
    DROP COLUMN IF EXISTS provincia_id,
    DROP COLUMN IF EXISTS location_id;

-- Step 14: Drop old columns from users table
-- ============================================================
ALTER TABLE users
    DROP COLUMN IF EXISTS provincia;

-- Step 15: Drop old tables
-- ============================================================
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS provincias CASCADE;

-- Step 16: Drop old provincia_type ENUM (optional - only if not used elsewhere)
-- ============================================================
DROP TYPE IF EXISTS provincia_type;

-- Step 17: Remove old index
-- ============================================================
DROP INDEX IF EXISTS idx_tours_provincia_id;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify migration
DO $$
DECLARE
    country_count INTEGER;
    zone_count INTEGER;
    tour_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO country_count FROM countries;
    SELECT COUNT(*) INTO zone_count FROM zones;
    SELECT COUNT(*) INTO tour_count FROM tours WHERE country_id IS NOT NULL;

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'MIGRATION SUMMARY';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Countries created: %', country_count;
    RAISE NOTICE 'Zones created: %', zone_count;
    RAISE NOTICE 'Tours migrated: %', tour_count;
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Old tables (provincias, locations) have been removed.';
    RAISE NOTICE 'System is now ready for international expansion.';
    RAISE NOTICE '============================================================';
END $$;
