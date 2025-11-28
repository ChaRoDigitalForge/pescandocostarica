-- ============================================
-- PESCANDO COSTA RICA - SEED DATA
-- Datos de prueba para desarrollo
-- ============================================

-- ============================================
-- USUARIOS DE PRUEBA
-- ============================================

-- Admin user
INSERT INTO users (firebase_uid, email, first_name, last_name, role, status, phone, bio, provincia, email_verified) VALUES
('firebase_admin_001', 'admin@pescandocostarica.com', 'Carlos', 'Rodríguez', 'admin', 'active', '+506-8888-8888', 'Administrador del sistema', 'sanJose', true);

-- Capitanes
INSERT INTO users (firebase_uid, email, first_name, last_name, role, status, phone, bio, provincia, license_number, years_of_experience, specializations, email_verified) VALUES
('firebase_capitan_001', 'juan.navarro@example.com', 'Juan', 'Navarro', 'capitan', 'active', '+506-7777-0001', 'Capitán experto en pesca de alta mar', 'puntarenas', 'CAP-2015-001', 20, ARRAY['altaMar', 'costera'], true),
('firebase_capitan_002', 'maria.gomez@example.com', 'María', 'Gómez', 'capitan', 'active', '+506-7777-0002', 'Especialista en pesca costera y río', 'guanacaste', 'CAP-2018-045', 15, ARRAY['costera', 'rio'], true),
('firebase_capitan_003', 'pedro.castro@example.com', 'Pedro', 'Castro', 'capitan', 'active', '+506-7777-0003', 'Experto en pesca en manglar', 'limon', 'CAP-2020-089', 10, ARRAY['rio', 'manglar'], true);

-- Clientes
INSERT INTO users (firebase_uid, email, first_name, last_name, role, status, phone, provincia, email_verified) VALUES
('firebase_cliente_001', 'cliente1@example.com', 'Roberto', 'Sánchez', 'cliente', 'active', '+506-6666-0001', 'sanJose', true),
('firebase_cliente_002', 'cliente2@example.com', 'Ana', 'Martínez', 'cliente', 'active', '+506-6666-0002', 'alajuela', true),
('firebase_cliente_003', 'cliente3@example.com', 'Luis', 'Fernández', 'cliente', 'active', '+506-6666-0003', 'cartago', true);

-- ============================================
-- LOCATIONS (Ubicaciones específicas)
-- ============================================

-- Guanacaste
INSERT INTO locations (provincia_id, name, description, latitude, longitude, is_popular) VALUES
(1, 'Tamarindo', 'Playa popular para pesca costera y alta mar', 10.2995, -85.8395, true),
(1, 'Flamingo', 'Marina con acceso a excelente pesca deportiva', 10.4336, -85.7880, true),
(1, 'Playa del Coco', 'Destino conocido por torneos de pesca', 10.5500, -85.7000, true);

-- Puntarenas
INSERT INTO locations (provincia_id, name, description, latitude, longitude, is_popular) VALUES
(2, 'Quepos', 'Capital de la pesca deportiva en Costa Rica', 9.4314, -84.1627, true),
(2, 'Golfito', 'Zona sur con excelente pesca de marlín', 8.6381, -83.1678, true),
(2, 'Sierpe', 'Río y manglar con biodiversidad única', 8.8333, -83.5500, false);

-- Limón
INSERT INTO locations (provincia_id, name, description, latitude, longitude, is_popular) VALUES
(3, 'Puerto Viejo', 'Pesca caribeña con cultura afro-caribeña', 9.6544, -82.7539, true),
(3, 'Tortuguero', 'Canales y ríos con pesca única', 10.5369, -83.5058, true);

-- ============================================
-- TOURS DE PESCA
-- ============================================

-- Obtener IDs de capitanes
DO $$
DECLARE
    capitan_juan_id UUID;
    capitan_maria_id UUID;
    capitan_pedro_id UUID;
