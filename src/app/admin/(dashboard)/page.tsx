'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  DollarSign,
  Clock,
  PlusCircle,
  Calendar,
  Mail,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Building,
  Eye,
  Filter,
  ArrowRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { getLiveBookings, computeLiveDashboardStats } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { formatVND, formatUSD, formatCompactVND } from '@/lib/utils';
import { useIsMounted } from '@/lib/useHydrated';
import { useToastStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [liveBookings, setLiveBookings] = useState(() => getLiveBookings());
  const [stats, setStats] = useState(() => computeLiveDashboardStats(getLiveBookings()));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await bookingStore.forceSyncCloud();
      const updated = getLiveBookings();
      setLiveBookings(updated);
      setStats(computeLiveDashboardStats(updated));

      addToast({
        title: 'Đồng bộ đám mây thành công',
        message: `Đã đồng bộ ${res.count} đơn đặt phòng giữa máy tính và điện thoại.`,
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Lỗi đồng bộ',
        message: 'Vui lòng kiểm tra lại kết nối mạng.',
        type: 'error',
      });
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    // Initial fetch
    const b = getLiveBookings();
    setLiveBookings(b);
    setStats(computeLiveDashboardStats(b));

    // Realtime subscription from bookingStore / DB sync
    const unsubscribe = bookingStore.subscribe(() => {
      const updated = getLiveBookings();
      setLiveBookings(updated);
      setStats(computeLiveDashboardStats(updated));
    });

    return () => unsubscribe();
  }, []);

  const pendingCount = liveBookings.filter((b) => b.status === 'pending').length;

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return liveBookings;
    if (statusFilter === 'pending') return liveBookings.filter((b) => b.status === 'pending');
    if (statusFilter === 'in_house') return liveBookings.filter((b) => b.status === 'checked_in');
    if (statusFilter === 'confirmed') return liveBookings.filter((b) => b.status === 'confirmed');
    return liveBookings;
  }, [liveBookings, statusFilter]);


  return (
    <div className="space-y-8 animate-fade-in pb-12" suppressHydrationWarning>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14171A] via-[#1E2328] to-[#14171A] p-6 sm:p-8 text-white border border-[#C2A476]/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2A476]/15 border border-[#C2A476]/30 text-[#C2A476] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>B Villa Da Nang • Trung Tâm Điều Hành</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF8F5] tracking-tight">
              Xin chào, Ban Quản Trị 👋
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              {pendingCount > 0 ? (
                <>Hôm nay hệ thống có <strong className="text-[#C2A476]">{pendingCount} yêu cầu đặt phòng mới</strong> cần xử lý.</>
              ) : (
                <>Hệ thống đang hoạt động ổn định. Hiện chưa có yêu cầu đặt phòng mới nào.</>
              )}
            </p>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2A476]/20 hover:bg-[#C2A476]/30 text-[#C2A476] text-xs font-bold border border-[#C2A476]/40 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Đồng bộ ngay dữ liệu giữa máy tính và điện thoại"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Đám Mây'}</span>
            </button>
            <Link
              href="/admin/bookings/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold shadow-md hover:bg-[#d4ba94] hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Đặt Phòng Mới</span>
            </Link>
            <Link
              href="/admin/bookings/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#C2A476]" />
              <span>Xem Lịch Hôm Nay</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#C2A476]/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards (2 core operational metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Tổng Đặt Phòng Tháng Này */}
        <div className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Đơn Tháng Này
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
            {stats.totalBookingsThisMonth}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Đơn đặt phòng tháng này
          </p>
        </div>

        {/* Card 2: Đặt Phòng Chờ Duyệt */}
        <Link
          href="/admin/bookings/pending"
          className="bg-white dark:bg-[#1E2328] rounded-2xl p-5 border border-black/5 dark:border-white/5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Chờ Duyệt
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
              {pendingCount}
            </p>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse">
                Cần xử lý
              </span>
            )}
          </div>
          <p className="text-xs text-[#C2A476] group-hover:underline mt-2 flex items-center gap-1 font-semibold">
            Xem ngay <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </Link>
      </div>

      {/* Main Section: Bảng Hoạt Động & Giao Dịch Gần Đây (Full Width) */}
      <div className="w-full bg-white dark:bg-[#1E2328] rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#C2A476]/15 text-[#C2A476]">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#14171A] dark:text-[#FAF8F5]">
                Hoạt Động & Giao Dịch Gần Đây
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Thời gian thực
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Theo dõi trực tiếp biến động đặt phòng, yêu cầu mới và nhật ký vận hành 4 biệt thự
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-2.5">

            {pendingCount > 0 && (
              <Link
                href="/admin/bookings/pending"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} đơn chờ duyệt</span>
              </Link>
            )}

            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[#14171A] dark:text-[#FAF8F5] transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C2A476]" />
            </Link>
          </div>
        </div>

        {/* TABLE OF RECENT TRANSACTIONS */}
        <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Lọc:
              </span>
              {[
                { key: 'all', label: `Tất cả (${liveBookings.length})` },
                { key: 'pending', label: `Chờ duyệt (${pendingCount})` },
                {
                  key: 'in_house',
                  label: `Đang lưu trú (${liveBookings.filter((b) => b.status === 'checked_in').length})`,
                },
                {
                  key: 'confirmed',
                  label: `Đã xác nhận (${liveBookings.filter((b) => b.status === 'confirmed').length})`,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    statusFilter === f.key
                      ? 'bg-[#C2A476] text-[#14171A] shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/5">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-white/[0.02] text-gray-500 border-b border-black/5 dark:border-white/5 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3.5 px-4">Mã Đơn & Thời Gian</th>
                    <th className="py-3.5 px-4">Khách Hàng</th>
                    <th className="py-3.5 px-4">Biệt Thự</th>
                    <th className="py-3.5 px-4">Lịch Trình Lưu Trú</th>
                    <th className="py-3.5 px-4">Tổng Tiền</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.slice(0, 8).map((b) => {
                      const villa = getVillaBadge(b.villaId);
                      const st = getStatusBadge(b.status);
                      const nights = b.nights || getNightCount(b.checkIn, b.checkOut);

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Mã đơn */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-[#14171A] dark:text-[#FAF8F5] block">
                              {b.id}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDate(b.createdAt)}
                            </span>
                          </td>

                          {/* Khách hàng */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                              {b.customerName}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                              {b.customerPhone && <span>{b.customerPhone}</span>}
                              {b.customerEmail && (
                                <span className="truncate max-w-[140px] text-gray-400">• {b.customerEmail}</span>
                              )}
                            </div>
                          </td>

                          {/* Biệt thự */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${villa.color}`}
                            >
                              <Building className="w-3 h-3" />
                              {villa.name}
                            </span>
                          </td>

                          {/* Lịch trình */}
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#14171A] dark:text-[#FAF8F5] whitespace-nowrap">
                              {formatDate(b.checkIn)} ➔ {formatDate(b.checkOut)}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {nights} đêm • {b.adults} người lớn{b.children ? `, ${b.children} trẻ` : ''}
                            </div>
                          </td>

                          {/* Tổng tiền */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                              {formatVND(b.totalAmount)}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {b.paymentStatus === 'paid'
                                ? 'Đã thanh toán'
                                : 'Chưa thanh toán'}
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${st.className}`}
                            >
                              {st.label}
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {b.status === 'pending' ? (
                              <Link
                                href="/admin/bookings/pending"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C2A476] text-[#14171A] text-xs font-bold shadow-xs hover:bg-[#d4ba94] transition-colors"
                              >
                                <span>Duyệt Ngay</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <Link
                                href="/admin/bookings"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#C2A476]" />
                                <span>Chi tiết</span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}

function getVillaBadge(villaId: string) {
  const normalized = (villaId || '').toLowerCase();
  if (normalized.includes('b1')) {
    return { code: 'B1', name: 'Biệt Thự B1', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  }
  if (normalized.includes('b2')) {
    return { code: 'B2', name: 'Biệt Thự B2', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
  }
  if (normalized.includes('b3')) {
    return { code: 'B3', name: 'Biệt Thự B3', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  }
  if (normalized.includes('b4')) {
    return { code: 'B4', name: 'Biệt Thự B4', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
  }
  return { code: villaId, name: villaId, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' };
}

function getStatusBadge(status: string) {
  if (status === 'completed') {
    return {
      label: 'Hoàn Thành',
      className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    };
  }
  if (status === 'checked_in') {
    return {
      label: 'Đang Lưu Trú',
      className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold',
    };
  }
  if (status === 'pending') {
    return {
      label: 'Chờ Duyệt',
      className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold animate-pulse',
    };
  }
  if (status === 'confirmed') {
    return {
      label: 'Đã Xác Nhận',
      className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold',
    };
  }
  if (status === 'cancelled') {
    return {
      label: 'Đã Hủy',
      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    };
  }
  return {
    label: status,
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getNightCount(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}
