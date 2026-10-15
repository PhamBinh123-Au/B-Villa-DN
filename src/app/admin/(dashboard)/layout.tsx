'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar/Sidebar';
import { Header } from '@/components/admin/header/Header';
import { Breadcrumbs } from '@/components/admin/ui/Breadcrumbs';
import { OfflineBanner } from '@/components/admin/ui/OfflineBanner';
import { GlobalSearchModal } from '@/components/admin/ui/GlobalSearchModal';
import { KeyboardShortcutsModal } from '@/components/admin/ui/KeyboardShortcutsModal';
import { ToastContainer } from '@/components/admin/ui/ToastContainer';
import { useAdminStore } from '@/lib/store';
import { isSpaSessionActive, clearSpaSession } from '@/lib/spaAuthSession';

const ADMIN_ROUTES = [
  '/admin',
  '/admin/bookings',
  '/admin/bookings/calendar',
  '/admin/bookings/new',
  '/admin/bookings/pending',
  '/admin/settings/general',
  '/admin/settings/rates',
  '/admin/settings/accounts',
  '/admin/finance/revenue',
  '/admin/reviews',
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleDarkMode, setDarkMode, navigatingTo, setNavigatingTo } = useAdminStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(() => isSpaSessionActive());

  // Clear navigation indicator once pathname updates
  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname, setNavigatingTo]);

  // Aggressive Background Route Prefetching & Warmup for Instant 0ms Transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prefetch Next.js router cache
    ADMIN_ROUTES.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {}
    });

    // In dev mode, warm up routes in background so compilation is already done before click!
    if (process.env.NODE_ENV !== 'production') {
      const timer = setTimeout(() => {
        ADMIN_ROUTES.forEach((route) => {
          fetch(route, { priority: 'low' }).catch(() => {});
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [router]);

  // Strict session verification: Force re-login on F5 / page reload / pull-to-refresh / new tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isSpaSessionActive()) {
      clearSpaSession();
      fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});

      const currentPath = window.location.pathname;
      const redirectUrl = currentPath && currentPath !== '/admin'
        ? `/admin/login?redirect=${encodeURIComponent(currentPath)}`
        : '/admin/login';

      setIsAuthorized(false);
      router.replace(redirectUrl);
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  // Restore dark mode preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDark = localStorage.getItem('darkMode');
      if (savedDark !== null) {
        setDarkMode(JSON.parse(savedDark));
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
      }
    }
  }, [setDarkMode]);

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push('/admin/bookings');
      } else if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push('/admin/bookings/calendar');
      } else if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push('/admin/bookings/new');
      } else if (e.key.toLowerCase() === 'v' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push('/admin/villas');
      } else if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleDarkMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleDarkMode]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0E1114] flex flex-col items-center justify-center p-6 text-center select-none" suppressHydrationWarning>
        <div className="w-10 h-10 border-2 border-[#C2A476] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#C2A476] font-sans font-bold tracking-wider uppercase">
          Xác thực bảo mật • Đang chuyển hướng đăng nhập...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#14171A] text-[#14171A] dark:text-[#FAF8F5] transition-colors duration-200 relative" suppressHydrationWarning>
      {/* Luxury Instant Navigation Progress Bar */}
      {navigatingTo && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 overflow-hidden bg-[#C2A476]/20 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#C2A476] via-[#E2C799] to-[#C2A476] w-full animate-pulse shadow-[0_0_10px_rgba(194,164,118,0.9)]" />
        </div>
      )}
      <OfflineBanner />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar with Suspense */}
        <Suspense fallback={<aside className="w-64 bg-[#14171A] h-full" />}>
          <Sidebar />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header with Suspense */}
          <Suspense fallback={<header className="h-16 bg-white dark:bg-[#14171A]" />}>
            <Header
              onOpenSearch={() => setSearchOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
            />
          </Suspense>

          {/* Main Scrollable Body */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Suspense fallback={null}>
                <Breadcrumbs />
              </Suspense>
              <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Đang tải trang...</div>}>
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <Suspense fallback={null}>
        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
        <KeyboardShortcutsModal
          isOpen={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />
      </Suspense>
      <ToastContainer />
    </div>
  );
}
