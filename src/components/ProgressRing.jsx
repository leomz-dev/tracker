import React from 'react';

const ProgressRing = ({ progress = 0, size = 148, strokeWidth = 12, completedCount, totalCount }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;
  const percentage = Math.round(progress * 100);

  return (
    <div
      className="relative shrink-0"
      role="img"
      aria-label={`Progreso del día: ${percentage}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="fill-none stroke-secondary"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="fill-none transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 2px 6px hsl(215 65% 45% / 0.25))' }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="url(#ringGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b6fc4" />
            <stop offset="100%" stopColor="#7ba7e8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-foreground">
          {completedCount}
          <span className="text-lg font-semibold text-muted-foreground">/{totalCount}</span>
        </span>
        <span className="text-xs font-medium text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressRing;