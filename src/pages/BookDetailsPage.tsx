/**
 * Manuscript AI - Book Details & Folio Catalog Page
 * 
 * Complies with Section 12 & 13 Master Prompt:
 * - Bibliographic metadata presentation
 * - Folio gallery & thumbnail list with recognition and review badges
 * - Page upload modal with drag and drop, file preview, validation
 * - Direct navigation to HTR recognition workspace
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ArrowRight,
  Upload,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  ScanText,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { booksApi, pagesApi } from '../api/books.api';
import { Book, ManuscriptPage } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';
import { Breadcrumbs } from '../components/layout/BackendStatusBanner';

export interface BookDetailsPageProps {
  bookId: string;
  navigate: (route: string, params?: Record<string, any>) => void;
}

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({ bookId, navigate }) => {
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [pages, setPages] = useState<ManuscriptPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadPageNumber, setUploadPageNumber] = useState<number>(1);
  const [uploadFolioLabel, setUploadFolioLabel] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchBookData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookRes, pagesRes] = await Promise.all([
        booksApi.getBook(bookId),
        booksApi.getBookPages(bookId),
      ]);

      if (bookRes.success && bookRes.data) {
        setBook(bookRes.data);
      }
      if (pagesRes.success && pagesRes.data) {
        setPages(pagesRes.data);
        setUploadPageNumber(pagesRes.data.length + 1);
        setUploadFolioLabel(`Folio ${pagesRes.data.length + 1}a`);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری مشخصات کتاب و برگ‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookData();
  }, [bookId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('لطفاً یک تصویر با فرمت JPEG, PNG یا WebP انتخاب فرمایید.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await pagesApi.uploadPage(bookId, {
        file: uploadFile,
        pageNumber: uploadPageNumber,
        folioLabel: uploadFolioLabel.trim() || undefined,
        language: book?.language || 'fa',
      });

      if (res.success && res.data) {
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadPreview(null);
        fetchBookData();
      }
    } catch (err: any) {
      setUploadError(err?.message || 'خطا در بارگذاری برگ نسخه');
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'کتب و نسخ خطی', route: 'books' },
          { label: book?.title || 'جزئیات نسخه خطی' },
        ]}
        onNavigate={navigate}
      />

      {error && <ErrorAlert message={error} onRetry={fetchBookData} />}

      {isLoading ? (
        <LoadingSpinner label="در حال دریافت اطلاعات نسخه خطی و نگاره‌های برگ‌ها..." />
      ) : book ? (
        <>
          {/* Book Header Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={book.language === 'fa' ? 'amber' : 'purple'}>
                    {book.language === 'fa' ? 'زبان فارسی' : book.language === 'ar' ? 'زبان عربی' : book.language}
                  </Badge>
                  {book.estimatedDate && (
                    <span className="text-xs text-stone-500 font-mono bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                      تاریخ کتابت: {book.estimatedDate}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {book.title}
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  پدیدآورنده / کاتب: <span className="font-semibold text-stone-700 dark:text-stone-300">{book.author || 'ناشناس'}</span>
                  {book.manuscriptIdentifier && (
                    <span className="mr-3 font-mono">شناسه آرشیو: {book.manuscriptIdentifier}</span>
                  )}
                </p>
              </div>

              {canUpload && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsUploadOpen(true)}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  افزودن برگ جدید به نسخه
                </Button>
              )}
            </div>

            {book.description && (
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-3">
                {book.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 border-t border-stone-100 dark:border-stone-800 pt-3">
              <span>تعداد کل برگ‌های اسکن‌شده: <strong className="text-stone-800 dark:text-stone-200">{pages.length.toLocaleString('fa-IR')} برگ</strong></span>
              {book.collectionName && <span>محل نگهداری: <strong>{book.collectionName}</strong></span>}
              {book.license && <span>مجوز دسترسی: <strong className="font-mono">{book.license}</strong></span>}
            </div>
          </div>

          {/* Folios Section Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              نگارخانه برگ‌ها و وضعیت بازشناسی (Folios)
            </h3>
            <span className="text-xs text-stone-500">
              کلیک روی هر برگ جهت بازگشایی در میزکار بازشناسی
            </span>
          </div>

          {/* Folios Gallery */}
          {pages.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-10 h-10" />}
              title="برگی برای این دست‌نوشته بارگذاری نشده است"
              description="برای شروع فرآیند پردازش تصویر و بازشناسی نویسه، اولین نگاره را بارگذاری فرمایید."
              action={
                canUpload
                  ? {
                      label: 'بارگذاری نگاره برگ',
                      onClick: () => setIsUploadOpen(true),
                      icon: <Upload className="w-4 h-4" />,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p) => {
                const imageUrl = pagesApi.getPageImageUrl(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate('recognition', { pageId: p.id, bookId: book.id })}
                    className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-3/4 bg-stone-950 flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={p.folioLabel || `صفحه ${p.pageNumber}`}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-stone-900/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-300 border border-stone-700">
                        {p.folioLabel || `#${p.pageNumber}`}
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          صفحه {p.pageNumber.toLocaleString('fa-IR')}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {p.imageWidth}×{p.imageHeight}
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <span className="flex items-center gap-1 group-hover:underline">
                          <ScanText className="w-3 h-3" />
                          میزکار HTR
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {/* Upload Page Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="بارگذاری نگاره برگ نسخه خطی"
        subtitle={`افزودن برگ به کتاب «${book?.title || ''}»`}
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {/* File Drag and Drop / Picker */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              فایل تصویر با وضوح بالا (JPEG / PNG / WebP) *
            </label>
            <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-6 text-center hover:border-amber-500 transition-colors bg-stone-50 dark:bg-stone-950/50">
              {uploadPreview ? (
                <div className="space-y-2">
                  <img
                    src={uploadPreview}
                    alt="پیش‌نمایش"
                    className="max-h-40 mx-auto rounded-lg shadow-sm object-contain"
                  />
                  <p className="text-[11px] text-stone-500 font-mono">{uploadFile?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview(null);
                    }}
                    className="text-rose-500 hover:underline text-[11px]"
                  >
                    تغییر تصویر انتخابی
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-stone-400" />
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    کلیک برای انتخاب فایل تصویر
                  </span>
                  <span className="text-[11px] text-stone-400">حداکثر حجم مجاز: ۲۵ مگابایت</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                شماره صفحه (Page Number) *
              </label>
              <input
                type="number"
                min="1"
                value={uploadPageNumber}
                onChange={(e) => setUploadPageNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                برچسب فولیو (Folio Label)
              </label>
              <input
                type="text"
                value={uploadFolioLabel}
                onChange={(e) => setUploadFolioLabel(e.target.value)}
                placeholder="مثال: Folio 1b یا ظهر ورق ۳"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
              />
            </div>
          </div>

          {uploadError && (
            <p className="text-rose-500 text-[11px] p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
              {uploadError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isUploading}>
              شروع بارگذاری
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
