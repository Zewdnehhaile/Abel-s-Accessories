import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { initializePayment, verifyPayment } from '../services/chapaService';

export const createOrder = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { products, shopId, paymentMethod, customerName, customerEmail } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return next(new AppError('Order must include products', 400));
  }

  const normalizedPaymentMethod = String(paymentMethod || '').toLowerCase();
  const allowedPaymentMethods = ['chapa', 'telebirr', 'cbe', 'cbebirr', 'cash'];
  if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
    return next(new AppError('Invalid payment method', 400));
  }

  let totalPrice = 0;
  const stockReservations: Array<{ product: any; quantity: number }> = [];

  const resolveOrderUser = async () => {
    if (req.user) return req.user;
    const fallback = await User.findOne({ role: 'shop_admin' }) || await User.findOne({ role: 'super_admin' });
    if (!fallback) {
      throw new AppError('No admin user available to attach the order', 400);
    }
    return fallback;
  };

  const orderUser = await resolveOrderUser();
  let resolvedShopId = shopId;
  
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
    stockReservations.push({ product, quantity: item.quantity });
    if (!resolvedShopId) {
      resolvedShopId = product.shopId?.toString();
    }
  }

  if (!resolvedShopId) {
    return next(new AppError('Shop ID is required to place an order', 400));
  }

  const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const isCashPayment = normalizedPaymentMethod === 'cash';

  const order = await Order.create({
    userId: orderUser.id,
    shopId: resolvedShopId,
    products,
    totalPrice,
    paymentMethod: normalizedPaymentMethod,
    chapaTxRef: tx_ref,
    paymentStatus: isCashPayment ? 'paid' : 'pending'
  });

  if (isCashPayment) {
    for (const item of stockReservations) {
      item.product.stock = Math.max(0, item.product.stock - item.quantity);
      await item.product.save();
    }
  }

  // Initialize Chapa Payment (used for Chapa checkout and its channels like Telebirr/CBE Birr)
  let paymentUrl = '';
  const chapaMethods = ['chapa', 'telebirr', 'cbe', 'cbebirr'];
  if (chapaMethods.includes(normalizedPaymentMethod)) {
    const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const frontendUrl = requestOrigin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const nameSource = req.user?.name || customerName || orderUser.name || 'Customer';
    const emailSource = req.user?.email || customerEmail || orderUser.email;
    const nameParts = nameSource.split(' ');
    const paymentInfo = await initializePayment(
      totalPrice,
      'ETB',
      emailSource,
      nameParts[0] || 'Customer',
      nameParts[1] || 'User',
      tx_ref,
      `${frontendUrl}/payment-success`,
      `${frontendUrl}/payment-success`
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
  if (!tx_ref) {
    return next(new AppError('tx_ref is required', 400));
  }

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

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email')
    .populate('products.productId', 'name price');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});
