-- Agregar tablas para información de botes y especies objetivo

-- Tabla de botes
CREATE TABLE IF NOT EXISTS boats (
    id SERIAL PRIMARY KEY,
    capitan_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boat_type VARCHAR(100), -- e.g., 'Centro Console', 'Yate', 'Panga', 'Crucero'
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    length_feet DECIMAL(5, 2),
    capacity INTEGER NOT NULL,
    description TEXT,
    features TEXT[], -- e.g., ['GPS', 'Sonar', 'Baño', 'Cocina', 'Camarote']
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de especies de pesca
CREATE TABLE IF NOT EXISTS fish_species (
    id SERIAL PRIMARY KEY,
    name_es VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    description TEXT,
    image_url TEXT,
    common_names TEXT[],
    average_weight_lbs DECIMAL(8, 2),
    max_weight_lbs DECIMAL(8, 2),
    fishing_seasons INTEGER[], -- array de meses [1,2,3,4,5,6,7,8,9,10,11,12]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación entre tours y botes
CREATE TABLE IF NOT EXISTS tour_boats (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    boat_id INTEGER REFERENCES boats(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, boat_id)
);

-- Tabla de relación entre tours y especies objetivo
CREATE TABLE IF NOT EXISTS tour_target_species (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    species_id INTEGER REFERENCES fish_species(id) ON DELETE CASCADE,
    probability_percentage DECIMAL(5, 2), -- probabilidad de captura (0-100)
    is_featured BOOLEAN DEFAULT FALSE, -- si es una especie destacada del tour
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, species_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_boats_capitan_id ON boats(capitan_id);
CREATE INDEX IF NOT EXISTS idx_tour_boats_tour_id ON tour_boats(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_boats_boat_id ON tour_boats(boat_id);
CREATE INDEX IF NOT EXISTS idx_tour_target_species_tour_id ON tour_target_species(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_target_species_species_id ON tour_target_species(species_id);

-- Trigger para actualizar updated_at en boats
CREATE TRIGGER update_boats_updated_at
    BEFORE UPDATE ON boats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar especies de pesca comunes en Costa Rica
INSERT INTO fish_species (name_es, name_en, scientific_name, description, average_weight_lbs, max_weight_lbs, fishing_seasons) VALUES
    ('Marlín Azul', 'Blue Marlin', 'Makaira nigricans', 'El marlín azul es uno de los peces deportivos más codiciados del mundo.', 300, 1500, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Marlín Negro', 'Black Marlin', 'Istiompax indica', 'El marlín negro es conocido por su tamaño impresionante y fuerza.', 350, 1650, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Pez Vela', 'Sailfish', 'Istiophorus platypterus', 'El pez vela es el pez más rápido del océano.', 100, 220, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Dorado', 'Mahi-Mahi', 'Coryphaena hippurus', 'El dorado es conocido por sus colores vibrantes y excelente sabor.', 30, 88, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Atún Aleta Amarilla', 'Yellowfin Tuna', 'Thunnus albacares', 'El atún aleta amarilla es un pez fuerte y excelente para comer.', 100, 400, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Wahoo', 'Wahoo', 'Acanthocybium solandri', 'El wahoo es uno de los peces más rápidos y agresivos.', 40, 180, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Róbalo', 'Snook', 'Centropomus undecimalis', 'El róbalo es un pez costero muy apreciado por los pescadores.', 10, 50, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Sábalo', 'Tarpon', 'Megalops atlanticus', 'El sábalo es famoso por sus saltos espectaculares.', 80, 280, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Pargo', 'Snapper', 'Lutjanus campechanus', 'El pargo es un pez de fondo muy apreciado en la cocina.', 10, 50, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Corvina', 'Corvina', 'Cynoscion albus', 'La corvina es un pez costero muy popular en Costa Rica.', 15, 80, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Jurel', 'Jack Crevalle', 'Caranx hippos', 'El jurel es un pez fuerte que da gran pelea.', 20, 65, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]),
    ('Guapote', 'Rainbow Bass', 'Parachromis dovii', 'El guapote es el pez de agua dulce más codiciado de Costa Rica.', 5, 15, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12])
ON CONFLICT DO NOTHING;

-- Insertar algunos botes de ejemplo
DO $$
DECLARE
    capitan_juan_id UUID;
    capitan_maria_id UUID;
    capitan_pedro_id UUID;
BEGIN
    -- Obtener IDs de capitanes existentes
    SELECT id INTO capitan_juan_id FROM users WHERE email = 'juan.navarro@example.com' LIMIT 1;
    SELECT id INTO capitan_maria_id FROM users WHERE email = 'maria.gomez@example.com' LIMIT 1;
    SELECT id INTO capitan_pedro_id FROM users WHERE email = 'pedro.castro@example.com' LIMIT 1;

    -- Insertar botes solo si los capitanes existen
    IF capitan_juan_id IS NOT NULL THEN
        INSERT INTO boats (capitan_id, name, boat_type, brand, model, year, length_feet, capacity, description, features)
        VALUES
            (capitan_juan_id, 'Mar Azul', 'Centro Console', 'Contender', '35 ST', 2020, 35, 6, 'Bote moderno de alta mar con todo el equipo profesional', ARRAY['GPS Garmin', 'Sonar', 'Radar', 'Baño', 'Camarote', 'Live Bait Tank', 'Fighting Chair']),
            (capitan_juan_id, 'Pescador II', 'Yate Deportivo', 'Hatteras', '50 Convertible', 2018, 50, 8, 'Yate de lujo para pesca deportiva con todas las comodidades', ARRAY['GPS', 'Sonar', 'Radar', '2 Baños', '2 Camarotes', 'Cocina completa', 'Aire acondicionado', 'Flying Bridge'])
        ON CONFLICT DO NOTHING;
    END IF;

    IF capitan_maria_id IS NOT NULL THEN
        INSERT INTO boats (capitan_id, name, boat_type, brand, model, year, length_feet, capacity, description, features)
        VALUES
            (capitan_maria_id, 'Costa Brava', 'Centro Console', 'Boston Whaler', '270 Outrage', 2021, 27, 5, 'Bote versátil ideal para pesca costera y deportiva', ARRAY['GPS', 'Fish Finder', 'Bimini Top', 'Cooler', 'Rod Holders']),
            (capitan_maria_id, 'Flamingo Star', 'Panga', 'Super Panga', '27', 2019, 27, 4, 'Panga tradicional costarricense perfecta para pesca inshore', ARRAY['GPS', 'Fish Finder', 'Toldo', 'Hielera', 'Portacañas'])
        ON CONFLICT DO NOTHING;
    END IF;

    IF capitan_pedro_id IS NOT NULL THEN
        INSERT INTO boats (capitan_id, name, boat_type, brand, model, year, length_feet, capacity, description, features)
        VALUES
            (capitan_pedro_id, 'Caribe Explorer', 'Lancha', 'Carolina Skiff', '24', 2020, 24, 4, 'Lancha ideal para canales y ríos del Caribe', ARRAY['GPS', 'Fish Finder', 'Toldo', 'Motor eléctrico']),
            (capitan_pedro_id, 'Río Aventura', 'Jon Boat', 'Tracker', 'Grizzly 1860', 2022, 18, 3, 'Bote especializado para pesca en ríos y canales', ARRAY['Motor eléctrico', 'Ancla', 'Asientos acolchados'])
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

COMMENT ON TABLE boats IS 'Información de los botes utilizados en los tours de pesca';
COMMENT ON TABLE fish_species IS 'Catálogo de especies de pesca disponibles en Costa Rica';
COMMENT ON TABLE tour_boats IS 'Relación entre tours y los botes utilizados';
COMMENT ON TABLE tour_target_species IS 'Especies objetivo de cada tour con probabilidades de captura';
