import { query, getClient } from '../config/database.js';
import { setToken, deleteToken, blacklistToken, isTokenBlacklisted } from '../config/redis.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Register new user
export const register = async (req, res, next) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role = 'cliente',
      license_number,
      years_of_experience,
      specializations
    } = req.body;

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert specializations to array if needed
    let specializationsArray = null;
    if (specializations && typeof specializations === 'string') {
      specializationsArray = specializations.split(',').map(s => s.trim()).filter(s => s);
    } else if (Array.isArray(specializations)) {
      specializationsArray = specializations;
    }

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, phone, role,
        status, email_verified, license_number, years_of_experience, specializations
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', false, $7, $8, $9)
      RETURNING id, email, first_name, last_name, phone, role, status, created_at`,
      [email, hashedPassword, first_name, last_name, phone, role, license_number, years_of_experience, specializationsArray]
    );

    const user = userResult.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis
    await setToken(`refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, phone, role, status,
              avatar_url, email_verified
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in Redis
    await setToken(`refresh:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, phone, role, status,
              avatar_url, date_of_birth, bio, address, city, provincia, country,
              license_number, years_of_experience, specializations, email_verified,
              created_at, last_login_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [req.user.id]
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

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Generate new access token
    const { accessToken } = generateTokens(req.user);

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Blacklist the current token
      await blacklistToken(token, 7 * 24 * 60 * 60); // 7 days
    }

    // Delete refresh token from Redis
    await deleteToken(`refresh:${req.user.id}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { current_password, new_password } = req.body;

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    // Invalidate all existing refresh tokens
    await deleteToken(`refresh:${req.user.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in Redis with 1 hour expiration
    await setToken(`reset:${result.rows[0].id}`, resetToken, 60 * 60);

    // TODO: Send email with reset link
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link',
      // In production, remove this
      resetToken: resetToken
    });
  } catch (error) {
    next(error);
  }
};
