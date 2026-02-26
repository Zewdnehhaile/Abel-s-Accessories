import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, searchImages } from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('shop_admin', 'super_admin'), createProduct);

router.get('/search-images', protect, authorize('shop_admin', 'super_admin'), searchImages);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('shop_admin', 'super_admin'), updateProduct)
  .delete(protect, authorize('shop_admin', 'super_admin'), deleteProduct);

export default router;
