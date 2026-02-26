import express from 'express';
import { getRepairs, createRepair, updateRepairStatus, trackRepair } from '../controllers/repairController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, authorize('shop_admin', 'staff', 'super_admin'), getRepairs)
  .post(createRepair);

router.route('/:id/status')
  .put(protect, authorize('shop_admin', 'staff', 'super_admin'), updateRepairStatus);

router.get('/track/:code', trackRepair);

export default router;
