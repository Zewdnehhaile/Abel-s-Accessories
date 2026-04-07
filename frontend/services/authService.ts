import { User } from '../types';
import { API_URL } from '../config/api';

type LoginResponse = {
  success: boolean;
  token: string;
  user: User;
  message?: string;
  error?: string;
};

type ResetRequestResponse = {
  success: boolean;
  message?: string;
  resetToken?: string;
  error?: string;
};

type ResetResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export const login = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
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

export const requestPasswordReset = async (email: string) => {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    let message = 'Failed to request password reset';
    try {
      const data = (await res.json()) as Partial<ResetRequestResponse>;
      if (data?.message) message = data.message;
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as ResetRequestResponse;
};

export const resetPassword = async (token: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  if (!res.ok) {
    let message = 'Failed to reset password';
    try {
      const data = (await res.json()) as Partial<ResetResponse>;
      if (data?.message) message = data.message;
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as ResetResponse;
};
