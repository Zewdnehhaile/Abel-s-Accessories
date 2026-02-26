import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
  name: string;
  ownerName: string;
  phone: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
}

const ShopSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IShop>('Shop', ShopSchema);
