import { Product } from '../types';
import { API_URL } from '../config/api';

export type ApiProduct = {
  _id: string;
  name: string;
  description?: string;
  category: 'phone' | 'accessory';
  subcategory?: string;
  brand?: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  discountPercent?: number;
  stock: number;
  imageUrl?: string;
  shopId?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  category: 'phone' | 'accessory';
  subcategory?: string;
  brand?: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  discountPercent?: number;
  stock: number;
  imageUrl?: string;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
};

const titleCase = (value: string) =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();

const mapApiToUi = (p: ApiProduct): Product => {
  const category =
    p.category === 'phone' ? 'Phone' : p.subcategory ? titleCase(p.subcategory) : 'Accessory';
  const condition = p.condition === 'refurbished' ? 'used' : p.condition;
  return {
    id: p._id,
    name: p.name,
    category,
    modelType: p.category === 'phone' ? 'phone' : 'all',
    condition,
    price: p.price,
    discountPercent: p.discountPercent ?? 0,
    stock: p.stock ?? 0,
    description: p.description || '',
    image: p.imageUrl || '',
    warrantyDays: condition === 'new' ? 365 : 90,
    status: (p.stock ?? 0) > 0 ? 'available' : 'out_of_stock',
    brand: p.brand || '',
    shopId: p.shopId
  };
};

type ProductCacheEntry = {
  data: Product[];
  fetchedAt: number;
  inFlight?: Promise<Product[]>;
};

const PRODUCT_CACHE_TTL_MS = 12_000;
const productCache = new Map<string, ProductCacheEntry>();

const getAuthHeaders = () => {
  const token = localStorage.getItem('abel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseApiError = async (res: Response) => {
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as Partial<ApiListResponse<unknown>>;
    if (data?.message) message = data.message;
    if (data?.error) message = data.error;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
};

export const getDiscountedPrice = (product: Product) => {
  const discount = product.discountPercent ?? 0;
  if (!discount || discount <= 0) return product.price;
  const finalPrice = product.price * (1 - discount / 100);
  return Math.max(0, Math.round(finalPrice));
};

const fetchProductsFromApi = async (options?: { shopId?: string }) => {
  const params = options?.shopId ? `?shopId=${encodeURIComponent(options.shopId)}` : '';
  const res = await fetch(`${API_URL}/api/products${params}`);
  if (!res.ok) {
    await parseApiError(res);
  }
  const data = (await res.json()) as ApiListResponse<ApiProduct[]>;
  return (data.data || []).map(mapApiToUi);
};

export const fetchProducts = async (options?: { shopId?: string }) => {
  const cacheKey = options?.shopId ? `shop:${options.shopId}` : 'all';
  const now = Date.now();
  const cached = productCache.get(cacheKey);

  if (cached && now - cached.fetchedAt < PRODUCT_CACHE_TTL_MS && cached.data.length > 0) {
    return cached.data;
  }

  if (cached?.inFlight) {
    return cached.inFlight;
  }

  const request = fetchProductsFromApi(options)
    .then(data => {
      productCache.set(cacheKey, {
        data,
        fetchedAt: Date.now()
      });
      return data;
    })
    .catch(() => {
      if (cached?.data?.length) {
        return cached.data;
      }
      return [];
    })
    .finally(() => {
      const latest = productCache.get(cacheKey);
      if (latest?.inFlight) {
        productCache.set(cacheKey, {
          data: latest.data,
          fetchedAt: latest.fetchedAt
        });
      }
    });

  productCache.set(cacheKey, {
    data: cached?.data ?? [],
    fetchedAt: cached?.fetchedAt ?? 0,
    inFlight: request
  });

  return request;
};

export const createProduct = async (payload: CreateProductInput) => {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await parseApiError(res);
  }

  const data = (await res.json()) as ApiListResponse<ApiProduct>;
  return mapApiToUi(data.data);
};

export const updateProduct = async (id: string, payload: Partial<CreateProductInput>) => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await parseApiError(res);
  }

  const data = (await res.json()) as ApiListResponse<ApiProduct>;
  return mapApiToUi(data.data);
};

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    await parseApiError(res);
  }
};

export const searchProductImages = async (query: string) => {
  const res = await fetch(`${API_URL}/api/products/search-images?query=${encodeURIComponent(query)}`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!res.ok) {
    try {
      await parseApiError(res);
    } catch (error: any) {
      const message = String(error?.message || '');
      if (/image search failed/i.test(message) || /no image results found/i.test(message)) {
        throw new Error('Image search failed. Please try another query or upload an image.');
      }
      throw error;
    }
  }

  const data = (await res.json()) as ApiListResponse<string[]>;
  return data.data || [];
};
