import React from 'react';
import { Flame, Trophy, CircleCheckBig, Target, Gauge, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import MonthlyHeatmap from '../components/MonthlyHeatmap';
import CompletionStrip from '../components/CompletionStrip';

const SummaryTile = ({ icon: Icon, label, value, tone }) => (
  <Card className="flex items-center gap-3 p-4">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold leading-tight tracking-tight">{value}</p>
    </div>
  </Card>
);

const StatRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

const Stats = ({ habits, getHabitStats }) => {
  const allStats = habits.map((h) => getHabitStats(h.id)).filter(Boolean);
  const bestStreak = allStats.reduce((max, s) => Math.max(max, s.streak), 0);
  const avgCompletion = allStats.length
    ? Math.round(allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length)
    : 0;

  return (
    <main
      className="h-full space-y-6 overflow-y-auto p-6 pb-28 sm:p-10 sm:pb-10"
      aria-label="Estadísticas"
    >
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Resumen</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Estadísticas</h1>
        <p className="text-muted-foreground">Tu progreso en los últimos 30 días</p>
      </header>

      {habits.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarCheck className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sin datos todavía</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crea hábitos y empieza a hacer check-in para ver tus estadísticas aquí.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={Flame}
              label="Mejor racha activa"
              value={`${bestStreak} día${bestStreak !== 1 ? 's' : ''}`}
              tone="bg-orange-500/15 text-orange-400"
            />
            <SummaryTile
              icon={Target}
              label="Hábitos"
              value={habits.length}
              tone="bg-violet-500/15 text-violet-400"
            />
            <SummaryTile
              icon={Gauge}
              label="Completitud promedio"
              value={`${avgCompletion}%`}
              tone="bg-emerald-500/15 text-emerald-400"
            />
          </div>

          <Card className="p-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Actividad global</CardTitle>
              <CardDescription>Frecuencia de check-ins combinando todos los hábitos</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <CompletionStrip habits={habits} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" role="list" aria-label="Estadísticas por hábito">
            {habits.map((habit) => {
              const stats = getHabitStats(habit.id);
              if (!stats) return null;
              return (
                <Card key={habit.id} role="listitem" className="p-5">
                  <CardHeader className="flex-row items-center gap-3 space-y-0 p-0">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback
                        className="text-xl"
                        style={{ background: `${habit.color}22`, color: habit.color }}
                      >
                        {habit.emoji}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                      <CardDescription>Últimos 30 días</CardDescription>
                    </div>
                  </CardHeader>

                  <Separator className="my-4" />

                  <CardContent className="space-y-1 p-0">
                    <StatRow icon={Flame} label="Racha actual" value={`${stats.streak} días`} />
                    <StatRow icon={Trophy} label="Racha máxima" value={`${stats.maxStreak} días`} />
                    <StatRow icon={CircleCheckBig} label="Completados" value={`${stats.totalDays} días`} />

                    <div className="pt-3">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completitud</span>
                        <span className="font-semibold">{stats.completionRate}%</span>
                      </div>
                      <Progress
                        value={stats.completionRate}
                        indicatorClassName="bg-[var(--habit-color)]"
                        style={{ ['--habit-color']: habit.color }}
                      />
                    </div>

                    <div className="pt-4">
                      <p className="mb-2 text-xs text-muted-foreground">Calendario (12 semanas)</p>
                      <MonthlyHeatmap completions={habit.completions} color={habit.color} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
};

export default Stats;