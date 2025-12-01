import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import pool from './config/database.js';
import redisClient from './config/redis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

app.use('/api', limiter);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';

    res.json({
      success: true,
      service: 'auth-service',
      status: 'healthy',
      database: 'connected',
      redis: redisStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'auth-service',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Service info
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'auth-service',
    version: '1.0.0',
    description: 'Authentication and Authorization Microservice',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║      🔐 AUTH SERVICE                                ║
║                                                      ║
║      Port: ${PORT}                                      ║
║      Environment: ${process.env.NODE_ENV || 'development'}                        ║
║      Database: PostgreSQL                            ║
║      Cache: Redis                                    ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down Auth Service...');
  server.close(async () => {
    console.log('✅ HTTP server closed');
    await pool.end();
    console.log('✅ Database connections closed');
    await redisClient.quit();
    console.log('✅ Redis connection closed');
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
