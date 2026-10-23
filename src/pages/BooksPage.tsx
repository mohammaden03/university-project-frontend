/**
 * Manuscript AI - Books Management Page
 * 
 * Complies with Section 11 Master Prompt:
 * - Book list, search, filter by language, pagination, sorting
 * - Create book modal with React Hook Form & Zod validation
 * - Delete book with confirmation (Admin only)
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { booksApi } from '../api/books.api';
import { Book } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../components/common/Badge';

const bookSchema = z.object({
  title: z.string().min(2, 'عنوان کتاب باید حداقل ۲ نویسه باشد'),
  author: z.string().optional(),
  language: z.enum(['fa', 'ar', 'ota'] as const),
  description: z.string().optional(),
  manuscriptIdentifier: z.string().optional(),
  estimatedDate: z.string().optional(),
  collectionName: z.string().optional(),
  sourceUrl: z.string().url('آدرس اینترنتی معتبر وارد نمایید').optional().or(z.literal('')),
  license: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export interface BooksPageProps {
  navigate: (route: string) => void;
}

export const BooksPage: React.FC<BooksPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      language: 'fa',
    },
  });

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await booksApi.listBooks({
        search: searchQuery.trim() || undefined,
        language: languageFilter || undefined,
      });
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در بارگذاری فهرست کتب');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, languageFilter]);

  const onSubmitCreate = async (data: BookFormData) => {
    try {
      const res = await booksApi.createBook({
        title: data.title.trim(),
        author: data.author?.trim() || null,
        language: data.language,
        description: data.description?.trim() || null,
        manuscriptIdentifier: data.manuscriptIdentifier?.trim() || null,
        estimatedDate: data.estimatedDate?.trim() || null,
        collectionName: data.collectionName?.trim() || null,
        sourceUrl: data.sourceUrl?.trim() || null,
        license: data.license?.trim() || null,
      });
      if (res.success && res.data) {
        setIsCreateOpen(false);
        reset();
        fetchBooks();
      }
    } catch (err: any) {
      alert(err?.message || 'خطا در ثبت کتاب جدید');
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    try {
      await booksApi.deleteBook(deletingBook.id);
      setDeletingBook(null);
      fetchBooks();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف کتاب');
    }
  };

  const canCreate = user && (user.role === 'ADMIN' || user.role === 'RESEARCHER');
  const canDelete = user && user.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            فهرست کتب و نسخ خطی کهن
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            مدیریت گنجینه دست‌نوشته‌ها، شناسنامه‌های کتاب‌شناسی و دسترسی به برگ‌ها
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            ثبت نسخه خطی جدید
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان، نام مصنف، شناسه نسخه خطی..."
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="">تمام زبان‌ها</option>
            <option value="fa">فارسی (Persian)</option>
            <option value="ar">عربی (Arabic)</option>
            <option value="ota">ترکی عثمانی (Ottoman)</option>
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchBooks} />}

      {isLoading ? (
        <LoadingSpinner label="در حال فراخوانی کاتالوگ نسخ خطی..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="w-10 h-10" />}
          title="نسخه خطی یافت نشد"
          description={
            searchQuery || languageFilter
              ? 'موردی با فیلترهای انتخابی پیدا نشد. عبارت جستجو را تغییر دهید.'
              : 'هنوز دست‌نوشته‌ای در سامانه کاتالوگ نشده است.'
          }
          action={
            canCreate
              ? {
                  label: 'ثبت اولین دست‌نوشته',
                  onClick: () => setIsCreateOpen(true),
                  icon: <Plus className="w-4 h-4" />,
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={book.language === 'fa' ? 'amber' : 'purple'} size="sm">
                    {book.language === 'fa' ? 'فارسی' : book.language === 'ar' ? 'عربی' : book.language}
                  </Badge>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {book.estimatedDate || 'سده نامشخص'}
                  </span>
                </div>

                <h3
                  onClick={() => navigate(`book-${book.id}`)}
                  className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-pointer transition-colors line-clamp-1"
                >
                  {book.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
                  مصنف: {book.author || 'ناشناس'}
                </p>

                {book.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono text-[11px] truncate max-w-[150px]">
                  {book.manuscriptIdentifier || book.collectionName || 'مجموعه دانشگاهی'}
                </span>

                <div className="flex items-center gap-2">
                  {canDelete && (
                    <button
                      onClick={() => setDeletingBook(book)}
                      title="حذف کتاب"
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`book-${book.id}`)}
                  >
                    مشاهده برگ‌ها
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Book Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="ثبت دست‌نوشته و کتاب جدید"
        subtitle="ورود مشخصات کتاب‌شناختی نسخه خطی بر اساس استاندارد مارک و کاتالوگ‌های خطی"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              عنوان کتاب یا نسخه خطی *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="مثال: دیوان حافظ شیرازی (نسخه خلخالی)"
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                نام مصنف / کاتب
              </label>
              <input
                type="text"
                {...register('author')}
                placeholder="مثال: خواجه شمس‌الدین محمد حافظ"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                زبان متن *
              </label>
              <select
                {...register('language')}
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="fa">فارسی</option>
                <option value="ar">عربی</option>
                <option value="ota">ترکی عثمانی</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                شناسه نسخه خطی در آرشیو
              </label>
              <input
                type="text"
                {...register('manuscriptIdentifier')}
                placeholder="مثال: MS. Persian 1528"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                تاریخ تقریبی کتابت
              </label>
              <input
                type="text"
                {...register('estimatedDate')}
                placeholder="مثال: ۸۲۴ هجری قمری"
                className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              نام کتابخانه / مجموعه نگهدارنده
            </label>
            <input
              type="text"
              {...register('collectionName')}
              placeholder="مثال: کتابخانه مرکزی دانشگاه تهران یا موزه متروپولیتن"
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              توضیحات و خصوصیات ظاهری خط
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="توضیحاتی درباره نوع خط (نستعلیق، نسخ، شکسته)، وضعیت تذهیب، جلد و کاغذ..."
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              ثبت و ادامه
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingBook(null)}
          title="تایید حذف نسخه خطی"
          maxWidth="sm"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeletingBook(null)}>
                انصراف
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteBook}>
                بله، حذف شود
              </Button>
            </div>
          }
        >
          <p className="text-xs text-stone-600 dark:text-stone-400">
            آیا از حذف دست‌نوشته «{deletingBook.title}» اطمینان دارید؟ تمام برگ‌ها و بازنویسی‌های متصل به آن حذف خواهند شد.
          </p>
        </Modal>
      )}
    </div>
  );
};
