/**
 * Manuscript AI - HTR Recognition Workspace
 * 
 * Complies with Section 15 & 16 Master Prompt:
 * - Two-pane view: Manuscript Image Viewer + Transcription Editor
 * - Model selector with status flags (pretrained, finetuned, mock)
 * - Job status polling with terminal state resolution
 * - Seamless folio navigation across the active manuscript
 */

import React, { useState, useEffect } from 'react';
import {
  ScanText,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { booksApi, pagesApi } from '../api/books.api';
import { transcriptionsApi } from '../api/transcriptions.api';
import { Book, ManuscriptPage, Transcription } from '../api/types';
import { ManuscriptViewer } from '../components/viewer/ManuscriptViewer';
import { TranscriptionEditor } from '../components/transcription/TranscriptionEditor';
import { RecognitionDialog } from '../components/recognition/RecognitionDialog';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export interface RecognitionWorkspaceProps {
  initialBookId?: string;
  initialPageId?: string;
  navigate: (route: string, params?: Record<string, any>) => void;
}

export const RecognitionWorkspacePage: React.FC<RecognitionWorkspaceProps> = ({
  initialBookId,
  initialPageId,
  navigate,
}) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId || '');
  const [pages, setPages] = useState<ManuscriptPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId || '');
  const [currentPage, setCurrentPage] = useState<ManuscriptPage | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);

  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(true);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState<boolean>(false);
  const [isRecognitionOpen, setIsRecognitionOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load books
  useEffect(() => {
    setIsLoadingBooks(true);
    booksApi
      .listBooks()
      .then((res) => {
        if (res.success && res.data) {
          setBooks(res.data);
          if (!selectedBookId && res.data.length > 0) {
            setSelectedBookId(res.data[0].id);
          }
        }
      })
      .catch((err) => setError(err?.message || 'خطا در بارگذاری فهرست کتب'))
      .finally(() => setIsLoadingBooks(false));
  }, []);

  // Load pages when selectedBookId changes
  useEffect(() => {
    if (!selectedBookId) return;
    booksApi
      .getBookPages(selectedBookId)
      .then((res) => {
        if (res.success && res.data) {
          setPages(res.data);
          if (res.data.length > 0) {
            // Pick matching page or first page
            const match = res.data.find((p) => p.id === selectedPageId);
            const targetPage = match || res.data[0];
            setSelectedPageId(targetPage.id);
            setCurrentPage(targetPage);
          } else {
            setSelectedPageId('');
            setCurrentPage(null);
            setTranscription(null);
          }
        }
      })
      .catch((err) => setError(err?.message || 'خطا در دریافت برگ‌های کتاب'));
  }, [selectedBookId]);

  // Load page details & transcription when selectedPageId changes
  useEffect(() => {
    if (!selectedPageId) return;
    setIsLoadingPage(true);
    pagesApi
      .getPage(selectedPageId)
      .then((res) => {
        if (res.success && res.data) {
          setCurrentPage(res.data);
        }
      })
      .finally(() => setIsLoadingPage(false));

    setIsLoadingTranscription(true);
    transcriptionsApi
      .getPageTranscriptions(selectedPageId)
      .then((res) => {
        if (res.success && res.data) {
          const item = Array.isArray(res.data) ? res.data[0] : res.data;
          setTranscription(item || null);
        } else {
          setTranscription(null);
        }
      })
      .catch(() => setTranscription(null))
      .finally(() => setIsLoadingTranscription(false));
  }, [selectedPageId]);

  // Folio navigation helpers
  const currentIndex = pages.findIndex((p) => p.id === selectedPageId);
  const hasPrevPage = currentIndex > 0;
  const hasNextPage = currentIndex >= 0 && currentIndex < pages.length - 1;

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setSelectedPageId(pages[currentIndex - 1].id);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setSelectedPageId(pages[currentIndex + 1].id);
    }
  };

  const canRecognize = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');
  const canEdit = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');
  const canApprove = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');

  return (
    <div className="space-y-4">
      {/* Top Selector Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Book Dropdown */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 max-w-[200px] sm:max-w-[260px] truncate"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Page Dropdown */}
          {pages.length > 0 && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-400" />
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.folioLabel || `صفحه ${p.pageNumber}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canRecognize && currentPage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRecognitionOpen(true)}
              leftIcon={<ScanText className="w-4 h-4" />}
            >
              {transcription ? 'بازشناسی مجدد صفحه' : 'شروع بازشناسی HTR'}
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Main Two-Pane Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Main Column: Folio Image Viewer */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
              <span>نگاره اسکن‌شده نسخه خطی</span>
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                title="برگ قبلی"
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-stone-400">
                {currentIndex + 1} / {pages.length}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!hasNextPage}
                title="برگ بعدی"
                className="p-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ManuscriptViewer
            page={currentPage}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        </div>

        {/* Right Column: Transcription & HTR Output Editor */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>بازنویسی هوشمند و تصحیح انتقادی</span>
            </span>
          </div>

          {isLoadingTranscription ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
              <LoadingSpinner label="در حال دریافت متن بازنویسی شده..." />
            </div>
          ) : transcription ? (
            <TranscriptionEditor
              transcription={transcription}
              canEdit={!!canEdit}
              canApprove={!!canApprove}
              onSaved={(updated) => setTranscription(updated)}
            />
          ) : (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <ScanText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                هنوز بازنویسی برای این برگ انجام نشده است
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                برای استخراج نویسه‌ها با استفاده از مدل بینایی-زبانی TrOCR یا شبیه‌ساز دانشگاهی، روی دکمه زیر کلیک نمایید.
              </p>
              {canRecognize && currentPage && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsRecognitionOpen(true)}
                  leftIcon={<ScanText className="w-4 h-4" />}
                >
                  ارسال برگ به موتور بازشناسی
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recognition Dialog */}
      {currentPage && (
        <RecognitionDialog
          isOpen={isRecognitionOpen}
          onClose={() => setIsRecognitionOpen(false)}
          pageId={currentPage.id}
          folioLabel={currentPage.folioLabel || `صفحه ${currentPage.pageNumber}`}
          onCompleted={(job) => {
            // Refresh transcription after job completes
            transcriptionsApi.getPageTranscriptions(currentPage.id).then((res) => {
              if (res.success && res.data) {
                const item = Array.isArray(res.data) ? res.data[0] : res.data;
                setTranscription(item || null);
              }
            });
          }}
        />
      )}
    </div>
  );
};
