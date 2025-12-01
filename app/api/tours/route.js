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

    // Build query with filters using tagged template literals
    let countResult;
    let tours;

    if (provincia && provincia !== 'all' && category && category !== 'all') {
      // Both filters
      [countResult] = await sql`
        SELECT COUNT(*) as total
        FROM tours
        WHERE is_active = true
          AND categoria = ${category}
          AND provincia = ${provincia}
      `;

      tours = await sql`
        SELECT *
        FROM tours_view
        WHERE is_active = true
          AND categoria = ${category}
          AND provincia = ${provincia}
        ORDER BY is_featured DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (provincia && provincia !== 'all') {
      // Only provincia filter
      [countResult] = await sql`
        SELECT COUNT(*) as total
        FROM tours
        WHERE is_active = true AND provincia = ${provincia}
      `;

      tours = await sql`
        SELECT *
        FROM tours_view
        WHERE is_active = true AND provincia = ${provincia}
        ORDER BY is_featured DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (category && category !== 'all') {
      // Only category filter
      [countResult] = await sql`
        SELECT COUNT(*) as total
        FROM tours
        WHERE is_active = true AND categoria = ${category}
      `;

      tours = await sql`
        SELECT *
        FROM tours_view
        WHERE is_active = true AND categoria = ${category}
        ORDER BY is_featured DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // No filters
      [countResult] = await sql`
        SELECT COUNT(*) as total
        FROM tours
        WHERE is_active = true
      `;

      tours = await sql`
        SELECT *
        FROM tours_view
        WHERE is_active = true
        ORDER BY is_featured DESC, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: tours,
      pagination: {
        page,
        limit,
        total,
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
