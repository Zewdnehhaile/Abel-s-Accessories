import { Log, SalesStat, User } from '../types';
import { API_URL } from '../config/api';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

type ApiUser = {
  _id: string;
  name: string;
  email: string;
  role: User['role'];
  isActive: boolean;
  shopId?: string;
  createdAt: string;
};

type ApiLog = {
  _id: string;
  action: string;
  description: string;
  type: 'security' | 'system';
  createdAt: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
    isp?: string;
  };
  userId?: { name?: string; email?: string };
  userEmail?: string;
};

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

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiUser[]>;
  return (data.data || []).map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    shopId: u.shopId,
    isActive: u.isActive
  })) as User[];
};

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  shopId?: string;
}) => {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiUser>;
  return data.data;
};

export const updateUser = async (id: string, payload: Partial<{
  name: string;
  email: string;
  password: string;
  role: User['role'];
  isActive: boolean;
  shopId?: string;
}>) => {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiUser>;
  return data.data;
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });
  if (!res.ok) {
    await parseError(res);
  }
};

export const toggleUserActive = async (id: string) => {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/active`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiUser>;
  return data.data;
};

export const fetchLogs = async (userId?: string) => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${API_URL}/api/admin/logs${query}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiLog[]>;
  return (data.data || []).map(log => {
    const location = [log.location?.city, log.location?.region, log.location?.country]
      .filter(Boolean)
      .join(', ');
    return {
    id: log._id,
    action: log.action,
    description: log.description,
    user: log.userId?.email || log.userEmail,
    timestamp: new Date(log.createdAt).toLocaleString(),
    type: log.type,
    ipAddress: log.ipAddress,
    location: location || undefined
  };
  }) as Log[];
};

export const fetchSalesStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/sales-stats`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<SalesStat[]>;
  return data.data || [];
};

export const fetchUsageStats = async () => {
  const res = await fetch(`${API_URL}/api/admin/usage`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<{ totalUsers: number; activeUsers: number; totalLogins: number }>;
  return data.data;
};
