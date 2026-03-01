self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── NOTIFICATION REGISTRY ──
// Each entry: { title, body, time, condition }
// To add a new notification, just send SCHEDULE_NOTIF with a new id.
// That's it. No other changes needed.
const _timers = {};

self.addEventListener('message', e => {
  const { type, id, title, body, time } = e.data || {};

  if (type === 'SCHEDULE_NOTIF') {
    // Cancel existing timer for this id if already scheduled
    if (_timers[id]) {
      clearTimeout(_timers[id]);
      delete _timers[id];
    }
    scheduleNotif(id, title, body, time);
  }

  if (type === 'CANCEL_NOTIF') {
    if (id) {
      // Cancel a specific notification by id
      if (_timers[id]) {
        clearTimeout(_timers[id]);
        delete _timers[id];
      }
    } else {
      // Cancel ALL notifications (e.g. on reset)
      Object.keys(_timers).forEach(k => clearTimeout(_timers[k]));
      Object.keys(_timers).forEach(k => delete _timers[k]);
    }
  }

  if (type === 'LIST_SCHEDULED') {
    // Debug: reply with what's currently scheduled
    e.source.postMessage({
      type: 'SCHEDULED_LIST',
      ids: Object.keys(_timers)
    });
  }
});

function scheduleNotif(id, title, body, time) {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const ms = next - now;

  _timers[id] = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: id,           // Each notification has its own tag so they don't clobber each other
      renotify: true
    });
    delete _timers[id];
    // Reschedule for tomorrow
    scheduleNotif(id, title, body, time);
  }, ms);
}
