import React from "react";
import Link from "next/link";

export const metadata = {
  title: "404 - Trang Không Tồn Tại | B Villa Da Nang",
  description: "Đường dẫn bạn yêu cầu không tìm thấy trên hệ thống B Villa Da Nang.",
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF8F5]">
      <div className="max-w-lg w-full bg-white border border-[#EAE5DC] rounded-3xl p-8 sm:p-10 shadow-xl">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C2A476] font-bold block mb-2">
          Lỗi Điều Hướng • 404 Not Found
        </span>
        <h1 className="text-6xl font-black text-[#C2A476] mb-3">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-[#14171A] mb-3">
          Trang Không Tồn Tại / Page Not Found
        </h2>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Đường dẫn bạn yêu cầu không tìm thấy trên máy chủ B Villa Da Nang. Vui lòng kiểm tra lại địa chỉ URL hoặc tham khảo các liên kết hữu ích dưới đây.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#14171A] hover:bg-[#2C3238] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Trang Chủ
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#C2A476] hover:bg-[#ad9164] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Liên Hệ Quản Gia
          </Link>
        </div>

        <div className="pt-6 border-t border-[#EAE5DC] text-xs text-neutral-500 text-left">
          <p className="font-semibold text-neutral-700 mb-2">Dành cho Trợ lý AI & Nhà phát triển (AI Agents & Developers):</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>
              <Link href="/llms.txt" className="text-[#C2A476] hover:underline font-medium">
                llms.txt (Agent Instructions &amp; Directory)
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="text-[#C2A476] hover:underline font-medium">
                sitemap.xml (Site Index)
              </Link>
            </li>
            <li>
              <Link href="/docs" className="text-[#C2A476] hover:underline font-medium">
                /docs (API &amp; MCP Documentation)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
