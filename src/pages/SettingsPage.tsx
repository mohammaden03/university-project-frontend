/**
 * Manuscript AI - Settings & Backend Integration Management
 * 
 * Complies with Section 2 & 29 Master Prompt:
 * - Dynamic VITE_API_BASE_URL configuration
 * - Direct health probe test
 * - Embedded Swagger / OpenAPI documentation
 */

import React, { useState } from 'react';
import {
  Settings,
  Server,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Key,
  Shield,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { setCustomApiBaseUrl } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { apiBaseUrl, connectionStatus, checkBackendHealth, user } = useAuth();
  const [customUrl, setCustomUrl] = useState<string>(apiBaseUrl);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'swagger'>('connection');

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiBaseUrl(customUrl.trim() || null);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    checkBackendHealth();
  };

  const handleResetDefault = () => {
    setCustomApiBaseUrl(null);
    setCustomUrl('/api/v1');
    checkBackendHealth();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await checkBackendHealth();
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" />
          تنظیمات ارتباط با سرور و معماری API
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          پیکربندی آدرس پایگاه داده، بررسی تست پایداری شبکه و مطالعه مستندات رسمی OpenAPI 3.0
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('connection')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'connection'
              ? 'bg-amber-600 text-white'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          تنظیمات اتصال سرور (VITE_API_BASE_URL)
        </button>
        <button
          onClick={() => setActiveTab('swagger')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'swagger'
              ? 'bg-amber-600 text-white'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          مستندات تعاملی Swagger و OpenAPI
        </button>
      </div>

      {activeTab === 'connection' ? (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-stone-500" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  وضعیت اتصال به سرور بک‌اند
                </h3>
              </div>
              <Badge
                variant={connectionStatus === 'CONNECTED' ? 'success' : 'danger'}
              >
                {connectionStatus === 'CONNECTED' ? 'متصل و عملیاتی' : 'ارتباط قطع است'}
              </Badge>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  آدرس پایه REST API (VITE_API_BASE_URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    dir="ltr"
                    placeholder="http://localhost:3000/api/v1 یا /api/v1"
                    className="flex-1 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    ذخیره و اعمال
                  </Button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  پیش‌فرض سرور محلی: <code className="font-mono">http://localhost:3000/api/v1</code> یا پراکسی نسبی <code className="font-mono">/api/v1</code>
                </p>
              </div>

              {isSaved && (
                <p className="text-emerald-600 text-xs flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  آدرس با موفقیت ذخیره گردید و فرآیند اتصال مجدد آزمایش شد.
                </p>
              )}

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  isLoading={isTesting}
                  onClick={handleTestConnection}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  تست سلامت سرور (/health)
                </Button>

                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-stone-400 hover:text-stone-600 text-[11px]"
                >
                  بازنشانی به پیش‌فرض سامانه
                </button>
              </div>
            </form>
          </div>

          {/* Active Session Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-3 text-xs shadow-xs">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              اطلاعات نشست و توکن امنیتی JWT
            </h3>
            {user ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-stone-400 block">کاربر لاگین شده:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{user.displayName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">پست الکترونیکی:</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">{user.email}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">نقش در سامانه:</span>
                  <span className="font-mono font-bold text-amber-600">{user.role}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">الگوریتم رمزنگاری:</span>
                  <span className="font-mono text-stone-600 dark:text-stone-400">HMAC-SHA256 (PBKDF2 Salted)</span>
                </div>
              </div>
            ) : (
              <p className="text-stone-500">کاربری وارد نشده است (حالت مهمان).</p>
            )}
          </div>
        </div>
      ) : (
        /* Swagger UI Tab */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                مستندات استاندارد OpenAPI 3.0 سرور
              </span>
              <p className="text-stone-400">نمایش تعاملی مشخصات متدها و اسکیمای DTOهای بک‌اند</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/api/docs-json"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs flex items-center gap-1 font-mono"
              >
                <span>/api/docs-json</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/api/docs"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs flex items-center gap-1"
              >
                <span>باز کردن Swagger در تب جدید</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="w-full h-[600px] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white">
            <iframe
              src="/api/docs"
              title="مستندات Swagger"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'ایمیل یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-600 rounded-2xl text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-amber-900/30">
            M
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            ورود به سامانه Manuscript AI
          </h2>
          <p className="text-xs text-stone-500">
            سامانه دانشگاهی بازشناسی و تصحیح انتقادی نسخ خطی کهن
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              پست الکترونیکی:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.ac.ir"
              dir="ltr"
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              رمز عبور:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              dir="ltr"
              className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-2.5 font-bold"
          >
            ورود به میزکار
          </Button>
        </form>

        {/* Development Email Fillers (Gated for development mode only) */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-xs space-y-2">
            <p className="font-semibold text-stone-500 dark:text-stone-400 text-center text-[11px]">
              انتخاب سریع ایمیل‌های آزمایشی دانشگاهی (محیط توسعه):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEmail('admin@manuscript.ai')}
                className="p-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-medium hover:bg-purple-100"
              >
                مدیر (Admin)
              </button>
              <button
                type="button"
                onClick={() => setEmail('researcher@manuscript.ai')}
                className="p-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium hover:bg-amber-100"
              >
                پژوهشگر (Researcher)
              </button>
              <button
                type="button"
                onClick={() => setEmail('viewer@manuscript.ai')}
                className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium hover:bg-stone-100"
              >
                بیننده (Viewer)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <span className="text-6xl font-bold font-mono text-amber-600">۴۰۴</span>
      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
        صفحه یا منبع درخواستی یافت نشد
      </h3>
      <p className="text-xs text-stone-500 max-w-sm">
        مسیر مورد نظر شما در سامانه وجود ندارد یا ممکن است حذف شده باشد.
      </p>
      <Button variant="primary" size="sm" onClick={onGoHome}>
        بازگشت به پیشخوان سامانه
      </Button>
    </div>
  );
};
