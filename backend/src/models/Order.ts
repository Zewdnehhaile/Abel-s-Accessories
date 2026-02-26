import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  products: Array<{ productId: mongoose.Types.ObjectId; quantity: number }>;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  chapaTxRef?: string;
  orderStatus: 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  chapaTxRef: { type: String },
  orderStatus: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
