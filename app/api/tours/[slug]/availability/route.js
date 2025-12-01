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

    // Get availability using tagged template literals
    let bookings;

    if (startDate && endDate) {
      bookings = await sql`
        SELECT
          booking_date,
          SUM(participants) as total_booked
        FROM bookings
        WHERE tour_id = ${tourId}
          AND status != 'cancelled'
          AND booking_date >= ${startDate}
          AND booking_date <= ${endDate}
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    } else if (startDate) {
      bookings = await sql`
        SELECT
          booking_date,
          SUM(participants) as total_booked
        FROM bookings
        WHERE tour_id = ${tourId}
          AND status != 'cancelled'
          AND booking_date >= ${startDate}
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    } else if (endDate) {
      bookings = await sql`
        SELECT
          booking_date,
          SUM(participants) as total_booked
        FROM bookings
        WHERE tour_id = ${tourId}
          AND status != 'cancelled'
          AND booking_date <= ${endDate}
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    } else {
      bookings = await sql`
        SELECT
          booking_date,
          SUM(participants) as total_booked
        FROM bookings
        WHERE tour_id = ${tourId}
          AND status != 'cancelled'
        GROUP BY booking_date
        ORDER BY booking_date ASC
      `;
    }

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
