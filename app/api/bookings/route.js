import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request) {
  try {
    const bookingData = await request.json();

    const {
      tour_id,
      user_id,
      booking_date,
      participants,
      total_price,
      customer_name,
      customer_email,
      customer_phone,
      special_requests,
      promo_code
    } = bookingData;

    // Validar datos requeridos
    if (!tour_id || !booking_date || !participants || !total_price || !customer_email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos incompletos',
          message: 'Faltan campos requeridos'
        },
        { status: 400 }
      );
    }

    // Verificar que el tour existe y está activo
    const tours = await sql`
      SELECT id, title, price, max_participants
      FROM tours
      WHERE id = ${tour_id} AND is_active = true
    `;

    if (tours.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tour no encontrado o no disponible'
        },
        { status: 404 }
      );
    }

    const tour = tours[0];

    // Validar número de participantes
    if (participants > tour.max_participants) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de participantes excede el máximo permitido',
          message: `Máximo ${tour.max_participants} participantes`
        },
        { status: 400 }
      );
    }

    // Crear la reserva
    const [booking] = await sql`
      INSERT INTO bookings (
        tour_id,
        user_id,
        booking_date,
        participants,
        total_price,
        customer_name,
        customer_email,
        customer_phone,
        special_requests,
        promo_code,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${tour_id},
        ${user_id || null},
        ${booking_date},
        ${participants},
        ${total_price},
        ${customer_name},
        ${customer_email},
        ${customer_phone || null},
        ${special_requests || null},
        ${promo_code || null},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Reserva creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la reserva',
        message: error.message
      },
      { status: 500 }
    );
  }
}
