import express from 'express';
import { createOrder, verifyOrderPayment, getOrders } from '../controllers/orderController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, authorize('shop_admin', 'super_admin'), getOrders)
  .post(protect, createOrder);

router.post('/verify-payment', protect, verifyOrderPayment);

export default router;
