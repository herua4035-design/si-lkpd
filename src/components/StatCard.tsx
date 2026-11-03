import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'orange' | 'purple' | 'amber' | 'rose' | 'indigo';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      accent: 'from-blue-600 to-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      accent: 'from-emerald-600 to-teal-600',
    },
    orange: {
      bg: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      border: 'hover:border-orange-300 dark:hover:border-orange-700',
      accent: 'from-orange-500 to-amber-600',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      accent: 'from-purple-600 to-pink-600',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-700',
      accent: 'from-amber-500 to-yellow-600',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      accent: 'from-rose-600 to-red-600',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      accent: 'from-indigo-600 to-violet-600',
    },
  };

  const selected = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
        selected.border
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
              <span
                className={
                  trend.isPositive !== false
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400">vs target</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${selected.bg} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selected.accent} opacity-80`} />
    </div>
  );
};
