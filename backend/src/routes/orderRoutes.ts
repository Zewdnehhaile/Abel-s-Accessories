import express from 'express';
import { createOrder, verifyOrderPayment, getOrders } from '../controllers/orderController';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, authorize('shop_admin', 'super_admin'), getOrders)
  .post(optionalProtect, createOrder);

router.post('/verify-payment', optionalProtect, verifyOrderPayment);

export default router;
