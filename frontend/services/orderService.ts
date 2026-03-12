import { CartItem, Order } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

type CreateOrderResponse = {
  _id: string;
  products: Array<{
    productId: string | { _id: string; name?: string; price?: number };
    quantity: number;
  }>;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  chapaTxRef?: string;
  createdAt?: string;
};

type VerifyPaymentResponse = CreateOrderResponse;

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

const mapOrder = (apiOrder: CreateOrderResponse): Order => ({
  id: apiOrder._id,
  products: (apiOrder.products || []).map(item => {
    if (typeof item.productId === 'string') {
      return {
        productId: item.productId,
        quantity: item.quantity
      };
    }
    return {
      productId: item.productId?._id || '',
      quantity: item.quantity,
      name: item.productId?.name,
      price: item.productId?.price
    };
  }),
  totalPrice: apiOrder.totalPrice,
  paymentStatus: apiOrder.paymentStatus,
  paymentMethod: apiOrder.paymentMethod,
  chapaTxRef: apiOrder.chapaTxRef,
  createdAt: apiOrder.createdAt || ''
});

export const createOrder = async (payload: {
  products: CartItem[];
  shopId?: string;
  paymentMethod: 'chapa' | 'telebirr' | 'cbe' | 'cash';
  customerName?: string;
  customerEmail?: string;
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
      paymentMethod: payload.paymentMethod,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail
    })
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse<CreateOrderResponse> & { paymentUrl?: string };
  return {
    order: mapOrder(data.data),
    paymentUrl: data.paymentUrl
  };
};

export const verifyOrderPayment = async (txRef: string) => {
  const res = await fetch(`${API_BASE}/api/orders/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ tx_ref: txRef })
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse<VerifyPaymentResponse>;
  return mapOrder(data.data);
};

export const fetchOrders = async () => {
  const res = await fetch(`${API_BASE}/api/orders`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    await parseError(res);
  }

  const data = (await res.json()) as ApiResponse<CreateOrderResponse[]>;
  return (data.data || []).map(mapOrder);
};
