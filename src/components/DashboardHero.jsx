import React from 'react';
import { Card, CardContent } from './ui/card';
import ProgressRing from './ProgressRing';
import { Flame, Target, CircleCheckBig, Sparkles } from 'lucide-react';

const MetricTile = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3 backdrop-blur-sm">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs leading-tight text-muted-foreground">{label}</p>
      <p className="text-lg font-bold leading-tight tracking-tight">{value}</p>
    </div>
  </div>
);

const DashboardHero = ({ habits, getHabitStats, todayProgress, todayCompletedCount }) => {
  const bestStreak = habits.reduce((max, habit) => {
    const stats = getHabitStats(habit.id);
    return Math.max(max, stats?.streak ?? 0);
  }, 0);

  const allDone = habits.length > 0 && todayCompletedCount === habits.length;

  return (
    <Card className="relative overflow-hidden border-primary/20 glow-primary">
      <div className="gradient-primary absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <CardContent className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        <ProgressRing
          progress={todayProgress}
          completedCount={todayCompletedCount}
          totalCount={habits.length}
        />

        <div className="w-full flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="gradient-text text-2xl font-extrabold leading-none tracking-tight">
              {allDone ? '¡Día perfecto!' : 'Tu progreso hoy'}
            </span>
            {allDone && <Sparkles className="h-5 w-5 text-amber-400" aria-hidden="true" />}
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricTile
              icon={Flame}
              label="Racha máxima"
              value={`${bestStreak} día${bestStreak !== 1 ? 's' : ''}`}
              tone="bg-orange-500/15 text-orange-400"
            />
            <MetricTile
              icon={Target}
              label="Hábitos creados"
              value={habits.length}
              tone="bg-violet-500/15 text-violet-400"
            />
            <MetricTile
              icon={CircleCheckBig}
              label="Completados hoy"
              value={`${todayCompletedCount}/${habits.length}`}
              tone="bg-emerald-500/15 text-emerald-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHero;