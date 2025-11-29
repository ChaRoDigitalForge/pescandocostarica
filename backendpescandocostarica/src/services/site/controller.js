import pool from '../../config/database.js';

// Obtener toda la configuración del sitio
export const getSiteSettings = async (req, res) => {
  try {
    // Obtener slides del hero
    const slidesResult = await pool.query(
      `SELECT id, title, subtitle, description, image_url, order_position
       FROM hero_slides
       WHERE is_active = true
       ORDER BY order_position ASC`
    );

    // Obtener features
    const featuresResult = await pool.query(
      `SELECT id, icon, title, description, order_position
       FROM site_features
       WHERE is_active = true
       ORDER BY order_position ASC`
    );

    // Obtener configuración general
    const configResult = await pool.query(
      `SELECT key, value FROM site_config`
    );

    // Convertir array de config a objeto
    const config = {};
    configResult.rows.forEach(row => {
      config[row.key] = row.value;
    });

    // Obtener redes sociales
    const socialResult = await pool.query(
      `SELECT id, platform, url, icon_svg, order_position
       FROM social_media
       WHERE is_active = true
       ORDER BY order_position ASC`
    );

    // Obtener menú de navegación
    const navResult = await pool.query(
      `SELECT id, label, url, parent_id, order_position
       FROM navigation_menu
       WHERE is_active = true AND parent_id IS NULL
       ORDER BY order_position ASC`
    );

    // Obtener provincias para los filtros
    const provinciasResult = await pool.query(
      `SELECT id, code, name, description
       FROM provincias
       WHERE is_active = true
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      data: {
        heroSlides: slidesResult.rows,
        features: featuresResult.rows,
        config,
        socialMedia: socialResult.rows,
        navigation: navResult.rows,
        provincias: provinciasResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar la configuración del sitio',
      error: error.message
    });
  }
};

// Obtener solo slides del hero
export const getHeroSlides = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, subtitle, description, image_url, order_position
       FROM hero_slides
       WHERE is_active = true
       ORDER BY order_position ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar los slides',
      error: error.message
    });
  }
};

// Obtener solo features
export const getFeatures = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, icon, title, description, order_position
       FROM site_features
       WHERE is_active = true
       ORDER BY order_position ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar las características',
      error: error.message
    });
  }
};

// Obtener configuración específica por key
export const getConfigByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      `SELECT key, value FROM site_config WHERE key = $1`,
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar la configuración',
      error: error.message
    });
  }
};
