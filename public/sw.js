// Service Worker para Maraña Amigurumis & Crochet (Neiva, Huila)
// Gestión de notificaciones en el navegador y seguimiento de pedidos en segundo plano

const CACHE_NAME = 'marana-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Escuchar evento de clic en la notificación del navegador
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const orderId = data.orderId || '';
  const targetUrl = data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana o pestaña abierta, enfocarla y enviarle mensaje
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            orderId: orderId,
            action: event.action || 'open',
          });
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir la app
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Escuchar mensajes desde la aplicación principal (para programar o emitir alertas)
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = data;
    self.registration.showNotification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [150, 80, 150],
      ...options,
    });
  }

  if (data.type === 'SCHEDULE_BACKGROUND_ALERT') {
    const { title, options, delayMs } = data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200],
        ...options,
      });
    }, delayMs || 5000);
  }
});
