-- Quick fix: Update vw_tours_complete to use zones instead of locations
DROP VIEW IF EXISTS vw_tours_complete;

CREATE OR REPLACE VIEW vw_tours_complete AS
SELECT
    t.*,
    c.name as country_name,
    c.code as country_code,
    z.name as zone_name,
    z.latitude,
    z.longitude,
    u.first_name || ' ' || u.last_name as capitan_name,
    u.years_of_experience as capitan_experience,
    u.avatar_url as capitan_avatar
FROM tours t
LEFT JOIN countries c ON t.country_id = c.id
LEFT JOIN zones z ON t.zone_id = z.id
LEFT JOIN users u ON t.capitan_id = u.id
WHERE t.deleted_at IS NULL;
