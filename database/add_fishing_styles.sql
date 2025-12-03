-- Migration: Add Fishing Styles (Estilos de Pesca)
-- Description: Adds fishing_styles table and many-to-many relationship with tours
-- Date: 2025-12-02

-- Create fishing_styles table
CREATE TABLE fishing_styles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create many-to-many relationship table between tours and fishing styles
CREATE TABLE tour_fishing_styles (
    id SERIAL PRIMARY KEY,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    fishing_style_id INTEGER REFERENCES fishing_styles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, fishing_style_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tour_fishing_styles_tour_id ON tour_fishing_styles(tour_id);
CREATE INDEX idx_tour_fishing_styles_style_id ON tour_fishing_styles(fishing_style_id);
CREATE INDEX idx_fishing_styles_slug ON fishing_styles(slug);
CREATE INDEX idx_fishing_styles_is_active ON fishing_styles(is_active);

-- Create trigger to update updated_at
CREATE TRIGGER update_fishing_styles_updated_at
    BEFORE UPDATE ON fishing_styles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the 12 fishing styles (Estilos de Pesca)
INSERT INTO fishing_styles (name, slug, description, display_order) VALUES
('Equipo Ligero', 'equipo-ligero', 'Pesca con equipo ligero para especies pequeñas y medianas', 1),
('Equipo Pesado', 'equipo-pesado', 'Pesca con equipo pesado para grandes pelágicos como marlín y atún', 2),
('Fondo', 'fondo', 'Pesca de fondo para especies como pargo y mero', 3),
('Pesca en Alta Mar', 'pesca-alta-mar', 'Pesca deportiva en aguas profundas lejos de la costa', 4),
('Fly Fishing', 'fly-fishing', 'Pesca con mosca en ríos, lagos o costa', 5),
('Cuerda de Mano', 'cuerda-mano', 'Técnica tradicional de pesca con línea de mano', 6),
('Jigging', 'jigging', 'Técnica vertical con señuelos de metal', 7),
('Señuelo', 'senuelo', 'Pesca con señuelos artificiales', 8),
('Orilla', 'orilla', 'Pesca desde la orilla o playa', 9),
('Spinning', 'spinning', 'Pesca con carrete giratorio y señuelos', 10),
('Baitcaster', 'baitcaster', 'Pesca con carrete de baitcasting para lances precisos', 11),
('Trolling', 'trolling', 'Pesca al curricán arrastrando señuelos detrás de la embarcación', 12);

-- Add some sample associations (optional - can be removed)
-- This associates some existing tours with fishing styles
DO $$
DECLARE
    tour_alta_mar UUID;
    tour_rio UUID;
    tour_costera UUID;
BEGIN
    -- Get sample tour IDs
    SELECT id INTO tour_alta_mar FROM tours WHERE slug = 'pesca-deportiva-alta-mar-quepos' LIMIT 1;
    SELECT id INTO tour_rio FROM tours WHERE slug = 'pesca-rio-manglar-sierpe' LIMIT 1;
    SELECT id INTO tour_costera FROM tours WHERE slug = 'pesca-costera-tamarindo' LIMIT 1;

    -- Associate alta mar tour with relevant styles
    IF tour_alta_mar IS NOT NULL THEN
        INSERT INTO tour_fishing_styles (tour_id, fishing_style_id)
        SELECT tour_alta_mar, id FROM fishing_styles
        WHERE slug IN ('equipo-pesado', 'pesca-alta-mar', 'trolling', 'jigging');
    END IF;

    -- Associate río tour with relevant styles
    IF tour_rio IS NOT NULL THEN
        INSERT INTO tour_fishing_styles (tour_id, fishing_style_id)
        SELECT tour_rio, id FROM fishing_styles
        WHERE slug IN ('equipo-ligero', 'fly-fishing', 'senuelo', 'spinning');
    END IF;

    -- Associate costera tour with relevant styles
    IF tour_costera IS NOT NULL THEN
        INSERT INTO tour_fishing_styles (tour_id, fishing_style_id)
        SELECT tour_costera, id FROM fishing_styles
        WHERE slug IN ('equipo-ligero', 'spinning', 'senuelo', 'orilla');
    END IF;
END $$;

-- Add comment to tables
COMMENT ON TABLE fishing_styles IS 'Catalog of fishing styles/techniques (Estilos de Pesca)';
COMMENT ON TABLE tour_fishing_styles IS 'Many-to-many relationship between tours and fishing styles';
