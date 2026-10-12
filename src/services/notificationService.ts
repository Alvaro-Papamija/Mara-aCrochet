import { Order } from '../types';

export interface NotificationItem {
  id: string;
  timestamp: string;
  orderId?: string;
  title: string;
  body: string;
  status?: 'preparacion' | 'listo' | 'transito' | 'entregado' | 'info';
  read: boolean;
  icon?: string;
  trackingNumber?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  workshopAlerts: boolean; // Notificar avances en taller (Neiva)
  readyAlerts: boolean; // Notificar cuando esté empacado y listo
  shippingAlerts: boolean; // Notificar cuando esté en tránsito con transportadora
  deliveryAlerts: boolean; // Notificar cuando haya sido entregado
}

const STORAGE_KEY_NOTIFICATIONS = 'marana_notifications_history';
const STORAGE_KEY_SETTINGS = 'marana_notifications_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  workshopAlerts: true,
  readyAlerts: true,
  shippingAlerts: true,
  deliveryAlerts: true,
};

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Verifica si el navegador soporta Notificaciones Web
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Obtiene el estado actual del permiso en el navegador
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Inicializa y registra el Service Worker para notificaciones en segundo plano
 */
export async function initNotificationService(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;

    // Escuchar mensajes provenientes del Service Worker cuando el usuario hace clic en la notificación
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        const orderId = event.data.orderId;
        window.dispatchEvent(
          new CustomEvent('marana:notification-clicked', { detail: { orderId } })
        );
      }
    });

    return reg;
  } catch (err) {
    console.warn('No se pudo registrar el Service Worker de notificaciones:', err);
    return null;
  }
}

/**
 * Solicita permiso al usuario para enviar notificaciones en el navegador
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Registrar SW si aún no está listo
      if (!swRegistration && 'serviceWorker' in navigator) {
        await initNotificationService();
      }
    }
    return permission;
  } catch (err) {
    console.error('Error solicitando permiso de notificación:', err);
    return Notification.permission;
  }
}

/**
 * Reproduce un acorde suave y artesanal tipo campanilla utilizando Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do5, Mi5, Sol5, Do6 (Arpegio armónico)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
    });
  } catch (e) {
    // Si el navegador tiene restricciones de audio sin interacción, silenciar limpiamente
  }
}

/**
 * Emite una notificación real en el navegador
 */
export async function sendBrowserNotification(
  title: string,
  options?: NotificationOptions & {
    orderId?: string;
    status?: 'preparacion' | 'listo' | 'transito' | 'entregado' | 'info';
    sound?: boolean;
    trackingNumber?: string;
  }
): Promise<boolean> {
  const settings = getNotificationSettings();

  // Guardar en el historial de la app independientemente para que la clienta lo vea
  addStoredNotification({
    title,
    body: options?.body || '',
    orderId: options?.orderId,
    status: options?.status || 'info',
    icon: '/logo.png',
    trackingNumber: options?.trackingNumber,
  });

  // Si el usuario configuró sonido, reproducir
  if (settings.soundEnabled && options?.sound !== false) {
    playNotificationChime();
  }

  // Notificar al sistema
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const notificationOptions: NotificationOptions = {
    body: options?.body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: options?.tag || (options?.orderId ? `marana-order-${options.orderId}` : 'marana-notification'),
    data: {
      orderId: options?.orderId,
      url: window.location.origin,
      status: options?.status,
    },
    silent: !settings.soundEnabled,
    ...options,
  };

  try {
    // Intentar a través del Service Worker para soporte en segundo plano
    if ('serviceWorker' in navigator) {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Fallback a API Notification estándar
    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.orderId) {
        window.dispatchEvent(
          new CustomEvent('marana:notification-clicked', {
            detail: { orderId: options.orderId },
          })
        );
      }
    };
    return true;
  } catch (err) {
    console.warn('Fallo al emitir notificación directa:', err);
    return false;
  }
}

/**
 * Emite notificación personalizada sobre el estado real de un pedido
 */
