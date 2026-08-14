import React, { useState } from 'react';
import { toast } from 'sonner';
import { BellRing, Smartphone, Download, Info, Clock, ListTodo, AlarmClock, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { cn } from '@/lib/utils';

const INTERVALS = [2, 3, 4, 6];

const fieldClass =
  'flex h-11 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base text-foreground sm:h-10 sm:text-sm';

const Settings = ({ reminders, habits, tasks }) => {
  const { settings, supported, permission, canInstall, installApp, sendTestNotification } = reminders;

  const [enabled, setEnabled] = useState(settings.enabled);
  const [intervalHours, setIntervalHours] = useState(settings.intervalHours);
  const [startHour, setStartHour] = useState(settings.startHour);
  const [endHour, setEndHour] = useState(settings.endHour);
  const [tasksEnabled, setTasksEnabled] = useState(settings.tasksEnabled);
  const [taskReminderHour, setTaskReminderHour] = useState(settings.taskReminderHour);
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
    const patch = { enabled, intervalHours, startHour, endHour, habitIds: [...selected], tasksEnabled, taskReminderHour };
    reminders.updateSettings(patch);
    const ok = await reminders.scheduleNow(patch);

    if (!enabled && !tasksEnabled) {
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
    const labels = [];
    if (enabled) labels.push(`cada ${intervalHours}h`);
    if (tasksEnabled) labels.push('para tus tareas');
    toast.success(`Recordatorios activados ${labels.join(' y ')}`);
  };

  const handleTest = async () => {
    const result = await sendTestNotification();
    if (result.ok === false) {
      if (result.status === 'denied') {
        toast.warning('Bloqueaste las notificaciones. Actívalas para este sitio en tu navegador.');
      } else if (result.status === 'unsupported') {
        toast.error('Tu navegador no soporta notificaciones.');
      } else {
        toast.error('No se pudo enviar la prueba. Instala la app y vuelve a intentarlo.');
      }
      return;
    }
    if (result.status === 'sent') {
      toast.success('Notificación de prueba enviada. Revisa tu pantalla.');
    } else if (result.status === 'inapp') {
      toast('Aviso de prueba (dentro de la app)', {
        description:
          'Este navegador no soporta notificaciones del sistema; así se verán tus recordatorios.',
      });
    }
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
                <div className="relative">
                  <select
                    id="interval"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className={cn(fieldClass, 'cursor-pointer appearance-none pr-10')}
                  >
                    {INTERVALS.map((h) => (
                      <option key={h} value={h}>Cada {h} horas</option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
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

      <Card className="p-5 sm:p-6">
        <CardHeader className="flex-row items-center gap-3 space-y-0 p-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ListTodo className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg">Recordatorios de tareas</CardTitle>
            <CardDescription>
              Avisos el día anterior y el día de la fecha límite de tus tareas pendientes
            </CardDescription>
          </div>
        </CardHeader>

        <Separator className="my-4" />

        <CardContent className="space-y-5 p-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Activar recordatorios de tareas</p>
              <p className="text-sm text-muted-foreground">
                Recibirás «¿Ya hiciste la tarea?» o «No has hecho la tarea» por cada tarea con fecha
              </p>
            </div>
            <Switch checked={tasksEnabled} onCheckedChange={setTasksEnabled} aria-label="Activar recordatorios de tareas" />
          </div>

          {tasksEnabled && (
            <div className="space-y-2">
              <label htmlFor="task-reminder-hour" className="flex items-center gap-2 text-sm font-medium">
                <AlarmClock className="h-4 w-4" aria-hidden="true" />
                Hora del recordatorio
              </label>
              <input
                id="task-reminder-hour"
                type="time"
                value={taskReminderHour}
                onChange={(e) => setTaskReminderHour(e.target.value)}
                className={fieldClass}
              />
              <p className="text-xs text-muted-foreground">
                {tasks.length === 0
                  ? 'Aún no tienes tareas. Crea una en «Tareas» para que te avisemos.'
                  : `${tasks.filter((t) => !t.completed && t.dueDate).length} tarea${tasks.filter((t) => !t.completed && t.dueDate).length !== 1 ? 's' : ''} pendiente${tasks.filter((t) => !t.completed && t.dueDate).length !== 1 ? 's' : ''} con fecha programada.`}
              </p>
            </div>
          )}
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

      <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={handleTest}>
          <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
          Probar notificación
        </Button>
        <Button onClick={handleSave} disabled={(enabled && selected.size === 0) && !tasksEnabled}>
          Guardar recordatorios
        </Button>
      </div>
    </main>
  );
};

export default Settings;