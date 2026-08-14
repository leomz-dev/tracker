import React, { useEffect, useState } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Today from './pages/Today';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import { useHabits } from './hooks/useHabits';
import { useReminders } from './hooks/useReminders';

function App() {
  const [activePage, setActivePage] = useState('today');
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

  const reminders = useReminders(habits);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '1') setActivePage('today');
      else if (e.key === '2') setActivePage('stats');
      else if (e.key === '3') setActivePage('settings');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-full w-full min-h-0 flex-col sm:flex-row" id="app-root">
      <div className="hidden sm:block">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
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
        {activePage === 'stats' && (
          <Stats habits={habits} getHabitStats={getHabitStats} />
        )}
        {activePage === 'settings' && (
          <Settings reminders={reminders} habits={habits} />
        )}
      </div>
      <MobileNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
}

export default App;