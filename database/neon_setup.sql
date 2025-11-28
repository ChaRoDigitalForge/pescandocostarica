CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    bio TEXT,
    address TEXT,
    city VARCHAR(100),
    provincia provincia_type,
    country VARCHAR(100) DEFAULT 'Costa Rica',
    zip_code VARCHAR(20),
    license_number VARCHAR(50),
    years_of_experience INTEGER,
    specializations TEXT[],
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

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

CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capitan_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provincia_id INTEGER REFERENCES provincias(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    fishing_type fishing_type NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    duration_display VARCHAR(50),
    capacity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    status tour_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    main_image_url TEXT,
    image_gallery TEXT[],
    video_url TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    total_bookings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE tour_services (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    additional_cost DECIMAL(10, 2) DEFAULT 0,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tour_availability (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_slots INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    special_price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, date)
);

CREATE TABLE tour_inclusions (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_included BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tour_requirements (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promocion_type promocion_type NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    applies_to VARCHAR(50) DEFAULT 'all',
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    current_usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE promocion_tours (
    id SERIAL PRIMARY KEY,
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(promocion_id, tour_id)
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    promocion_id UUID REFERENCES promociones(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    number_of_people INTEGER NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    customer_notes TEXT,
    admin_notes TEXT,
    cancellation_reason TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_processor VARCHAR(100),
    processor_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    guide_rating INTEGER CHECK (guide_rating BETWEEN 1 AND 5),
    equipment_rating INTEGER CHECK (equipment_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    status review_status DEFAULT 'pending',
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE review_images (
    id SERIAL PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tour_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE promocion_usage (
    id SERIAL PRIMARY KEY,
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category VARCHAR(100),
    tags TEXT[],
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_tours_capitan_id ON tours(capitan_id);
CREATE INDEX idx_tours_provincia_id ON tours(provincia_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_fishing_type ON tours(fishing_type);
CREATE INDEX idx_tours_is_featured ON tours(is_featured);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_created_at ON tours(created_at DESC);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_promociones_code ON promociones(code);
CREATE INDEX idx_promociones_valid_from ON promociones(valid_from);
CREATE INDEX idx_promociones_valid_until ON promociones(valid_until);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promociones_updated_at BEFORE UPDATE ON promociones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_tour_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE tours SET total_reviews = total_reviews + 1, average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE tour_id = NEW.tour_id AND status = 'approved') WHERE id = NEW.tour_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE tours SET total_reviews = total_reviews + 1, average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE tour_id = NEW.tour_id AND status = 'approved') WHERE id = NEW.tour_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE tours SET total_reviews = GREATEST(total_reviews - 1, 0), average_rating = (SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0) FROM reviews WHERE tour_id = OLD.tour_id AND status = 'approved') WHERE id = OLD.tour_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tour_stats AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_tour_stats_on_review();

CREATE OR REPLACE FUNCTION update_promocion_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE promociones SET current_usage_count = current_usage_count + 1 WHERE id = NEW.promocion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promocion_usage AFTER INSERT ON promocion_usage FOR EACH ROW EXECUTE FUNCTION update_promocion_usage_count();

CREATE SEQUENCE booking_number_seq;

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number := 'PCR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_booking_number BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

CREATE OR REPLACE VIEW vw_tours_complete AS SELECT t.*, p.name as provincia_name, p.code as provincia_code, l.name as location_name, l.latitude, l.longitude, u.first_name || ' ' || u.last_name as capitan_name, u.years_of_experience as capitan_experience, u.avatar_url as capitan_avatar FROM tours t LEFT JOIN provincias p ON t.provincia_id = p.id LEFT JOIN locations l ON t.location_id = l.id LEFT JOIN users u ON t.capitan_id = u.id WHERE t.deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_bookings_complete AS SELECT b.*, t.title as tour_title, t.main_image_url as tour_image, u.first_name || ' ' || u.last_name as customer_full_name, pr.code as promocion_code, pr.name as promocion_name FROM bookings b LEFT JOIN tours t ON b.tour_id = t.id LEFT JOIN users u ON b.user_id = u.id LEFT JOIN promociones pr ON b.promocion_id = pr.id;

INSERT INTO provincias (code, name, description) VALUES ('guanacaste', 'Guanacaste', 'Provincia en la costa del Pacífico Norte conocida por sus playas y pesca deportiva'), ('puntarenas', 'Puntarenas', 'Provincia costera con excelentes oportunidades de pesca en alta mar'), ('limon', 'Limón', 'Provincia caribeña con pesca única en el Atlántico'), ('sanJose', 'San José', 'Provincia central con pesca en ríos y embalses'), ('alajuela', 'Alajuela', 'Provincia con lagos y ríos ideales para la pesca deportiva'), ('cartago', 'Cartago', 'Provincia montañosa con ríos de montaña'), ('heredia', 'Heredia', 'Provincia con ríos y zonas de pesca en la selva');

INSERT INTO users (firebase_uid, email, first_name, last_name, role, status, phone, bio, provincia, email_verified) VALUES ('firebase_admin_001', 'admin@pescandocostarica.com', 'Carlos', 'Rodríguez', 'admin', 'active', '+506-8888-8888', 'Administrador del sistema', 'sanJose', true), ('firebase_capitan_001', 'juan.navarro@example.com', 'Juan', 'Navarro', 'capitan', 'active', '+506-7777-0001', 'Capitán experto en pesca de alta mar', 'puntarenas', true), ('firebase_capitan_002', 'maria.gomez@example.com', 'María', 'Gómez', 'capitan', 'active', '+506-7777-0002', 'Especialista en pesca costera y río', 'guanacaste', true), ('firebase_capitan_003', 'pedro.castro@example.com', 'Pedro', 'Castro', 'capitan', 'active', '+506-7777-0003', 'Experto en pesca en manglar', 'limon', true), ('firebase_cliente_001', 'cliente1@example.com', 'Roberto', 'Sánchez', 'cliente', 'active', '+506-6666-0001', 'sanJose', true), ('firebase_cliente_002', 'cliente2@example.com', 'Ana', 'Martínez', 'cliente', 'active', '+506-6666-0002', 'alajuela', true), ('firebase_cliente_003', 'cliente3@example.com', 'Luis', 'Fernández', 'cliente', 'active', '+506-6666-0003', 'cartago', true);

UPDATE users SET license_number = 'CAP-2015-001', years_of_experience = 20, specializations = ARRAY['altaMar', 'costera'] WHERE email = 'juan.navarro@example.com';
UPDATE users SET license_number = 'CAP-2018-045', years_of_experience = 15, specializations = ARRAY['costera', 'rio'] WHERE email = 'maria.gomez@example.com';
UPDATE users SET license_number = 'CAP-2020-089', years_of_experience = 10, specializations = ARRAY['rio', 'manglar'] WHERE email = 'pedro.castro@example.com';

INSERT INTO locations (provincia_id, name, description, latitude, longitude, is_popular) VALUES (1, 'Tamarindo', 'Playa popular para pesca costera y alta mar', 10.2995, -85.8395, true), (1, 'Flamingo', 'Marina con acceso a excelente pesca deportiva', 10.4336, -85.7880, true), (1, 'Playa del Coco', 'Destino conocido por torneos de pesca', 10.5500, -85.7000, true), (2, 'Quepos', 'Capital de la pesca deportiva en Costa Rica', 9.4314, -84.1627, true), (2, 'Golfito', 'Zona sur con excelente pesca de marlín', 8.6381, -83.1678, true), (2, 'Sierpe', 'Río y manglar con biodiversidad única', 8.8333, -83.5500, false), (3, 'Puerto Viejo', 'Pesca caribeña con cultura afro-caribeña', 9.6544, -82.7539, true), (3, 'Tortuguero', 'Canales y ríos con pesca única', 10.5369, -83.5058, true);

DO $$
DECLARE capitan_juan_id UUID; capitan_maria_id UUID; capitan_pedro_id UUID;
BEGIN
    SELECT id INTO capitan_juan_id FROM users WHERE email = 'juan.navarro@example.com';
    SELECT id INTO capitan_maria_id FROM users WHERE email = 'maria.gomez@example.com';
    SELECT id INTO capitan_pedro_id FROM users WHERE email = 'pedro.castro@example.com';
    INSERT INTO tours (capitan_id, provincia_id, location_id, title, slug, description, short_description, fishing_type, duration_hours, duration_display, capacity, price, original_price, status, is_featured, difficulty_level, main_image_url, image_gallery, average_rating, total_reviews) VALUES (capitan_juan_id, 2, 4, 'Pesca Deportiva en Alta Mar', 'pesca-deportiva-alta-mar-quepos', 'Experimenta la emoción de pescar marlín azul y pez vela en las aguas cristalinas del Pacífico. Tour completo con todo el equipo incluido.', 'Pesca de marlín y pez vela en Quepos', 'altaMar', 8, '1 Día', 6, 850.00, 950.00, 'active', true, 4, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp', '/tour-detail-03.webp', '/tour-detail-05.webp'], 5, 12), (capitan_juan_id, 2, 6, 'Pesca en Río y Manglar', 'pesca-rio-manglar-sierpe', 'Explora los manglares de Sierpe en una aventura única. Pesca róbalo, sábalo y otras especies.', 'Aventura en río y manglar de Sierpe', 'rio', 4, '4 Horas', 4, 450.00, NULL, 'active', true, 2, '/tour-detail-03.webp', ARRAY['/tour-detail-03.webp'], 5, 8), (capitan_juan_id, 2, 5, 'Pesca de Marlín y Pez Vela', 'pesca-marlin-pez-vela-golfito', 'Golfito es conocido mundialmente por la pesca de marlín. Únete a esta expedición de día completo.', 'Expedición de marlín en Golfito', 'altaMar', 8, '8 Horas', 5, 950.00, 1100.00, 'active', true, 5, '/tour-detail-02.webp', ARRAY['/tour-detail-02.webp'], 5, 18), (capitan_maria_id, 1, 1, 'Pesca Costera en Tamarindo', 'pesca-costera-tamarindo', 'Pesca costera relajante para toda la familia. Ideal para principiantes.', 'Pesca familiar en Tamarindo', 'costera', 6, '6 Horas', 5, 600.00, 'active', false, 2, '/tour-detail-05.webp', 5, 15), (capitan_maria_id, 1, 2, 'Tour de Pesca Completo en Flamingo', 'tour-pesca-completo-flamingo', 'Dos días de pesca intensiva con alojamiento incluido.', 'Tour de 2 días en Flamingo', 'altaMar', 16, '2 Días', 6, 1200.00, 'active', true, 4, '/tour-detail-10.webp', 5, 20), (capitan_maria_id, 1, 3, 'Pesca al Atardecer en Playa del Coco', 'pesca-atardecer-coco', 'Disfruta de una tarde de pesca mientras contemplas el atardecer.', 'Pesca con atardecer incluido', 'costera', 5, '5 Horas', 4, 550.00, 'active', false, 1, '/tour-detail-05.webp', 5, 14), (capitan_pedro_id, 3, 7, 'Pesca en el Caribe - Puerto Viejo', 'pesca-caribe-puerto-viejo', 'Experiencia única de pesca en el Caribe costarricense.', 'Pesca caribeña en Puerto Viejo', 'costera', 6, '6 Horas', 4, 480.00, 'active', false, 2, '/tour-detail-03.webp', 5, 11), (capitan_pedro_id, 3, 8, 'Aventura de Pesca en Tortuguero', 'aventura-pesca-tortuguero', 'Navega por los canales de Tortuguero mientras pescas.', 'Pesca en canales de Tortuguero', 'rio', 8, '1 Día', 5, 720.00, 'active', true, 3, '/tour-detail-02.webp', 5, 16), (capitan_pedro_id, 3, 7, 'Pesca en Canales y Ríos - Cahuita', 'pesca-canales-rios-cahuita', 'Media jornada de pesca en los ríos cercanos a Cahuita.', 'Pesca familiar en Cahuita', 'rio', 4, '4 Horas', 3, 380.00, 'active', false, 1, '/tour-detail-03.webp', 5, 9);
END $$;

INSERT INTO promociones (code, name, description, promocion_type, discount_percentage, discount_amount, valid_from, valid_until, usage_limit, is_active) VALUES ('WELCOME25', 'Bienvenida 25%', 'Descuento de bienvenida para nuevos clientes', 'percentage', 25.00, NULL, NOW(), NOW() + INTERVAL '30 days', 100, true), ('SUMMER2025', 'Verano 2025', 'Promoción especial de verano', 'percentage', 15.00, NULL, '2025-06-01', '2025-08-31', 500, true), ('EARLYBIRD', 'Madrugador', 'Reserva con 30 días de anticipación', 'percentage', 20.00, NULL, NOW(), NOW() + INTERVAL '90 days', 200, true), ('FAMILY50', 'Descuento Familiar', '$50 de descuento en tours familiares', 'fixed_amount', NULL, 50.00, NOW(), NOW() + INTERVAL '60 days', 150, true);

DO $$
DECLARE tour_record RECORD; date_cursor DATE;
BEGIN
    FOR tour_record IN SELECT id, capacity FROM tours WHERE status = 'active' LOOP
        date_cursor := CURRENT_DATE;
        FOR i IN 1..30 LOOP
            INSERT INTO tour_availability (tour_id, date, available_slots, is_available) VALUES (tour_record.id, date_cursor, tour_record.capacity, true);
            date_cursor := date_cursor + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END $$;
