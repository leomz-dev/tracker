import React from 'react';
import { subDays } from 'date-fns';
import {
  Flame,
  Trophy,
  CircleCheckBig,
  Target,
  Gauge,
  CalendarCheck,
  Sparkles,
  TrendingUp,
  CalendarDays,
  Award,
  ChartColumn,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import MonthlyHeatmap from '../components/MonthlyHeatmap';
import CompletionStrip from '../components/CompletionStrip';
import WeeklyTrend from '../components/WeeklyTrend';
import WeekdayChart from '../components/WeekdayChart';
import ProgressRing from '../components/ProgressRing';
import SectionHeader from '../components/SectionHeader';
import { getDateKey, getTodayKey } from '../utils/dateUtils';

const HeroMetric = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-3 backdrop-blur-sm">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs leading-tight text-muted-foreground">{label}</p>
      <p className="text-lg font-bold leading-tight tracking-tight">{value}</p>
    </div>
  </div>
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
  const todayKey = getTodayKey();

  const last30 = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
  let slots = 0;
  let completedSlots = 0;
  let perfectDays30 = 0;
  last30.forEach((day) => {
    const key = getDateKey(day);
    const eligible = habits.filter((h) => new Date(h.createdAt).getTime() <= day.getTime());
    if (eligible.length === 0) return;
    const done = eligible.filter((h) => h.completions[key]).length;
    slots += eligible.length;
    completedSlots += done;
    if (done === eligible.length) perfectDays30++;
  });
  const overallRate = slots ? Math.round((completedSlots / slots) * 100) : 0;

  const allStats = habits.map((h) => getHabitStats(h.id)).filter(Boolean);
  const bestStreak = allStats.reduce((max, s) => Math.max(max, s.streak), 0);
  const bestMaxStreak = allStats.reduce((max, s) => Math.max(max, s.maxStreak), 0);
  const totalCheckIns = allStats.reduce((sum, s) => sum + s.totalDays, 0);
  const todayPerfect = habits.length > 0 && habits.every((h) => h.completions[todayKey]);

  const ranking = habits
    .map((h) => ({ habit: h, stats: getHabitStats(h.id) }))
    .filter((x) => x.stats)
    .sort((a, b) => b.stats.completionRate - a.stats.completionRate);

  return (
    <main
      className="h-full space-y-6 overflow-y-auto p-6 pb-28 sm:p-10 sm:pb-10"
      aria-label="Estadísticas"
    >
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <ChartColumn className="h-4 w-4" aria-hidden="true" />
          Resumen
        </p>
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
          <Card className="relative border-primary/25 glow-primary">
            <CardContent className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
              <ProgressRing
                progress={overallRate / 100}
                completedCount={completedSlots}
                totalCount={slots}
                size={160}
              />

              <div className="w-full flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="gradient-text text-2xl font-extrabold leading-none tracking-tight">
                      Tu constancia suma
                    </h2>
                    {todayPerfect && <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" aria-hidden="true" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Completitud global de los últimos 30 días
                  </p>
                </div>

                {todayPerfect && (
                  <Badge className="gap-1 border-0 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    ¡Hoy es un día perfecto!
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroMetric
                    icon={Crown}
                    label="Racha actual"
                    value={`${bestStreak} día${bestStreak !== 1 ? 's' : ''}`}
                    tone="bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
                  />
                  <HeroMetric
                    icon={Trophy}
                    label="Racha máxima"
                    value={`${bestMaxStreak} día${bestMaxStreak !== 1 ? 's' : ''}`}
                    tone="bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                  />
                  <HeroMetric
                    icon={CircleCheckBig}
                    label="Días perfectos"
                    value={perfectDays30}
                    tone="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  />
                  <HeroMetric
                    icon={Target}
                    label="Check-ins totales"
                    value={totalCheckIns}
                    tone="bg-primary/10 text-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <CardHeader className="p-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary" aria-hidden="true">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-lg">Tendencia semanal</CardTitle>
                </div>
                <CardDescription>% de completitud por semana · últimas 6 semanas</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <WeeklyTrend habits={habits} />
              </CardContent>
            </Card>

            <Card className="p-5">
              <CardHeader className="p-0 pb-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" aria-hidden="true">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-lg">Consistencia por día</CardTitle>
                </div>
                <CardDescription>Qué días de la semana completas más</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <WeekdayChart habits={habits} />
              </CardContent>
            </Card>
          </div>

          <Card className="p-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg">Actividad diaria</CardTitle>
              <CardDescription>Check-ins por día · últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <CompletionStrip habits={habits} />
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="p-0 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" aria-hidden="true">
                  <Award className="h-4 w-4" />
                </span>
                <CardTitle className="text-lg">Ranking de hábitos</CardTitle>
              </div>
              <CardDescription>Ordenados por completitud en los últimos 30 días</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pt-1">
              {ranking.map(({ habit, stats }, idx) => (
                <div key={habit.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/40">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-bold tabular-nums',
                      idx === 0
                        ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : idx === 1
                          ? 'bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-300'
                          : idx === 2
                            ? 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                            : 'bg-secondary text-muted-foreground'
                    )}
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-base" style={{ background: `${habit.color}22`, color: habit.color }}>
                      {habit.emoji}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{habit.name}</span>
                      <span className="text-sm font-bold tabular-nums">{stats.completionRate}%</span>
                    </div>
                    <div className="mt-1.5">
                      <Progress
                        value={stats.completionRate}
                        className="h-2"
                        indicatorClassName="bg-[var(--habit-color)]"
                        style={{ ['--habit-color']: habit.color }}
                      />
                    </div>
                  </div>
                  {stats.streak > 0 && (
                    <Badge variant="secondary" className="hidden shrink-0 gap-1 sm:inline-flex">
                      <Flame className="h-3 w-3 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                      {stats.streak}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <SectionHeader title="Detalle por hábito" count={habits.length} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" role="list" aria-label="Detalle por hábito">
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
                      <StatRow icon={Gauge} label="Completitud" value={`${stats.completionRate}%`} />
                      <StatRow icon={CircleCheckBig} label="Completados" value={`${stats.totalDays} días`} />

                      <div className="pt-4">
                        <p className="mb-2 text-xs text-muted-foreground">Calendario (12 semanas)</p>
                        <MonthlyHeatmap completions={habit.completions} color={habit.color} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Stats;