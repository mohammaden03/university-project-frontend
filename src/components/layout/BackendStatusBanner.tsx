/**
 * Manuscript AI - Backend Status & Disconnection Banner
 */

import React from 'react';
import { AlertCircle, RefreshCw, Settings, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const BackendStatusBanner: React.FC<{ onOpenSettings?: () => void }> = ({ onOpenSettings }) => {
  const { connectionStatus, apiBaseUrl, checkBackendHealth } = useAuth();

  if (connectionStatus === 'CONNECTED') {
    return null;
  }

  return (
    <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            {connectionStatus === 'CHECKING' ? (
              'در حال اعتبارسنجی ارتباط با سرور بک‌اند...'
            ) : (
              <>
                ارتباط با سرور بک‌اند در آدرس <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">{apiBaseUrl}</code> برقرار نشد.
                داده‌های فرم و عملیات هوش مصنوعی به سرور متصل نمی‌باشد.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => checkBackendHealth()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تلاش مجدد</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-600/30 hover:bg-amber-500/20 text-amber-900 dark:text-amber-100 font-medium text-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>تغییر آدرس سرور</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const Breadcrumbs: React.FC<{
  items: Array<{ label: string; route?: string }>;
  onNavigate: (route: string) => void;
}> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="موقعیت در سامانه" className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-stone-300 dark:text-stone-700">/</span>}
            {isLast || !item.route ? (
              <span className="font-medium text-stone-800 dark:text-stone-200">{item.label}</span>
            ) : (
              <button
                onClick={() => onNavigate(item.route!)}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
