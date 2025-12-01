import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Obtener hero slides
    const heroSlides = await sql`
      SELECT id, image_url, title, subtitle, description, link_url, button_text, display_order
      FROM hero_slides
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    // Obtener features
    const features = await sql`
      SELECT id, icon, title, description, display_order
      FROM features
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    // Obtener configuración general del sitio
    const siteConfig = await sql`
      SELECT key, value, data_type
      FROM site_config
      WHERE is_active = true
    `;

    // Convertir configuración a objeto
    const config = {};
    siteConfig.forEach(item => {
      let value = item.value;
      if (item.data_type === 'json') {
        try {
          value = JSON.parse(item.value);
        } catch (e) {
          console.error(`Error parsing JSON for key ${item.key}:`, e);
        }
      } else if (item.data_type === 'number') {
        value = parseFloat(item.value);
      } else if (item.data_type === 'boolean') {
        value = item.value === 'true';
      }
      config[item.key] = value;
    });

    // Obtener redes sociales
    const socialMedia = await sql`
      SELECT id, platform, url, icon, display_order
      FROM social_media
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    // Obtener navegación
    const navigation = await sql`
      SELECT id, label, url, parent_id, display_order
      FROM navigation
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    // Obtener provincias disponibles
    const provincias = await sql`
      SELECT DISTINCT provincia
      FROM tours
      WHERE is_active = true AND provincia IS NOT NULL
      ORDER BY provincia ASC
    `;

    return NextResponse.json({
      success: true,
      data: {
        heroSlides,
        features,
        config,
        socialMedia,
        navigation,
        provincias: provincias.map(p => p.provincia)
      }
    });

  } catch (error) {
    console.error('Error fetching site settings:', error);

    // Retornar datos por defecto en caso de error
    return NextResponse.json({
      success: false,
      data: {
        heroSlides: [],
        features: [],
        config: {},
        socialMedia: [],
        navigation: [],
        provincias: []
      },
      error: error.message
    });
  }
}
