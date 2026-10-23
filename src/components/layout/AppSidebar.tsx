/**
 * Manuscript AI - Responsive RTL Sidebar Navigation
 */

import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ScanText,
  FileCheck2,
  Search,
  Database,
  Cpu,
  BarChart3,
  Flame,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'پیشخوان سامانه',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'books',
      label: 'کتب و نسخ خطی',
      icon: BookOpen,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'recognition',
      label: 'میزکار بازشناسی (HTR)',
      icon: ScanText,
      roles: ['ADMIN', 'RESEARCHER'],
    },
    {
      id: 'transcriptions',
      label: 'بازبینی و تصحیح',
      icon: FileCheck2,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'search',
      label: 'جستجوی پیشرفته متون',
      icon: Search,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'datasets',
      label: 'مجموعه‌داده‌ها و مانیفست',
      icon: Database,
      roles: ['ADMIN', 'RESEARCHER'],
    },
    {
      id: 'models',
      label: 'رجیستری مدل‌های هوش‌مصنوعی',
      icon: Cpu,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'evaluations',
      label: 'گزارش‌های ارزیابی CER/WER',
      icon: BarChart3,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'training',
      label: 'آموزش و بهینه‌سازی مدل',
      icon: Flame,
      roles: ['ADMIN'],
    },
    {
      id: 'backend-review',
      label: 'تحلیل و بهینه‌سازی بک‌اند',
      icon: Zap,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
      highlight: true,
    },
    {
      id: 'users',
      label: 'مدیریت کاربران',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'تنظیمات و اتصال سرور',
      icon: Settings,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
    {
      id: 'api-docs',
      label: 'مستندات Swagger / API',
      icon: Server,
      roles: ['ADMIN', 'RESEARCHER', 'VIEWER'],
    },
  ];

  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes('VIEWER')
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-stone-950/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-stone-900 text-stone-200 border-l border-stone-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold shadow-md shadow-amber-900/40">
              <BookOpen className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-100 tracking-tight">Manuscript AI</h1>
              <p className="text-[11px] text-amber-400 font-medium">سامانه بازشناسی نسخ کهن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن منو"
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Quick Info */}
        {user && (
          <div className="px-5 py-3 mx-3 my-2 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-stone-200 truncate">{user.displayName}</p>
              <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
            </div>
            <Badge
              variant={user.role === 'ADMIN' ? 'purple' : user.role === 'RESEARCHER' ? 'amber' : 'default'}
              size="sm"
            >
              {user.role === 'ADMIN' ? 'مدیر' : user.role === 'RESEARCHER' ? 'پژوهشگر' : 'بیننده'}
            </Badge>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === 'books' && currentRoute.startsWith('book-'));
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                } ${item.highlight ? 'border border-amber-500/40 bg-amber-950/20 text-amber-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/30 text-amber-300 rounded font-semibold">
                    ویژه
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-stone-800 space-y-2">
          {user ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>خروج از حساب کاربری</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium bg-amber-700 hover:bg-amber-600 text-white rounded-xl transition-colors"
            >
              <span>ورود به سامانه</span>
            </button>
          )}

          <div className="pt-2 px-2 text-[10px] text-stone-500 text-center flex items-center justify-between">
            <span>نسخه ۱.۰.۰ — REST v1</span>
            <span className="font-mono text-stone-400">NestJS / Python</span>
          </div>
        </div>
      </aside>
    </>
  );
};
