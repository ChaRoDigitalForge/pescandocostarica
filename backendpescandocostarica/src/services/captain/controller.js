import { query, getClient } from '../../config/database.js';

// Get captain's tours
export const getMyTours = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'capitan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Captain role required.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let toursQuery = `
      SELECT * FROM vw_tours_complete
      WHERE capitan_id = $1
    `;
    const params = [req.user.id];

    if (status) {
      toursQuery += ` AND status = $2`;
      params.push(status);
    }

    toursQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total FROM tours
      WHERE capitan_id = $1 AND deleted_at IS NULL
      ${status ? 'AND status = $2' : ''}
    `;

    const [toursResult, countResult] = await Promise.all([
      query(toursQuery, params),
      query(countQuery, status ? [req.user.id, status] : [req.user.id])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: toursResult.rows,
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

// Get captain's bookings
export const getMyBookings = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'capitan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Captain role required.'
      });
    }

    const { status, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let bookingsQuery = `
      SELECT b.*, t.title as tour_title, t.main_image_url
      FROM bookings b
      INNER JOIN tours t ON b.tour_id = t.id
      WHERE t.capitan_id = $1 AND b.deleted_at IS NULL
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (status) {
      bookingsQuery += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date_from) {
      bookingsQuery += ` AND b.booking_date >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      bookingsQuery += ` AND b.booking_date <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    bookingsQuery += ` ORDER BY b.booking_date DESC, b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total FROM bookings b
      INNER JOIN tours t ON b.tour_id = t.id
      WHERE t.capitan_id = $1 AND b.deleted_at IS NULL
      ${status ? `AND b.status = '${status}'` : ''}
      ${date_from ? `AND b.booking_date >= '${date_from}'` : ''}
      ${date_to ? `AND b.booking_date <= '${date_to}'` : ''}
    `;

    const [bookingsResult, countResult] = await Promise.all([
      query(bookingsQuery, params),
      query(countQuery, [req.user.id])
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

// Get captain statistics
export const getStatistics = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'capitan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Captain role required.'
      });
    }

    // Get overall statistics
    const statsQuery = `
      SELECT
        COUNT(DISTINCT t.id) as total_tours,
        COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) as active_tours,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days' THEN b.total_amount ELSE 0 END), 0) as revenue_last_30_days
      FROM tours t
      LEFT JOIN bookings b ON t.id = b.tour_id
      WHERE t.capitan_id = $1 AND t.deleted_at IS NULL
    `;

    const statsResult = await query(statsQuery, [req.user.id]);

    // Get upcoming bookings
    const upcomingQuery = `
      SELECT COUNT(*) as upcoming_bookings
      FROM bookings b
      INNER JOIN tours t ON b.tour_id = t.id
      WHERE t.capitan_id = $1
        AND b.booking_date >= CURRENT_DATE
        AND b.status IN ('pending', 'confirmed')
        AND b.deleted_at IS NULL
    `;

    const upcomingResult = await query(upcomingQuery, [req.user.id]);

    // Get monthly booking trends (last 6 months)
    const trendsQuery = `
      SELECT
        TO_CHAR(b.booking_date, 'YYYY-MM') as month,
        COUNT(*) as bookings_count,
        SUM(b.total_amount) as revenue
      FROM bookings b
      INNER JOIN tours t ON b.tour_id = t.id
      WHERE t.capitan_id = $1
        AND b.booking_date >= CURRENT_DATE - INTERVAL '6 months'
        AND b.status IN ('confirmed', 'completed')
        AND b.deleted_at IS NULL
      GROUP BY TO_CHAR(b.booking_date, 'YYYY-MM')
      ORDER BY month DESC
    `;

    const trendsResult = await query(trendsQuery, [req.user.id]);

    res.json({
      success: true,
      data: {
        overview: {
          ...statsResult.rows[0],
          upcoming_bookings: parseInt(upcomingResult.rows[0].upcoming_bookings)
        },
        trends: trendsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
export const updateBookingStatus = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    if (!req.user || req.user.role !== 'capitan') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { booking_number } = req.params;
    const { status, notes } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Verify booking belongs to captain
    const bookingCheck = await client.query(
      `SELECT b.*, t.capitan_id
       FROM bookings b
       INNER JOIN tours t ON b.tour_id = t.id
       WHERE b.booking_number = $1 AND b.deleted_at IS NULL`,
      [booking_number]
    );

    if (bookingCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingCheck.rows[0].capitan_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied - not your booking'
      });
    }

    // Update booking status
    const updateFields = ['status = $1', 'updated_at = NOW()'];
    const updateParams = [status];
    let paramCount = 2;

    if (status === 'confirmed') {
      updateFields.push(`confirmed_at = NOW()`);
    } else if (status === 'cancelled') {
      updateFields.push(`cancelled_at = NOW()`);
      if (notes) {
        updateFields.push(`cancellation_reason = $${paramCount}`);
        updateParams.push(notes);
        paramCount++;
      }
    }

    updateParams.push(booking_number);

    const updateQuery = `
      UPDATE bookings
      SET ${updateFields.join(', ')}
      WHERE booking_number = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(updateQuery, updateParams);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
