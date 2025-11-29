import { query, getClient } from '../../config/database.js';

export const createBooking = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      tour_id,
      booking_date,
      number_of_people,
      customer_name,
      customer_email,
      customer_phone,
      customer_notes,
      promocion_code
    } = req.body;

    const tourResult = await client.query(
      'SELECT id, price, capacity FROM tours WHERE id = $1 AND status = $\'active\'',
      [tour_id]
    );

    if (tourResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const tour = tourResult.rows[0];

    const availabilityResult = await client.query(
      `SELECT available_slots, special_price FROM tour_availability
       WHERE tour_id = $1 AND date = $2 AND is_available = true`,
      [tour_id, booking_date]
    );

    if (availabilityResult.rows.length === 0 || availabilityResult.rows[0].available_slots < number_of_people) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Insufficient availability for this date'
      });
    }

    const pricePerPerson = availabilityResult.rows[0].special_price || tour.price;
    let subtotal = pricePerPerson * number_of_people;
    let discount_amount = 0;
    let promocion_id = null;

    if (promocion_code) {
      const promocionResult = await client.query(
        `SELECT * FROM promociones
         WHERE code = $1 AND is_active = true
         AND valid_from <= NOW() AND valid_until >= NOW()
         AND (usage_limit IS NULL OR current_usage_count < usage_limit)`,
        [promocion_code]
      );

      if (promocionResult.rows.length > 0) {
        const promocion = promocionResult.rows[0];
        promocion_id = promocion.id;

        const userUsageResult = await client.query(
          `SELECT COUNT(*) as count FROM promocion_usage
           WHERE promocion_id = $1 AND user_id = $2`,
          [promocion.id, req.user?.id]
        );

        if (parseInt(userUsageResult.rows[0].count) < promocion.usage_limit_per_user) {
          if (promocion.promocion_type === 'percentage') {
            discount_amount = (subtotal * promocion.discount_percentage) / 100;
            if (promocion.max_discount_amount && discount_amount > promocion.max_discount_amount) {
              discount_amount = promocion.max_discount_amount;
            }
          } else if (promocion.promocion_type === 'fixed_amount') {
            discount_amount = promocion.discount_amount;
          }
        }
      }
    }

    const tax_amount = (subtotal - discount_amount) * 0.13;
    const total_amount = subtotal - discount_amount + tax_amount;

    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, tour_id, promocion_id, booking_date, number_of_people,
        customer_name, customer_email, customer_phone, customer_notes,
        subtotal, discount_amount, tax_amount, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
      RETURNING *`,
      [
        req.user?.id || null,
        tour_id,
        promocion_id,
        booking_date,
        number_of_people,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount
      ]
    );

    await client.query(
      `UPDATE tour_availability
       SET available_slots = available_slots - $1
       WHERE tour_id = $2 AND date = $3`,
      [number_of_people, tour_id, booking_date]
    );

    if (promocion_id && req.user) {
      await client.query(
        `INSERT INTO promocion_usage (promocion_id, user_id, booking_id, discount_amount)
         VALUES ($1, $2, $3, $4)`,
        [promocion_id, req.user.id, bookingResult.rows[0].id, discount_amount]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: bookingResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let bookingsQuery = `
      SELECT * FROM vw_bookings_complete
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (status) {
      bookingsQuery += ` AND status = $2`;
      params.push(status);
    }

    bookingsQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total FROM bookings
      WHERE user_id = $1 ${status ? 'AND status = $2' : ''}
    `;

    const [bookingsResult, countResult] = await Promise.all([
      query(bookingsQuery, params),
      query(countQuery, status ? [req.user.id, status] : [req.user.id])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: bookingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingByNumber = async (req, res, next) => {
  try {
    const { booking_number } = req.params;

    const result = await query(
      'SELECT * FROM vw_bookings_complete WHERE booking_number = $1',
      [booking_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = result.rows[0];

    if (req.user && booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { booking_number } = req.params;
    const { cancellation_reason } = req.body;

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE booking_number = $1',
      [booking_number]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    if (req.user && booking.user_id !== req.user.id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    await client.query(
      `UPDATE bookings
       SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1
       WHERE booking_number = $2`,
      [cancellation_reason, booking_number]
    );

    await client.query(
      `UPDATE tour_availability
       SET available_slots = available_slots + $1
       WHERE tour_id = $2 AND date = $3`,
      [booking.number_of_people, booking.tour_id, booking.booking_date]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const { booking_number } = req.params;

    const bookingResult = await query(
      'SELECT * FROM bookings WHERE booking_number = $1',
      [booking_number]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking already confirmed'
      });
    }

    await query(
      `UPDATE bookings
       SET status = 'confirmed', confirmed_at = NOW()
       WHERE booking_number = $1`,
      [booking_number]
    );

    res.json({
      success: true,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const validatePromoCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { tour_id, subtotal } = req.query;

    const promocionResult = await query(
      `SELECT * FROM promociones
       WHERE code = $1 AND is_active = true
       AND valid_from <= NOW() AND valid_until >= NOW()
       AND (usage_limit IS NULL OR current_usage_count < usage_limit)`,
      [code]
    );

    if (promocionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    const promocion = promocionResult.rows[0];

    if (req.user) {
      const userUsageResult = await query(
        `SELECT COUNT(*) as count FROM promocion_usage
         WHERE promocion_id = $1 AND user_id = $2`,
        [promocion.id, req.user.id]
      );

      if (parseInt(userUsageResult.rows[0].count) >= promocion.usage_limit_per_user) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this promo code'
        });
      }
    }

    let discount = 0;
    if (subtotal) {
      if (promocion.promocion_type === 'percentage') {
        discount = (parseFloat(subtotal) * promocion.discount_percentage) / 100;
        if (promocion.max_discount_amount && discount > promocion.max_discount_amount) {
          discount = promocion.max_discount_amount;
        }
      } else if (promocion.promocion_type === 'fixed_amount') {
        discount = promocion.discount_amount;
      }
    }

    res.json({
      success: true,
      data: {
        ...promocion,
        calculated_discount: discount
      }
    });
  } catch (error) {
    next(error);
  }
};
