import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

export default router;
