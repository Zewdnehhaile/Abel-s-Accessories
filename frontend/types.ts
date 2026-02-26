export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  STAFF = 'staff',
  SHOP_ADMIN = 'shop_admin', // Abel
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // Added for mock auth
  shopId?: string;
  isActive?: boolean;
}

export type ModelType = 'phone' | 'tablet' | 'pc' | 'desktop' | 'all';

export interface Product {
  id: string;
  name: string;
  category: string;
  modelType: ModelType; // Added model type
  condition: 'new' | 'used'; // Added condition field
  price: number;
  discountPercent?: number;
  stock: number;
  description: string;
  image: string;
  warrantyDays: number;
  status: 'available' | 'out_of_stock';
  brand?: string;
  shopId?: string;
}

export enum RepairStatus {
  RECEIVED = 'received',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export interface RepairRequest {
  id: string;
  trackingCode: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  issueDescription: string;
  serviceType: string;
  estimatedCost: number;
  paymentStatus: 'pending' | 'paid' | 'cash';
  repairStatus: RepairStatus;
  createdAt: string;
}

export interface SalesStat {
  date: string;
  amount: number;
}

export interface Log {
  id: string;
  action: string;
  description: string;
  user?: string;
  timestamp: string;
  type: 'security' | 'system';
  ipAddress?: string;
  location?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
