import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
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

const EMOJIS = [
  '🧘', '🏃', '📚', '💧', '🥗', '😴', '🎨', '🎸',
  '💪', '🧠', '✍️', '🌿', '☀️', '🏊', '🚴', '🎯',
  '🍎', '💊', '🧹', '📝', '🎵', '🌙', '🤸', '🧗',
];

const COLORS = [
  '#3b6fc4', '#5b8af0', '#38bdf8', '#22d3ee',
  '#34d399', '#4ade80', '#fbbf24', '#fb923c',
  '#f87171', '#f472b6', '#a78bfa', '#64748b',
];

const HabitFormModal = ({ open, onOpenChange, onSave, habit }) => {
  const isEdit = !!habit;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('#3b6fc4');

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '');
      setEmoji(habit?.emoji ?? '🎯');
      setColor(habit?.color ?? '#3b6fc4');
    }
  }, [open, habit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, emoji, color });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar hábito' : 'Nuevo hábito'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza el nombre, icono o color de tu hábito.'
              : 'Define un hábito que quieras construir en tu rutina diaria.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="habit-name-input">Nombre</Label>
            <Input
              id="habit-name-input"
              placeholder="ej. Meditación, Ejercicio..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-8 gap-1.5" role="group" aria-label="Seleccionar emoji">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  aria-label={`Emoji ${e}`}
                  aria-pressed={emoji === e}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-md text-lg transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    emoji === e ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-accent'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar color">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  className={cn(
                    'h-10 w-10 rounded-full transition-transform',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    color === c && 'scale-110 ring-2 ring-offset-2 ring-offset-background'
                  )}
                  style={{
                    background: c,
                    ...(color === c ? { '--tw-ring-color': c } : {}),
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEdit ? 'Guardar cambios' : 'Crear hábito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitFormModal;