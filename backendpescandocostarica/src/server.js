import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import toursRoutes from './services/tours/routes.js';
import bookingsRoutes from './services/bookings/routes.js';
import usersRoutes from './services/users/routes.js';
import siteRoutes from './services/site/routes.js';
import authRoutes from './services/auth/routes.js';
import captainRoutes from './services/captain/routes.js';
import reportsRoutes from './services/reports/routes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

app.use('/api', limiter);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Pescando Costa Rica API v1.0',
    version: '1.0.0',
    endpoints: {
      tours: '/api/tours',
      bookings: '/api/bookings',
      users: '/api/users',
      site: '/api/site',
      reports: '/api/reports',
      health: '/api/health'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/captain', captainRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/reports', reportsRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║      🎣 PESCANDO COSTA RICA API                     ║
║                                                      ║
║      Server running on port ${PORT}                    ║
║      Environment: ${process.env.NODE_ENV || 'development'}                        ║
║      Database: Neon PostgreSQL                       ║
║                                                      ║
║      API Endpoints:                                  ║
║      - Tours:    http://localhost:${PORT}/api/tours        ║
║      - Bookings: http://localhost:${PORT}/api/bookings    ║
║      - Users:    http://localhost:${PORT}/api/users        ║
║      - Site:     http://localhost:${PORT}/api/site         ║
║      - Health:   http://localhost:${PORT}/api/health       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

const gracefulShutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️  Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
