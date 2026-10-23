/**
 * Manuscript AI - Dashboard Page
 * 
 * Complies with Section 10 Master Prompt:
 * - Real database metrics retrieved from /api/v1/dashboard/stats
 * - Total books, manuscript pages, completed/pending/failed jobs, awaiting review, datasets, models
 * - Recent books & recent recognition jobs
 * - Quick action shortcuts
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Database,
  Cpu,
  Plus,
  Upload,
  ScanText,
  Search,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { dashboardApi } from '../api/research.api';
import { booksApi } from '../api/books.api';
import { recognitionApi } from '../api/transcriptions.api';
import { DashboardStats, Book, RecognitionJob } from '../api/types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export interface DashboardPageProps {
  navigate: (route: string, params?: Record<string, any>) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecognitionJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, booksRes, jobsRes] = await Promise.all([
        dashboardApi.getStats(),
        booksApi.listBooks(),
        recognitionApi.listRecognitionJobs(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (booksRes.success && booksRes.data) {
        setRecentBooks(booksRes.data.slice(0, 5));
      }
      if (jobsRes.success && jobsRes.data) {
        setRecentJobs(jobsRes.data.slice(0, 5));
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در ارتباط با سرور و دریافت آمارهای پیشخوان');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-l from-amber-900/30 via-stone-900 to-stone-900 border border-stone-800 text-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">
            خوش‌آمدید، {user ? user.displayName : 'پژوهشگر گرامی'}
          </h2>
          <p className="text-xs text-stone-400">
            سامانه بازشناسی خط کهن (HTR) و تصحیح انتقادی نسخ خطی فارسی و عربی دانشگاه تهران
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('books')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            ثبت نسخه جدید
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('recognition')}
            leftIcon={<ScanText className="w-4 h-4" />}
          >
            شروع بازشناسی
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('backend-review')}
            leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
          >
            بهینه‌سازی بک‌اند
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchStats} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت داده‌های آماری پایگاه داده..." />
      ) : stats ? (
        <>
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="تعداد کتب ثبت‌شده"
              value={stats.totalBooks ?? 0}
              subtitle="نسخه‌های خطی کاتالوگ‌شده"
              icon={<BookOpen className="w-5 h-5" />}
              variant="amber"
              onClick={() => navigate('books')}
            />
            <StatCard
              title="برگ‌های اسکن‌شده"
              value={stats.totalManuscriptPages ?? 0}
              subtitle="فولیوهای با کیفیت بالا"
              icon={<FileText className="w-5 h-5" />}
              variant="stone"
              onClick={() => navigate('books')}
            />
            <StatCard
              title="بازشناسی‌های موفق"
              value={stats.completedRecognitionJobs ?? 0}
              subtitle="استخراج کامل متن HTR"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="emerald"
              onClick={() => navigate('recognition')}
            />
            <StatCard
              title="در انتظار بازبینی"
              value={stats.transcriptionsAwaitingReview ?? 0}
              subtitle="نیازمند تایید مصحح"
              icon={<FileCheck2 className="w-5 h-5" />}
              variant="blue"
              onClick={() => navigate('transcriptions')}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-stone-500">در صف پردازش HTR:</span>
              <span className="text-sm font-mono font-bold text-amber-600">
                {(stats.pendingRecognitionJobs ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-stone-500">پردازش‌های ناموفق:</span>
              <span className="text-sm font-bold text-rose-600">
                {(stats.failedRecognitionJobs ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-stone-500">نمونه‌های برچسب‌خورده:</span>
              <span className="text-sm font-bold text-indigo-600">
                {(stats.registeredDatasetSamples ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-stone-500">مدل‌های فعال TrOCR:</span>
              <span className="text-sm font-bold text-emerald-600">
                {(stats.availableModels ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Records & Activities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Recent Books */}
            <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  آخرین کتب و نسخ خطی
                </h3>
                <button
                  onClick={() => navigate('books')}
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                >
                  مشاهده همه
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {recentBooks.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">هنوز کتابی ثبت نشده است.</p>
                ) : (
                  recentBooks.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`book-${b.id}`)}
                      className="py-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850 px-2 rounded-lg transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          {b.author || 'نویسنده نامشخص'} • {b.estimatedDate || 'دوره تاریخی نامشخص'}
                        </p>
                      </div>
                      <Badge variant={b.language === 'fa' ? 'amber' : 'purple'} size="sm">
                        {b.language === 'fa' ? 'فارسی' : b.language === 'ar' ? 'عربی' : b.language}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent HTR Jobs */}
            <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ScanText className="w-4 h-4 text-emerald-600" />
                  آخرین پردازش‌های بازشناسی خط (HTR)
                </h3>
                <button
                  onClick={() => navigate('recognition')}
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                >
                  میزکار HTR
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {recentJobs.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">پردازشی در سامانه یافت نشد.</p>
                ) : (
                  recentJobs.map((j) => (
                    <div
                      key={j.id}
                      className="py-3 flex items-center justify-between px-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 font-mono">
                          {j.id}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          مدل: {j.modelId} • {j.recognitionMode === 'FULL_PAGE' ? 'تمام صفحه' : 'سطر به سطر'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {j.processingDurationMs && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            {j.processingDurationMs}ms
                          </span>
                        )}
                        <Badge
                          variant={
                            j.status === 'COMPLETED'
                              ? 'success'
                              : j.status === 'PROCESSING' || j.status === 'QUEUED'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {j.status === 'COMPLETED'
                            ? 'انجام شد'
                            : j.status === 'PROCESSING'
                            ? 'در حال پردازش'
                            : j.status === 'QUEUED'
                            ? 'در صف'
                            : 'ناموفق'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
