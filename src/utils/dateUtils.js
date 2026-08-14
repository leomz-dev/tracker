import { format, isToday, differenceInCalendarDays, subDays } from 'date-fns';

export const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

export const getDateKey = (date) => format(date, 'yyyy-MM-dd');

export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(subDays(new Date(), i));
  }
  return days;
};

export const calculateStreak = (completions = {}) => {
  let streak = 0;
  let current = new Date();

  // If today is not completed, start from yesterday
  const todayKey = getDateKey(current);
  if (!completions[todayKey]) {
    current = subDays(current, 1);
  }

  while (true) {
    const key = getDateKey(current);
    if (completions[key]) {
      streak++;
      current = subDays(current, 1);
    } else {
      break;
    }
  }

  return streak;
};

export const calculateMaxStreak = (completions = {}) => {
  const dates = Object.keys(completions)
    .filter((k) => completions[k])
    .sort();

  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = differenceInCalendarDays(curr, prev);

    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};

export const getCompletionRate = (completions = {}, daysBack = 30, startDate) => {
  if (startDate) {
    const sinceCreated =
      differenceInCalendarDays(new Date(), new Date(startDate)) + 1;
    daysBack = Math.max(1, Math.min(daysBack, sinceCreated));
  }
  let completed = 0;
  for (let i = 0; i < daysBack; i++) {
    const key = getDateKey(subDays(new Date(), i));
    if (completions[key]) completed++;
  }
  return Math.round((completed / daysBack) * 100);
};

export const formatDayLabel = (date) => {
  if (isToday(date)) return 'Hoy';
  return format(date, 'EEE');
};
