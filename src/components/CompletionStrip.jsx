import React from 'react';
import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDateKey } from '../utils/dateUtils';

const DAYS = 30;

const CompletionStrip = ({ habits }) => {
  if (habits.length === 0) return null;

  const today = new Date();
  const days = Array.from({ length: DAYS }, (_, i) => subDays(today, DAYS - 1 - i));

  const data = days.map((day) => {
    const key = getDateKey(day);
    const count = habits.filter((h) => h.completions[key]).length;
    return { day, count };
  });

  const totalHabits = habits.length;
  const max = Math.max(totalHabits, 1);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          Actividad por día ({totalHabits} hábito{totalHabits !== 1 ? 's' : ''})
        </span>
        <span className="text-muted-foreground">{format(today, 'd MMM', { locale: es })}</span>
      </div>
      <div
        className="flex items-end gap-[3px]"
        role="img"
        aria-label="Frecuencia de hábitos completados por día en los últimos 30 días"
      >
        {data.map(({ day, count }) => {
          const pct = count / max;
          const height = Math.max(4, Math.round(pct * 40));
          return (
            <span
              key={getDateKey(day)}
              className="w-full flex-1 rounded-sm transition-colors"
              style={{
                height: `${height}px`,
                background: count > 0 ? `hsl(262 80% ${55 + pct * 20}%)` : 'hsl(var(--secondary))',
                opacity: count > 0 ? 0.5 + pct * 0.5 : 1,
              }}
              title={`${format(day, 'd MMM', { locale: es })}: ${count}/${totalHabits}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CompletionStrip;