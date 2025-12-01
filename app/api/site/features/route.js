import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const features = await sql`
      SELECT id, icon, title, description, display_order
      FROM features
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    return NextResponse.json({
      success: true,
      data: features
    });

  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error.message
      },
      { status: 500 }
    );
  }
}
