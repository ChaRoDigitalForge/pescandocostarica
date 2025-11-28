-- ============================================
-- PESCANDO COSTA RICA - DATABASE SCHEMA
-- PostgreSQL Database Schema
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS (Tipos Enumerados)
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'capitan', 'pescador', 'cliente');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE tour_status AS ENUM ('active', 'inactive', 'draft', 'sold_out');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'sinpe_movil');
CREATE TYPE provincia_type AS ENUM ('guanacaste', 'puntarenas', 'limon', 'sanJose', 'alajuela', 'cartago', 'heredia');
CREATE TYPE fishing_type AS ENUM ('altaMar', 'costera', 'rio', 'lago', 'manglar');
CREATE TYPE service_type AS ENUM ('pesca', 'hospedaje', 'transporte', 'equipo', 'alimentacion', 'guia');
CREATE TYPE promocion_type AS ENUM ('percentage', 'fixed_amount', 'buy_one_get_one', 'early_bird');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- TABLA: users
-- Usuarios del sistema (integrado con Firebase)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'cliente',
    status user_status NOT NULL DEFAULT 'pending_verification',
    avatar_url TEXT,
    date_of_birth DATE,

    -- Información adicional
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    provincia provincia_type,
    country VARCHAR(100) DEFAULT 'Costa Rica',
    zip_code VARCHAR(20),

    -- Para capitanes
    license_number VARCHAR(50), -- Número de licencia de capitán
    years_of_experience INTEGER,
    specializations TEXT[], -- Especializaciones en tipos de pesca

    -- Metadata
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: provincias
-- Provincias de Costa Rica
-- ============================================
CREATE TABLE provincias (
    id SERIAL PRIMARY KEY,
    code provincia_type UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: locations
-- Ubicaciones específicas dentro de las provincias
-- ============================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    provincia_id INTEGER REFERENCES provincias(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_popular BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tours
-- Tours de pesca disponibles
-- ============================================
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capitan_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provincia_id INTEGER REFERENCES provincias(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,

    -- Información básica
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,

    -- Detalles del tour
    fishing_type fishing_type NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL, -- Duración en horas (ej: 8.5)
    duration_display VARCHAR(50), -- Display amigable (ej: "1 Día", "8 Horas")

    -- Capacidad y precios
    capacity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2), -- Para mostrar descuentos

    -- Estado y metadata
    status tour_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),

    -- Imágenes y multimedia
    main_image_url TEXT,
    image_gallery TEXT[], -- Array de URLs de imágenes
    video_url TEXT,

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],

    -- Estadísticas
    total_bookings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABLA: tour_services
-- Servicios incluidos en los tours
-- ============================================
CREATE TABLE tour_services (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_included BOOLEAN DEFAULT TRUE, -- Si está incluido o es opcional
    additional_cost DECIMAL(10, 2) DEFAULT 0,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tour_availability
-- Disponibilidad de tours por fecha
-- ============================================
CREATE TABLE tour_availability (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_slots INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    special_price DECIMAL(10, 2), -- Precio especial para esta fecha
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, date)
);

-- ============================================
-- TABLA: tour_inclusions
-- Lo que incluye cada tour
-- ============================================
CREATE TABLE tour_inclusions (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_included BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: tour_requirements
-- Requisitos para cada tour
-- ============================================
CREATE TABLE tour_requirements (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: promociones
-- Promociones y ofertas especiales
-- ============================================
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promocion_type promocion_type NOT NULL,

    -- Descuento
    discount_percentage DECIMAL(5, 2), -- Para porcentaje (0-100)
    discount_amount DECIMAL(10, 2), -- Para monto fijo

    -- Aplicabilidad
    applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'specific_tours', 'specific_categories'
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),

    -- Límites de uso
    usage_limit INTEGER, -- Límite total de usos
    usage_limit_per_user INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,

    -- Fechas de validez
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Estado
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: promocion_tours
-- Relación entre promociones y tours específicos
-- ============================================
CREATE TABLE promocion_tours (
    id SERIAL PRIMARY KEY,
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promocion_id, tour_id)
);

-- ============================================
-- TABLA: bookings
-- Reservaciones de tours
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    promocion_id UUID REFERENCES promociones(id) ON DELETE SET NULL,

    -- Información de la reservación
    booking_date DATE NOT NULL,
    number_of_people INTEGER NOT NULL,

    -- Información del cliente
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,

    -- Precios
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Estado
    status booking_status DEFAULT 'pending',

    -- Notas
    customer_notes TEXT,
    admin_notes TEXT,
    cancellation_reason TEXT,

    -- Metadata
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: payments
-- Pagos realizados
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Información del pago
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',

    -- Información del procesador de pagos
    transaction_id VARCHAR(255),
    payment_processor VARCHAR(100), -- 'stripe', 'paypal', etc.
    processor_response JSONB,

    -- Metadata
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: reviews
-- Reseñas y calificaciones
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Calificación y reseña
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,

    -- Calificaciones específicas
    guide_rating INTEGER CHECK (guide_rating BETWEEN 1 AND 5),
    equipment_rating INTEGER CHECK (equipment_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),

    -- Estado
    status review_status DEFAULT 'pending',

    -- Respuesta del capitán
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: review_images
-- Imágenes adjuntas a las reseñas
-- ============================================
CREATE TABLE review_images (
    id SERIAL PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: favorites
-- Tours favoritos de los usuarios
-- ============================================
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tour_id)
);

