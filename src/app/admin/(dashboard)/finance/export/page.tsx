'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getLiveBookings } from '@/lib/adminDataService';
import { formatVND } from '@/lib/utils';
import { useToastStore } from '@/lib/store';

export default function FinanceExportPage() {
  const { addToast } = useToastStore();
  const [format, setFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [villaFilter, setVillaFilter] = useState('all');
  const [dateRange, setDateRange] = useState('2026-10');

  const filtered = getLiveBookings().filter((b) => {
    if (villaFilter !== 'all' && b.villaId !== villaFilter) return false;
    return true;
  });

  const handleDownload = () => {
    addToast({
      type: 'success',
      title: 'Tải báo cáo thành công',
      message: `Đã kết xuất và tải tệp báo cáo tài chính ${format.toUpperCase()} cho ${filtered.length} dòng dữ liệu.`,
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
          Trung Tâm Xuất Dữ Liệu & Báo Cáo
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Xuất dữ liệu kế toán, quyết toán thuế và lịch sử đặt phòng chuẩn định dạng Excel, CSV, PDF
        </p>
      </div>

      {/* Export Config Card */}
      <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-6">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#C2A476]" />
          Tùy Chọn Tham Số Báo Cáo
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Định dạng tệp xuất:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'excel', label: 'Excel (.xlsx)' },
                { id: 'pdf', label: 'PDF Report' },
                { id: 'csv', label: 'CSV Data' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    format === f.id
                      ? 'border-[#C2A476] bg-[#C2A476]/10 text-[#C2A476]'
                      : 'border-black/10 dark:border-white/10 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Lọc theo Biệt thự:
            </label>
            <select
              value={villaFilter}
              onChange={(e) => setVillaFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-semibold"
            >
              <option value="all">Tất cả 4 Biệt Thự (B1 - B4)</option>
              <option value="B1">Chỉ Villa B1</option>
              <option value="B2">Chỉ Villa B2</option>
              <option value="B3">Chỉ Villa B3</option>
              <option value="B4">Chỉ Villa B4</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Kỳ báo cáo:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-semibold"
            >
              <option value="2025-10">Tháng 10/2025 (Hiện tại)</option>
              <option value="2025-09">Tháng 09/2025</option>
              <option value="2025-Q3">Quý 3/2025</option>
              <option value="2025-ALL">Toàn năm 2025</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-6 py-3 rounded-xl bg-[#C2A476] text-[#14171A] font-extrabold text-xs shadow-md hover:bg-[#d4ba94] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuất Báo Cáo ({filtered.length} dòng)</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
          Bản Xem Trước Dữ Liệu Báo Cáo (Preview)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF8F5] dark:bg-[#14171A] text-gray-500 font-bold border-b border-black/5 dark:border-white/5">
              <tr>
                <th className="p-3">Mã Đặt</th>
                <th className="p-3">Biệt Thự</th>
                <th className="p-3">Tên Khách</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
                <th className="p-3 text-center">Đêm</th>
                <th className="p-3 text-right">Doanh Thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.slice(0, 10).map((b) => (
                <tr key={b.id} className="hover:bg-black/[0.01]">
                  <td className="p-3 font-mono font-bold">{b.id}</td>
                  <td className="p-3 font-bold">Villa {b.villaId}</td>
                  <td className="p-3">{b.customerName}</td>
                  <td className="p-3">{b.checkIn.slice(0, 10)}</td>
                  <td className="p-3">{b.checkOut.slice(0, 10)}</td>
                  <td className="p-3 text-center font-semibold">{b.nights}</td>
                  <td className="p-3 text-right font-extrabold text-[#C2A476]">
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
