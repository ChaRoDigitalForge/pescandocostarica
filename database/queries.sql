-- ============================================
-- PESCANDO COSTA RICA - CONSULTAS ÚTILES
-- Queries comunes para la aplicación
-- ============================================

-- ============================================
-- TOURS
-- ============================================

-- Obtener todos los tours activos con información completa
SELECT * FROM vw_tours_complete
WHERE status = 'active'
ORDER BY is_featured DESC, average_rating DESC, created_at DESC;

-- Obtener tours por provincia
SELECT * FROM vw_tours_complete
WHERE provincia_code = 'guanacaste' AND status = 'active'
ORDER BY is_featured DESC, average_rating DESC;

-- Obtener tours por tipo de pesca
SELECT * FROM vw_tours_complete
WHERE fishing_type = 'altaMar' AND status = 'active'
ORDER BY average_rating DESC;

-- Obtener tours destacados
SELECT * FROM vw_tours_complete
WHERE is_featured = true AND status = 'active'
ORDER BY average_rating DESC
LIMIT 6;

-- Buscar tours por texto (título o descripción)
SELECT * FROM vw_tours_complete
WHERE (
    LOWER(title) LIKE LOWER('%pesca%') OR
    LOWER(description) LIKE LOWER('%pesca%')
) AND status = 'active'
ORDER BY average_rating DESC;

-- Obtener tour específico con todos sus servicios
SELECT
    t.*,
    p.name as provincia_name,
    l.name as location_name,
    u.first_name || ' ' || u.last_name as capitan_name,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', ts.id,
                'type', ts.service_type,
                'name', ts.name,
                'description', ts.description,
                'is_included', ts.is_included,
                'additional_cost', ts.additional_cost
            )
        ) FILTER (WHERE ts.id IS NOT NULL),
        '[]'
    ) as services,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'description', ti.description,
                'is_included', ti.is_included
            )
        ) FILTER (WHERE ti.id IS NOT NULL),
        '[]'
    ) as inclusions
FROM tours t
LEFT JOIN provincias p ON t.provincia_id = p.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN users u ON t.capitan_id = u.id
LEFT JOIN tour_services ts ON t.id = ts.tour_id
LEFT JOIN tour_inclusions ti ON t.id = ti.tour_id
WHERE t.slug = 'pesca-deportiva-alta-mar-quepos'
GROUP BY t.id, p.name, l.name, u.first_name, u.last_name;

-- Obtener disponibilidad de un tour
SELECT
    t.title,
    ta.date,
    ta.available_slots,
    ta.is_available,
    ta.special_price,
    t.price as regular_price
FROM tour_availability ta
JOIN tours t ON ta.tour_id = t.id
WHERE t.slug = 'pesca-deportiva-alta-mar-quepos'
    AND ta.date >= CURRENT_DATE
    AND ta.is_available = true
ORDER BY ta.date
LIMIT 30;

-- Tours más populares (por bookings)
SELECT
    t.id,
    t.title,
    t.slug,
    t.main_image_url,
    t.price,
    t.total_bookings,
    t.average_rating,
    t.total_reviews,
    p.name as provincia_name
FROM tours t
LEFT JOIN provincias p ON t.provincia_id = p.id
WHERE t.status = 'active'
ORDER BY t.total_bookings DESC, t.average_rating DESC
LIMIT 10;

-- ============================================
-- BOOKINGS (RESERVACIONES)
-- ============================================

-- Obtener todas las reservaciones de un usuario
SELECT * FROM vw_bookings_complete
WHERE user_id = 'user-uuid-here'
ORDER BY booking_date DESC;

-- Reservaciones próximas (confirmadas)
SELECT
    b.*,
    t.title as tour_title,
    t.main_image_url,
    u.first_name || ' ' || u.last_name as customer_name
FROM bookings b
JOIN tours t ON b.tour_id = t.id
LEFT JOIN users u ON b.user_id = u.id
WHERE b.status = 'confirmed'
    AND b.booking_date >= CURRENT_DATE
ORDER BY b.booking_date ASC;

-- Reservaciones pendientes de confirmación
SELECT * FROM vw_bookings_complete
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Reporte de ingresos por mes
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_bookings,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_booking_value
FROM bookings
WHERE status IN ('confirmed', 'completed')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Reservaciones de hoy
SELECT * FROM vw_bookings_complete
WHERE booking_date = CURRENT_DATE
ORDER BY created_at;

-- ============================================
-- REVIEWS (RESEÑAS)
-- ============================================

