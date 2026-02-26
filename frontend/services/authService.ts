import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type LoginResponse = {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  error?: string;
};

export const login = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    let message = 'Invalid credentials';
    try {
      const data = (await res.json()) as Partial<LoginResponse>;
      if (data?.message) message = data.message;
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const data = (await res.json()) as LoginResponse;
  if (data?.token) {
    localStorage.setItem('abel_token', data.token);
  }
  return data.user;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('abel_user');
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem('abel_user');
  localStorage.removeItem('abel_token');
};
