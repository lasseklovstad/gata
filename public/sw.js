self.addEventListener("install", function (event) {
   event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
   event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
   const options = event.data.json();
   const title = options.title || "Oppdatering";
   event.waitUntil(self.registration.showNotification(title, options));
});
// https://github.com/mdn/serviceworker-cookbook/tree/master
// Register event listener for the 'notificationclick' event.
self.addEventListener("notificationclick", function (event) {
   event.waitUntil(
      // Retrieve a list of the clients of this service worker.
      self.clients.matchAll().then(function (clientList) {
         // If there is at least one client, focus it.
         if (clientList.length > 0) {
            clientList[0].postMessage({ url: event.notification.data.url });
            return clientList[0].focus();
         }
         // Otherwise, open a new page.
         return self.clients.openWindow(event.notification.data.url);
      })
   );
});
