import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Sprout, Sun, CloudSun, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import HabitCard from '../components/HabitCard';
import DashboardHero from '../components/DashboardHero';
import HabitFormModal from '../components/HabitFormModal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Buenos días', icon: Sun };
  if (hour < 19) return { text: 'Buenas tardes', icon: CloudSun };
  return { text: 'Buenas noches', icon: Moon };
};

const Today = ({ habits, toggleCompletion, isTodayCompleted, addHabit, updateHabit, deleteHabit, restoreHabit, getHabitStats, todayProgress, todayCompletedCount }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const pending = habits.filter((h) => !isTodayCompleted(h.id));
  const completed = habits.filter((h) => isTodayCompleted(h.id));
  const allDone = habits.length > 0 && todayCompletedCount === habits.length;
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
      confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } });
      confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } });
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  const openCreate = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleFormOpenChange = (next) => {
    if (!next) setEditingHabit(null);
    setFormOpen(next);
  };

  const handleSave = (data) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
      toast.success('Hábito actualizado');
    } else {
      addHabit(data);
      toast.success('Hábito creado');
    }
    handleFormOpenChange(false);
  };

  const handleDelete = (id) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    deleteHabit(id);
    toast('Hábito eliminado', {
      action: {
        label: 'Deshacer',
        onClick: () => restoreHabit(habit),
      },
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === 'n') openCreate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className="h-full space-y-6 overflow-y-auto p-6 pb-28 sm:p-10 sm:pb-10"
      aria-label="Vista de hoy"
    >
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <GreetingIcon className="h-4 w-4" aria-hidden="true" />
          {greeting.text}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{todayCapitalized}</h1>
        {habits.length > 0 && (
          <p className="text-muted-foreground">
            {allDone
              ? '¡Todos los hábitos completados!'
              : `${pending.length} hábito${pending.length !== 1 ? 's' : ''} por completar`}
          </p>
        )}
      </header>

      {habits.length > 0 && (
        <DashboardHero
          habits={habits}
          getHabitStats={getHabitStats}
          todayProgress={todayProgress}
          todayCompletedCount={todayCompletedCount}
        />
      )}

      {habits.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sprout className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sin hábitos todavía</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crea tu primer hábito para empezar a construir tu mejor versión.
          </p>
          <Button onClick={openCreate} className="mt-2">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Agregar hábito
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section aria-labelledby="pending-title">
              <h2 id="pending-title" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Pendientes · {pending.length}
              </h2>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2" role="list" aria-label="Hábitos pendientes">
                {pending.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={false}
                    onToggle={toggleCompletion}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                    stats={getHabitStats(habit.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section aria-labelledby="completed-title">
              <h2 id="completed-title" className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Completados · {completed.length}
              </h2>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2" role="list" aria-label="Hábitos completados">
                {completed.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={true}
                    onToggle={toggleCompletion}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                    stats={getHabitStats(habit.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {habits.length > 0 && (
        <Button className="self-start" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Agregar hábito
        </Button>
      )}

      <HabitFormModal
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSave={handleSave}
        habit={editingHabit}
      />
    </main>
  );
};

export default Today;