import { useState, useEffect, useCallback } from 'react';
import { getTodayKey } from '../utils/dateUtils';

const STORAGE_KEY = 'habitflow_tasks';

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

export const useTasks = () => {
  const [tasks, setTasks] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks]);

  const addTask = useCallback(({ title, dueDate }) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      dueDate: dueDate || null,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const restoreTask = useCallback((task) => {
    setTasks((prev) => {
      const idx = prev.findIndex(
        (t) => new Date(t.createdAt) > new Date(task.createdAt)
      );
      const next = [...prev];
      if (idx === -1) next.push(task);
      else next.splice(idx, 0, task);
      return next;
    });
  }, []);

  const updateTask = useCallback((id, { title, dueDate }) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: title.trim() || t.title,
              dueDate: dueDate || null,
            }
          : t
      )
    );
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  }, []);

  const getTaskStats = useCallback(() => {
    const todayKey = getTodayKey();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < todayKey
    ).length;
    const dueToday = tasks.filter(
      (t) => !t.completed && t.dueDate === todayKey
    ).length;
    return { total, completed, pending: total - completed, overdue, dueToday };
  }, [tasks]);

  return {
    tasks,
    addTask,
    deleteTask,
    restoreTask,
    updateTask,
    toggleTask,
    getTaskStats,
  };
};
