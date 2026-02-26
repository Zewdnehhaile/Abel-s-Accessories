import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  shopId?: string;
  isActive?: boolean;
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

const mapUser = (user: ApiUser): User => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  shopId: user.shopId,
  isActive: user.isActive
});

export const fetchProfile = async () => {
  const res = await fetch(`${API_BASE}/api/users/me`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    await parseError(res);
  }
  const data = (await res.json()) as ApiResponse<ApiUser>;
  return mapUser(data.data);
};

export const updateProfile = async (payload: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  const res = await fetch(`${API_BASE}/api/users/me`, {
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
  return mapUser(data.data);
};
