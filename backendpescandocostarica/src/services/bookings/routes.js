import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingByNumber,
  cancelBooking,
  confirmBooking,
  validatePromoCode
} from './controller.js';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createBooking);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/promo/:code/validate', optionalAuth, validatePromoCode);
router.get('/:booking_number', optionalAuth, getBookingByNumber);
router.put('/:booking_number/cancel', optionalAuth, cancelBooking);
router.put('/:booking_number/confirm', authenticate, authorize('admin', 'capitan'), confirmBooking);

export default router;
