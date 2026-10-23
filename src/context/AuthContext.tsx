/**
 * Manuscript AI - Authentication Context & Provider
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { getEffectiveApiBaseUrl, getStoredToken, onAuthExpired, setStoredToken } from '../api/client';
import { User, UserRole } from '../api/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'CHECKING';
  apiBaseUrl: string;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  devQuickLogin?: (role: UserRole, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  checkBackendHealth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reference development user accounts without hardcoded passwords
export const DEV_USERS: Record<UserRole, { email: string; title: string }> = {
  ADMIN: {
    email: 'admin@manuscript.ai',
    title: 'مدیر ارشد سامانه (Dr. Maryam Mirzakhani)',
  },
  RESEARCHER: {
    email: 'researcher@manuscript.ai',
    title: 'پژوهشگر ارشد نسخ خطی (Prof. Ehsan Yarshater)',
  },
  VIEWER: {
    email: 'viewer@manuscript.ai',
    title: 'پژوهشگر مهمان / بیننده (Layla Al-Khatib)',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CHECKING'>('CHECKING');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(getEffectiveApiBaseUrl());

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      setConnectionStatus('CHECKING');
      await authApi.checkHealth();
      setConnectionStatus('CONNECTED');
      return true;
    } catch {
      setConnectionStatus('DISCONNECTED');
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        setConnectionStatus('CONNECTED');
      } else {
        setUser(null);
        setStoredToken(null);
      }
    } catch (err: any) {
      console.warn('Authentication token check failed:', err?.message);
      if (err?.isNetworkError) {
        setConnectionStatus('DISCONNECTED');
      } else {
        setUser(null);
        setStoredToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setApiBaseUrl(getEffectiveApiBaseUrl());
    refreshUser();
    checkBackendHealth();

    const unsubscribe = onAuthExpired(() => {
      setUser(null);
    });

    return () => unsubscribe();
  }, [refreshUser, checkBackendHealth]);

  const login = async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        setStoredToken(res.data.accessToken, remember);
        setUser(res.data.user);
        setConnectionStatus('CONNECTED');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (getStoredToken()) {
        await authApi.logout();
      }
    } catch (e) {
      // Ignore logout backend errors
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const devQuickLogin = async (role: UserRole, password: string) => {
    if (!import.meta.env.DEV) {
      throw new Error('ورود سریع فقط در محیط توسعه (DEV) مجاز است.');
    }
    const userRef = DEV_USERS[role];
    await login(userRef.email, password, false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        connectionStatus,
        apiBaseUrl,
        login,
        logout,
        devQuickLogin: import.meta.env.DEV ? devQuickLogin : undefined,
        refreshUser,
        checkBackendHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
