/**
 * Manuscript AI - Core Application Root Shell
 * 
 * Complies with Section 7 Master Prompt:
 * - Application Shell with Sidebar navigation, Top navigation, Breadcrumbs
 * - Role-aware routing & protected actions
 * - Persian RTL design system
 */

import React, { useState, useEffect } from 'react';
import { AppProviders } from './app/providers';
import { useAuth } from './context/AuthContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { BackendStatusBanner } from './components/layout/BackendStatusBanner';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { RecognitionWorkspacePage } from './pages/RecognitionWorkspacePage';
import { TranscriptionReviewPage } from './pages/TranscriptionReviewPage';
import { SearchPage } from './pages/SearchPage';
import { DatasetsPage, ModelsPage } from './pages/DatasetsPage';
import { EvaluationsPage, TrainingPage } from './pages/EvaluationsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage, LoginPage, NotFoundPage } from './pages/SettingsPage';
import { ArchitectureReviewView } from './components/review/ArchitectureReviewView';

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const initialHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    return initialHash || 'dashboard';
  });
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Read URL hash on initial load and on popstate/hashchange
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentRoute(hash);
      } else {
        setCurrentRoute('dashboard');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  const navigate = (route: string, params: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = (route: string) => {
    if (route.startsWith('book-')) return 'مشخصات و برگ‌های نسخه خطی';
    switch (route) {
      case 'dashboard':
        return 'پیشخوان سامانه Manuscript AI';
      case 'books':
        return 'کتب و نسخ خطی کهن';
      case 'recognition':
        return 'میزکار بازشناسی خط کهن (HTR)';
      case 'transcriptions':
        return 'بازبینی و تصحیح بازنویسی‌ها';
      case 'search':
        return 'جستجوی پیشرفته متون خطی';
      case 'datasets':
        return 'مجموعه‌داده‌ها و مانیفست HTR';
      case 'models':
        return 'رجیستری مدل‌های هوش‌مصنوعی';
      case 'evaluations':
        return 'گزارش‌های ارزیابی خطاسنجی (CER/WER)';
      case 'training':
        return 'آموزش و تنظیم دقیق مدل‌ها';
      case 'backend-review':
        return 'بررسی تخصصی و بهینه‌سازی بک‌اند';
      case 'users':
        return 'مدیریت پژوهشگران و کاربران';
      case 'settings':
      case 'api-docs':
        return 'تنظیمات و مستندات API';
      case 'login':
        return 'ورود به حساب کاربری';
      default:
        return 'سامانه Manuscript AI';
    }
  };

  const renderCurrentPage = () => {
    if (currentRoute === 'login') {
      return <LoginPage onLoginSuccess={() => navigate('dashboard')} />;
    }

    if (currentRoute.startsWith('book-')) {
      const bookId = currentRoute.replace('book-', '');
      return <BookDetailsPage bookId={bookId} navigate={navigate} />;
    }

    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'books':
        return <BooksPage navigate={navigate} />;
      case 'recognition':
        return (
          <RecognitionWorkspacePage
            initialBookId={routeParams.bookId}
            initialPageId={routeParams.pageId}
            navigate={navigate}
          />
        );
      case 'transcriptions':
        return <TranscriptionReviewPage navigate={navigate} />;
      case 'search':
        return <SearchPage navigate={navigate} />;
      case 'datasets':
        return <DatasetsPage />;
      case 'models':
        return <ModelsPage />;
      case 'evaluations':
        return <EvaluationsPage />;
      case 'training':
        return <TrainingPage />;
      case 'backend-review':
        return <ArchitectureReviewView />;
      case 'users':
        return <UsersPage />;
      case 'settings':
      case 'api-docs':
        return <SettingsPage />;
      default:
        return <NotFoundPage onGoHome={() => navigate('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-150">
      {/* Sidebar Navigation */}
      <AppSidebar
        currentRoute={currentRoute}
        navigate={navigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (shifted by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col lg:mr-72 min-w-0">
        {/* Top Header */}
        <AppHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          navigate={navigate}
          title={getPageTitle(currentRoute)}
        />

        {/* Backend Disconnection / Health Banner */}
        <BackendStatusBanner onOpenSettings={() => navigate('settings')} />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