-- Obtener reseñas de un tour
SELECT
    r.*,
    u.first_name || ' ' || u.last_name as reviewer_name,
    u.avatar_url as reviewer_avatar,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'url', ri.image_url,
                'order', ri.display_order
            )
        ) FILTER (WHERE ri.id IS NOT NULL),
        '[]'
    ) as images
FROM reviews r
JOIN users u ON r.user_id = u.id
LEFT JOIN review_images ri ON r.id = ri.review_id
WHERE r.tour_id = 'tour-uuid-here' AND r.status = 'approved'
GROUP BY r.id, u.first_name, u.last_name, u.avatar_url
ORDER BY r.created_at DESC;

-- Reseñas pendientes de aprobación
SELECT
    r.*,
    t.title as tour_title,
    u.first_name || ' ' || u.last_name as reviewer_name
FROM reviews r
JOIN tours t ON r.tour_id = t.id
JOIN users u ON r.user_id = u.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Promedio de calificaciones por tour
SELECT
    t.id,
    t.title,
    COUNT(r.id) as total_reviews,
    AVG(r.rating)::DECIMAL(3,2) as average_rating,
    AVG(r.guide_rating)::DECIMAL(3,2) as average_guide_rating,
    AVG(r.equipment_rating)::DECIMAL(3,2) as average_equipment_rating,
    AVG(r.value_rating)::DECIMAL(3,2) as average_value_rating
FROM tours t
LEFT JOIN reviews r ON t.id = r.tour_id AND r.status = 'approved'
WHERE t.id = 'tour-uuid-here'
GROUP BY t.id, t.title;

-- ============================================
-- PROMOCIONES
-- ============================================

-- Obtener promociones activas
SELECT *
FROM promociones
WHERE is_active = true
    AND valid_from <= NOW()
    AND valid_until >= NOW()
    AND (usage_limit IS NULL OR current_usage_count < usage_limit)
ORDER BY discount_percentage DESC;

-- Validar código promocional
SELECT
    p.*,
    CASE
        WHEN NOT p.is_active THEN 'inactive'
        WHEN p.valid_from > NOW() THEN 'not_started'
        WHEN p.valid_until < NOW() THEN 'expired'
        WHEN p.usage_limit IS NOT NULL AND p.current_usage_count >= p.usage_limit THEN 'limit_reached'
        ELSE 'valid'
    END as validation_status
FROM promociones p
WHERE p.code = 'WELCOME25';

-- Verificar si un usuario puede usar una promoción
SELECT
    p.*,
    COUNT(pu.id) as user_usage_count,
    p.usage_limit_per_user,
    CASE
        WHEN COUNT(pu.id) >= p.usage_limit_per_user THEN false
        ELSE true
    END as can_use
FROM promociones p
LEFT JOIN promocion_usage pu ON p.id = pu.promocion_id AND pu.user_id = 'user-uuid-here'
WHERE p.code = 'WELCOME25'
GROUP BY p.id;

-- Estadísticas de uso de promociones
SELECT
    p.code,
    p.name,
    p.current_usage_count,
    p.usage_limit,
    SUM(pu.discount_amount) as total_discounts_given,
    COUNT(DISTINCT pu.user_id) as unique_users
FROM promociones p
LEFT JOIN promocion_usage pu ON p.id = pu.promocion_id
GROUP BY p.id, p.code, p.name
ORDER BY p.current_usage_count DESC;

-- ============================================
-- USUARIOS
-- ============================================

-- Obtener información completa de un usuario
SELECT * FROM users WHERE firebase_uid = 'firebase-uid-here';

-- Capitanes activos con sus estadísticas
SELECT
    u.*,
    COUNT(DISTINCT t.id) as total_tours,
    COALESCE(AVG(t.average_rating), 0)::DECIMAL(3,2) as average_tour_rating,
    COUNT(DISTINCT b.id) as total_bookings
FROM users u
LEFT JOIN tours t ON u.id = t.capitan_id AND t.status = 'active'
LEFT JOIN bookings b ON t.id = b.tour_id AND b.status IN ('confirmed', 'completed')
WHERE u.role = 'capitan' AND u.status = 'active'
GROUP BY u.id
ORDER BY average_tour_rating DESC, total_bookings DESC;

-- Clientes más activos
SELECT
    u.id,
    u.first_name || ' ' || u.last_name as name,
    u.email,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.total_amount) as total_spent,
    COUNT(DISTINCT r.id) as total_reviews
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id AND b.status IN ('confirmed', 'completed')
LEFT JOIN reviews r ON u.id = r.user_id AND r.status = 'approved'
WHERE u.role = 'cliente'
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY total_bookings DESC
LIMIT 20;

-- ============================================
-- REPORTES Y ESTADÍSTICAS
-- ============================================