-- ============================================
-- TABLA: notifications
-- Notificaciones del sistema
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Contenido
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,

    -- Metadata
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    data JSONB, -- Datos adicionales en formato JSON

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: promocion_usage
-- Registro de uso de códigos promocionales
-- ============================================
CREATE TABLE promocion_usage (
    id SERIAL PRIMARY KEY,
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: blog_posts
-- Blog posts y contenido
-- ============================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Contenido
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,

    -- Categorización
    category VARCHAR(100),
    tags TEXT[],

    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,

    -- Estado
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Estadísticas
    view_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: contact_messages
-- Mensajes de contacto
-- ============================================
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,

    -- Estado
    is_read BOOLEAN DEFAULT FALSE,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: activity_logs
-- Registro de actividades del sistema
-- ============================================
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar el rendimiento
-- ============================================

-- Users
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Tours
CREATE INDEX idx_tours_capitan_id ON tours(capitan_id);
CREATE INDEX idx_tours_provincia_id ON tours(provincia_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_fishing_type ON tours(fishing_type);
CREATE INDEX idx_tours_is_featured ON tours(is_featured);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_created_at ON tours(created_at DESC);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- Reviews
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Promociones
CREATE INDEX idx_promociones_code ON promociones(code);
CREATE INDEX idx_promociones_valid_from ON promociones(valid_from);
CREATE INDEX idx_promociones_valid_until ON promociones(valid_until);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promociones_updated_at BEFORE UPDATE ON promociones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de tours cuando se crea una review
CREATE OR REPLACE FUNCTION update_tour_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE tours
        SET total_reviews = total_reviews + 1,
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2)
                FROM reviews
                WHERE tour_id = NEW.tour_id AND status = 'approved'
            )
        WHERE id = NEW.tour_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE tours
        SET total_reviews = total_reviews + 1,
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2)
                FROM reviews
                WHERE tour_id = NEW.tour_id AND status = 'approved'
            )
        WHERE id = NEW.tour_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE tours
        SET total_reviews = GREATEST(total_reviews - 1, 0),
            average_rating = (
                SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
                FROM reviews
                WHERE tour_id = OLD.tour_id AND status = 'approved'
            )
        WHERE id = OLD.tour_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tour_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_tour_stats_on_review();

-- Función para actualizar contador de uso de promociones
CREATE OR REPLACE FUNCTION update_promocion_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE promociones
    SET current_usage_count = current_usage_count + 1
    WHERE id = NEW.promocion_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promocion_usage
AFTER INSERT ON promocion_usage
FOR EACH ROW EXECUTE FUNCTION update_promocion_usage_count();

-- Función para generar número de booking único
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number := 'PCR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE booking_number_seq;

CREATE TRIGGER trigger_generate_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de tours con información completa
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
    u.avatar_url as capitan_avatar
FROM tours t
LEFT JOIN provincias p ON t.provincia_id = p.id
LEFT JOIN locations l ON t.location_id = l.id
LEFT JOIN users u ON t.capitan_id = u.id
WHERE t.deleted_at IS NULL;

-- Vista de bookings con información completa
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

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar provincias
INSERT INTO provincias (code, name, description) VALUES
('guanacaste', 'Guanacaste', 'Provincia en la costa del Pacífico Norte conocida por sus playas y pesca deportiva'),
('puntarenas', 'Puntarenas', 'Provincia costera con excelentes oportunidades de pesca en alta mar'),
('limon', 'Limón', 'Provincia caribeña con pesca única en el Atlántico'),
('sanJose', 'San José', 'Provincia central con pesca en ríos y embalses'),
('alajuela', 'Alajuela', 'Provincia con lagos y ríos ideales para la pesca deportiva'),
('cartago', 'Cartago', 'Provincia montañosa con ríos de montaña'),
('heredia', 'Heredia', 'Provincia con ríos y zonas de pesca en la selva');

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE users IS 'Usuarios del sistema integrados con Firebase Authentication';
COMMENT ON TABLE tours IS 'Tours de pesca disponibles en la plataforma';
COMMENT ON TABLE bookings IS 'Reservaciones realizadas por los usuarios';
COMMENT ON TABLE promociones IS 'Códigos promocionales y descuentos';
COMMENT ON TABLE reviews IS 'Calificaciones y reseñas de los tours';
COMMENT ON TABLE payments IS 'Registro de pagos procesados';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
