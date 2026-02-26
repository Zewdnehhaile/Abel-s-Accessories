import { CartItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

type CreateOrderResponse = {
  _id: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  chapaTxRef?: string;
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

export const createOrder = async (payload: {
  products: CartItem[];
  shopId?: string;
  paymentMethod: 'chapa' | 'telebirr' | 'cbe' | 'cash';
}) => {
  const products = payload.products.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }));

  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      products,
      shopId: payload.shopId,
      paymentMethod: payload.paymentMethod
    })
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse<CreateOrderResponse> & { paymentUrl?: string };
  return {
    order: data.data,
    paymentUrl: data.paymentUrl
  };
};
