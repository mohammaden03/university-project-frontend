/**
 * Manuscript AI - Core Accessible UI Components
 */

import React from 'react';

// =============================================================
// Badge Component
// =============================================================
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    amber: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs font-medium px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// =============================================================
// Button Component
// =============================================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-amber-700 hover:bg-amber-800 text-white focus:ring-amber-600 shadow-sm shadow-amber-900/10 dark:bg-amber-600 dark:hover:bg-amber-500',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 focus:ring-stone-400',
    outline: 'border border-stone-300 hover:bg-stone-50 text-stone-700 dark:border-stone-700 dark:hover:bg-stone-800 dark:text-stone-200 focus:ring-stone-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600',
    ghost: 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 focus:ring-stone-400',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

// =============================================================
// Empty State Component
// =============================================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl my-4">
      {icon && <div className="p-3 mb-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-stone-500">{icon}</div>}
      <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="sm" leftIcon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// =============================================================
// Loading Spinner
// =============================================================
export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'در حال دریافت اطلاعات...',
  size = 'md',
}) => {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-stone-500">
      <div className={`${sizeClass} border-amber-600 border-t-transparent rounded-full animate-spin`} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

// =============================================================
// Error Alert
// =============================================================
export interface ErrorAlertProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'خطا در برقراری ارتباط با سامانه',
  message,
  details,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-900 dark:text-rose-200 my-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
          {details && (
            <p className="text-xs font-mono mt-2 p-2 bg-rose-100/50 dark:bg-rose-900/50 rounded">
              {details}
            </p>
          )}
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="border-rose-300 dark:border-rose-700 shrink-0">
            تلاش مجدد
          </Button>
        )}
      </div>
    </div>
  );
};
