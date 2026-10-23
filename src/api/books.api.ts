/**
 * Manuscript AI - Books & Pages API Modules
 */

import { apiRequest, getEffectiveApiBaseUrl, getStoredToken } from './client';
import { ApiResponse, Book, ManuscriptPage } from './types';

export interface BooksQueryParams {
  page?: number;
  limit?: number;
  language?: string;
  search?: string;
}

export const booksApi = {
  listBooks: async (params?: BooksQueryParams): Promise<ApiResponse<Book[]>> => {
    return apiRequest<Book[]>({
      url: '/books',
      method: 'GET',
      params,
    });
  },

  getBook: async (id: string): Promise<ApiResponse<Book>> => {
    return apiRequest<Book>({
      url: `/books/${id}`,
      method: 'GET',
    });
  },

  createBook: async (data: Partial<Book>): Promise<ApiResponse<Book>> => {
    return apiRequest<Book>({
      url: '/books',
      method: 'POST',
      data,
    });
  },

  updateBook: async (id: string, data: Partial<Book>): Promise<ApiResponse<Book>> => {
    return apiRequest<Book>({
      url: `/books/${id}`,
      method: 'PATCH',
      data,
    });
  },

  deleteBook: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>({
      url: `/books/${id}`,
      method: 'DELETE',
    });
  },

  getBookPages: async (bookId: string): Promise<ApiResponse<ManuscriptPage[]>> => {
    return apiRequest<ManuscriptPage[]>({
      url: `/books/${bookId}/pages`,
      method: 'GET',
    });
  },
};

export const pagesApi = {
  getPage: async (id: string): Promise<ApiResponse<ManuscriptPage>> => {
    return apiRequest<ManuscriptPage>({
      url: `/pages/${id}`,
      method: 'GET',
    });
  },

  uploadPage: async (
    bookId: string,
    data: {
      file: File;
      pageNumber: number;
      folioLabel?: string;
      language?: string;
    }
  ): Promise<ApiResponse<ManuscriptPage>> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('pageNumber', String(data.pageNumber));
    if (data.folioLabel) formData.append('folioLabel', data.folioLabel);
    if (data.language) formData.append('language', data.language);

    return apiRequest<ManuscriptPage>({
      url: `/books/${bookId}/pages`,
      method: 'POST',
      data: formData,
      // Note: do not set Content-Type header manually to allow browser to calculate boundary
    });
  },

  deletePage: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>({
      url: `/pages/${id}`,
      method: 'DELETE',
    });
  },

  // Helper to get authenticated folio image URL or stream
  getPageImageUrl: (pageId: string): string => {
    const base = getEffectiveApiBaseUrl();
    const token = getStoredToken();
    return `${base}/pages/${pageId}/image${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};
