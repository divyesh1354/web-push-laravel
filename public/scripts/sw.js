self.addEventListener('push', function(event) {
    console.log('Test Push Received.');
    console.log(`Test Push had this data: "${event.data.text()}"`);
  
    const title = 'Push Codelab';
    const options = {
        body: 'Yeah It is working.',
        icon: 'images/push-icon.png',
        // You can add more options here
    };
  
    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click received.');
  
    event.notification.close();
  
    event.waitUntil(
      clients.openWindow('https://developers.google.com/web')
    );
});