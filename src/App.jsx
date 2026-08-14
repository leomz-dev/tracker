import React, { useEffect, useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Today from './pages/Today';
import Tasks from './pages/Tasks';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import { useHabits } from './hooks/useHabits';
import { useTasks } from './hooks/useTasks';
import { useReminders } from './hooks/useReminders';

function App() {
  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    return ['today', 'tasks', 'stats', 'settings'].includes(page) ? page : 'today';
  };

  const [activePage, setActivePage] = useState(getInitialPage);

  const navigate = (page) => {
    setActivePage(page);
    window.history.replaceState(null, '', page === 'today' ? '/' : `/?page=${page}`);
  };
  const {
    habits,
    addHabit,
    deleteHabit,
    restoreHabit,
    updateHabit,
    toggleCompletion,
    isTodayCompleted,
    getHabitStats,
    todayProgress,
    todayCompletedCount,
  } = useHabits();

  const {
    tasks,
    addTask,
    deleteTask,
    restoreTask,
    updateTask,
    toggleTask,
    getTaskStats,
  } = useTasks();

  const reminders = useReminders(habits, tasks);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '1') navigate('today');
      else if (e.key === '2') navigate('tasks');
      else if (e.key === '3') navigate('stats');
      else if (e.key === '4') navigate('settings');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full w-full min-h-0 flex-col sm:flex-row" id="app-root">
      <div className="hidden sm:block">
        <Sidebar activePage={activePage} onNavigate={navigate} />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        {activePage === 'today' && (
          <Today
            habits={habits}
            toggleCompletion={toggleCompletion}
            isTodayCompleted={isTodayCompleted}
            addHabit={addHabit}
            updateHabit={updateHabit}
            deleteHabit={deleteHabit}
            restoreHabit={restoreHabit}
            getHabitStats={getHabitStats}
            todayProgress={todayProgress}
            todayCompletedCount={todayCompletedCount}
          />
        )}
        {activePage === 'tasks' && (
          <Tasks
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
            restoreTask={restoreTask}
            updateTask={updateTask}
            toggleTask={toggleTask}
            getTaskStats={getTaskStats}
          />
        )}
        {activePage === 'stats' && (
          <Stats habits={habits} getHabitStats={getHabitStats} />
        )}
        {activePage === 'settings' && (
          <Settings reminders={reminders} habits={habits} tasks={tasks} />
        )}
      </div>
      <MobileNav activePage={activePage} onNavigate={navigate} />
    </div>
  );
}

export default App;