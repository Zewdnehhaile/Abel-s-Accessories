import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { initializePayment, verifyPayment } from '../services/chapaService';

export const createOrder = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { products, shopId, paymentMethod } = req.body;

  let totalPrice = 0;
  
  // Calculate total and verify stock
  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(new AppError(`Product ${item.productId} not found`, 404));
    }
    if (product.stock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }
    totalPrice += product.price * item.quantity;
  }

  const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const order = await Order.create({
    userId: req.user.id,
    shopId,
    products,
    totalPrice,
    paymentMethod,
    chapaTxRef: tx_ref,
    paymentStatus: 'pending'
  });

  // Initialize Chapa Payment
  let paymentUrl = '';
  if (paymentMethod === 'chapa') {
    const paymentInfo = await initializePayment(
      totalPrice,
      'ETB',
      req.user.email,
      req.user.name.split(' ')[0],
      req.user.name.split(' ')[1] || 'User',
      tx_ref,
      `https://your-frontend.com/payment-success`, // Replace with actual frontend URL
      `https://your-frontend.com/payment-success`
    );
    paymentUrl = paymentInfo.data.checkout_url;
  }

  res.status(201).json({
    success: true,
    data: order,
    paymentUrl
  });
});

export const verifyOrderPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tx_ref } = req.body;

  const verification = await verifyPayment(tx_ref);

  if (verification.status !== 'success') {
    return next(new AppError('Payment verification failed', 400));
  }

  const order = await Order.findOne({ chapaTxRef: tx_ref });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.paymentStatus === 'paid') {
    return res.status(200).json({ success: true, message: 'Order already paid', data: order });
  }

  order.paymentStatus = 'paid';
  await order.save();

  // Deduct Stock
  for (const item of order.products) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
        // Optionally set isActive = false or status = out_of_stock
      }
      await product.save();
    }
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

export const getOrders = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const query: any = {};
  
  if (req.user.role === 'shop_admin') {
    query.shopId = req.user.shopId;
  } else if (req.user.role === 'staff') {
    return next(new AppError('Staff cannot view orders', 403));
  }
  // Super admin sees all

  const orders = await Order.find(query).populate('userId', 'name email').populate('products.productId', 'name price');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});
