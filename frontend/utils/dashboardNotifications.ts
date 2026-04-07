import { Order, Product, RepairRequest } from '../types';

export type DashboardNotificationType = 'repair' | 'sales' | 'stock';

export type DashboardNotificationItem = {
  id: DashboardNotificationType;
  title: string;
  value: string;
  description: string;
  tone: 'sky' | 'emerald' | 'amber';
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK_THRESHOLD = 10;

const toTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const isRecent = (value: string) => {
  const timestamp = toTimestamp(value);
  return timestamp > 0 && Date.now() - timestamp <= ONE_DAY_MS;
};

const getRecentItems = <T extends { createdAt: string }>(items: T[]) =>
  [...items]
    .filter(item => isRecent(item.createdAt))
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));

export const buildDashboardNotifications = ({
  repairs,
  orders,
  products
}: {
  repairs: RepairRequest[];
  orders: Order[];
  products: Product[];
}): DashboardNotificationItem[] => {
  const recentRepairs = getRecentItems(repairs);
  const recentPaidOrders = getRecentItems(
    orders.filter(order => order.paymentStatus === 'paid')
  );

  const soldUnitsToday = recentPaidOrders.reduce(
    (total, order) => total + order.products.reduce((sum, product) => sum + product.quantity, 0),
    0
  );

  const lowStockProducts = products
    .filter(product => product.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  const latestRepair = recentRepairs[0];
  const latestOrder = recentPaidOrders[0];
  const lowStockPreview = lowStockProducts.slice(0, 2).map(product => `${product.name} (${product.stock})`);

  return [
    {
      id: 'repair',
      title: 'New Repairs',
      value: String(recentRepairs.length),
      tone: 'sky',
      description: latestRepair
        ? `Latest: ${latestRepair.trackingCode} for ${latestRepair.deviceModel}`
        : 'No repair requests were created in the last 24 hours.'
    },
    {
      id: 'sales',
      title: 'Inventory Sold',
      value: `${soldUnitsToday} pcs`,
      tone: 'emerald',
      description: latestOrder
        ? `Across ${recentPaidOrders.length} paid order${recentPaidOrders.length === 1 ? '' : 's'} today.`
        : 'No completed sales were recorded in the last 24 hours.'
    },
    {
      id: 'stock',
      title: 'Low Stock',
      value: String(lowStockProducts.length),
      tone: 'amber',
      description: lowStockPreview.length
        ? `Watch ${lowStockPreview.join(', ')}${lowStockProducts.length > 2 ? ' and more' : ''}.`
        : `All inventory is above ${LOW_STOCK_THRESHOLD} units right now.`
    }
  ];
};
