import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const provincia = searchParams.get('provincia');
    const offset = (page - 1) * limit;

    // Construir query con filtros
    let whereConditions = ['is_active = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (category && category !== 'all') {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (provincia && provincia !== 'all') {
      whereConditions.push(`provincia = $${paramIndex}`);
      queryParams.push(provincia);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Obtener total de tours
    const countQuery = `SELECT COUNT(*) as total FROM tours WHERE ${whereClause}`;
    const [{ total }] = await sql(countQuery, queryParams);

    // Obtener tours paginados
    const toursQuery = `
      SELECT
        id, title, slug, description, short_description,
        price, duration, category, provincia, location,
        image_url, gallery_images, difficulty, max_participants,
        included_items, not_included_items, what_to_bring,
        meeting_point, is_active, is_featured, rating,
        reviews_count, created_at, updated_at
      FROM tours
      WHERE ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const tours = await sql(toursQuery, [...queryParams, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: tours,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los tours',
        message: error.message
      },
      { status: 500 }
    );
  }
}
