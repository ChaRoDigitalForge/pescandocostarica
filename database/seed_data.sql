-- ============================================
-- Script completo de datos iniciales
-- ============================================

-- Insertar provincias
INSERT INTO provincias (code, name, description, is_active) VALUES
('guanacaste', 'Guanacaste', 'Provincia del Pacífico Norte conocida por sus playas y pesca deportiva', true),
('puntarenas', 'Puntarenas', 'Provincia costera del Pacífico con excelente pesca de altura', true),
('limon', 'Limón', 'Provincia caribeña con pesca única en canales y ríos', true),
('sanJose', 'San José', 'Provincia central con pesca en embalses y ríos', true),
('alajuela', 'Alajuela', 'Provincia norte con lagos y ríos para pesca deportiva', true),
('cartago', 'Cartago', 'Provincia central con pesca de montaña', true),
('heredia', 'Heredia', 'Provincia norte con pesca en ríos de selva tropical', true)
ON CONFLICT (code) DO NOTHING;

-- Insertar ubicaciones populares
INSERT INTO locations (provincia_id, name, description, is_popular) VALUES
((SELECT id FROM provincias WHERE code = 'guanacaste'), 'Tamarindo', 'Playa turística con excelente pesca costera', true),
((SELECT id FROM provincias WHERE code = 'guanacaste'), 'Flamingo', 'Destino premium de pesca deportiva', true),
((SELECT id FROM provincias WHERE code = 'guanacaste'), 'Playa del Coco', 'Puerto pesquero tradicional', true),
((SELECT id FROM provincias WHERE code = 'puntarenas'), 'Quepos', 'Capital de la pesca deportiva en Costa Rica', true),
((SELECT id FROM provincias WHERE code = 'puntarenas'), 'Golfito', 'Puerto del sur con pesca de marlín', true),
((SELECT id FROM provincias WHERE code = 'puntarenas'), 'Sierpe', 'Acceso a manglares únicos', true),
((SELECT id FROM provincias WHERE code = 'limon'), 'Puerto Viejo', 'Pueblo caribeño con pesca costera', true),
((SELECT id FROM provincias WHERE code = 'limon'), 'Tortuguero', 'Canales naturales con biodiversidad única', true)
ON CONFLICT DO NOTHING;

