import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Obtener el tour_id por slug
    const tours = await sql`
      SELECT id FROM tours WHERE slug = ${slug} AND deleted_at IS NULL LIMIT 1
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

    const tourId = tours[0].id;

    // Obtener total de reviews
    const [{ total }] = await sql`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE tour_id = ${tourId} AND is_approved = true
    `;

    // Obtener reviews paginadas
    const reviews = await sql`
      SELECT
        r.id, r.rating, r.comment, r.created_at,
        u.name as user_name, u.avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.tour_id = ${tourId} AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        error: error.message
      },
      { status: 500 }
    );
  }
}
