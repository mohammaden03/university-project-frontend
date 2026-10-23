/**
 * Manuscript AI - Authentication & Users API Modules
 */

import { apiRequest } from './client';
import { ApiResponse, AuthData, User, UserRole } from './types';

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthData>> => {
    return apiRequest<AuthData>({
      url: '/auth/login',
      method: 'POST',
      data: { email, password },
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>({
      url: '/auth/me',
      method: 'GET',
    });
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>({
      url: '/auth/logout',
      method: 'POST',
    });
  },

  checkHealth: async (): Promise<ApiResponse<{ status: string; timestamp: string; service: string }>> => {
    return apiRequest<{ status: string; timestamp: string; service: string }>({
      url: '/health',
      method: 'GET',
    });
  },
};

export const usersApi = {
  listUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>({
      url: '/users',
      method: 'GET',
    });
  },

  createUser: async (data: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
  }): Promise<ApiResponse<User>> => {
    return apiRequest<User>({
      url: '/users',
      method: 'POST',
      data,
    });
  },

  updateUser: async (
    id: string,
    data: { displayName?: string; role?: UserRole; isActive?: boolean }
  ): Promise<ApiResponse<User>> => {
    return apiRequest<User>({
      url: `/users/${id}`,
      method: 'PATCH',
      data,
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>({
      url: `/users/${id}`,
      method: 'DELETE',
    });
  },
};
