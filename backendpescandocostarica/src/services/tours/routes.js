import express from 'express';
import {
  getAllTours,
  getTourBySlug,
  getTourAvailability,
  getFeaturedTours,
  getTourReviews,
  searchTours
} from './controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

router.get('/search', optionalAuth, searchTours);
router.get('/featured', getFeaturedTours);
router.get('/', optionalAuth, getAllTours);
router.get('/:slug', optionalAuth, getTourBySlug);
router.get('/:slug/availability', getTourAvailability);
router.get('/:slug/reviews', getTourReviews);

export default router;
