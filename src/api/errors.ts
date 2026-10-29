/**
 * Manuscript AI - Centralized Error Normalization & Translation
 */

import axios, { AxiosError } from 'axios';
import { ApiErrorPayload } from './types';

export class AppApiError extends Error {
  code: string;
  statusCode?: number;
  details?: Array<{ field?: string; message: string }>;
  isNetworkError: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    details?: Array<{ field?: string; message: string }>,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'AppApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export function normalizeAxiosError(error: unknown): AppApiError {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) {
      return new AppApiError(error.message, 'CLIENT_ERROR');
    }
    return new AppApiError('خطای پیش‌بینی نشده در سامانه رخ داد.');
  }

  const axiosError = error as AxiosError<{ success?: boolean; error?: ApiErrorPayload }>;

  // Network / Connection Error
  if (!axiosError.response) {
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return new AppApiError(
        'مهلت زمانی ارتباط با سرور پایان یافت (Timeout). لطفاً ارتباط شبکه را بررسی نمایید.',
        'REQUEST_TIMEOUT',
        408,
        undefined,
        true
      );
    }
    return new AppApiError(
      'ارتباط با سرور بک‌اند برقرار نشد. لطفاً از در دسترس بودن سرویس و آدرس تنظیم شده در VITE_API_BASE_URL اطمینان حاصل فرمایید.',
      'NETWORK_ERROR',
      0,
      undefined,
      true
    );
  }

  const status = axiosError.response.status;
  const responseData = axiosError.response.data as any;
  const errorData = responseData?.error;

  const code = errorData?.code || responseData?.error || `HTTP_${status}`;
  const details = errorData?.details;

  let rawMessage = errorData?.message || responseData?.message;
  let message: string | undefined = Array.isArray(rawMessage) ? rawMessage.join(' • ') : (typeof rawMessage === 'string' ? rawMessage : undefined);

  // Persian friendly translation fallbacks
  if (!message || status === 401 || status === 403 || status === 409 || status === 404 || status === 413) {
    switch (status) {
      case 401:
        message = message || 'نشست کاربری شما منقضی شده یا وارد حساب کاربری خود نشده‌اید. لطفاً مجدداً وارد شوید.';
        break;
      case 403:
        message = message || 'شما مجوز لازم برای انجام این عملیات را ندارید. (نیازمند نقش بالاتر)';
        break;
      case 404:
        message = message || 'منبع یا رکورد درخواستی در سامانه یافت نشد.';
        break;
      case 409:
        message = message || 'تداخل همزمانی: این رکورد توسط کاربر دیگری تغییر یافته است. برای جلوگیری از بازنویسی ناخواسته، صفحه را نوسازی فرمایید.';
        break;
      case 413:
        message = message || 'حجم تصویر نسخه خطی بیش از حد مجاز سرور است. لطفاً فایل سبک‌تری آپلود نمایید.';
        break;
      case 422:
      case 400:
        message = message || 'اطلاعات ارسالی نامعتبر است. لطفاً فیلدهای فرم را بررسی فرمایید.';
        break;
      case 500:
      case 502:
      case 503:
        message = message || 'خطای داخلی در سرور بک‌اند رخ داد. لطفاً لاگ‌های سیستم را بررسی نمایید.';
        break;
      default:
        message = message || `خطای سرور با کد ${status}`;
    }
  }

  return new AppApiError(message, code, status, details, false);
}
