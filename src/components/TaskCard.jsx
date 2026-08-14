import React from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CircleCheckBig, Circle, Trash2, Pencil, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const getDueLabel = (dueDate) => {
  if (!dueDate) return null;
  const date = new Date(`${dueDate}T00:00:00`);
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return { label: 'Hoy', tone: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' };
  if (days === 1) return { label: 'Mañana', tone: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' };
  if (days === -1) return { label: 'Ayer', tone: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-300' };
  if (days < 0)
    return { label: `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`, tone: 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-300' };
  return { label: format(date, "d 'de' MMMM", { locale: es }), tone: 'bg-secondary text-muted-foreground' };
};

const DueBadge = ({ dueDate }) => {
  const due = getDueLabel(dueDate);
  if (!due) return null;
  return (
    <Badge variant="outline" className={cn('gap-1 border-0', due.tone)}>
      <CalendarClock className="h-3 w-3" aria-hidden="true" />
      {due.label}
    </Badge>
  );
};

const TaskCard = ({ task, isCompleted, onToggle, onDelete, onEdit }) => {
  return (
    <Card
      role="listitem"
      className={cn(
        'group relative flex items-center gap-3 p-4 transition-colors',
        'border-l-4 border-l-primary/70',
        'hover:bg-accent/30',
        isCompleted && 'opacity-85'
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        aria-label={isCompleted ? `Desmarcar ${task.title}` : `Completar ${task.title}`}
        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
        className="group/toggle flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
            isCompleted
              ? 'bg-emerald-500/10'
              : 'bg-secondary/50 ring-1 ring-inset ring-border group-hover/toggle:bg-accent group-hover/toggle:ring-ring/40'
          )}
        >
          {isCompleted ? (
            <CircleCheckBig className="h-7 w-7 animate-check-pop text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Circle className="h-7 w-7 text-muted-foreground/60" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'truncate font-semibold tracking-tight',
              isCompleted && 'text-muted-foreground line-through decoration-2'
            )}
          >
            {task.title}
          </span>
          <DueBadge dueDate={task.dueDate} />
        </div>
        {task.completedAt && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Completada {format(new Date(task.completedAt), "d 'de' MMMM, HH:mm", { locale: es })}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          aria-label={`Editar ${task.title}`}
          title="Editar tarea"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          aria-label={`Eliminar ${task.title}`}
          title="Eliminar tarea"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};

export default TaskCard;
