import mongoose, { Document, Schema } from 'mongoose';

export interface IRepair extends Document {
  trackingCode: string;
  customerName: string;
  phone: string;
  telegramUsername?: string;
  deviceModel: string;
  issueDescription: string;
  serviceType: string;
  estimatedCost: number;
  paymentStatus: 'pending' | 'paid' | 'cash';
  repairStatus: 'received' | 'in_progress' | 'ready' | 'completed' | 'rejected';
  technicianId?: mongoose.Types.ObjectId;
  shopId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RepairSchema: Schema = new Schema({
  trackingCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  telegramUsername: { type: String, default: '' },
  deviceModel: { type: String, required: true },
  issueDescription: { type: String, required: true },
  serviceType: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'cash'], default: 'pending' },
  repairStatus: { 
    type: String, 
    enum: ['received', 'in_progress', 'ready', 'completed', 'rejected'], 
    default: 'received' 
  },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRepair>('Repair', RepairSchema);