BEGIN
    SELECT id INTO capitan_juan_id FROM users WHERE email = 'juan.navarro@example.com';
    SELECT id INTO capitan_maria_id FROM users WHERE email = 'maria.gomez@example.com';
    SELECT id INTO capitan_pedro_id FROM users WHERE email = 'pedro.castro@example.com';

    -- Tours Puntarenas
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, original_price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES
    (capitan_juan_id, 2, 4, 'Pesca Deportiva en Alta Mar', 'pesca-deportiva-alta-mar-quepos', 'Experimenta la emoción de pescar marlín azul y pez vela en las aguas cristalinas del Pacífico. Tour completo con todo el equipo incluido.', 'Pesca de marlín y pez vela en Quepos', 'altaMar', 8, '1 Día', 6, 850.00, 950.00, 'active', true, 4, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp', '/tour-detail-10.webp'], 5, 12),
    (capitan_juan_id, 2, 6, 'Pesca en Río y Manglar', 'pesca-rio-manglar-sierpe', 'Explora los manglares de Sierpe en una aventura única. Pesca róbalo, sábalo y otras especies mientras navegas por canales naturales.', 'Aventura en río y manglar de Sierpe', 'rio', 4, '4 Horas', 4, 450.00, NULL, 'active', true, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp', '/tour-detail-05.webp'], 5, 8),
    (capitan_juan_id, 2, 5, 'Pesca de Marlín y Pez Vela', 'pesca-marlin-pez-vela-golfito', 'Golfito es conocido mundialmente por la pesca de marlín. Únete a esta expedición de día completo con capitán experimentado.', 'Expedición de marlín en Golfito', 'altaMar', 8, '8 Horas', 5, 950.00, 1100.00, 'active', true, 5, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-10.webp'], 5, 18);

    -- Tours Guanacaste
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, average_rating, total_reviews) VALUES
    (capitan_maria_id, 1, 1, 'Pesca Costera en Tamarindo', 'pesca-costera-tamarindo', 'Pesca costera relajante para toda la familia. Ideal para principiantes y pescadores experimentados.', 'Pesca familiar en Tamarindo', 'costera', 6, '6 Horas', 5, 600.00, 'active', false, 2, '/tour-detail-05.webp', 5, 15),
    (capitan_maria_id, 1, 2, 'Tour de Pesca Completo en Flamingo', 'tour-pesca-completo-flamingo', 'Dos días de pesca intensiva con alojamiento incluido. Combina alta mar y pesca costera en el mejor destino de Guanacaste.', 'Tour de 2 días en Flamingo', 'altaMar', 16, '2 Días', 6, 1200.00, 'active', true, 4, '/tour-detail-10.webp', 5, 20),
    (capitan_maria_id, 1, 3, 'Pesca al Atardecer en Playa del Coco', 'pesca-atardecer-coco', 'Disfruta de una tarde de pesca mientras contemplas el atardecer del Pacífico. Incluye snacks y bebidas.', 'Pesca con atardecer incluido', 'costera', 5, '5 Horas', 4, 550.00, 'active', false, 1, '/tour-detail-05.webp', 5, 14);

    -- Tours Limón
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, status, is_featured, difficulty_level, main_image_url, average_rating, total_reviews) VALUES
    (capitan_pedro_id, 3, 7, 'Pesca en el Caribe - Puerto Viejo', 'pesca-caribe-puerto-viejo', 'Experiencia única de pesca en el Caribe costarricense. Pesca de sábalo, róbalo y tarpon en aguas cristalinas.', 'Pesca caribeña en Puerto Viejo', 'costera', 6, '6 Horas', 4, 480.00, 'active', false, 2, '/tour-detail-03.webp', 5, 11),
    (capitan_pedro_id, 3, 8, 'Aventura de Pesca en Tortuguero', 'aventura-pesca-tortuguero', 'Navega por los canales de Tortuguero mientras pescas en uno de los ecosistemas más biodiversos del país.', 'Pesca en canales de Tortuguero', 'rio', 8, '1 Día', 5, 720.00, 'active', true, 3, '/tour-detail-02.webp', 5, 16),
    (capitan_pedro_id, 3, 7, 'Pesca en Canales y Ríos - Cahuita', 'pesca-canales-rios-cahuita', 'Media jornada de pesca en los ríos cercanos a Cahuita. Perfecto para familias y principiantes.', 'Pesca familiar en Cahuita', 'rio', 4, '4 Horas', 3, 380.00, 'active', false, 1, '/tour-detail-03.webp', 5, 9);
END $$;

-- ============================================
-- SERVICIOS DE TOURS
-- ============================================

-- Agregar servicios a los tours (ejemplo para el primer tour)
INSERT INTO tour_services (tour_id, service_type, name, description, is_included, icon)
SELECT id, 'equipo', 'Equipo de Pesca Profesional', 'Cañas, carretes y señuelos de alta calidad', true, 'fishing-rod'
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_services (tour_id, service_type, name, description, is_included, icon)
SELECT id, 'alimentacion', 'Almuerzo y Bebidas', 'Almuerzo completo y bebidas durante el tour', true, 'utensils'
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_services (tour_id, service_type, name, description, is_included, icon)
SELECT id, 'guia', 'Capitán Certificado', 'Capitán con más de 20 años de experiencia', true, 'user-tie'
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_services (tour_id, service_type, name, description, is_included, icon)
SELECT id, 'transporte', 'Transporte desde Hotel', 'Recogida y regreso a hoteles en la zona', false, 'van'
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

-- ============================================
-- INCLUSIONES DE TOURS
-- ============================================

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Todo el equipo de pesca profesional', true, 1
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Capitán certificado y experimentado', true, 2
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Licencia de pesca deportiva', true, 3
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Almuerzo y bebidas', true, 4
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Seguro de accidentes', true, 5
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_inclusions (tour_id, description, is_included, display_order)
SELECT id, 'Fotos del tour', true, 6
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

-- ============================================
-- REQUISITOS DE TOURS
-- ============================================

INSERT INTO tour_requirements (tour_id, requirement, is_mandatory, display_order)
SELECT id, 'Edad mínima: 12 años', true, 1
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_requirements (tour_id, requirement, is_mandatory, display_order)
SELECT id, 'Saber nadar', true, 2
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_requirements (tour_id, requirement, is_mandatory, display_order)
SELECT id, 'Llevar protector solar y gorra', false, 3
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

INSERT INTO tour_requirements (tour_id, requirement, is_mandatory, display_order)
SELECT id, 'Ropa cómoda y zapatos antideslizantes', false, 4
FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';

-- ============================================
-- PROMOCIONES
-- ============================================

INSERT INTO promociones (code, name, description, promocion_type, discount_percentage, valid_from, valid_until, usage_limit, is_active) VALUES
('WELCOME25', 'Bienvenida 25%', 'Descuento de bienvenida para nuevos clientes', 'percentage', 25.00, NOW(), NOW() + INTERVAL '30 days', 100, true),
('SUMMER2025', 'Verano 2025', 'Promoción especial de verano', 'percentage', 15.00, '2025-06-01', '2025-08-31', 500, true),
('EARLYBIRD', 'Madrugador', 'Reserva con 30 días de anticipación', 'percentage', 20.00, NOW(), NOW() + INTERVAL '90 days', 200, true),
('FAMILY50', 'Descuento Familiar', '$50 de descuento en tours familiares', 'fixed_amount', NULL, NOW(), NOW() + INTERVAL '60 days', 150, true);

-- Actualizar discount_amount para la promoción de monto fijo
UPDATE promociones SET discount_amount = 50.00 WHERE code = 'FAMILY50';

-- ============================================
-- DISPONIBILIDAD DE TOURS
-- ============================================

-- Generar disponibilidad para los próximos 30 días
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
END $$;

-- ============================================
-- RESEÑAS DE EJEMPLO
-- ============================================

DO $$
DECLARE
    tour_quepos UUID;
    cliente_1 UUID;
    cliente_2 UUID;
    cliente_3 UUID;
BEGIN
    SELECT id INTO tour_quepos FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';
    SELECT id INTO cliente_1 FROM users WHERE email = 'cliente1@example.com';
    SELECT id INTO cliente_2 FROM users WHERE email = 'cliente2@example.com';
    SELECT id INTO cliente_3 FROM users WHERE email = 'cliente3@example.com';

    INSERT INTO reviews (tour_id, user_id, rating, title, comment, guide_rating, equipment_rating, value_rating, status, verified_purchase) VALUES
    (tour_quepos, cliente_1, 5, '¡Experiencia increíble!', 'El mejor tour de pesca que he tenido. El capitán Juan es muy profesional y conoce los mejores puntos. Pescamos 3 marlínes. Totalmente recomendado.', 5, 5, 5, 'approved', true),
    (tour_quepos, cliente_2, 5, 'Excelente día de pesca', 'Todo estuvo perfecto desde el principio. El equipo es de primera calidad y el almuerzo delicioso. Ya reservé para el próximo año.', 5, 5, 4, 'approved', true),
    (tour_quepos, cliente_3, 4, 'Muy buena experiencia', 'Gran tour aunque el día estuvo un poco nublado. El capitán hizo todo lo posible para que tuviéramos éxito. Capturamos varios peces.', 5, 5, 4, 'approved', true);
END $$;

-- ============================================
-- BOOKINGS DE EJEMPLO
-- ============================================

DO $$
DECLARE
    tour_quepos UUID;
    tour_tamarindo UUID;
    cliente_1 UUID;
    cliente_2 UUID;
    promo_welcome UUID;
BEGIN
    SELECT id INTO tour_quepos FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos';
    SELECT id INTO tour_tamarindo FROM tours WHERE slug = 'pesca-costera-tamarindo';
    SELECT id INTO cliente_1 FROM users WHERE email = 'cliente1@example.com';
    SELECT id INTO cliente_2 FROM users WHERE email = 'cliente2@example.com';
    SELECT id INTO promo_welcome FROM promociones WHERE code = 'WELCOME25';

    INSERT INTO bookings (user_id, tour_id, promocion_id, booking_date, number_of_people, customer_name, customer_email, customer_phone, subtotal, discount_amount, tax_amount, total_amount, status, confirmed_at) VALUES
    (cliente_1, tour_quepos, promo_welcome, CURRENT_DATE + INTERVAL '7 days', 2, 'Roberto Sánchez', 'cliente1@example.com', '+506-6666-0001', 1700.00, 425.00, 165.75, 1440.75, 'confirmed', NOW()),
    (cliente_2, tour_tamarindo, NULL, CURRENT_DATE + INTERVAL '14 days', 4, 'Ana Martínez', 'cliente2@example.com', '+506-6666-0002', 2400.00, 0, 312.00, 2712.00, 'confirmed', NOW());
END $$;

-- ============================================
-- BLOG POSTS DE EJEMPLO
-- ============================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@pescandocostarica.com';

    INSERT INTO blog_posts (author_id, title, slug, excerpt, content, category, tags, is_published, published_at, view_count) VALUES
    (admin_id, 'Los Mejores Lugares para Pescar en Costa Rica', 'mejores-lugares-pesca-costa-rica',
     'Descubre los destinos más populares para la pesca deportiva en Costa Rica.',
     'Costa Rica es uno de los mejores destinos del mundo para la pesca deportiva. En este artículo exploramos los lugares más destacados...',
     'Destinos', ARRAY['pesca', 'destinos', 'guía'], true, NOW() - INTERVAL '10 days', 342),

    (admin_id, 'Temporada de Marlín en el Pacífico', 'temporada-marlin-pacifico',
     'Conoce cuándo es la mejor época para pescar marlín en Costa Rica.',
     'El marlín azul y el pez vela son algunas de las especies más codiciadas. La temporada alta comienza en...',
     'Especies', ARRAY['marlín', 'temporadas', 'pesca deportiva'], true, NOW() - INTERVAL '5 days', 198),

    (admin_id, 'Equipo Esencial para Pesca en Alta Mar', 'equipo-esencial-pesca-alta-mar',
     'Todo lo que necesitas saber sobre el equipo para pesca deportiva.',
     'Contar con el equipo adecuado es fundamental para una experiencia exitosa de pesca en alta mar...',
     'Equipamiento', ARRAY['equipo', 'consejos', 'alta mar'], true, NOW() - INTERVAL '2 days', 156);
END $$;

-- ============================================
-- FIN DEL SEED DATA
-- ============================================
