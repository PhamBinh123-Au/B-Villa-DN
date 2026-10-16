"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-[#1E2328] border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-6xl font-black text-[#C2A476] mb-3">404</h1>
        <h2 className="text-xl font-bold text-[#14171A] dark:text-[#FAF8F5] mb-2">Trang Không Tồn Tại</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#C2A476] hover:bg-[#d4ba94] text-[#14171A] font-bold text-xs transition-all shadow-xs"
        >
          Trở Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
