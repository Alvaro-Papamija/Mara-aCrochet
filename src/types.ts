export type TabType = 'panel' | 'vouchers' | 'stock' | 'pedidos' | 'catalogo';

export type UserRole = 'admin' | 'client';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl: string;
  phone?: string;
  city?: string;
  address?: string;
}

export type ScreenType =
  | 'main'
  | 'detalle-comprobante'
  | 'editar-stock'
  | 'guia-despacho'
  | 'detalle-producto-catalogo'
  | 'checkout-catalogo';

export interface CartItem {
  product: StockProduct;
  quantity: number;
  size?: string;
  customNote?: string;
}

export interface OrderItem {
  name: string;
  specs: string;
  quantity: number;
  price: number;
  imageUrl: string;
  tag?: string;
  artisanNote?: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerInitials: string;
  customerPhone: string;
  customerLocation: string;
  customerAddress?: string;
  status: 'preparacion' | 'listo' | 'transito' | 'entregado';
  statusLabel: string;
  priorityPercent?: number;
  readyTime?: string;
  carrier: string;
  shippingCost: number;
  trackingNumber?: string;
  trackingStatus?: string;
  specialNote?: string;
  items: OrderItem[];
  artisanName?: string;
  paymentVerified?: boolean;
}

export interface Voucher {
  id: string;
  orderId: string;
  timeAgo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shippingMethod: string;
  totalAmount: number;
  expectedAmount: number;
  paymentMethod: string;
  bankAccount: string;
  approvalCode: string;
  bankTimestamp: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  receiptThumbUrl: string;
  receiptFullUrl: string;
  itemsSummary: {
    name: string;
    tag: string;
  }[];
  itemsDetail: OrderItem[];
  internalNote?: string;
}

export interface StockProduct {
  sku: string;
  name: string;
  tag: string;
  size: string;
  supplier: string;
  priceCOP: number;
  yarnCostCOP: number;
  currentStock: number;
  minStockAlert: number;
  category: 'critico' | 'agotado' | 'optimo' | 'pedido';
  statusLabel: string;
  imageUrl: string;
  waitingListCount?: number;
  leadTimeDays?: number;
  monthlyQuota?: number;
}
