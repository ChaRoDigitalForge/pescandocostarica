import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    const tours = await sql`
      SELECT *
      FROM vw_tours_complete
      WHERE slug = ${slug} AND status = 'active'
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
