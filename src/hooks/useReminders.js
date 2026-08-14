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
  tasksEnabled: false,
  taskReminderHour: '20:00',
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

const showNotification = (title, { body, tag, time, url }) => {
  navigator.serviceWorker.ready.then((reg) => {
    try {
      reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        tag,
        data: { url },
        showTrigger: new NotificationTrigger({ time }),
      });
    } catch {
      /* per-notification errors (quota, etc.) are ignored */
    }
  });
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

const scheduleHabits = (settings, habits) => {
  const selected = habits.filter((h) => settings.habitIds.includes(h.id));
  if (settings.habitIds.length === 0 || selected.length === 0) return 0;

  const names = selected.map((h) => h.name);
  const times = buildTimes(settings, new Date());
  let count = 0;

  for (const time of times) {
    showNotification('HabitFlow', {
      body: `Hey, ¿ya hiciste ${names.join(', ')}?`,
      tag: `habitflow-reminder-${time}`,
      time,
      url: '/',
    });
    count++;
  }
  return count;
};

const dateAtHour = (dateKey, hour, minute) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
};

const scheduleTasks = (settings, tasks) => {
  if (!settings.tasksEnabled) return 0;

  const [hour, minute] = settings.taskReminderHour.split(':').map(Number);
  const now = Date.now();
  const todayKey = getTodayKey();
  let count = 0;

  for (const task of tasks) {
    if (task.completed || !task.dueDate) continue;

    const dueDate = dateAtHour(task.dueDate, hour, minute);

    if (task.dueDate >= todayKey) {
      if (dueDate.getTime() > now) {
        showNotification('HabitFlow — Tarea', {
          body: `¿Ya hiciste la tarea «${task.title}»?`,
          tag: `habitflow-task-${task.id}-due`,
          time: dueDate.getTime(),
          url: '/?page=tasks',
        });
        count++;
      }

      const oneDayBefore = new Date(dueDate.getTime() - 86400000);
      if (oneDayBefore.getTime() > now) {
        showNotification('HabitFlow — Tarea', {
          body: `Mañana vence: «${task.title}»`,
          tag: `habitflow-task-${task.id}-pre`,
          time: oneDayBefore.getTime(),
          url: '/?page=tasks',
        });
        count++;
      }
    } else {
      const next = new Date();
      next.setHours(hour, minute, 0, 0);
      if (next.getTime() <= now) next.setDate(next.getDate() + 1);
      showNotification('HabitFlow — Tarea', {
        body: `Hey, no has hecho la tarea «${task.title}»`,
        tag: `habitflow-task-${task.id}-overdue`,
        time: next.getTime(),
        url: '/?page=tasks',
      });
      count++;
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

export function useReminders(habits, tasks = []) {
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
  const taskSignature = tasks
    .filter((t) => !t.completed)
    .map((t) => `${t.id}:${t.dueDate ?? ''}`)
    .sort()
    .join(',');

  useEffect(() => {
    if (!supported) return;
    const anyEnabled = settings.enabled || settings.tasksEnabled;
    if (anyEnabled && permission === 'granted') {
      clearScheduled().then(() => {
        scheduleHabits(settings, habits);
        scheduleTasks(settings, tasks);
      });
    } else if (!anyEnabled) {
      clearScheduled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.enabled, settings.tasksEnabled, supported, permission, habitSignature, taskSignature]);

  const scheduleNow = async (next = {}) => {
    const effective = { ...settings, ...next };
    const anyEnabled = effective.enabled || effective.tasksEnabled;
    if (!anyEnabled) {
      if (supported) await clearScheduled();
      return true;
    }
    const perm = await ensurePermission();
    setPermission(perm);
    if (perm !== 'granted') return false;
    if (!supported) return true;
    try {
      await clearScheduled();
      scheduleHabits(effective, habits);
      scheduleTasks(effective, tasks);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (supported) return;
    const anyEnabled = settings.enabled || settings.tasksEnabled;
    if (!anyEnabled) return;

    const fire = () => {
      const pendingHabits = settings.enabled
        ? habits.filter(
            (h) => settings.habitIds.includes(h.id) && !h.completions[getTodayKey()]
          )
        : [];
      if (pendingHabits.length > 0) {
        toast('Hey, ¿ya hiciste tus hábitos?', {
          description: pendingHabits.map((h) => h.name).join(', '),
        });
      }

      if (settings.tasksEnabled) {
        const pendingTasks = tasks.filter(
          (t) => !t.completed && t.dueDate && t.dueDate <= getTodayKey()
        );
        if (pendingTasks.length > 0) {
          toast('Tienes tareas por hacer', {
            description: pendingTasks
              .map((t) => `«${t.title}»`)
              .join(', '),
          });
        }
      }
    };

    fire();
    const id = setInterval(fire, settings.intervalHours * 3600 * 1000);
    return () => clearInterval(id);
  }, [settings.enabled, settings.tasksEnabled, settings.intervalHours, settings.habitIds, supported, habits, tasks]);

  const sendTestNotification = async () => {
    if (!('Notification' in window)) return { ok: false, status: 'unsupported' };
    const perm = await ensurePermission();
    setPermission(perm);
    if (perm !== 'granted') return { ok: false, status: 'denied' };

    if (!supported) return { ok: true, status: 'inapp' };

    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('HabitFlow — Prueba', {
        body: 'Las notificaciones están activadas y funcionando',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        tag: 'habitflow-test',
        data: { url: '/' },
      });
      return { ok: true, status: 'sent' };
    } catch {
      return { ok: false, status: 'error' };
    }
  };

  const installApp = () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    setDeferredPrompt(null);
    return true;
  };

  return {
    settings,
    updateSettings,
    scheduleNow,
    sendTestNotification,
    supported,
    permission,
    deferredPrompt,
    canInstall: !!deferredPrompt && !isStandalone,
    installApp,
  };
}