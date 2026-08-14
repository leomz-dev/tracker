import React from 'react';
import { getLast7Days, getDateKey, formatDayLabel } from '../utils/dateUtils';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';

const WeekHeatmap = ({ completions = {}, color = '#3b6fc4' }) => {
  const days = getLast7Days();
  const completedInWeek = days.filter((d) => completions[getDateKey(d)]).length;

  return (
    <div
      className="flex items-end gap-1.5"
      role="img"
      aria-label={`Últimos 7 días: ${completedInWeek} de 7 completados`}
    >
      {days.map((date) => {
        const key = getDateKey(date);
        const filled = !!completions[key];
        const today = isToday(date);
        return (
          <span className="flex flex-col items-center gap-1" key={key}>
            <span
              className={cn(
                'text-[10px] leading-none',
                today ? 'font-bold text-foreground' : 'text-muted-foreground'
              )}
            >
              {formatDayLabel(date).slice(0, 1)}
            </span>
            <span
              className={cn(
                'h-3 w-3 rounded-full transition-colors',
                !filled && 'bg-secondary ring-1 ring-inset ring-border',
                today && filled && 'ring-2 ring-ring/40 ring-offset-1 ring-offset-background'
              )}
              style={filled ? { background: color } : undefined}
              title={`${formatDayLabel(date)}: ${filled ? 'Completado' : 'Pendiente'}`}
            />
          </span>
        );
      })}
    </div>
  );
};

export default WeekHeatmap;