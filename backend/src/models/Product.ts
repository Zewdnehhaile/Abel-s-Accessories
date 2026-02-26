import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: 'phone' | 'accessory';
  subcategory?: string;
  brand?: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  discountPercent?: number;
  stock: number;
  imageUrl?: string;
  shopId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['phone', 'accessory'], required: true },
  subcategory: { type: String },
  brand: { type: String, default: '' },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], required: true },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, default: '' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduct>('Product', ProductSchema);
