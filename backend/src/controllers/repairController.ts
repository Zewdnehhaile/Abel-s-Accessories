import { Request, Response, NextFunction } from 'express';
import Repair from '../models/Repair';
import Shop from '../models/Shop';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const generateTrackingCode = async () => {
  let code = '';
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    code = 'R-' + Math.floor(1000 + Math.random() * 9000);
    // eslint-disable-next-line no-await-in-loop
    const found = await Repair.findOne({ trackingCode: code });
    exists = !!found;
    attempts += 1;
  }
  return code || `R-${Date.now()}`;
};

export const getRepairs = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const query: any = {};
  
  // If shop admin or staff, only show their shop's repairs
  if (req.user.role !== 'super_admin') {
    query.shopId = req.user.shopId;
  }

  const repairs = await Repair.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: repairs.length,
    data: repairs
  });
});

export const createRepair = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const isAuthed = !!req.user;
  const payload = { ...req.body };

  payload.trackingCode = await generateTrackingCode();

  if (isAuthed && req.user.role !== 'super_admin') {
    payload.shopId = req.user.shopId;
  }

  if (!payload.shopId) {
    const defaultShop = await Shop.findOne();
    if (!defaultShop) {
      return next(new AppError('No shop configured for repair requests', 400));
    }
    payload.shopId = defaultShop._id;
  }

  // Normalize fields for public requests
  payload.customerName = payload.customerName || payload.name;
  payload.deviceModel = payload.deviceModel || payload.device;
  payload.issueDescription = payload.issueDescription || payload.description;
  payload.telegramUsername = payload.telegramUsername || payload.telegram || '';
  payload.serviceType = payload.serviceType || 'general';
  payload.estimatedCost = payload.estimatedCost || 0;
  const paymentInput = payload.paymentStatus || payload.payment;
  if (paymentInput === 'cash') {
    payload.paymentStatus = 'cash';
  } else if (paymentInput === 'paid') {
    payload.paymentStatus = 'paid';
  } else {
    payload.paymentStatus = 'pending';
  }

  const repair = await Repair.create(payload);

  res.status(201).json({
    success: true,
    data: repair
  });
});

export const updateRepairStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  let repair = await Repair.findById(req.params.id);

  if (!repair) {
    return next(new AppError('Repair not found', 404));
  }

  // Check ownership
  if (req.user.role !== 'super_admin' && repair.shopId.toString() !== req.user.shopId.toString()) {
    return next(new AppError('Not authorized to update this repair', 401));
  }

  repair = await Repair.findByIdAndUpdate(req.params.id, {
    repairStatus: req.body.repairStatus,
    technicianId: req.user.id
  }, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: repair
  });
});

export const trackRepair = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.params;
  const repair = await Repair.findOne({ trackingCode: code });

  if (!repair) {
    return next(new AppError('Repair not found with that code', 404));
  }

  res.status(200).json({
    success: true,
    data: repair
  });
});
