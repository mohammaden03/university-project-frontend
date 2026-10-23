/**
 * Manuscript AI - Application Header with Status, Quick Role Switcher, and Theme Toggle
 */

import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Search,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../api/types';

export interface AppHeaderProps {
  onToggleSidebar: () => void;
  navigate: (route: string) => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
  navigate,
  title = 'پیشخوان سامانه',
}) => {
  const { user, connectionStatus, logout, checkBackendHealth, apiBaseUrl } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    await checkBackendHealth();
    setTimeout(() => setIsChecking(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 lg:px-8 flex items-center justify-between">
      {/* Right side: Sidebar toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="باز کردن منو"
          className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{title}</h2>
          <span className="hidden sm:inline-block text-xs text-stone-500 dark:text-stone-400">
            دانشگاه تهران • مرکز پردازش هوشمند اسناد تاریخی
          </span>
        </div>
      </div>

      {/* Left side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search trigger */}
        <button
          onClick={() => navigate('search')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs border border-stone-200 dark:border-stone-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>جستجوی واژگان در نسخ...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-stone-200 dark:bg-stone-700 rounded font-mono">⌘K</kbd>
        </button>

        {/* Backend Review shortcut button */}
        <button
          onClick={() => navigate('backend-review')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-xs font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>بهینه‌سازی بک‌اند</span>
        </button>

        {/* Backend Connection Status Badge */}
        <div
          onClick={handleHealthCheck}
          title={`اتصال بک‌اند: ${apiBaseUrl} (برای بررسی مجدد کلیک کنید)`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer select-none transition-colors ${
            connectionStatus === 'CONNECTED'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : connectionStatus === 'CHECKING' || isChecking
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          {connectionStatus === 'CONNECTED' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          )}
          <span className="hidden sm:inline">
            {connectionStatus === 'CONNECTED'
              ? 'بک‌اند فعال'
              : connectionStatus === 'CHECKING' || isChecking
              ? 'بررسی اتصال...'
              : 'قطع ارتباط بک‌اند'}
          </span>
          <RefreshCw className={`w-3 h-3 opacity-60 ${isChecking ? 'animate-spin' : ''}`} />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="تغییر تم روز و شب"
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>

        {/* User Account / Session Profile */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                {user.displayName.charAt(0)}
              </div>
              <span className="hidden md:inline text-stone-700 dark:text-stone-300">
                {user.displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود</span>
            </button>
          )}

          {showUserMenu && user && (
            <div
              className="absolute left-0 mt-2 w-72 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 text-right animate-in fade-in zoom-in-95"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  {user.displayName}
                </p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">{user.email}</p>
                <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  نقش کاربری: {user.role}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => navigate('settings')}
                  className="w-full text-right px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  تنظیمات اتصال و API
                </button>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('users')}
                    className="w-full text-right px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    مدیریت پژوهشگران
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 px-2">
                <button
                  onClick={async () => {
                    await logout();
                    navigate('login');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
                >
                  <span>خروج از حساب کاربری</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
