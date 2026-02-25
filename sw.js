self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIF') {
    const { title, body, time } = e.data;
    // Clear any existing alarm
    if (self._notifTimer) clearTimeout(self._notifTimer);
    scheduleDaily(title, body, time);
  }
  if (e.data && e.data.type === 'CANCEL_NOTIF') {
    if (self._notifTimer) clearTimeout(self._notifTimer);
  }
});

function scheduleDaily(title, body, time) {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const ms = next - now;
  self._notifTimer = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'tracker-reminder',
      renotify: true
    });
    // Reschedule for tomorrow
    scheduleDaily(title, body, time);
  }, ms);
}
