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

// Default to env var or relative '/api/v1' for Vite dev proxy/same-origin
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function getEffectiveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('manuscript_api_base_url');
    if (customUrl) return customUrl;
  }
  return DEFAULT_BASE_URL;
}

export function setCustomApiBaseUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (url) {
    localStorage.setItem('manuscript_api_base_url', url.trim());
  } else {
    localStorage.removeItem('manuscript_api_base_url');
  }
  // Update instance base URL
  apiClient.defaults.baseURL = getEffectiveApiBaseUrl();
}

// Token storage helpers
const TOKEN_KEY = 'manuscript_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null, remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } else if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
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
