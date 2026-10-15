'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  BarChart3,
  CreditCard,
  Building,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  RevenueChart,
} from '@/components/admin/charts/RevenueChart';
import {
  VillaComparisonChart,
} from '@/components/admin/charts/VillaComparisonChart';
import { OccupancyHeatmap } from '@/components/admin/charts/OccupancyHeatmap';
import { bookings, villas, getVillaColor, getStatusLabel } from '@/lib/mock-data';
import { formatVND, formatCompactVND, formatUSD } from '@/lib/utils';
import { useToastStore } from '@/lib/store';

export default function FinanceRevenuePage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const { addToast } = useToastStore();

  const totalRevenue = 720000000;
  const bookedNights = 42;
  const revPar = 17142857; // Doanh thu trung bình/đêm
  const occupancyRate = 73;

  const villaRev = [
    { id: 'B1', name: 'Villa B1 (Sơn Trà)', revenue: 220000000, nights: 12 },
    { id: 'B2', name: 'Villa B2 (Ngũ Hành Sơn)', revenue: 190000000, nights: 11 },
    { id: 'B3', name: 'Villa B3 (Sơn Trà)', revenue: 200000000, nights: 11 },
    { id: 'B4', name: 'Villa B4 (Ngũ Hành Sơn)', revenue: 110000000, nights: 8 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Báo Cáo Doanh Thu (Revenue)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi chi tiết dòng tiền, hiệu suất doanh thu từng biệt thự và kênh phân phối
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center p-1 bg-white dark:bg-[#1E2328] border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold shadow-xs">
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'quarter', label: 'Quý này' },
              { id: 'year', label: 'Cả năm' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === t.id
                    ? 'bg-[#C2A476] text-[#14171A] shadow-xs'
                    : 'text-gray-500 hover:text-[#14171A] dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link
            href="/admin/finance/export"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2328] border border-black/10 dark:border-white/10 hover:border-[#C2A476] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-[#C2A476]" />
            <span>Xuất Báo Cáo</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng Doanh Thu
            </span>
            <div className="p-2 rounded-xl bg-[#C2A476]/15 text-[#C2A476]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
            {formatVND(totalRevenue)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4%</span>
            <span className="text-gray-400 font-normal">so với tháng trước</span>
          </div>
        </div>

        {/* Booked Nights */}
        <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Số Đêm Đã Đặt
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
            {bookedNights} đêm
          </p>
          <p className="text-xs text-gray-400 mt-2">Tổng công suất 4 biệt thự</p>
        </div>

        {/* RevPAR */}
        <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Doanh Thu TB / Đêm (RevPAR)
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
            {formatCompactVND(revPar)}
          </p>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">Tăng 8.2% hiệu suất</p>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tỷ Lệ Lấp Đầy TB
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
            {occupancyRate}%
          </p>
          <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown per Villa 4-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {villaRev.map((v) => (
          <div
            key={v.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#1E2328] border border-black/5 dark:border-white/5 shadow-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getVillaColor(v.id as any) }}
              />
              <span className="text-[10px] font-bold text-gray-400">{v.nights} đêm booked</span>
            </div>
            <p className="font-extrabold text-xs text-[#14171A] dark:text-[#FAF8F5] truncate">
              {v.name}
            </p>
            <p className="text-base font-extrabold text-[#C2A476]">
              {formatCompactVND(v.revenue)}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <RevenueChart />

      {/* Villa Comparison & Heatmap */}
      <VillaComparisonChart />
      <OccupancyHeatmap />

      {/* Revenue Transactions Table */}
      <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
              Chi Tiết Giao Dịch Doanh Thu Tháng 10/2025
            </h3>
            <p className="text-xs text-gray-400">Danh sách các khoản thu đã xác nhận từ đặt phòng</p>
          </div>
          <Link
            href="/admin/finance/export"
            className="text-xs text-[#C2A476] hover:underline font-bold"
          >
            Xuất file Excel / PDF →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAF8F5] dark:bg-[#14171A] text-gray-500 font-bold border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="p-3">Mã Đặt</th>
                <th className="p-3">Biệt Thự</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3 text-center">Số Đêm</th>
                <th className="p-3">Thanh Toán</th>
                <th className="p-3 text-right">Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="p-3 font-mono font-bold">{b.id}</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${getVillaColor(b.villaId)}15`,
                        color: getVillaColor(b.villaId),
                      }}
                    >
                      {b.villaId}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{b.customerName}</td>
                  <td className="p-3 text-center">{b.nights}</td>
                  <td className="p-3">
                    <span className="text-[11px] font-semibold text-emerald-600">
                      Đã thanh toán
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-[#C2A476]">
                    {formatVND(b.totalAmount)}
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