export async function notifyOrderStatus(
  order: Order,
  customNote?: string
): Promise<boolean> {
  const settings = getNotificationSettings();

  let title = '';
  let body = '';
  const firstItem = order.items[0]?.name || 'Amigurumi artesanal';
  const itemCount = order.items.reduce((s, it) => s + it.quantity, 0);
  const itemsText = itemCount > 1 ? `${firstItem} y más piezas` : firstItem;

  switch (order.status) {
    case 'preparacion':
      if (!settings.workshopAlerts) return false;
      title = `🧶 Taller Maraña · Pedido #${order.id} en tejido`;
      body = customNote || `Tu amigurumi (${itemsText}) está siendo tejido a mano con fibras seleccionadas en nuestro taller de Neiva, Huila.`;
      break;

    case 'listo':
      if (!settings.readyAlerts) return false;
      title = `🌸 ¡Tu pedido #${order.id} está listo y empacado!`;
      body = customNote || `Tu pieza ${itemsText} fue empacada con sello artesanal Maraña, dedicatoria y ramita fresca de lavanda en Neiva.`;
      break;

    case 'transito':
      if (!settings.shippingAlerts) return false;
      title = `🚚 ¡Tu pedido #${order.id} va en camino!`;
      body = customNote || `Despachado con ${order.carrier}. Guía: #${order.trackingNumber || 'En asignación'}. Destino: ${order.customerLocation}.`;
      break;

    case 'entregado':
      if (!settings.deliveryAlerts) return false;
      title = `✨ ¡Pedido #${order.id} entregado con éxito!`;
      body = customNote || `Tu amigurumi ha llegado a su destino en ${order.customerLocation}. ¡Gracias por apoyar el tejido artesanal de Neiva!`;
      break;

    default:
      title = `📦 Maraña Crochet · Actualización de Pedido #${order.id}`;
      body = customNote || `El estado de tu orden ha cambiado a: ${order.statusLabel}`;
      break;
  }

  return sendBrowserNotification(title, {
    body,
    orderId: order.id,
    status: order.status,
    trackingNumber: order.trackingNumber,
  });
}

/**
 * Obtiene el historial guardado de notificaciones
 */
export function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      // Notificaciones iniciales de bienvenida / ejemplo si el historial está vacío
      const initial: NotificationItem[] = [
        {
          id: 'notif_init_1',
          timestamp: 'Hoy · 09:35 AM',
          orderId: 'MC-2024-884',
          title: '🌸 ¡Tu amigurumi está listo y empacado!',
          body: 'Pedido #MC-2024-884 empacado con dedicatoria en papel de fibra y ramita de lavanda natural del taller de Neiva.',
          status: 'listo',
          read: false,
          trackingNumber: '9482-0198-4820',
        },
        {
          id: 'notif_init_2',
          timestamp: 'Ayer · 03:20 PM',
          orderId: 'MC-2024-882',
          title: '🧶 Taller Maraña: Avance de tejido al 75%',
          body: 'Detalles bordados finales completados por Lucía M. en el taller de Neiva, Huila.',
          status: 'preparacion',
          read: true,
        },
      ];
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Agrega una notificación al historial local
 */
export function addStoredNotification(
  item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
): NotificationItem {
  const current = getStoredNotifications();
  const now = new Date();
  const timeStr = `Hoy · ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

  const newItem: NotificationItem = {
    ...item,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timeStr,
    read: false,
  };

  const updated = [newItem, ...current.slice(0, 49)]; // Mantener máximo 50
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error guardando historial de notificaciones:', e);
  }

  // Despachar evento para refrescar interfaces activas
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('marana:notifications-updated', { detail: newItem }));
  }

  return newItem;
}

/**
 * Marca todas las notificaciones como leídas
 */
export function markAllNotificationsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('marana:notifications-updated'));
  } catch (e) {
    console.warn('Error actualizando notificaciones leídas:', e);
  }
}

/**
 * Limpia el historial de notificaciones
 */
export function clearNotifications(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    window.dispatchEvent(new CustomEvent('marana:notifications-updated'));
  } catch (e) {
    console.warn('Error limpiando notificaciones:', e);
  }
}

/**
 * Obtiene las preferencias de notificación de la clienta
 */
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Guarda las preferencias de notificación
 */
export function saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error guardando configuración de notificaciones:', e);
  }
  return updated;
}

/**
 * Simula un cambio de estado en segundo plano (para que la clienta pueda
 * cambiar de pestaña o minimizar el navegador y ver la notificación real del sistema)
 */
export function scheduleSimulatedBackgroundNotification(
  order: Order,
  targetStatus: 'preparacion' | 'listo' | 'transito' | 'entregado',
  delaySeconds: number,
  onTrigger?: (updatedOrder: Order) => void
): () => void {
  const statusLabels: Record<string, string> = {
    preparacion: 'En Taller · Tejido en progreso',
    listo: 'Listo Despacho · Empacado',
    transito: 'En Tránsito con Servientrega',
    entregado: 'Entregado con Éxito',
  };

  const timeoutId = setTimeout(async () => {
    const updatedOrder: Order = {
      ...order,
      status: targetStatus,
      statusLabel: statusLabels[targetStatus] || targetStatus,
      trackingStatus:
        targetStatus === 'transito'
          ? 'En camino hacia la dirección de entrega'
          : targetStatus === 'entregado'
          ? 'Recibido en portería o domicilio por la clienta'
          : order.trackingStatus,
    };

    await notifyOrderStatus(updatedOrder);

    if (onTrigger) {
      onTrigger(updatedOrder);
    }
  }, delaySeconds * 1000);

  return () => clearTimeout(timeoutId);
}
