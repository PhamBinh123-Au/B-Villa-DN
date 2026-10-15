'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  ExternalLink,
  Command,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getLiveBookings } from '@/lib/adminDataService';
import { formatVND } from '@/lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Navigation pages list for search
  const navigationItems = [
    { title: 'Dashboard', path: '/admin', category: 'Trang' },
    { title: 'Tất Cả Đặt Phòng', path: '/admin/bookings', category: 'Trang' },
    { title: 'Lịch Đặt Phòng (Timeline)', path: '/admin/bookings/calendar', category: 'Trang' },
    { title: 'Thêm Đặt Phòng Mới', path: '/admin/bookings/new', category: 'Trang' },
    { title: 'Yêu Cầu Chờ Duyệt', path: '/admin/bookings/pending', category: 'Trang' },
    { title: 'Điều Chỉnh Giá Phòng & Tỷ Giá USD', path: '/admin/settings/rates', category: 'Trang' },
    { title: 'Thông Tin Villa', path: '/admin/settings/general', category: 'Trang' },
    { title: 'Thông Báo', path: '/admin/settings/notifications', category: 'Trang' },
  ];

  const trimmed = query.trim().toLowerCase();

  // Search results from live database
  const liveBookings = getLiveBookings();
  const filteredBookings = trimmed
    ? liveBookings
        .filter(
          (b) =>
            b.id.toLowerCase().includes(trimmed) ||
            b.customerName.toLowerCase().includes(trimmed) ||
            b.customerPhone.includes(trimmed) ||
            b.villaId.toLowerCase().includes(trimmed)
        )
        .slice(0, 6)
    : [];

  const filteredPages = trimmed
    ? navigationItems
        .filter((item) => item.title.toLowerCase().includes(trimmed))
        .slice(0, 4)
    : navigationItems.slice(0, 4);

  type SearchResultItem = {
    id: string;
    type: 'booking' | 'page';
    title: string;
    subtitle: string;
    url: string;
    tag?: string;
  };

  const allResults: SearchResultItem[] = [
    ...filteredBookings.map((b) => ({
      id: `b-${b.id}`,
      type: 'booking' as const,
      title: `${b.id} • ${b.customerName}`,
      subtitle: `${b.villaId} • ${b.nights} đêm • ${formatVND(b.totalAmount)} • ${b.status}`,
      url: `/admin/bookings/${b.id}`,
      tag: b.villaId,
    })),
    ...filteredPages.map((p) => ({
      id: `p-${p.path}`,
      type: 'page' as const,
      title: p.title,
      subtitle: p.path,
      url: p.path,
      tag: 'Chuyển trang',
    })),
  ];

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex].url);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1E2328] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-black/5 dark:border-white/10">
          <Search className="w-5 h-5 text-[#C2A476] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm đặt phòng (BVN-...), khách hàng, villa, hoặc chuyển trang..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-[#14171A] dark:text-[#FAF8F5] placeholder-gray-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-gray-500 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#C2A476]" />
              <p className="text-sm">Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;</p>
              <p className="text-xs text-gray-500 mt-1">Thử tìm theo tên khách, mã BVN, B1-B4 hoặc số điện thoại</p>
            </div>
          ) : (
            allResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#C2A476]/15 text-[#14171A] dark:text-[#FAF8F5]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'booking'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-purple-500/10 text-purple-500'
                      }`}
                    >
                      {item.type === 'booking' && <Calendar className="w-4 h-4" />}
                      {item.type === 'page' && <ExternalLink className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate text-[#14171A] dark:text-[#FAF8F5]">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        {item.tag}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 text-[#C2A476] transition-transform ${
                        isSelected ? 'translate-x-0.5 opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↓</kbd> Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↵</kbd> Mở
            </span>
          </div>
          <span>B Villa Da Nang Admin</span>
        </div>
      </div>
    </div>
  );
}
