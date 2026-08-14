import React from 'react';
import { subWeeks, startOfWeek, addDays, isAfter, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getDateKey } from '../utils/dateUtils';

const WEEKS = 6;

const isEligible = (habit, day) => new Date(habit.createdAt).getTime() <= day.getTime();

const getWeekData = (habits, weekStart, today) => {
  let slots = 0;
  let completed = 0;
  for (let d = 0; d < 7; d++) {
    const day = addDays(weekStart, d);
    if (isAfter(day, today)) break;
    const key = getDateKey(day);
    const eligible = habits.filter((h) => isEligible(h, day));
    slots += eligible.length;
    completed += eligible.filter((h) => h.completions[key]).length;
  }
  const rate = slots ? Math.round((completed / slots) * 100) : 0;
  return { rate, slots, completed };
};

const WeeklyTrend = ({ habits }) => {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });

  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const weekStart = subWeeks(monday, WEEKS - 1 - i);
    const { rate, slots } = getWeekData(habits, weekStart, today);
    return {
      label: format(weekStart, 'd MMM', { locale: es }),
      rate,
      hasData: slots > 0,
      current: i === WEEKS - 1,
    };
  });

  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3">
        {weeks.map((w, i) => (
          <div
            key={w.label}
            className="flex h-44 flex-1 flex-col items-center gap-1.5"
            role="img"
            aria-label={`Semana del ${w.label}: ${w.rate}% de completitud`}
          >
            <span className="text-xs font-bold tabular-nums text-primary">{w.rate}%</span>
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className={cn(
                  'w-full max-w-9 rounded-t-md animate-grow-up',
                  w.current ? 'gradient-primary' : 'bg-primary/25'
                )}
                style={{
                  height: `${w.hasData ? Math.max(w.rate, 6) : 4}%`,
                  animationDelay: `${i * 60}ms`,
                }}
                title={`Semana del ${w.label}: ${w.rate}%`}
              />
            </div>
            <span className={cn('text-[10px] uppercase tracking-wide', w.current ? 'font-semibold text-primary' : 'text-muted-foreground')}>
              {w.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm gradient-primary" aria-hidden="true" />
          Semana actual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-primary/25" aria-hidden="true" />
          Anteriores
        </span>
      </div>
    </div>
  );
};

export default WeeklyTrend;