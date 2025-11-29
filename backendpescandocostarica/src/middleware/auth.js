import { verifyFirebaseToken } from '../config/firebase.js';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Try JWT first, then Firebase
    try {
      // Try to decode as JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      const result = await query(
        'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = result.rows[0];
      req.authType = 'jwt';
      return next();
    } catch (jwtError) {
      // If JWT fails, try Firebase
      const decodedToken = await verifyFirebaseToken(token);

      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1 AND deleted_at IS NULL',
        [decodedToken.uid]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = result.rows[0];
      req.firebaseUser = decodedToken;
      req.authType = 'firebase';
      next();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyFirebaseToken(token);

      const result = await query(
        'SELECT * FROM users WHERE firebase_uid = $1 AND deleted_at IS NULL',
        [decodedToken.uid]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
        req.firebaseUser = decodedToken;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
