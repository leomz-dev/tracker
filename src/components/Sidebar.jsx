import React from 'react';
import { CalendarDays, ChartColumn, Settings as SettingsIcon, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const NAV_ITEMS = [
  { id: 'today', label: 'Hoy', icon: CalendarDays },
  { id: 'stats', label: 'Estadísticas', icon: ChartColumn },
  { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside
      className="flex h-full w-16 flex-col border-r border-border bg-card/40 backdrop-blur-sm sm:w-60"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center gap-2.5 px-4 py-6 sm:px-5">
        <div className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="hidden text-lg font-extrabold tracking-tight sm:inline">HabitFlow</span>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1.5 p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </nav>

      <Separator />

      <div className="px-4 py-4 sm:px-5">
        <p className="hidden text-xs text-muted-foreground sm:block">HabitFlow v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;