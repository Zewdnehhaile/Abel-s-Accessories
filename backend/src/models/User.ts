import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'shop_admin' | 'staff';
  shopId?: mongoose.Types.ObjectId;
  isActive: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  lastLoginUserAgent?: string;
  lastLoginCountry?: string;
  lastLoginCity?: string;
  createdAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'shop_admin', 'staff'], 
    default: 'staff' 
  },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  isActive: { type: Boolean, default: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLoginAt: { type: Date },
  lastLoginIP: { type: String },
  lastLoginUserAgent: { type: String },
  lastLoginCountry: { type: String },
  lastLoginCity: { type: String },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
