import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { searchProductImages } from '../services/imageService';

export const getProducts = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  // If shop admin, only show their shop's products
  const query: any = { isActive: true };
  
  if (req.user && req.user.role === 'shop_admin') {
    query.shopId = req.user.shopId;
  } else if (req.query.shopId) {
    query.shopId = req.query.shopId;
  }

  const products = await Product.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

export const createProduct = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  // Ensure shopId is set from user if shop_admin
  if (req.user.role === 'shop_admin') {
    req.body.shopId = req.user.shopId;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

export const updateProduct = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (req.user.role === 'shop_admin' && product.shopId.toString() !== req.user.shopId.toString()) {
    return next(new AppError('Not authorized to update this product', 401));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

export const deleteProduct = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check ownership
  if (req.user.role === 'shop_admin' && product.shopId.toString() !== req.user.shopId.toString()) {
    return next(new AppError('Not authorized to delete this product', 401));
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const searchImages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.query;
  if (!query) {
    return next(new AppError('Please provide a search query', 400));
  }

  const images = await searchProductImages(query as string);

  res.status(200).json({
    success: true,
    data: images
  });
});
