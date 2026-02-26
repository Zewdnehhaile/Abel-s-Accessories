import { RepairRequest, RepairStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type ApiRepair = {
  _id: string;
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
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

const mapRepair = (repair: ApiRepair): RepairRequest => ({
  id: repair._id,
  trackingCode: repair.trackingCode,
  customerName: repair.customerName,
  phone: repair.phone,
  deviceModel: repair.deviceModel,
  issueDescription: repair.issueDescription,
  serviceType: repair.serviceType,
  estimatedCost: repair.estimatedCost,
  paymentStatus: repair.paymentStatus,
  repairStatus: repair.repairStatus,
  createdAt: repair.createdAt
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('abel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseError = async (res: Response) => {
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as Partial<ApiResponse<unknown>>;
    if (data?.message) message = data.message;
    if (data?.error) message = data.error;
  } catch {
    // ignore
  }
  throw new Error(message);
};

export const createRepairRequest = async (payload: {
  name: string;
  phone: string;
  device: string;
  description: string;
  payment: 'telebirr' | 'cbe' | 'chapa' | 'cash';
}) => {
  const res = await fetch(`${API_BASE}/api/repairs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: payload.name,
      phone: payload.phone,
      deviceModel: payload.device,
      issueDescription: payload.description,
      paymentStatus: payload.payment === 'cash' ? 'cash' : 'pending',
      payment: payload.payment,
      serviceType: 'general',
      estimatedCost: 0
    })
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse<ApiRepair>;
  return mapRepair(data.data);
};

export const trackRepair = async (code: string) => {
  const res = await fetch(`${API_BASE}/api/repairs/track/${encodeURIComponent(code)}`);
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiRepair>;
  return mapRepair(data.data);
};

export const fetchRepairs = async () => {
  const res = await fetch(`${API_BASE}/api/repairs`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiRepair[]>;
  return (data.data || []).map(mapRepair);
};

export const updateRepairStatus = async (id: string, status: RepairStatus) => {
  const res = await fetch(`${API_BASE}/api/repairs/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ repairStatus: status })
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiRepair>;
  return mapRepair(data.data);
};
