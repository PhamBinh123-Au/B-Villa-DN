'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + K', description: 'Mở tìm kiếm nhanh toàn hệ thống' },
    { key: '?', description: 'Mở bảng phím tắt này' },
    { key: 'B', description: 'Đi tới Danh sách Đặt Phòng' },
    { key: 'C', description: 'Đi tới Lịch Đặt Phòng (Timeline)' },
    { key: 'N', description: 'Tạo Đặt Phòng Mới' },
    { key: 'V', description: 'Đi tới Danh sách Biệt thự' },
    { key: 'D', description: 'Bật / Tắt chế độ Tối (Dark Mode)' },
    { key: 'ESC', description: 'Đóng cửa sổ / Modal hiện tại' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1E2328] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C2A476]/15 text-[#C2A476]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                Phím Tắt Hệ Thống
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tăng tốc độ thao tác quản lý với các phím tắt tiện ích
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {s.description}
              </span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-black/5 dark:bg-white/10 text-[#C2A476] border border-black/5 dark:border-white/10 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center text-xs text-gray-400">
          Bấm <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">ESC</kbd> hoặc click bên ngoài để đóng
        </div>
      </div>
    </div>
  );
}
