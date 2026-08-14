import React from 'react';
import { CalendarDays, ChartColumn, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'today', label: 'Hoy', icon: CalendarDays },
  { id: 'stats', label: 'Estadísticas', icon: ChartColumn },
  { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
];

const MobileNav = ({ activePage, onNavigate }) => (
  <nav
    className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md sm:hidden"
    role="navigation"
    aria-label="Navegación principal"
  >
    {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
      const isActive = activePage === id;
      return (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {isActive && <span className="absolute -top-px h-0.5 w-10 rounded-full gradient-primary" aria-hidden="true" />}
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </button>
      );
    })}
  </nav>
);

export default MobileNav;