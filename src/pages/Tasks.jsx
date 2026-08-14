import React, { useEffect, useState } from 'react';
import { Plus, ListTodo, CircleCheckBig, AlertTriangle, CalendarClock, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { getTodayKey } from '../utils/dateUtils';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import SectionHeader from '../components/SectionHeader';
import FloatingAdd from '../components/FloatingAdd';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const sortByDueDate = (list) =>
  [...list].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

const StatTile = ({ icon: Icon, label, value, tone }) => (
  <Card className="flex items-center gap-3 p-3.5">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-[11px] leading-tight text-muted-foreground">{label}</p>
      <p className="text-lg font-bold leading-tight tracking-tight">{value}</p>
    </div>
  </Card>
);

const TaskSection = ({ title, tasks, sort, tone, ...handlers }) => {
  if (tasks.length === 0) return null;
  return (
    <section aria-label={title}>
      <SectionHeader title={title} count={tasks.length} tone={tone} />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2" role="list" aria-label={title}>
        {(sort ? sortByDueDate(tasks) : tasks).map((task) => (
          <TaskCard key={task.id} task={task} isCompleted={task.completed} {...handlers} />
        ))}
      </div>
    </section>
  );
};

const Tasks = ({ tasks, addTask, deleteTask, restoreTask, updateTask, toggleTask, getTaskStats }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const todayKey = getTodayKey();
  const stats = getTaskStats();

  const overdue = [];
  const dueToday = [];
  const upcoming = [];
  const noDate = [];
  const completed = [];

  tasks.forEach((t) => {
    if (t.completed) completed.push(t);
    else if (!t.dueDate) noDate.push(t);
    else if (t.dueDate < todayKey) overdue.push(t);
    else if (t.dueDate === todayKey) dueToday.push(t);
    else upcoming.push(t);
  });

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormOpenChange = (next) => {
    if (!next) setEditingTask(null);
    setFormOpen(next);
  };

  const handleSave = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      toast.success('Tarea actualizada');
    } else {
      addTask(data);
      toast.success('Tarea creada');
    }
    handleFormOpenChange(false);
  };

  const handleDelete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    deleteTask(id);
    toast('Tarea eliminada', {
      action: {
        label: 'Deshacer',
        onClick: () => restoreTask(task),
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

  const commonHandlers = { onToggle: toggleTask, onDelete: handleDelete, onEdit: openEdit };

  return (
    <main
      className="h-full space-y-6 overflow-y-auto p-6 pb-28 sm:p-10 sm:pb-10"
      aria-label="Tareas"
    >
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <ListTodo className="h-4 w-4" aria-hidden="true" />
          Lista de tareas
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tareas</h1>
        <p className="text-muted-foreground">
          Compromisos y pendientes con fecha para no olvidar nada
        </p>
      </header>

      {tasks.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            icon={Inbox}
            label="Pendientes"
            value={stats.pending}
            tone="bg-violet-500/15 text-violet-400"
          />
          <StatTile
            icon={CalendarClock}
            label="Para hoy"
            value={stats.dueToday}
            tone="bg-sky-500/15 text-sky-400"
          />
          <StatTile
            icon={AlertTriangle}
            label="Vencidas"
            value={stats.overdue}
            tone="bg-red-500/15 text-red-400"
          />
          <StatTile
            icon={CircleCheckBig}
            label="Completadas"
            value={stats.completed}
            tone="bg-emerald-500/15 text-emerald-400"
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ListTodo className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sin tareas todavía</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Añade compromisos y pendientes con fecha para mantener todo bajo control.
          </p>
          <Button onClick={openCreate} className="mt-2">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Agregar tarea
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <TaskSection title="Vencidas" tasks={overdue} tone="bg-red-500/15 text-red-400" {...commonHandlers} />
          <TaskSection title="Hoy" tasks={dueToday} tone="bg-amber-500/15 text-amber-400" {...commonHandlers} />
          <TaskSection title="Próximas" tasks={upcoming} sort tone="bg-sky-500/15 text-sky-400" {...commonHandlers} />
          <TaskSection title="Sin fecha" tasks={noDate} tone="bg-secondary text-muted-foreground" {...commonHandlers} />
          <TaskSection title="Completadas" tasks={completed} tone="bg-emerald-500/15 text-emerald-400" {...commonHandlers} />
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Agregar tarea
          </Button>
        </div>
      )}

      <FloatingAdd onClick={openCreate} label="Agregar tarea" />

      <TaskFormModal
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSave={handleSave}
        task={editingTask}
      />
    </main>
  );
};

export default Tasks;