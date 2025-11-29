import { query } from '../../config/database.js';
import { createFirebaseUser } from '../../config/firebase.js';

export const createUser = async (req, res, next) => {
  try {
    const {
      firebase_uid,
      email,
      first_name,
      last_name,
      phone,
      role = 'cliente'
    } = req.body;

    const result = await query(
      `INSERT INTO users (firebase_uid, email, first_name, last_name, phone, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', true)
       RETURNING *`,
      [firebase_uid, email, first_name, last_name, phone, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await query(
      `SELECT id, firebase_uid, email, first_name, last_name, phone, role, status,
              avatar_url, date_of_birth, bio, address, city, provincia, country,
              license_number, years_of_experience, specializations, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      first_name,
      last_name,
      phone,
      bio,
      address,
      city,
      provincia,
      date_of_birth,
      avatar_url
    } = req.body;

    const result = await query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        bio = COALESCE($4, bio),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        provincia = COALESCE($7, provincia),
        date_of_birth = COALESCE($8, date_of_birth),
        avatar_url = COALESCE($9, avatar_url),
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [first_name, last_name, phone, bio, address, city, provincia, date_of_birth, avatar_url, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByFirebaseUid = async (req, res, next) => {
  try {
    const { firebase_uid } = req.params;

    const result = await query(
      'SELECT * FROM users WHERE firebase_uid = $1 AND deleted_at IS NULL',
      [firebase_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const addToFavorites = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { tour_id } = req.body;

    const tourExists = await query(
      'SELECT id FROM tours WHERE id = $1 AND status = \'active\'',
      [tour_id]
    );

    if (tourExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    await query(
      'INSERT INTO favorites (user_id, tour_id) VALUES ($1, $2) ON CONFLICT (user_id, tour_id) DO NOTHING',
      [req.user.id, tour_id]
    );

    res.json({
      success: true,
      message: 'Tour added to favorites'
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { tour_id } = req.params;

    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND tour_id = $2',
      [req.user.id, tour_id]
    );

    res.json({
      success: true,
      message: 'Tour removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await query(
      `SELECT t.* FROM tours t
       INNER JOIN favorites f ON t.id = f.tour_id
       WHERE f.user_id = $1 AND t.status = 'active' AND t.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      tour_id,
      booking_id,
      rating,
      title,
      comment,
      guide_rating,
      equipment_rating,
      value_rating
    } = req.body;

    const bookingCheck = await query(
      `SELECT * FROM bookings
       WHERE id = $1 AND user_id = $2 AND tour_id = $3 AND status = 'completed'`,
      [booking_id, req.user.id, tour_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review tours you have completed'
      });
    }

    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND tour_id = $2',
      [req.user.id, tour_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this tour'
      });
    }

    const result = await query(
      `INSERT INTO reviews (
        tour_id, user_id, booking_id, rating, title, comment,
        guide_rating, equipment_rating, value_rating, verified_purchase
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *`,
      [tour_id, req.user.id, booking_id, rating, title, comment, guide_rating, equipment_rating, value_rating]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
