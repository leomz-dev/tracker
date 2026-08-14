import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getTodayKey } from '../utils/dateUtils';

const REMINDERS_KEY = 'habitflow_reminders';

const DEFAULTS = {
  enabled: false,
  intervalHours: 3,
  startHour: '08:00',
  endHour: '22:00',
  habitIds: [],
};

const loadSettings = () => {
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    if (!data) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(data) };
  } catch {
    return DEFAULTS;
  }
};

const persist = (settings) => {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
};

const clearScheduled = async () => {
  const reg = await navigator.serviceWorker.ready;
  const notifications = await reg.getNotifications({ includeTriggered: false });
  notifications.forEach((n) => n.close());
};

const buildTimes = ({ intervalHours, startHour, endHour }, now) => {
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);
  const intervalMs = intervalHours * 3600 * 1000;
  const times = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, startH, startM, 0, 0);
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, endH, endM, 59, 999);
    let t = new Date(dayStart);
    while (t <= dayEnd) {
      if (t.getTime() > now.getTime()) times.push(t.getTime());
      t = new Date(t.getTime() + intervalMs);
    }
  }
  return times;
};

const schedule = async (settings, habits) => {
  const reg = await navigator.serviceWorker.ready;
  await clearScheduled();

  const selected = habits.filter((h) => settings.habitIds.includes(h.id));
  if (settings.habitIds.length === 0 || selected.length === 0) return 0;

  const names = selected.map((h) => h.name);
  const times = buildTimes(settings, new Date());
  let count = 0;

  for (const time of times) {
    try {
      await reg.showNotification('HabitFlow', {
        body: `Hey, ¿ya hiciste ${names.join(', ')}?`,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        tag: `habitflow-reminder-${time}`,
        data: { url: '/' },
        showTrigger: new NotificationTrigger({ time }),
      });
      count++;
    } catch {
      /* per-notification errors (quota, etc.) are ignored */
    }
  }
  return count;
};

const ensurePermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
};

export function useReminders(habits) {
  const [settings, setSettings] = useState(loadSettings);
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const supported = useMemo(
    () =>
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'showTrigger' in Notification.prototype,
    []
  );

  const isStandalone = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches,
    []
  );

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const updateSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  };

  const habitSignature = settings.habitIds.slice().sort().join(',');

  useEffect(() => {
    if (settings.enabled && supported && permission === 'granted' && habits.length > 0) {
      schedule(settings, habits);
    } else if (!settings.enabled && supported) {
      clearScheduled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabled, supported, permission, habitSignature]);

  const scheduleNow = async (next = {}) => {
    const effective = { ...settings, ...next };
    if (!effective.enabled) {
      if (supported) await clearScheduled();
      return true;
    }
    const perm = await ensurePermission();
    setPermission(perm);
    if (perm !== 'granted') return false;
    if (!supported) return true;
    try {
      await schedule(effective, habits);
      return true;
    } catch {
      return false;
    }
  };

  const installApp = () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    setDeferredPrompt(null);
    return true;
  };

  useEffect(() => {
    if (!settings.enabled || supported) return;
    const fire = () => {
      const pending = habits.filter(
        (h) => settings.habitIds.includes(h.id) && !h.completions[getTodayKey()]
      );
      if (pending.length === 0) return;
      toast('Hey, ¿ya hiciste tus hábitos?', {
        description: pending.map((h) => h.name).join(', '),
      });
    };
    fire();
    const id = setInterval(fire, settings.intervalHours * 3600 * 1000);
    return () => clearInterval(id);
  }, [settings.enabled, settings.intervalHours, settings.habitIds, supported, habits]);

  return {
    settings,
    updateSettings,
    scheduleNow,
    supported,
    permission,
    deferredPrompt,
    canInstall: !!deferredPrompt && !isStandalone,
    installApp,
  };
}