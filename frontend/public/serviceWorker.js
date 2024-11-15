self.addEventListener('push', event => {
  const data = event.data.json();
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/images/logo/logo-150.png',
    badge: '/images/logo/logo-favicon.ico',
    data: data.url,
    requireInteraction: true
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
}); 