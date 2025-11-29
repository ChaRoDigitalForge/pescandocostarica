import express from 'express';
import {
  getSiteSettings,
  getHeroSlides,
  getFeatures,
  getConfigByKey
} from './controller.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/settings', getSiteSettings);
router.get('/hero-slides', getHeroSlides);
router.get('/features', getFeatures);
router.get('/config/:key', getConfigByKey);

export default router;
