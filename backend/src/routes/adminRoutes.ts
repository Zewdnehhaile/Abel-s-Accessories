import express from 'express';
import { getUsers, toggleUserActive, getLogs, getSalesStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect, authorize('super_admin'));

router.get('/users', getUsers);
router.patch('/users/:id/active', toggleUserActive);
router.get('/logs', getLogs);
router.get('/sales-stats', getSalesStats);

export default router;