-- Dashboard - Estadísticas generales
SELECT
    (SELECT COUNT(*) FROM tours WHERE status = 'active') as total_active_tours,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND booking_date >= CURRENT_DATE) as upcoming_bookings,
    (SELECT COUNT(*) FROM users WHERE role = 'cliente') as total_customers,
    (SELECT COUNT(*) FROM users WHERE role = 'capitan' AND status = 'active') as total_captains,
    (SELECT SUM(total_amount) FROM bookings WHERE status IN ('confirmed', 'completed') AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_revenue,
    (SELECT COUNT(*) FROM reviews WHERE status = 'pending') as pending_reviews;

-- Ingresos por provincia
SELECT
    p.name as provincia,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount)::DECIMAL(10,2) as average_booking_value
FROM bookings b
JOIN tours t ON b.tour_id = t.id
JOIN provincias p ON t.provincia_id = p.id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- Ingresos por tipo de pesca
SELECT
    t.fishing_type,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount)::DECIMAL(10,2) as average_booking_value
FROM bookings b
JOIN tours t ON b.tour_id = t.id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY t.fishing_type
ORDER BY total_revenue DESC;

-- Tours con mejor rating
SELECT
    t.title,
    t.slug,
    t.average_rating,
    t.total_reviews,
    t.total_bookings,
    p.name as provincia
FROM tours t
LEFT JOIN provincias p ON t.provincia_id = p.id
WHERE t.status = 'active' AND t.total_reviews >= 5
ORDER BY t.average_rating DESC, t.total_reviews DESC
LIMIT 10;

-- Análisis de cancelaciones
SELECT
    DATE_TRUNC('month', cancelled_at) as month,
    COUNT(*) as total_cancellations,
    cancellation_reason,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM bookings
WHERE status = 'cancelled' AND cancelled_at IS NOT NULL
GROUP BY DATE_TRUNC('month', cancelled_at), cancellation_reason
ORDER BY month DESC, total_cancellations DESC;

-- ============================================
-- BÚSQUEDAS Y FILTROS AVANZADOS
-- ============================================

-- Búsqueda avanzada de tours
SELECT * FROM vw_tours_complete
WHERE
    status = 'active'
    AND (
        -- Filtro por provincia (opcional)
        (:provincia IS NULL OR provincia_code = :provincia)
    )
    AND (
        -- Filtro por tipo de pesca (opcional)
        (:fishing_type IS NULL OR fishing_type = :fishing_type)
    )
    AND (
        -- Filtro por rango de precio
        (:min_price IS NULL OR price >= :min_price)
    )
    AND (
        -- Filtro por capacidad mínima
        (:min_capacity IS NULL OR capacity >= :min_capacity)
    )
    AND (
        -- Filtro por rating mínimo
        (:min_rating IS NULL OR average_rating >= :min_rating)
    )
ORDER BY
    CASE WHEN :sort = 'price_asc' THEN price END ASC,
    CASE WHEN :sort = 'price_desc' THEN price END DESC,
    CASE WHEN :sort = 'rating' THEN average_rating END DESC,
    CASE WHEN :sort = 'popular' THEN total_bookings END DESC,
    created_at DESC;

-- ============================================
-- NOTIFICACIONES
-- ============================================

-- Obtener notificaciones no leídas de un usuario
SELECT *
FROM notifications
WHERE user_id = 'user-uuid-here' AND is_read = false
ORDER BY created_at DESC;

-- Marcar notificación como leída
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE id = 'notification-uuid-here' AND user_id = 'user-uuid-here';

-- ============================================
-- ACTIVITY LOGS
-- ============================================

-- Registrar actividad
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, metadata)
VALUES (
    'user-uuid-here',
    'booking_created',
    'booking',
    'booking-uuid-here',
    'Usuario creó una nueva reservación',
    '192.168.1.1'::inet,
    '{"tour_title": "Pesca en Alta Mar", "amount": 850.00}'::jsonb
);

-- Ver actividades recientes de un usuario
SELECT *
FROM activity_logs
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC
LIMIT 50;

-- ============================================
-- MANTENIMIENTO
-- ============================================

-- Limpiar notificaciones antiguas (más de 90 días y leídas)
DELETE FROM notifications
WHERE is_read = true AND read_at < NOW() - INTERVAL '90 days';

-- Actualizar estadísticas de tours manualmente
UPDATE tours t
SET
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE tour_id = t.id AND status = 'approved'),
    average_rating = (SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) FROM reviews WHERE tour_id = t.id AND status = 'approved');

-- Limpiar logs de actividad antiguos (más de 1 año)
DELETE FROM activity_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- ============================================
-- FIN DE QUERIES
-- ============================================
