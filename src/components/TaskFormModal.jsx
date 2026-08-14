import React, { useEffect, useState } from 'react';
import { addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateKey, getTodayKey } from '../utils/dateUtils';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, CalendarPlus } from 'lucide-react';

const TaskFormModal = ({ open, onOpenChange, onSave, task }) => {
  const isEdit = !!task;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '');
      setDueDate(task?.dueDate ?? '');
    }
  }, [open, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, dueDate });
  };

  const quickDates = [
    { label: 'Hoy', key: getTodayKey() },
    { label: 'Mañana', key: getDateKey(addDays(new Date(), 1)) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza el título o la fecha de tu tarea.'
              : 'Añade una tarea o compromiso y, si quieres, una fecha límite.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="task-title-input">Tarea</Label>
            <Input
              id="task-title-input"
              placeholder="ej. Pagar la renta, llamar al dentista..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date-input">Fecha límite</Label>
            <div className="group relative">
              <input
                id="task-due-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base text-foreground [color-scheme:dark] transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10 sm:text-sm [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <button
                type="button"
                aria-label="Abrir calendario"
                onClick={() => {
                  const el = document.getElementById('task-due-date-input');
                  if (el && typeof el.showPicker === 'function') el.showPicker();
                  el?.focus();
                }}
                className="pointer-events-auto absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CalendarPlus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickDates.map(({ label, key }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(dueDate === key && 'border-primary text-primary')}
                  onClick={() => setDueDate(key)}
                >
                  {label}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDueDate('')}
                className={cn(!dueDate && 'border-primary text-primary')}
              >
                <CalendarPlus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Sin fecha
              </Button>
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate('')}
                  aria-label="Quitar fecha"
                >
                  <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Quitar
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormModal;