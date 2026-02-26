import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import ActivityLog from '../models/ActivityLog';

export const getProfile = catchAsync(async (req: any, res: Response) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

export const updateProfile = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) {
      return next(new AppError('Email already in use', 400));
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (password) user.password = password;

  await user.save();

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'profile_updated',
    description: 'User updated profile details',
    type: 'system'
  });

  res.status(200).json({
    success: true,
    data: user
  });
});
