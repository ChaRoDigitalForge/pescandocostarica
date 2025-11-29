import express from 'express';
import {
  getMyTours,
  getMyBookings,
  getStatistics,
  updateBookingStatus
} from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and captain role
router.use(authenticate);

// Captain routes
router.get('/tours', getMyTours);
router.get('/bookings', getMyBookings);
router.get('/statistics', getStatistics);
router.patch('/bookings/:booking_number/status', updateBookingStatus);

export default router;
