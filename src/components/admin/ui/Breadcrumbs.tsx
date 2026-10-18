'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const pathNameMap: Record<string, string> = {
  admin: 'Dashboard',
  bookings: 'Đặt Phòng',
  calendar: 'Lịch Đặt Phòng',
  new: 'Thêm Mới',
  pending: 'Chờ Duyệt',
  villas: 'Biệt Thự',
  gallery: 'Quản Lý Ảnh',
  amenities: 'Tiện Ích',
  finance: 'Tài Chính',
  revenue: 'Doanh Thu',
  monthly: 'Báo Cáo Tháng',
  export: 'Xuất Báo Cáo',
  customers: 'Khách Hàng',
  history: 'Lịch Sử',
  reviews: 'Đánh Giá',
  settings: 'Cài Đặt',
  general: 'Chung',
  rates: 'Giá Phòng & Tỷ Giá USD',
  pricing: 'Ưu Đãi & Mùa Vụ',
  notifications: 'Thông Báo',
  accounts: 'Tài Khoản Quản Trị',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // If on admin root dashboard or empty, no need for breadcrumbs
  if (!pathname || pathname === '/admin') return null;

  const allSegments = pathname.split('/').filter(Boolean);
  const adminIndex = allSegments.indexOf('admin');
  const relevantSegments = adminIndex !== -1 ? allSegments.slice(adminIndex + 1) : allSegments;

  if (relevantSegments.length === 0) return null;

  let currentPath = '/admin';

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto py-1">
      <Link
        href="/admin"
        className="flex items-center hover:text-[#C2A476] transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Trang chủ</span>
      </Link>

      {relevantSegments.map((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === relevantSegments.length - 1;
        const name = pathNameMap[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={segment + index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#14171A] dark:text-[#FAF8F5] shrink-0">
                {name}
              </span>
            ) : (
              <Link
                href={currentPath}
                className="hover:text-[#C2A476] transition-colors shrink-0"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
