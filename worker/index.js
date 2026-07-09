const ICON = "/icons/icone-app-1024.png";
const APP_NAME = "GestaGlic";

self.addEventListener("push", (event) => {
  const data = (() => {
    try {
      return event.data?.json() ?? {};
    } catch {
      return { body: event.data?.text() ?? "" };
    }
  })();

  event.waitUntil(
    self.registration.showNotification(data.title ?? APP_NAME, {
      body: data.body ?? "",
      icon: ICON,
      badge: ICON,
      tag: "gestaglic-reminder",
      data: { url: data.url ?? "/medicao" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/medicao";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
