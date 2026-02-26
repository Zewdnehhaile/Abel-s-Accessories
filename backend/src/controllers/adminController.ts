import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import Order from '../models/Order';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: users
  });
});

export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, shopId } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    shopId?: string;
  };

  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required', 400));
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return next(new AppError('Email already in use', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff',
    shopId
  });

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'user_created',
    description: 'Super admin created a new user',
    type: 'security'
  });

  res.status(201).json({
    success: true,
    data: user
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.role === 'super_admin') {
    return next(new AppError('Cannot modify super admin account', 400));
  }

  const { name, email, password, role, shopId, isActive } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    shopId?: string;
    isActive?: boolean;
  };

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return next(new AppError('Email already in use', 400));
    }
    user.email = email;
  }
  if (name) user.name = name;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (role) user.role = role as any;
  if (shopId !== undefined) user.shopId = shopId as any;
  if (password) user.password = password;

  await user.save();

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'user_updated',
    description: 'Super admin updated user details',
    type: 'security'
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.role === 'super_admin') {
    return next(new AppError('Cannot delete super admin account', 400));
  }

  await user.deleteOne();

  await ActivityLog.create({
    userEmail: user.email,
    action: 'user_deleted',
    description: 'Super admin deleted a user',
    type: 'security'
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

export const toggleUserActive = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.role === 'super_admin') {
    return next(new AppError('Cannot deactivate super admin account', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: user.isActive ? 'account_activated' : 'account_deactivated',
    description: user.isActive ? 'Account activated by super admin' : 'Account deactivated by super admin',
    type: 'security'
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

export const getLogs = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit || 50);
  const query: any = {};
  if (req.query.userId) {
    query.userId = req.query.userId;
  }
  const logs = await ActivityLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');

  res.status(200).json({
    success: true,
    data: logs
  });
});

export const getSalesStats = catchAsync(async (req: Request, res: Response) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const orders = await Order.find({
    paymentStatus: 'paid',
    createdAt: { $gte: start, $lte: now }
  });

  const totalsByDay: Record<number, number> = {};
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    totalsByDay[day.getDay()] = 0;
  }

  orders.forEach(order => {
    const dayIndex = new Date(order.createdAt).getDay();
    totalsByDay[dayIndex] = (totalsByDay[dayIndex] || 0) + order.totalPrice;
  });

  const stats = Object.keys(totalsByDay).map(dayIndex => ({
    date: DAY_NAMES[Number(dayIndex)],
    amount: totalsByDay[Number(dayIndex)]
  }));

  res.status(200).json({
    success: true,
    data: stats
  });
});

export const getUsageStats = catchAsync(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const totalLoginsAgg = await User.aggregate([
    { $group: { _id: null, total: { $sum: '$loginCount' } } }
  ]);
  const totalLogins = totalLoginsAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalLogins
    }
  });
});
