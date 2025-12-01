import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Obtener hero slides
    const heroSlides = await sql`
      SELECT id, image_url, title, subtitle, description, order_position as display_order
      FROM hero_slides
      WHERE is_active = true
      ORDER BY order_position ASC
    `;

    // Obtener features
    const features = await sql`
      SELECT id, icon, title, description, order_position as display_order
      FROM site_features
      WHERE is_active = true
      ORDER BY order_position ASC
    `;

    // Obtener configuración general del sitio
    const siteConfig = await sql`
      SELECT key, value
      FROM site_config
    `;

    // Convertir configuración a objeto
    const config = {};
    siteConfig.forEach(item => {
      config[item.key] = item.value;
    });

    // Obtener redes sociales
    const socialMedia = await sql`
      SELECT id, platform, url, icon_svg, order_position as display_order
      FROM social_media
      WHERE is_active = true
      ORDER BY order_position ASC
    `;

    // Obtener navegación
    const navigation = await sql`
      SELECT id, label, url, parent_id, order_position as display_order
      FROM navigation_menu
      WHERE is_active = true
      ORDER BY order_position ASC
    `;

    // Obtener provincias disponibles
    const provincias = await sql`
      SELECT code, name
      FROM provincias
      WHERE is_active = true
      ORDER BY name ASC
    `;

    return NextResponse.json({
      success: true,
      data: {
        heroSlides,
        features,
        config,
        socialMedia,
        navigation,
        provincias
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
