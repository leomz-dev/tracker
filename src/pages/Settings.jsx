import React, { useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Smartphone, Download, Info, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { cn } from '@/lib/utils';

const INTERVALS = [2, 3, 4, 6];

const fieldClass =
  'flex h-11 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base text-foreground sm:h-10 sm:text-sm';

const Settings = ({ reminders, habits }) => {
  const { settings, supported, permission, canInstall, installApp } = reminders;

  const [enabled, setEnabled] = useState(settings.enabled);
  const [intervalHours, setIntervalHours] = useState(settings.intervalHours);
  const [startHour, setStartHour] = useState(settings.startHour);
  const [endHour, setEndHour] = useState(settings.endHour);
  const [selected, setSelected] = useState(
    () =>
      new Set(settings.habitIds.length > 0 ? settings.habitIds : habits.map((h) => h.id))
  );

  const toggleHabit = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    reminders.updateSettings({ enabled, intervalHours, startHour, endHour, habitIds: [...selected] });
    const ok = await reminders.scheduleNow({
      enabled,
      intervalHours,
      startHour,
      endHour,
      habitIds: [...selected],
    });

    if (!enabled) {
      toast.success('Recordatorios desactivados');
      return;
    }
    if (permission !== 'granted' || !ok) {
      toast.warning('Concede el permiso de notificaciones para activarlos');
      return;
    }
    if (!supported) {
      toast.warning('Tu navegador no soporta notificaciones programadas: se mostrarán avisos dentro de la app');
      return;
    }
    toast.success(`Recordatorios activados cada ${intervalHours}h`);
  };

  return (
    <main
      className="h-full space-y-6 overflow-y-auto p-6 pb-28 sm:p-10 sm:pb-10"
      aria-label="Ajustes"
    >
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Configuración
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ajustes</h1>
        <p className="text-muted-foreground">Controla cómo y cuándo te recordamos tus hábitos</p>
      </header>

      <Card className="p-5 sm:p-6">
        <CardHeader className="flex-row items-center gap-3 space-y-0 p-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BellRing className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg">Recordatorios</CardTitle>
            <CardDescription>Notificaciones cada 3 horas preguntando por tus hábitos</CardDescription>
          </div>
        </CardHeader>

        <Separator className="my-4" />

        <CardContent className="space-y-5 p-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Activar recordatorios</p>
              <p className="text-sm text-muted-foreground">
                Se programan los próximos 7 días y se refrescan al abrir la app
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Activar recordatorios" />
          </div>

          {enabled && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="interval" className="text-sm font-medium">Recordar cada</label>
                <select
                  id="interval"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className={cn(fieldClass, 'appearance-none')}
                >
                  {INTERVALS.map((h) => (
                    <option key={h} value={h}>Cada {h} horas</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start-hour" className="text-sm font-medium">Desde</label>
                  <input
                    id="start-hour"
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="end-hour" className="text-sm font-medium">Hasta</label>
                  <input
                    id="end-hour"
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Hábitos a recordar</p>
                {habits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todavía no tienes hábitos. Crea uno en «Hoy» para poder recordarlo.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {habits.map((habit) => (
                      <li key={habit.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border/60 px-3 py-2.5 transition-colors hover:bg-accent">
                          <input
                            type="checkbox"
                            checked={selected.has(habit.id)}
                            onChange={() => toggleHabit(habit.id)}
                            className="h-5 w-5 accent-[#7c5cbf]"
                          />
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                            style={{ background: `${habit.color}22`, color: habit.color }}
                            aria-hidden="true"
                          >
                            {habit.emoji}
                          </span>
                          <span className="truncate text-sm font-medium">{habit.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div
            className={cn(
              'flex items-start gap-2 rounded-lg border p-3 text-sm',
              !supported
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                : permission === 'denied'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : permission === 'default'
                    ? 'border-border bg-muted/40 text-muted-foreground'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            )}
            role="status"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              {!supported
                ? 'Este navegador no soporta notificaciones programadas (solo Chrome en Android). Se mostrarán avisos dentro de la app mientras esté abierta.'
                : permission === 'denied'
                  ? 'Bloqueaste las notificaciones. Actívalas para este sitio en la configuración de tu navegador.'
                  : permission === 'default'
                    ? 'Al guardar se pedirá tu permiso para enviar notificaciones.'
                    : 'Permiso concedido. Recibirás notificaciones aunque la app esté cerrada.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {canInstall && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Instala HabitFlow</p>
              <p className="text-sm text-muted-foreground">
                Para recibir las notificaciones de forma fiable, agrégala a tu pantalla de inicio.
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={installApp} className="shrink-0">
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Instalar app
          </Button>
        </Card>
      )}

      <div className="mt-auto flex justify-end">
        <Button onClick={handleSave} disabled={enabled && selected.size === 0}>
          Guardar recordatorios
        </Button>
      </div>
    </main>
  );
};

export default Settings;