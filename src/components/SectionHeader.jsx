import React from 'react';
import { cn } from '@/lib/utils';

const SectionHeader = ({ title, count, tone = 'bg-primary/15 text-primary', className }) => (
  <div className={cn('mb-3 flex items-center gap-2', className)}>
    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
    {count !== undefined && count !== null && (
      <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', tone)}>{count}</span>
    )}
  </div>
);

export default SectionHeader;
