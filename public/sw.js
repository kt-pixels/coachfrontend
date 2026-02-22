// public/sw.js
let vibrationInterval;

self.addEventListener("push", function (event) {
  const options = {
    body: event.data ? event.data.text() : "Meal Time!",
    icon: "/logo.png",
    badge: "/badge.png",
    vibrate: [500, 200, 500, 200, 500, 200, 500],
    requireInteraction: true,
    renotify: true,
    actions: [
      { action: "ok", title: "✓ OK" },
      { action: "snooze", title: "⏰ Snooze 5m" },
    ],
    tag: "meal-reminder",
  };

  // Start continuous vibration
  startContinuousVibration();

  event.waitUntil(self.registration.showNotification("🍽️ Meal Time!", options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Stop vibration
  stopContinuousVibration();

  if (event.action === "snooze") {
    // Snooze for 5 minutes
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(
          () => {
            self.registration.showNotification("⏰ Snoozed Meal Reminder", {
              body: "Time to eat! (Snoozed)",
              icon: "/logo.png",
              vibrate: [500, 200, 500],
              requireInteraction: true,
            });
            resolve();
          },
          5 * 60 * 1000,
        ); // 5 minutes
      }),
    );
  } else if (event.action === "ok" || !event.action) {
    // Open app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow("/");
        }
      }),
    );
  }
});

// Continuous vibration function
function startContinuousVibration() {
  // Note: Service Worker mein direct vibration nahi hota
  // Yeh sirf tab chalega jab page active ho
  // Isliye hum message bhejte hain client ko
  clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "START_VIBRATION" });
    });
  });

  // Auto stop after 1 minute
  setTimeout(stopContinuousVibration, 60000);
}

function stopContinuousVibration() {
  clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "STOP_VIBRATION" });
    });
  });
}
