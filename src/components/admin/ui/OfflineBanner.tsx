'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs py-2 px-4 flex items-center justify-between shadow-md transition-all sticky top-0 z-50 animate-slide-in-down">
      <div className="flex items-center gap-2 mx-auto">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span className="font-medium">
          Mất kết nối mạng Internet. Hệ thống đang sử dụng dữ liệu cục bộ đã lưu tạm.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded text-xs transition-colors shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Thử lại</span>
      </button>
    </div>
  );
}
