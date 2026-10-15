import { Order, StockProduct, Voucher } from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_VOUCHERS } from '../data/mockData';

// Base URL hacia el backend en XAMPP Apache + PHP
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost/marana-api';

export interface DbStatusInfo {
  connected: boolean;
  database: string;
  server: string;
  phpVersion?: string;
  mysqlVersion?: string;
  tables?: Record<string, number>;
  timestamp?: string;
  error?: string;
}

/**
 * Verifica la conexión en tiempo real con MySQL a través de XAMPP
 */
export async function checkDbHealth(): Promise<DbStatusInfo> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/test.php`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return {
      connected: json.status === 'success',
      database: json.database || 'marana_crochet',
      server: json.server || 'XAMPP Apache / PHP',
      phpVersion: json.php_version,
      mysqlVersion: json.mysql_version,
      tables: json.tables || {},
      timestamp: json.timestamp,
    };
  } catch (err: any) {
    return {
      connected: false,
      database: 'marana_crochet',
      server: 'XAMPP Desconectado / Local',
      error: err?.message || 'No se pudo contactar el servidor de XAMPP',
    };
  }
}

/**
 * Obtener todos los productos desde MySQL (con fallback a mockData)
 */
export async function apiGetProducts(): Promise<StockProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products.php`);
    if (!res.ok) throw new Error('Error al cargar productos');
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn('[Maraña DB] Usando productos locales de respaldo:', err);
    return INITIAL_PRODUCTS;
  }
}

/**
 * Guardar o actualizar un producto / stock en MySQL
 */
export async function apiSaveProduct(product: Partial<StockProduct> & { sku: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/products.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('[Maraña DB] Error al guardar producto en MySQL:', err);
    return false;
  }
}

/**
 * Obtener todos los pedidos desde MySQL
 */
export async function apiGetOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders.php`);
    if (!res.ok) throw new Error('Error al cargar pedidos');
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return INITIAL_ORDERS;
  } catch (err) {
    console.warn('[Maraña DB] Usando pedidos locales de respaldo:', err);
    return INITIAL_ORDERS;
  }
}

/**
 * Crear un nuevo pedido en MySQL
 */
export async function apiCreateOrder(order: Order): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('[Maraña DB] Error al crear pedido en MySQL:', err);
    return false;
  }
}

/**
 * Actualizar estado o guía de un pedido en MySQL
 */
export async function apiUpdateOrder(orderData: Partial<Order> & { id: string }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('[Maraña DB] Error al actualizar pedido en MySQL:', err);
    return false;
  }
}

/**
 * Obtener todos los comprobantes desde MySQL
 */
export async function apiGetVouchers(): Promise<Voucher[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers.php`);
    if (!res.ok) throw new Error('Error al cargar comprobantes');
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return INITIAL_VOUCHERS;
  } catch (err) {
    console.warn('[Maraña DB] Usando comprobantes locales de respaldo:', err);
    return INITIAL_VOUCHERS;
  }
}

/**
 * Registrar un nuevo comprobante en MySQL
 */
export async function apiCreateVoucher(voucher: Voucher): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voucher),
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('[Maraña DB] Error al registrar comprobante en MySQL:', err);
    return false;
  }
}

/**
 * Actualizar estado de comprobante (aprobado / rechazado) en MySQL
 */
export async function apiUpdateVoucherStatus(
  voucherId: string,
  status: 'aprobado' | 'rechazado' | 'pendiente',
  internalNote?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/vouchers.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: voucherId, status, internalNote }),
    });
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    console.error('[Maraña DB] Error al actualizar comprobante en MySQL:', err);
    return false;
  }
}
