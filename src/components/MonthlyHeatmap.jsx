import React from 'react';
import {
  startOfWeek,
  subWeeks,
  addDays,
  isAfter,
  format,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getDateKey } from '../utils/dateUtils';
import { cn } from '@/lib/utils';

const WEEKS = 12;
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const getWeeks = (count) => {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeks = [];
  for (let w = count - 1; w >= 0; w--) {
    const start = subWeeks(monday, w);
    weeks.push(Array.from({ length: 7 }, (_, d) => addDays(start, d)));
  }
  return weeks;
};

const MonthlyHeatmap = ({ completions = {}, color = '#3b6fc4' }) => {
  const weeks = getWeeks(WEEKS);
  const today = startOfDay(new Date());
  const flat = weeks.flat();
  const completedInPeriod = flat.filter(
    (d) => !isAfter(d, today) && completions[getDateKey(d)]
  ).length;

  return (
    <div
      className="flex w-full gap-1.5"
      role="img"
      aria-label={`Calendario: ${completedInPeriod} días completados en las últimas ${WEEKS} semanas`}
    >
      <div className="flex flex-col gap-[3px] pt-0.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <span
            key={i}
            className="flex flex-1 items-center justify-center text-[9px] leading-none text-muted-foreground/70"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid w-full grid-flow-col grid-rows-7 auto-cols-fr gap-[3px]">
        {weeks.flat().map((date) => {
          const key = getDateKey(date);
          const filled = !!completions[key];
          const future = isAfter(date, today);
          return (
            <span
              key={key}
              className={cn(
                'h-2.5 w-full rounded-[3px]',
                future
                  ? 'bg-secondary/20'
                  : filled
                    ? ''
                    : 'bg-secondary/70 ring-1 ring-inset ring-border/50'
              )}
              style={!future && filled ? { background: color } : undefined}
              title={
                future
                  ? ''
                  : `${format(date, 'd MMM', { locale: es })}: ${filled ? 'Completado' : 'Pendiente'}`
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyHeatmap;