/**
 * Manuscript AI - Transcription Review & Approval Workflow
 * 
 * Complies with Section 16 & 17 Master Prompt:
 * - Review queue for academic scholars
 * - Filter by reviewStatus: PENDING_REVIEW, REVIEWED, APPROVED
 * - One-click approval with RBAC checks
 */

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Eye,
  Check,
  Search,
} from 'lucide-react';
import { searchApi } from '../api/research.api';
import { transcriptionsApi } from '../api/transcriptions.api';
import { SearchResult, ReviewStatus } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export interface TranscriptionReviewPageProps {
  navigate: (route: string, params?: Record<string, any>) => void;
}

export const TranscriptionReviewPage: React.FC<TranscriptionReviewPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use search API with reviewStatus filter
      const res = await searchApi.search({
        q: '',
        reviewStatus: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در دریافت فهرست بازنویسی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const handleApprove = async (transcriptionId: string) => {
    try {
      await transcriptionsApi.approveTranscription(transcriptionId);
      fetchItems();
    } catch (err: any) {
      alert(err?.message || 'خطا در تایید بازنویسی');
    }
  };

  const canApprove = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            صف بازبینی و تایید انتقادی بازنویسی‌ها
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            بررسی صحت خوانش مدل‌های هوش‌مصنوعی و تایید رسمی برای انتشار پژوهشی
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('PENDING_REVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === 'PENDING_REVIEW'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            در انتظار بررسی
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === 'APPROVED'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            تایید شده‌ها
          </button>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              statusFilter === ''
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            همه موارد
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchItems} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت موارد صف بازبینی..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-10 h-10" />}
          title="موردی در این وضعیت یافت نشد"
          description="هیچ برگی در وضعیت انتخابی وجود ندارد یا تمام متون بازنویسی شده تایید گردیده‌اند."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.transcriptionId}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.reviewStatus === 'APPROVED'
                        ? 'success'
                        : item.reviewStatus === 'REVIEWED'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {item.reviewStatus === 'APPROVED'
                      ? 'تایید شده'
                      : item.reviewStatus === 'REVIEWED'
                      ? 'بررسی شده'
                      : 'در انتظار بازبینی'}
                  </Badge>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    {item.bookTitle}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">({item.folioLabel})</span>
                </div>

                <p className="font-manuscript text-base text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate('recognition', { pageId: item.pageId, bookId: item.bookId })
                  }
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  مشاهده در ویرایشگر
                </Button>

                {canApprove && item.reviewStatus !== 'APPROVED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(item.transcriptionId)}
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    تایید نهایی
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
