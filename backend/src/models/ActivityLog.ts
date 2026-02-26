import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  description: string;
  type: 'security' | 'system';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    isp?: string;
    lat?: number;
    lon?: number;
  };
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['security', 'system'], default: 'system' },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    city: { type: String },
    region: { type: String },
    isp: { type: String },
    lat: { type: Number },
    lon: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
