'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, Keyboard, LogOut } from 'lucide-react';
import { useAdminStore } from '@/lib/store';
import { Booking } from '@/lib/types';
import { getLiveBookings } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { clearSpaSession } from '@/lib/spaAuthSession';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

export function Header({ onOpenSearch, onOpenShortcuts }: HeaderProps) {
  const router = useRouter();
  const { toggleMobileSidebar } = useAdminStore();
  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);

  const handleLogout = async () => {
    clearSpaSession();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.replace('/admin/login');
  };

  useEffect(() => {
    setLiveBookings(getLiveBookings());
    const unsub = bookingStore.subscribe(() => {
      setLiveBookings(getLiveBookings());
    });
    return () => unsub();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCheckIns = (liveBookings || []).filter(
    (b) => typeof b?.checkIn === 'string' && b.checkIn.startsWith(todayStr) && b?.status !== 'cancelled'
  ).length;
  const todayCheckOuts = (liveBookings || []).filter(
    (b) => typeof b?.checkOut === 'string' && b.checkOut.startsWith(todayStr) && b?.status !== 'cancelled'
  ).length;
  const pendingCount = (liveBookings || []).filter((b) => b?.status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/85 dark:bg-[#14171A]/85 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors" suppressHydrationWarning>
      {/* Left side: Toggle button & Quick Stats */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Stats Widget in Header */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-[#1E2328] border border-black/5 dark:border-white/5 text-xs" suppressHydrationWarning>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Check-in hôm nay: <strong className="font-bold">{todayCheckIns}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
            <span>Check-out hôm nay: <strong className="font-bold">{todayCheckOuts}</strong></span>
          </div>
          {pendingCount > 0 && (
            <Link
              href="/admin/bookings/pending"
              className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline pl-1"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{pendingCount} đơn chờ duyệt</span>
            </Link>
          )}
        </div>
      </div>

      {/* Right side: Search trigger, shortcuts, notifications, dark mode, user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-gray-500 dark:text-gray-400 text-xs transition-all border border-transparent hover:border-[#C2A476]/30"
          title="Tìm kiếm toàn hệ thống (Cmd+K)"
        >
          <Search className="w-4 h-4 text-[#C2A476]" />
          <span className="hidden sm:inline">Tìm kiếm...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Keyboard shortcuts button */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Phím tắt (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Quick Lock / Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-bold transition-all duration-200 border border-rose-500/20 hover:border-rose-500 shadow-2xs hover:shadow-md cursor-pointer ml-1"
          title="Đăng xuất khỏi hệ thống quản trị"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Đăng Xuất</span>
        </button>
      </div>
    </header>
  );
}
