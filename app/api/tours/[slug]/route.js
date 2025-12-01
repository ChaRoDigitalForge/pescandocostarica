import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    const tours = await sql`
      SELECT
        id, title, slug, description, short_description,
        price, duration, category, provincia, location,
        image_url, gallery_images, difficulty, max_participants,
        included_items, not_included_items, what_to_bring,
        meeting_point, is_active, is_featured, rating,
        reviews_count, created_at, updated_at
      FROM tours
      WHERE slug = ${slug} AND is_active = true
      LIMIT 1
    `;

    if (tours.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tour no encontrado'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tours[0]
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el tour',
        message: error.message
      },
      { status: 500 }
    );
  }
}
