'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#14171A] text-white">
      <div className="max-w-md w-full bg-[#1C1F24] border border-[#C2A476]/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative gold accent glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C2A476] to-transparent opacity-80" />

        <div className="w-16 h-16 rounded-2xl bg-[#C2A476]/10 border border-[#C2A476]/30 text-[#C2A476] flex items-center justify-center mx-auto mb-5 shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-2">
          Hệ Thống Đang Xử Lý Yêu Cầu
        </h2>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Đã xảy ra sự cố kỹ thuật tạm thời trong quá trình tải dữ liệu. Vui lòng thử tải lại hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải Lại Trang</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-semibold transition-all border border-white/10 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
