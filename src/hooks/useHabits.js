import { useState, useEffect, useCallback } from 'react';
import { getTodayKey, calculateStreak, calculateMaxStreak, getCompletionRate } from '../utils/dateUtils';

const STORAGE_KEY = 'habitflow_habits';

const defaultHabits = [
  {
    id: '1',
    name: 'Meditación',
    emoji: '🧘',
    color: '#7C5CBF',
    completions: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ejercicio',
    emoji: '🏃',
    color: '#3B82F6',
    completions: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Lectura',
    emoji: '📚',
    color: '#10B981',
    completions: {},
    createdAt: new Date().toISOString(),
  },
];

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : defaultHabits;
  } catch {
    return defaultHabits;
  }
};

const saveToStorage = (habits) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits:', e);
  }
};

export const useHabits = () => {
  const [habits, setHabits] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(habits);
  }, [habits]);

  const addHabit = useCallback(({ name, emoji, color }) => {
    const newHabit = {
      id: Date.now().toString(),
      name,
      emoji,
      color,
      completions: {},
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const restoreHabit = useCallback((habit) => {
    setHabits((prev) => {
      const idx = prev.findIndex(
        (h) => new Date(h.createdAt) > new Date(habit.createdAt)
      );
      const next = [...prev];
      if (idx === -1) next.push(habit);
      else next.splice(idx, 0, habit);
      return next;
    });
  }, []);

  const updateHabit = useCallback((id, { name, emoji, color }) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              name: name.trim() || h.name,
              emoji,
              color,
            }
          : h
      )
    );
  }, []);

  const toggleCompletion = useCallback((id, dateKey = getTodayKey()) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completions: {
                ...h.completions,
                [dateKey]: !h.completions[dateKey],
              },
            }
          : h
      )
    );
  }, []);

  const isTodayCompleted = useCallback(
    (id) => {
      const habit = habits.find((h) => h.id === id);
      return habit?.completions[getTodayKey()] ?? false;
    },
    [habits]
  );

  const getHabitStats = useCallback(
    (id) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return null;
      return {
        streak: calculateStreak(habit.completions),
        maxStreak: calculateMaxStreak(habit.completions),
        completionRate: getCompletionRate(habit.completions, 30, habit.createdAt),
        totalDays: Object.values(habit.completions).filter(Boolean).length,
      };
    },
    [habits]
  );

  const todayCompletedCount = habits.filter((h) => h.completions[getTodayKey()]).length;
  const todayProgress = habits.length > 0 ? todayCompletedCount / habits.length : 0;

  return {
    habits,
    addHabit,
    deleteHabit,
    restoreHabit,
    updateHabit,
    toggleCompletion,
    isTodayCompleted,
    getHabitStats,
    todayCompletedCount,
    todayProgress,
  };
};