-- Insertar usuarios capitanes de ejemplo
INSERT INTO users (firebase_uid, email, first_name, last_name, role, status, phone, provincia, years_of_experience, specializations, email_verified) VALUES
('firebase_uid_juan', 'juan.navarro@example.com', 'Juan', 'Navarro', 'capitan', 'active', '+506 8888-1111', 'puntarenas', 15, ARRAY['Alta mar', 'Pesca deportiva', 'Marlín'], true),
('firebase_uid_maria', 'maria.gomez@example.com', 'María', 'Gómez', 'capitan', 'active', '+506 8888-2222', 'guanacaste', 10, ARRAY['Costera', 'Familiar', 'Snorkeling'], true),
('firebase_uid_pedro', 'pedro.castro@example.com', 'Pedro', 'Castro', 'capitan', 'active', '+506 8888-3333', 'limon', 8, ARRAY['Río', 'Caribe', 'Canales'], true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Insertar tours
-- ============================================

DO $$
DECLARE
    capitan_juan_id UUID;
    capitan_maria_id UUID;
    capitan_pedro_id UUID;
BEGIN
    SELECT id INTO capitan_juan_id FROM users WHERE email = 'juan.navarro@example.com';
    SELECT id INTO capitan_maria_id FROM users WHERE email = 'maria.gomez@example.com';
    SELECT id INTO capitan_pedro_id FROM users WHERE email = 'pedro.castro@example.com';

    -- Limpiar tours existentes
    DELETE FROM tours;

    -- Tours Puntarenas
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, original_price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'puntarenas'), (SELECT id FROM locations WHERE name = 'Quepos'), 'Pesca Deportiva en Alta Mar', 'pesca-deportiva-alta-mar-quepos', 'Experimenta la emoción de pescar marlín azul y pez vela en las aguas cristalinas del Pacífico. Tour completo con todo el equipo incluido.', 'Pesca de marlín y pez vela en Quepos', 'altaMar', 8, '1 Día', 6, 850.00, 950.00, 'active', true, 4, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-10.webp', '/tour-detail-02.webp'], 5, 12),
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'puntarenas'), (SELECT id FROM locations WHERE name = 'Sierpe'), 'Pesca en Río y Manglar', 'pesca-rio-manglar-sierpe', 'Explora los manglares de Sierpe en una aventura única. Pesca róbalo, sábalo y otras especies mientras navegas por canales naturales.', 'Aventura en río y manglar de Sierpe', 'rio', 4, '4 Horas', 4, 450.00, NULL, 'active', true, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-03.webp'], 5, 8),
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'puntarenas'), (SELECT id FROM locations WHERE name = 'Golfito'), 'Pesca de Marlín y Pez Vela', 'pesca-marlin-pez-vela-golfito', 'Golfito es conocido mundialmente por la pesca de marlín. Únete a esta expedición de día completo con capitán experimentado.', 'Expedición de marlín en Golfito', 'altaMar', 8, '8 Horas', 5, 950.00, 1100.00, 'active', true, 5, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-05.webp'], 5, 18);

    -- Tours Guanacaste
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, original_price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'guanacaste'), (SELECT id FROM locations WHERE name = 'Tamarindo'), 'Pesca Costera', 'pesca-costera-tamarindo', 'Disfruta de una experiencia de pesca costera relajante para toda la familia. Ideal para principiantes y pescadores experimentados.', 'Pesca familiar en Tamarindo', 'costera', 6, '6 Horas', 5, 600.00, NULL, 'active', false, 2, '/tour-detail-05.webp', ARRAY['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-10.webp'], 5, 15),
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'guanacaste'), (SELECT id FROM locations WHERE name = 'Flamingo'), 'Tour de Pesca Completo', 'tour-pesca-completo-flamingo', 'Dos días de pesca intensiva con alojamiento incluido. Combina alta mar y pesca costera en el mejor destino de Guanacaste.', 'Tour de 2 días en Flamingo', 'altaMar', 16, '2 Días', 6, 1200.00, NULL, 'active', true, 4, '/tour-detail-10.webp', ARRAY['/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp'], 5, 20),
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'guanacaste'), (SELECT id FROM locations WHERE name = 'Playa del Coco'), 'Pesca al Atardecer', 'pesca-atardecer-coco', 'Disfruta de una tarde de pesca mientras contemplas el atardecer del Pacífico. Incluye snacks y bebidas.', 'Pesca con atardecer incluido', 'costera', 5, '5 Horas', 4, 550.00, NULL, 'active', false, 1, '/tour-detail-05.webp', ARRAY['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-10.webp', '/tour-detail-05.webp'], 5, 14);

    -- Tours Limón
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'limon'), (SELECT id FROM locations WHERE name = 'Puerto Viejo'), 'Pesca en el Caribe', 'pesca-caribe-puerto-viejo', 'Experiencia única de pesca en el Caribe costarricense. Pesca de sábalo, róbalo y tarpon en aguas cristalinas.', 'Pesca caribeña en Puerto Viejo', 'costera', 6, '6 Horas', 4, 480.00, 'active', false, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp', '/tour-detail-10.webp'], 5, 11),
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'limon'), (SELECT id FROM locations WHERE name = 'Tortuguero'), 'Aventura de Pesca Caribeña', 'aventura-pesca-tortuguero', 'Navega por los canales de Tortuguero mientras pescas en uno de los ecosistemas más biodiversos del país.', 'Pesca en canales de Tortuguero', 'rio', 8, '1 Día', 5, 720.00, 'active', true, 3, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-03.webp'], 5, 16),
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'limon'), (SELECT id FROM locations WHERE name = 'Puerto Viejo'), 'Pesca en Canales y Ríos', 'pesca-canales-rios-cahuita', 'Media jornada de pesca en los ríos cercanos a Cahuita. Perfecto para familias y principiantes.', 'Pesca familiar en Cahuita', 'rio', 4, '4 Horas', 3, 380.00, 'active', false, 1, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp'], 5, 9);

    -- Tours San José
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'sanJose'), NULL, 'Pesca en Embalses', 'pesca-embalses-cachi', 'Pesca deportiva en el embalse Cachí. Ideal para escapar de la ciudad y disfrutar de la naturaleza.', 'Pesca en embalse Cachí', 'lago', 5, '5 Horas', 4, 350.00, 'active', false, 2, '/tour-detail-05.webp', ARRAY['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp'], 4, 7),
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'sanJose'), NULL, 'Pesca de Trucha en Río', 'pesca-trucha-virilla', 'Pesca de trucha en el río Virilla. Una experiencia relajante cerca de San José.', 'Pesca de trucha cerca de la capital', 'rio', 3, '3 Horas', 3, 280.00, 'active', false, 1, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp'], 4, 6),
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'sanJose'), NULL, 'Tour de Pesca en Lago', 'tour-pesca-lago-cote', 'Día completo de pesca en el Lago de Cote. Incluye almuerzo y equipo completo.', 'Pesca en Lago de Cote', 'lago', 6, '6 Horas', 5, 420.00, 'active', false, 2, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-10.webp'], 5, 10);

    -- Tours Alajuela
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'alajuela'), NULL, 'Pesca de Guapote', 'pesca-guapote-arenal', 'Pesca del famoso guapote en el Lago Arenal. Una de las especies más buscadas de Costa Rica.', 'Guapote en Lago Arenal', 'lago', 7, '7 Horas', 4, 580.00, 'active', true, 3, '/tour-detail-10.webp', ARRAY['/tour-detail-10.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-10.webp'], 5, 13),
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'alajuela'), NULL, 'Pesca Deportiva en Reservorio', 'pesca-reservorio-sandillal', 'Pesca en el embalse Sandillal. Lugar tranquilo ideal para principiantes.', 'Pesca en Sandillal', 'lago', 5, '5 Horas', 3, 400.00, 'active', false, 2, '/tour-detail-05.webp', ARRAY['/tour-detail-05.webp', '/tour-detail-03.webp', '/tour-detail-02.webp'], 4, 8),
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'alajuela'), NULL, 'Expedición de Pesca en Río', 'expedicion-pesca-san-carlos', 'Expedición en el río San Carlos. Para pescadores que buscan aventura.', 'Pesca aventura en San Carlos', 'rio', 6, '6 Horas', 5, 490.00, 'active', false, 3, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-10.webp'], 5, 12);

    -- Tours Cartago
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'cartago'), NULL, 'Pesca en Río de Montaña', 'pesca-rio-reventazon', 'Pesca en el río Reventazón, rodeado de montañas. Experiencia única en Cartago.', 'Río Reventazón, Cartago', 'rio', 4, '4 Horas', 3, 320.00, 'active', false, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp'], 4, 5),
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'cartago'), NULL, 'Tour de Pesca en Río Grande', 'tour-pesca-rio-orosi', 'Pesca en el río Grande de Orosi. Paisajes impresionantes del valle de Orosi.', 'Río Grande de Orosi', 'rio', 5, '5 Horas', 4, 390.00, 'active', false, 2, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp'], 5, 9),
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'cartago'), NULL, 'Pesca Deportiva en Embalse', 'pesca-embalse-cachi-cartago', 'Pesca deportiva en el embalse de Cachí. Excelente para grupos y familias.', 'Embalse de Cachí', 'lago', 6, '6 Horas', 5, 450.00, 'active', false, 2, '/tour-detail-05.webp', ARRAY['/tour-detail-05.webp', '/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-10.webp'], 5, 11);

    -- Tours Heredia
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_pedro_id, (SELECT id FROM provincias WHERE code = 'heredia'), NULL, 'Pesca en Río Sarapiquí', 'pesca-rio-sarapiqui', 'Pesca en el río Sarapiquí, uno de los ríos más importantes de Costa Rica.', 'Río Sarapiquí, Heredia', 'rio', 5, '5 Horas', 4, 420.00, 'active', false, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-02.webp', '/tour-detail-10.webp'], 5, 10),
    (capitan_maria_id, (SELECT id FROM provincias WHERE code = 'heredia'), NULL, 'Aventura de Pesca en Selva', 'aventura-pesca-la-virgen', 'Pesca en medio de la selva tropical. Aventura completa en La Virgen de Sarapiquí.', 'Pesca en la selva, La Virgen', 'rio', 7, '7 Horas', 5, 530.00, 'active', true, 3, '/tour-detail-10.webp', ARRAY['/tour-detail-10.webp', '/tour-detail-03.webp', '/tour-detail-02.webp', '/tour-detail-05.webp', '/tour-detail-10.webp'], 5, 12),
    (capitan_juan_id, (SELECT id FROM provincias WHERE code = 'heredia'), NULL, 'Pesca en Río de Bajura', 'pesca-rio-chirripo', 'Pesca en el río Chirripó. Acceso a zonas poco exploradas de Heredia.', 'Río Chirripó, Heredia', 'rio', 4, '4 Horas', 3, 360.00, 'active', false, 2, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp'], 4, 7);

    RAISE NOTICE 'Tours insertados exitosamente: 21 tours';
END $$;

-- Regenerar disponibilidad para los próximos 30 días
DELETE FROM tour_availability;

DO $$
DECLARE
    tour_record RECORD;
    date_cursor DATE;
BEGIN
    FOR tour_record IN SELECT id, capacity FROM tours WHERE status = 'active' LOOP
        date_cursor := CURRENT_DATE;
        FOR i IN 1..30 LOOP
            INSERT INTO tour_availability (tour_id, date, available_slots, is_available)
            VALUES (tour_record.id, date_cursor, tour_record.capacity, true);
            date_cursor := date_cursor + INTERVAL '1 day';
        END LOOP;
    END LOOP;
    RAISE NOTICE 'Disponibilidad generada para 21 tours x 30 días';
END $$;
