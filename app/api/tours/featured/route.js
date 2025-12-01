import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const tours = await sql`
      SELECT
        id, title, slug, description, short_description,
        price, duration, category, provincia, location,
        image_url, gallery_images, difficulty, max_participants,
        is_active, is_featured, rating, reviews_count
      FROM tours
      WHERE is_active = true AND is_featured = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener tours destacados',
        message: error.message
      },
      { status: 500 }
    );
  }
}
