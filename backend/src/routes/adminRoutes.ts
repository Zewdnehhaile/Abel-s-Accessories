import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, toggleUserActive, getLogs, getSalesStats, getUsageStats } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect, authorize('super_admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/active', toggleUserActive);
router.get('/logs', getLogs);
router.get('/sales-stats', getSalesStats);
router.get('/usage', getUsageStats);

export default router;
