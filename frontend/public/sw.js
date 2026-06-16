/* Service Worker — notificações push do Bolão Aziladuz */

// Recebe o evento push (mesmo com o app fechado) e exibe a notificação.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Bolão Aziladuz', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Bolão Aziladuz';
  const options = {
    body: data.body || '',
    icon: '/favicon/web-app-manifest-192x192.png',
    badge: '/favicon/favicon-96x96.png',
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar na notificação, foca uma aba existente do app ou abre uma nova.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      }),
  );
});
