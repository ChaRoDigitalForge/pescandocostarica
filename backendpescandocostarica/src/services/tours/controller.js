import { query } from '../../config/database.js';

export const getAllTours = async (req, res, next) => {
  try {
    const {
      provincia,
      fishing_type,
      min_price,
      max_price,
      min_capacity,
      min_rating,
      featured,
      sort = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 12
    } = req.query;

    let queryText = `
      SELECT * FROM vw_tours_complete
      WHERE status = 'active'
    `;
    const params = [];
    let paramCount = 1;

    if (provincia) {
      queryText += ` AND provincia_code = $${paramCount}`;
      params.push(provincia);
      paramCount++;
    }

    if (fishing_type) {
      queryText += ` AND fishing_type = $${paramCount}`;
      params.push(fishing_type);
      paramCount++;
    }

    if (min_price) {
      queryText += ` AND price >= $${paramCount}`;
      params.push(min_price);
      paramCount++;
    }

    if (max_price) {
      queryText += ` AND price <= $${paramCount}`;
      params.push(max_price);
      paramCount++;
    }

    if (min_capacity) {
      queryText += ` AND capacity >= $${paramCount}`;
      params.push(min_capacity);
      paramCount++;
    }

    if (min_rating) {
      queryText += ` AND average_rating >= $${paramCount}`;
      params.push(min_rating);
      paramCount++;
    }

    if (featured === 'true') {
      queryText += ` AND is_featured = true`;
    }

    const validSorts = ['price', 'average_rating', 'total_bookings', 'created_at'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${sortOrder}`;

    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total FROM tours
      WHERE status = 'active' AND deleted_at IS NULL
      ${provincia ? `AND provincia_id = (SELECT id FROM provincias WHERE code = '${provincia}')` : ''}
      ${fishing_type ? `AND fishing_type = '${fishing_type}'` : ''}
    `;

    const [toursResult, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery)
    ]);

    const totalTours = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalTours / limit);

    res.json({
      success: true,
      data: toursResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalTours,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTourBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const tourQuery = `
      SELECT
        t.*,
        p.name as provincia_name,
        p.code as provincia_code,
        l.name as location_name,
        l.latitude,
        l.longitude,
        u.first_name || ' ' || u.last_name as capitan_name,
        u.years_of_experience as capitan_experience,
        u.avatar_url as capitan_avatar,
        u.bio as capitan_bio,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ts.id,
              'type', ts.service_type,
              'name', ts.name,
              'description', ts.description,
              'is_included', ts.is_included,
              'additional_cost', ts.additional_cost
            )
          ) FILTER (WHERE ts.id IS NOT NULL),
          '[]'
        ) as services,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'description', ti.description,
              'is_included', ti.is_included,
              'order', ti.display_order
            ) ORDER BY ti.display_order
          ) FILTER (WHERE ti.id IS NOT NULL),
          '[]'
        ) as inclusions,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'requirement', tr.requirement,
              'is_mandatory', tr.is_mandatory,
              'order', tr.display_order
            ) ORDER BY tr.display_order
          ) FILTER (WHERE tr.id IS NOT NULL),
          '[]'
        ) as requirements
      FROM tours t
      LEFT JOIN provincias p ON t.provincia_id = p.id
      LEFT JOIN locations l ON t.location_id = l.id
      LEFT JOIN users u ON t.capitan_id = u.id
      LEFT JOIN tour_services ts ON t.id = ts.tour_id
      LEFT JOIN tour_inclusions ti ON t.id = ti.tour_id
      LEFT JOIN tour_requirements tr ON t.id = tr.tour_id
      WHERE t.slug = $1 AND t.status = 'active' AND t.deleted_at IS NULL
      GROUP BY t.id, p.name, p.code, l.name, l.latitude, l.longitude, u.first_name, u.last_name, u.years_of_experience, u.avatar_url, u.bio
    `;

    const result = await query(tourQuery, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    await query('UPDATE tours SET view_count = view_count + 1 WHERE slug = $1', [slug]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getTourAvailability = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { start_date, end_date } = req.query;

    const tourResult = await query('SELECT id FROM tours WHERE slug = $1', [slug]);

    if (tourResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const tourId = tourResult.rows[0].id;

    let availabilityQuery = `
      SELECT * FROM tour_availability
      WHERE tour_id = $1 AND is_available = true
    `;
    const params = [tourId];

    if (start_date) {
      availabilityQuery += ` AND date >= $2`;
      params.push(start_date);
    }

    if (end_date) {
      const endParam = start_date ? '$3' : '$2';
      availabilityQuery += ` AND date <= ${endParam}`;
      params.push(end_date);
    }

    availabilityQuery += ` ORDER BY date ASC`;

    const result = await query(availabilityQuery, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedTours = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const result = await query(
      `SELECT * FROM vw_tours_complete
       WHERE is_featured = true AND status = 'active'
       ORDER BY average_rating DESC, total_bookings DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getTourReviews = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const tourResult = await query('SELECT id FROM tours WHERE slug = $1', [slug]);

    if (tourResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const tourId = tourResult.rows[0].id;
    const offset = (page - 1) * limit;

    const reviewsQuery = `
      SELECT
        r.*,
        u.first_name || ' ' || u.last_name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'url', ri.image_url,
              'order', ri.display_order
            ) ORDER BY ri.display_order
          ) FILTER (WHERE ri.id IS NOT NULL),
          '[]'
        ) as images
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN review_images ri ON r.id = ri.review_id
      WHERE r.tour_id = $1 AND r.status = 'approved'
      GROUP BY r.id, u.first_name, u.last_name, u.avatar_url
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM reviews
      WHERE tour_id = $1 AND status = 'approved'
    `;

    const [reviewsResult, countResult] = await Promise.all([
      query(reviewsQuery, [tourId, limit, offset]),
      query(countQuery, [tourId])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: reviewsResult.rows,
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

export const searchTours = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${q}%`;
    const offset = (page - 1) * limit;

    const searchQuery = `
      SELECT * FROM vw_tours_complete
      WHERE status = 'active' AND (
        LOWER(title) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(short_description) LIKE LOWER($1) OR
        LOWER(location_name) LIKE LOWER($1) OR
        LOWER(provincia_name) LIKE LOWER($1)
      )
      ORDER BY average_rating DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM tours
      WHERE status = 'active' AND deleted_at IS NULL AND (
        LOWER(title) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(short_description) LIKE LOWER($1)
      )
    `;

    const [toursResult, countResult] = await Promise.all([
      query(searchQuery, [searchTerm, limit, offset]),
      query(countQuery, [searchTerm])
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
