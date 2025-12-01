import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    const searchPattern = `%${query}%`;

    // Obtener total de resultados
    const [{ total }] = await sql`
      SELECT COUNT(*) as total
      FROM tours
      WHERE deleted_at IS NULL
        AND status = 'active'
        AND (
          title ILIKE ${searchPattern}
          OR description ILIKE ${searchPattern}
          OR short_description ILIKE ${searchPattern}
        )
    `;

    // Obtener tours
    const tours = await sql`
      SELECT *
      FROM vw_tours_complete
      WHERE status = 'active'
        AND (
          title ILIKE ${searchPattern}
          OR description ILIKE ${searchPattern}
          OR short_description ILIKE ${searchPattern}
          OR location_name ILIKE ${searchPattern}
        )
      ORDER BY
        CASE
          WHEN title ILIKE ${searchPattern} THEN 1
          WHEN short_description ILIKE ${searchPattern} THEN 2
          ELSE 3
        END,
        is_featured DESC,
        created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: tours,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error searching tours:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al buscar tours',
        message: error.message
      },
      { status: 500 }
    );
  }
}
