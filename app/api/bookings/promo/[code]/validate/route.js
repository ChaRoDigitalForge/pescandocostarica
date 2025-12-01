import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tour_id');
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción requerido'
        },
        { status: 400 }
      );
    }

    // Buscar código de promoción
    const promos = await sql`
      SELECT
        id, code, discount_type, discount_value,
        min_purchase, max_discount, valid_from, valid_until,
        is_active, usage_limit, times_used, applicable_tours
      FROM promo_codes
      WHERE code = ${code.toUpperCase()}
      LIMIT 1
    `;

    if (promos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción inválido'
        },
        { status: 404 }
      );
    }

    const promo = promos[0];

    // Validar si está activo
    if (!promo.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción inactivo'
        },
        { status: 400 }
      );
    }

    // Validar fechas
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción aún no válido'
        },
        { status: 400 }
      );
    }

    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción expirado'
        },
        { status: 400 }
      );
    }

    // Validar límite de uso
    if (promo.usage_limit && promo.times_used >= promo.usage_limit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de promoción agotado'
        },
        { status: 400 }
      );
    }

    // Validar compra mínima
    if (promo.min_purchase && subtotal < promo.min_purchase) {
      return NextResponse.json(
        {
          success: false,
          error: `Compra mínima de $${promo.min_purchase} requerida`,
          message: `Este código requiere una compra mínima de $${promo.min_purchase}`
        },
        { status: 400 }
      );
    }

    // Validar tours aplicables
    if (promo.applicable_tours && promo.applicable_tours.length > 0 && tourId) {
      const isApplicable = promo.applicable_tours.includes(parseInt(tourId));
      if (!isApplicable) {
        return NextResponse.json(
          {
            success: false,
            error: 'Código no aplicable a este tour'
          },
          { status: 400 }
        );
      }
    }

    // Calcular descuento
    let discountAmount = 0;
    if (promo.discount_type === 'percentage') {
      discountAmount = (subtotal * promo.discount_value) / 100;
      if (promo.max_discount) {
        discountAmount = Math.min(discountAmount, promo.max_discount);
      }
    } else if (promo.discount_type === 'fixed') {
      discountAmount = promo.discount_value;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        final_price: Math.max(0, subtotal - discountAmount)
      },
      message: 'Código de promoción válido'
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al validar código de promoción',
        message: error.message
      },
      { status: 500 }
    );
  }
}
