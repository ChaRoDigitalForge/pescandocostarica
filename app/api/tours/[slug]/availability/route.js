import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Obtener el tour_id por slug
    const tours = await sql`
      SELECT id, max_participants FROM tours WHERE slug = ${slug} LIMIT 1
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
    const maxParticipants = tours[0].max_participants;

    // Construir query de disponibilidad
    let query = `
      SELECT
        booking_date,
        SUM(participants) as total_booked
      FROM bookings
      WHERE tour_id = $1
        AND status != 'cancelled'
    `;

    const queryParams = [tourId];

    if (startDate) {
      query += ` AND booking_date >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND booking_date <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    query += `
      GROUP BY booking_date
      ORDER BY booking_date ASC
    `;

    const bookings = await sql(query, queryParams);

    // Calcular disponibilidad
    const availability = bookings.map(booking => ({
      date: booking.booking_date,
      booked: parseInt(booking.total_booked),
      available: maxParticipants - parseInt(booking.total_booked),
      is_full: parseInt(booking.total_booked) >= maxParticipants
    }));

    return NextResponse.json({
      success: true,
      data: availability
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
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
