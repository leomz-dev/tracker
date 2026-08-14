import React from 'react';
import { subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateKey } from '../utils/dateUtils';

const DAYS = 30;
const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const WeekdayChart = ({ habits }) => {
  const today = new Date();
  const acc = Array.from({ length: 7 }, () => ({ slots: 0, completed: 0 }));

  for (let i = DAYS - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const idx = (day.getDay() + 6) % 7;
    const key = getDateKey(day);
    const eligible = habits.filter((h) => new Date(h.createdAt).getTime() <= day.getTime());
    acc[idx].slots += eligible.length;
    acc[idx].completed += eligible.filter((h) => h.completions[key]).length;
  }

  const data = acc.map(({ slots, completed }) => ({
    rate: slots ? Math.round((completed / slots) * 100) : 0,
    hasData: slots > 0,
  }));
  const best = Math.max(...data.map((d) => d.rate));

  return (
    <div className="flex items-end justify-between gap-1.5 sm:gap-3">
      {data.map((d, i) => (
        <div
          key={DAY_LABELS[i]}
          className="flex h-36 flex-1 flex-col items-center gap-1.5"
          role="img"
          aria-label={`${DAY_NAMES[i]}: ${d.rate}% de completitud`}
        >
          <span className={cn('text-[11px] font-bold tabular-nums', d.rate === best && d.hasData ? 'text-primary' : 'text-muted-foreground')}>
            {d.rate}%
          </span>
          <div className="flex w-full flex-1 items-end justify-center">
            <div
              className={cn(
                'w-full max-w-8 rounded-t-md animate-grow-up',
                d.rate === best && d.hasData ? 'gradient-primary' : 'bg-primary/25'
              )}
              style={{
                height: `${d.hasData ? Math.max(d.rate, 6) : 4}%`,
                animationDelay: `${i * 55}ms`,
                opacity: d.hasData ? 1 : 0.3,
              }}
              title={`${DAY_NAMES[i]}: ${d.rate}% completado`}
            />
          </div>
          <span className={cn('text-[10px] uppercase', d.rate === best && d.hasData ? 'font-semibold text-primary' : 'text-muted-foreground')}>
            {DAY_LABELS[i]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default WeekdayChart;