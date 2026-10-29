/**
 * Manuscript AI - Centralized HTTP Client
 * 
 * Complies with:
 * - VITE_API_BASE_URL configuration with runtime override capability
 * - Standard JSON headers & Bearer authorization token injection
 * - Multipart form-data handling without rigid boundary clobbering
 * - Error normalization
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { normalizeAxiosError } from './errors';
import { ApiResponse } from './types';

// Default to env var or independent NestJS backend service URL
export const DEFAULT_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  'http://localhost:3000/api/v1';

/**
 * Validates a candidate API Base URL before applying to HTTP clients.
 * Prevents SSRF / malicious credential exfiltration via localStorage tampering.
 */
export function validateApiBaseUrl(url: string | null | undefined): { isValid: boolean; normalizedUrl?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'آدرس پایه API نمی‌تواند خالی باشد.' };
  }

  const trimmed = url.trim();

  // Relative path validation
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) {
      return { isValid: false, error: 'آدرس‌های پروتکل-نسبی (//) مجاز نمی‌باشند.' };
    }
    return { isValid: true, normalizedUrl: trimmed.replace(/\/+$/, '') };
  }

  // Absolute URL validation
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'پروتکل آدرس باید حتماً http: یا https: باشد.' };
    }
    if (parsed.username || parsed.password) {
      return { isValid: false, error: 'درج نام کاربری یا رمز عبور در URL مجاز نیست.' };
    }
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    const normalized = `${parsed.origin}${cleanPath}`;
    return { isValid: true, normalizedUrl: normalized };
  } catch {
    return { isValid: false, error: 'فرمت آدرس اینترنتی وارد شده نامعتبر است.' };
  }
}

export function getEffectiveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('manuscript_api_base_url');
    if (stored) {
      const validation = validateApiBaseUrl(stored);
      if (validation.isValid && validation.normalizedUrl) {
        return validation.normalizedUrl;
      }
      localStorage.removeItem('manuscript_api_base_url');
    }
  }
  return DEFAULT_BASE_URL;
}

export function setCustomApiBaseUrl(url: string | null): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'محیط غیر مرورگر' };
  if (!url || url.trim() === '') {
    localStorage.removeItem('manuscript_api_base_url');
    apiClient.defaults.baseURL = DEFAULT_BASE_URL;
    return { success: true };
  }

  const validation = validateApiBaseUrl(url);
  if (!validation.isValid || !validation.normalizedUrl) {
    return { success: false, error: validation.error || 'آدرس نامعتبر است.' };
  }

  localStorage.setItem('manuscript_api_base_url', validation.normalizedUrl);
  apiClient.defaults.baseURL = validation.normalizedUrl;
  return { success: true };
}

// Token storage helpers - Session-scoped by default, never store passwords or persist bearer tokens in localStorage
const TOKEN_KEY = 'manuscript_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY); // Clean up any old legacy token
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY); // Enforce session-only
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getEffectiveApiBaseUrl(),
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure baseURL is fresh if altered
  config.baseURL = getEffectiveApiBaseUrl();
  return config;
});

// Event bus for global auth/network states
type AuthExpiredListener = () => void;
const authExpiredListeners: Set<AuthExpiredListener> = new Set();

export function onAuthExpired(listener: AuthExpiredListener): () => void {
  authExpiredListeners.add(listener);
  return () => authExpiredListeners.delete(listener);
}

// Response interceptor: Normalize errors & handle 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const normalized = normalizeAxiosError(error);
    if (normalized.statusCode === 401) {
      setStoredToken(null);
      authExpiredListeners.forEach((fn) => fn());
    }
    return Promise.reject(normalized);
  }
);

// Generic wrapper ensuring type safety with backend { success, data, meta } envelope
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
}
