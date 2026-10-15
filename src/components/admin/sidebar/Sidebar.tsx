'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  CalendarPlus,
  Clock,
  Coins,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  KeyRound,
} from 'lucide-react';
import { useAdminStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Booking } from '@/lib/types';
import { getLiveBookings } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { clearSpaSession } from '@/lib/spaAuthSession';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidebarCollapsed,
    toggleSidebar,
    sidebarMobileOpen,
    closeMobileSidebar,
    setNavigatingTo,
  } = useAdminStore();

  const handleLogout = async () => {
    clearSpaSession();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.replace('/admin/login');
  };

  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setLiveBookings(getLiveBookings());
    const unsub = bookingStore.subscribe(() => {
      setLiveBookings(getLiveBookings());
    });
    return () => unsub();
  }, []);

  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending optimistic navigation when pathname changes
  useEffect(() => {
    setPendingHref(null);
    setNavigatingTo(null);
  }, [pathname, setNavigatingTo]);

  const pendingBookingsCount = useMemo(
    () => liveBookings.filter((b) => b.status === 'pending').length,
    [liveBookings]
  );

  const navSections: NavSection[] = useMemo(
    () => [
      {
        title: 'TỔNG QUAN',
        items: [
          {
            title: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: 'ĐẶT PHÒNG',
        items: [
          {
            title: 'Tất Cả Đặt Phòng',
            href: '/admin/bookings',
            icon: CalendarDays,
          },
          {
            title: 'Lịch Đặt Phòng',
            href: '/admin/bookings/calendar',
            icon: CalendarRange,
          },
          {
            title: 'Thêm Đặt Phòng',
            href: '/admin/bookings/new',
            icon: CalendarPlus,
          },
          {
            title: 'Yêu Cầu Chờ Duyệt',
            href: '/admin/bookings/pending',
            icon: Clock,
            badge: pendingBookingsCount,
            badgeColor: 'bg-[#C2A476] text-[#14171A]',
          },
        ],
      },
      {
        title: 'CÀI ĐẶT',
        items: [
          {
            title: 'Thông Tin Villa',
            href: '/admin/settings/general',
            icon: Settings,
          },
          {
            title: 'Giá Phòng & Tỷ Giá USD',
            href: '/admin/settings/rates',
            icon: Coins,
          },
          {
            title: 'Bảo Mật & Mã PIN',
            href: '/admin/settings/accounts',
            icon: KeyRound,
          },
        ],
      },
    ],
    [pendingBookingsCount]
  );

  const isItemActive = (href: string) => {
    if (pendingHref) {
      return pendingHref === href;
    }
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href;
  };

  const handleLinkClick = (href: string) => {
    if (href !== pathname) {
      setPendingHref(href);
      setNavigatingTo(href);
    }
    closeMobileSidebar();
  };

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && sidebarCollapsed;

    return (
      <div className="flex flex-col h-full bg-[#14171A] text-[#FAF8F5] select-none border-r border-[#2A2F35] relative">
        {/* Brand Header */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-[#2A2F35] px-4 shrink-0 transition-all duration-300',
            isCollapsed ? 'justify-center px-2' : 'justify-between'
          )}
        >
          <Link
            href="/admin"
            onClick={() => handleLinkClick('/admin')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2A476] via-[#E2C799] to-[#a88d5f] p-0.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(194,164,118,0.3)]">
              <div className="w-full h-full bg-[#14171A] rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="B Villa Da Nang Logo"
                  width={28}
                  height={28}
                  priority
                  className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(194,164,118,0.45)]"
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-wide text-white font-sans">
                    B Villa
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase bg-[#C2A476]/20 text-[#C2A476] border border-[#C2A476]/30">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-[#C2A476]/80 tracking-wider uppercase font-medium">
                  Đà Nẵng Luxury
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {isMobile ? (
            <button
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1E2328] transition-colors focus:outline-none"
              aria-label="Đóng thanh điều hướng"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            /* Desktop toggle button */
            !isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1E2328] transition-colors focus:outline-none"
                title="Thu gọn menu"
                aria-label="Thu gọn menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Desktop expand button when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center py-2 border-b border-[#2A2F35]/50">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1E2328] transition-colors focus:outline-none"
              title="Mở rộng menu"
              aria-label="Mở rộng menu"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-5 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pt-1 pb-1 text-[11px] font-bold tracking-wider text-[#C2A476]/70 uppercase font-sans">
                  {section.title}
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <div className="w-6 h-px bg-[#2A2F35]" />
                </div>
              )}

              {/* Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isItemActive(item.href);
                  const isPending = pendingHref === item.href && pathname !== item.href;
                  const Icon = item.icon;

                  return (
                    <div key={item.href} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => handleLinkClick(item.href)}
                        onMouseEnter={() => {
                          try {
                            router.prefetch(item.href);
                          } catch {}
                        }}
                        prefetch={true}
                        className={cn(
                          'relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-75 ease-out outline-none active:scale-[0.98] cursor-pointer select-none',
                          isCollapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'w-full',
                          active
                            ? 'bg-[#1E2328] text-[#C2A476] shadow-inner font-semibold'
                            : 'text-stone-300 hover:text-white hover:bg-[#1E2328] active:bg-[#252B32]'
                        )}
                      >
                        {/* Active pill / left glow indicator */}
                        {active && (
                          <span
                            className={cn(
                              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C2A476] rounded-r shadow-[0_0_8px_rgba(194,164,118,0.6)]',
                              isCollapsed && '-left-1 h-6'
                            )}
                          />
                        )}

                        <Icon
                          className={cn(
                            'shrink-0 transition-colors duration-75',
                            isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                            active
                              ? 'text-[#C2A476]'
                              : 'text-stone-400 group-hover:text-[#C2A476]'
                          )}
                        />

                        {!isCollapsed && (
                          <span className="flex-1 truncate tracking-tight text-[13.5px]">
                            {item.title}
                          </span>
                        )}

                        {/* Instant click feedback spinner/pulse */}
                        {!isCollapsed && isPending && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C2A476] animate-ping shrink-0" />
                        )}

                        {/* Badge for full view */}
                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            suppressHydrationWarning
                            className={cn(
                              'px-2 py-0.5 text-xs font-bold rounded-full transition-all shrink-0 font-sans',
                              item.badgeColor || 'bg-[#C2A476] text-[#14171A]'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {/* Tooltip on collapsed state */}
                      {isCollapsed && (
                        <div className="pointer-events-none fixed left-[78px] z-50 hidden group-hover:flex items-center">
                          <div className="bg-[#1E2328] text-white text-xs font-medium py-1.5 px-3 rounded-lg border border-[#2A2F35] shadow-xl whitespace-nowrap animate-fade-in flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge !== undefined && (
                              <span
                                suppressHydrationWarning
                                className={cn(
                                  'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                                  item.badgeColor || 'bg-[#C2A476] text-[#14171A]'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Clean Logout Button */}
        <div className="p-3 border-t border-[#2A2F35] shrink-0 bg-[#111316]">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold tracking-wide transition-all outline-none cursor-pointer',
              isCollapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'w-full'
            )}
            title="Đăng xuất khỏi trang quản trị"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Backdrop Overlay */}
      {sidebarMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden transform transition-transform duration-300 ease-in-out',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
}

export default Sidebar;
