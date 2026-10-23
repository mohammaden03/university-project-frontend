/**
 * Manuscript AI - Advanced Historical Corpus Search Page
 * 
 * Complies with Section 18 Master Prompt:
 * - Full-text query with backend Persian/Arabic normalization
 * - Filters: book, language, review status
 * - Excerpt snippet highlighting
 * - Direct links to folio image & transcription editor
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { searchApi } from '../api/research.api';
import { booksApi } from '../api/books.api';
import { Book, SearchResult } from '../api/types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';

export interface SearchPageProps {
  navigate: (route: string, params?: Record<string, any>) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ navigate }) => {
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load books for filter dropdown
  useEffect(() => {
    booksApi.listBooks().then((res) => {
      if (res.success && res.data) {
        setBooks(res.data);
      }
    });
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await searchApi.search({
        q: query.trim(),
        bookId: selectedBookId || undefined,
        language: languageFilter || undefined,
        reviewStatus: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در اجرای جستجو در سرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setSelectedBookId('');
    setLanguageFilter('');
    setStatusFilter('');
    setResults([]);
    setHasSearched(false);
  };

  // Helper to highlight matching keywords safely without dangerouslySetInnerHTML
  const renderHighlightedSnippet = (snippet: string, term: string) => {
    if (!term.trim()) return <span>{snippet}</span>;
    // Simple word splitter for demonstration
    const words = snippet.split(' ');
    const normalizedTerm = term.trim().toLowerCase();

    return (
      <span>
        {words.map((word, idx) => {
          const isMatch = word.toLowerCase().includes(normalizedTerm);
          return (
            <React.Fragment key={idx}>
              {isMatch ? (
                <mark className="bg-amber-300 dark:bg-amber-600/60 text-stone-900 dark:text-stone-100 px-1 py-0.5 rounded">
                  {word}
                </mark>
              ) : (
                word
              )}{' '}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-600" />
          جستجوی پیشرفته در متون و نسخ خطی
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          موتور جستجوی فازی مجهز به یکسان‌سازی رسم‌الخط‌های تاریخی (الف، ی، ک، تطویل و اعراب)
        </p>
      </div>

      {/* Search Bar & Multi-Filter Form */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="واژه یا عبارت مورد نظر خود را بنویسید (مثال: خرد، فردوسی، حکمت، نور...)"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-manuscript"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="px-6 shrink-0"
              leftIcon={<Search className="w-4 h-4" />}
            >
              جستجو
            </Button>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            {/* Book Filter */}
            <div>
              <label className="block text-stone-500 mb-1">محدود به نسخه خطی:</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200"
              >
                <option value="">تمام کتب موجود</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-stone-500 mb-1">زبان نسخه:</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200"
              >
                <option value="">تمام زبان‌ها</option>
                <option value="fa">فارسی</option>
                <option value="ar">عربی</option>
                <option value="ota">ترکی عثمانی</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-stone-500 mb-1">وضعیت بازبینی:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200"
              >
                <option value="">تمام وضعیت‌ها</option>
                <option value="APPROVED">تایید نهایی شده</option>
                <option value="PENDING_REVIEW">در انتظار بازبینی</option>
              </select>
            </div>
          </div>

          {hasSearched && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                پاکسازی فیلترها و نتایج
              </button>
            </div>
          )}
        </form>
      </div>

      {error && <ErrorAlert message={error} onRetry={() => handleSearch()} />}

      {/* Results Section */}
      {isLoading ? (
        <LoadingSpinner label="در حال جستجو و انطباق واژگان در پایگاه داده..." />
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          icon={<Search className="w-10 h-10" />}
          title="نتیجه‌ای یافت نشد"
          description="عبارتی مطابق با درخواست شما در متون بازنویسی شده پیدا نشد. املای واژه را بررسی یا فیلترها را حذف فرمایید."
        />
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>تعداد نتایج منطبق: <strong>{results.length.toLocaleString('fa-IR')} مورد</strong></span>
          </div>

          {results.map((r, i) => (
            <div
              key={`${r.transcriptionId}-${i}`}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-3 hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant={r.language === 'fa' ? 'amber' : 'purple'} size="sm">
                    {r.language === 'fa' ? 'فارسی' : r.language === 'ar' ? 'عربی' : r.language}
                  </Badge>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {r.bookTitle}
                  </span>
                  <span className="text-stone-400 font-mono">({r.folioLabel})</span>
                </div>

                <Badge
                  variant={r.reviewStatus === 'APPROVED' ? 'success' : 'warning'}
                  size="sm"
                >
                  {r.reviewStatus === 'APPROVED' ? 'تایید شده' : 'در انتظار بررسی'}
                </Badge>
              </div>

              {/* Matched Excerpt */}
              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl font-manuscript text-base leading-relaxed text-stone-800 dark:text-stone-200 border border-stone-100 dark:border-stone-800">
                {renderHighlightedSnippet(r.snippet, query)}
              </div>

              {/* Link to folio */}
              <div className="flex justify-end pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate('recognition', { pageId: r.pageId, bookId: r.bookId })
                  }
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  مشاهده برگ در میزکار
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
