import React from 'react';
import { CircleCheckBig, Circle, Trash2, Pencil, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import WeekHeatmap from './WeekHeatmap';

const HabitCard = ({ habit, isCompleted, onToggle, onDelete, onEdit, stats }) => {
  return (
    <Card
      role="listitem"
      className={cn(
        'group relative flex items-center gap-3 border-l-4 p-4 transition-colors',
        'hover:bg-accent/30',
        isCompleted && 'opacity-90'
      )}
      style={{ borderLeftColor: habit.color }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(habit.id);
        }}
        aria-label={isCompleted ? `Desmarcar ${habit.name}` : `Completar ${habit.name}`}
        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isCompleted ? (
          <CircleCheckBig className="h-7 w-7 animate-check-pop" style={{ color: habit.color }} />
        ) : (
          <Circle className="h-7 w-7 text-muted-foreground/40" />
        )}
      </button>

      <Avatar className="h-11 w-11">
        <AvatarFallback className="text-xl" style={{ background: `${habit.color}22`, color: habit.color }}>
          {habit.emoji}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className={cn('flex items-center gap-2', isCompleted && 'text-muted-foreground')}>
          <span className="truncate font-semibold tracking-tight">{habit.name}</span>
          {stats?.streak > 0 && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Flame className="h-3 w-3 text-orange-400" aria-hidden="true" />
              {stats.streak}
            </Badge>
          )}
        </div>
        <div className="mt-2">
          <WeekHeatmap completions={habit.completions} color={habit.color} />
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(habit);
          }}
          aria-label={`Editar ${habit.name}`}
          title="Editar hábito"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit.id);
          }}
          aria-label={`Eliminar ${habit.name}`}
          title="Eliminar hábito"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};

export default HabitCard;