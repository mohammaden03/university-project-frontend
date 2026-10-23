/**
 * Manuscript AI - Dashboard Stat Card
 */

import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'stone';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'stone',
  onClick,
}) => {
  const colorMap = {
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    blue: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900',
    purple: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    stone: 'text-stone-600 bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800',
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-amber-500/50 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[variant]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
