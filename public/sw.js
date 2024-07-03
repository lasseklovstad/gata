self.addEventListener('push', async (event) => {  
    if (!(self.Notification && self.Notification.permission === "granted")) {
        console.log("No permission",self.Notification.permission)
        return;
      }
    const options = {
      body: await event.data.text(),
      icon: '/logo192.png'
    };

    console.log("Push event", options)
  
    event.waitUntil(
      self.registration.showNotification("Gata", options)
    );
  });