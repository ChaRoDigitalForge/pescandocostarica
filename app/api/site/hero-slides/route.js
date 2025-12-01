import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const slides = await sql`
      SELECT
        id, image_url, title, subtitle, description,
        link_url, button_text, display_order
      FROM hero_slides
      WHERE is_active = true
      ORDER BY display_order ASC
    `;

    return NextResponse.json({
      success: true,
      data: slides
    });

  } catch (error) {
    console.error('Error fetching hero slides:', error);
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
