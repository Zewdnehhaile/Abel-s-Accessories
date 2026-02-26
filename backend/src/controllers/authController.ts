import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import ActivityLog from '../models/ActivityLog';
import { lookupGeo } from '../services/geoService';
import { sendEmail } from '../services/emailService';

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET as Secret | undefined;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  const expiresIn = process.env.JWT_EXPIRE as SignOptions['expiresIn'] | undefined;
  const options: SignOptions | undefined = expiresIn ? { expiresIn } : undefined;

  return jwt.sign({ id }, secret, options);
};

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const AUTO_BLOCK_THRESHOLD = 12;
const SUSPICIOUS_WINDOW_MINUTES = 120;

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, shopId } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User already exists', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    shopId
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId
    }
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email });
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  const location = await lookupGeo(ipAddress);

  if (!user) {
    await ActivityLog.create({
      action: 'login_failed',
      description: `Failed login attempt for ${email}`,
      type: 'security',
      userEmail: email,
      ipAddress,
      userAgent,
      location
    });
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isActive) {
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'login_blocked',
      description: 'Login blocked: account deactivated',
      type: 'security',
      ipAddress,
      userAgent,
      location
    });
    return next(new AppError('Account is deactivated. Contact admin.', 403));
  }

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'login_locked',
      description: 'Login blocked: account temporarily locked',
      type: 'security',
      ipAddress,
      userAgent,
      location
    });
    return next(new AppError('Account locked. Try again later.', 423));
  }

  const isMatch = await user.matchPassword(password);
  let authenticated = isMatch;

  // Backward-compat: if legacy users have plaintext passwords in DB, migrate on first login
  if (!isMatch && user.password === password) {
    user.password = password;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    authenticated = true;
  }

  if (!authenticated) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= AUTO_BLOCK_THRESHOLD) {
      user.isActive = false;
      await ActivityLog.create({
        userId: user._id,
        userEmail: user.email,
        action: 'account_deactivated',
        description: 'Account automatically deactivated due to repeated failed logins',
        type: 'security',
        ipAddress,
        userAgent,
        location
      });
    } else if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      await ActivityLog.create({
        userId: user._id,
        userEmail: user.email,
        action: 'account_locked',
        description: 'Account temporarily locked due to failed logins',
        type: 'security',
        ipAddress,
        userAgent,
        location
      });
    }
    await user.save();
    return next(new AppError('Invalid credentials', 401));
  }

  const previousCountry = user.lastLoginCountry;
  const previousLoginAt = user.lastLoginAt;

  if (previousLoginAt && previousCountry && location?.country && previousCountry !== location.country) {
    const minutesSince = (Date.now() - new Date(previousLoginAt).getTime()) / (1000 * 60);
    if (minutesSince < SUSPICIOUS_WINDOW_MINUTES) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      await user.save();
      await ActivityLog.create({
        userId: user._id,
        userEmail: user.email,
        action: 'login_suspicious',
        description: `Suspicious login from new country within ${SUSPICIOUS_WINDOW_MINUTES} minutes`,
        type: 'security',
        ipAddress,
        userAgent,
        location
      });
      return next(new AppError('Suspicious login detected. Account locked.', 423));
    }
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.loginCount = (user.loginCount || 0) + 1;
  user.lastLoginAt = new Date();
  user.lastLoginIP = ipAddress;
  user.lastLoginUserAgent = userAgent;
  user.lastLoginCountry = location?.country || user.lastLoginCountry;
  user.lastLoginCity = location?.city || user.lastLoginCity;
  await user.save();

  if (previousCountry && location?.country && previousCountry !== location.country) {
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      action: 'login_location_change',
      description: `Login from new country: ${location.country}`,
      type: 'security',
      ipAddress,
      userAgent,
      location
    });
  }

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'login_success',
    description: 'User logged in successfully',
    type: 'system',
    ipAddress,
    userAgent,
    location
  });

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shopId: user.shopId
    }
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'password_reset_requested',
    description: 'User requested password reset',
    type: 'security'
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/?resetToken=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Abel Accessories password',
      text: `Reset your password using this link: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>We received a request to reset your password for Abel Accessories Sales.</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
          <p>If the button doesn’t work, copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new AppError('Email could not be sent. Please try again later.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Password reset email sent. Please check your inbox.'
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) {
    return next(new AppError('Token and new password are required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    userEmail: user.email,
    action: 'password_reset_completed',
    description: 'User reset password successfully',
    type: 'security'
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

export const getMe = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});
