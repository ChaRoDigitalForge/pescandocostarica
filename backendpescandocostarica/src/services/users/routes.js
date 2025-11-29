import express from 'express';
import {
  createUser,
  getProfile,
  updateProfile,
  getUserByFirebaseUid,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  createReview
} from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.post('/', createUser);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/firebase/:firebase_uid', getUserByFirebaseUid);
router.get('/favorites', authenticate, getFavorites);
router.post('/favorites', authenticate, addToFavorites);
router.delete('/favorites/:tour_id', authenticate, removeFromFavorites);
router.post('/reviews', authenticate, createReview);

export default router;
