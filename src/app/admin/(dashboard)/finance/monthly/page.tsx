'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  TrendingUp,
  Download,
  Building,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';
import { formatVND, formatCompactVND } from '@/lib/utils';

interface MonthStat {
  month: string;
  year: number;
  revenue: number;
  bookings: number;
  occupancy: number;
  revPar: number;
  topVilla: string;
  growth: number;
}

export default function FinanceMonthlyPage() {
  const monthsData: MonthStat[] = [
    { month: 'Tháng 10', year: 2025, revenue: 720000000, bookings: 42, occupancy: 73, revPar: 17140000, topVilla: 'B1', growth: 12.4 },
    { month: 'Tháng 9', year: 2025, revenue: 640000000, bookings: 38, occupancy: 68, revPar: 16840000, topVilla: 'B3', growth: -8.5 },
    { month: 'Tháng 8', year: 2025, revenue: 890000000, bookings: 54, occupancy: 88, revPar: 18500000, topVilla: 'B1', growth: 4.2 },
    { month: 'Tháng 7', year: 2025, revenue: 852000000, bookings: 51, occupancy: 86, revPar: 18200000, topVilla: 'B1', growth: 15.6 },
    { month: 'Tháng 6', year: 2025, revenue: 737000000, bookings: 45, occupancy: 76, revPar: 17400000, topVilla: 'B2', growth: 18.2 },
    { month: 'Tháng 5', year: 2025, revenue: 624000000, bookings: 39, occupancy: 65, revPar: 16000000, topVilla: 'B3', growth: 22.0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Báo Cáo Tài Chính Từng Tháng
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tổng hợp dữ liệu doanh thu, tăng trưởng và công suất theo từng chu kỳ kế toán
          </p>
        </div>

        <Link
          href="/admin/finance/export"
          className="px-4 py-2 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] shadow-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Tải Báo Cáo Kế Toán</span>
        </Link>
      </div>

      {/* Grid of Months Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {monthsData.map((m, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                {m.month}/{m.year}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                  m.growth >= 0
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-red-500/15 text-red-600'
                }`}
              >
                {m.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {m.growth}%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 block">Doanh Thu Thuần:</span>
              <p className="text-2xl font-extrabold text-[#C2A476] tracking-tight">
                {formatVND(m.revenue)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-black/5 dark:border-white/5 text-center text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Đơn Đặt</span>
                <strong className="font-bold">{m.bookings}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Lấp Đầy</span>
                <strong className="font-bold">{m.occupancy}%</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Top Villa</span>
                <strong className="font-bold text-[#C2A476]">{m.topVilla}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Monthly Comparison Table */}
      <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs overflow-hidden space-y-4">
        <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
          Bảng So Sánh Chỉ Số Kinh Doanh 6 Tháng Gần Nhất
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF8F5] dark:bg-[#14171A] text-gray-500 font-bold border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="p-3">Chu Kỳ</th>
                <th className="p-3 text-right">Doanh Thu (VNĐ)</th>
                <th className="p-3 text-center">Tăng Trưởng</th>
                <th className="p-3 text-center">Lượt Đặt</th>
                <th className="p-3 text-center">Lấp Đầy (%)</th>
                <th className="p-3 text-right">RevPAR / Đêm</th>
                <th className="p-3 text-center">Biệt Thự Xuất Sắc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {monthsData.map((m, idx) => (
                <tr key={idx} className="hover:bg-black/[0.01]">
                  <td className="p-3 font-bold">{m.month}/{m.year}</td>
                  <td className="p-3 text-right font-extrabold text-[#C2A476]">{formatVND(m.revenue)}</td>
                  <td className="p-3 text-center font-bold">
                    <span className={m.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                      {m.growth >= 0 ? `+${m.growth}%` : `${m.growth}%`}
                    </span>
                  </td>
                  <td className="p-3 text-center">{m.bookings} đơn</td>
                  <td className="p-3 text-center font-semibold">{m.occupancy}%</td>
                  <td className="p-3 text-right font-mono">{formatVND(m.revPar)}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded font-extrabold bg-[#C2A476]/15 text-[#C2A476]">
                      Villa {m.topVilla}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
