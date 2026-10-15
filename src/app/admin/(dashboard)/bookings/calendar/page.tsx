'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  Info,
  Building,
  CheckCircle,
  AlertCircle,
  Move,
  ChevronDown,
} from 'lucide-react';
import { getStatusColor, getStatusLabel, getVillaColor } from '@/lib/mock-data';
import { Booking, BookingStatus, VillaId, Villa } from '@/lib/types';
import { formatVND } from '@/lib/utils';
import { BookingSlideOver } from '@/components/admin/bookings/BookingSlideOver';
import { useToastStore } from '@/lib/store';
import { getLiveBookings, updateBookingDatesInDb, updateBookingStatusInDb, getLiveVillas } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

export default function BookingsCalendarPage() {
  const [bookingsList, setBookingsList] = useState<Booking[]>(() => getLiveBookings());
  const [villasList, setVillasList] = useState<Villa[]>(() => getLiveVillas());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Dynamic current date
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    villaId: VillaId;
    date: string;
  }>({ isOpen: false, villaId: 'B1', date: '' });
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    daysShift: number;
  }>({ isOpen: false, booking: null, daysShift: 0 });
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { addToast } = useToastStore();

  // Load live data and subscribe to realtime updates
  useEffect(() => {
    setBookingsList(getLiveBookings());
    setVillasList(getLiveVillas());
    const unsub = bookingStore.subscribe(() => {
      setBookingsList(getLiveBookings());
      setVillasList(getLiveVillas());
    });
    return () => unsub();
  }, []);

  // Days count for current month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Generate days array
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Today indicator check
  const today = new Date();
  const todayDay = today.getDate();
  const isCurrentMonthNow = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const cur = new Date();
    setCurrentYear(cur.getFullYear());
    setCurrentMonth(cur.getMonth());
  };

  // Click on empty cell
  const handleCellClick = (villaId: VillaId, day: number) => {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setQuickAddModal({
      isOpen: true,
      villaId,
      date: dateStr,
    });
  };

  // Drag & Reschedule Confirmation
  const confirmReschedule = async () => {
    if (!rescheduleModal.booking) return;
    const b = rescheduleModal.booking;
    const shift = rescheduleModal.daysShift;

    // Shift check-in and check-out dates
    const inDate = new Date(b.checkIn);
    inDate.setDate(inDate.getDate() + shift);
    const outDate = new Date(b.checkOut);
    outDate.setDate(outDate.getDate() + shift);

    const inStr = inDate.toISOString().slice(0, 10);
    const outStr = outDate.toISOString().slice(0, 10);

    try {
      await updateBookingDatesInDb(b.id, inStr, outStr);
      setRescheduleModal({ isOpen: false, booking: null, daysShift: 0 });
      addToast({
        type: 'success',
        title: 'Đổi lịch thành công',
        message: `Đơn ${b.id} của ${b.customerName} đã được chuyển sang ${inDate.toLocaleDateString('vi-VN')} - ${outDate.toLocaleDateString('vi-VN')}.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Không thể dời lịch',
        message: err?.message || 'Có xung đột phòng hoặc lỗi hệ thống.',
        duration: 5000,
      });
    }
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];


  return (
    <div className="space-y-6 animate-fade-in pb-12" suppressHydrationWarning>
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Lịch Đặt Phòng (Timeline)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Giao diện Gantt biểu diễn lịch lưu trú trực quan theo 4 biệt thự B1, B2, B3, B4
          </p>
        </div>

        {/* Month Navigation & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Navigator */}
          <div className="relative flex items-center gap-1 bg-white dark:bg-[#1E2328] rounded-xl p-1 border border-black/10 dark:border-white/10 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 hover:text-[#14171A] dark:hover:text-[#FAF8F5]" />
            </button>
            <button
              type="button"
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="px-3 py-1 text-xs font-bold text-[#14171A] dark:text-[#FAF8F5] min-w-[130px] text-center hover:text-[#C2A476] transition-colors flex items-center justify-center gap-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span>{monthNames[currentMonth]} / {currentYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#C2A476]" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4 text-gray-500 hover:text-[#14171A] dark:hover:text-[#FAF8F5]" />
            </button>

            {/* Luxury Month & Year Selector Popover */}
            {showMonthPicker && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-64 bg-white dark:bg-[#1E2328] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] dark:border-[#C2A476]/30 p-3.5 space-y-3 animate-scale-in">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
                  <span className="text-[11px] font-bold uppercase text-[#C2A476] tracking-wider">
                    Chọn Thời Gian Lịch
                  </span>
                  <div className="flex items-center gap-1 text-[#14171A] dark:text-[#FAF8F5]">
                    <button
                      type="button"
                      onClick={() => setCurrentYear((y) => y - 1)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold"
                    >
                      ‹
                    </button>
                    <span className="text-xs font-bold font-mono px-1">{currentYear}</span>
                    <button
                      type="button"
                      onClick={() => setCurrentYear((y) => y + 1)}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {monthNames.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(idx);
                        setShowMonthPicker(false);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-center font-semibold transition-all ${
                        idx === currentMonth
                          ? 'bg-gradient-to-r from-[#C2A476] to-[#d4ba94] text-[#14171A] font-bold shadow-sm'
                          : 'hover:bg-[#FAF8F5] dark:hover:bg-[#14171A] text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGoToday}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E2328] border border-black/10 dark:border-white/10 text-xs font-bold hover:border-[#C2A476] shadow-xs transition-colors"
          >
            Hôm nay
          </button>

          {/* View toggle */}
          <div className="flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#1E2328] text-[#14171A] dark:text-[#FAF8F5] shadow-xs'
                  : 'text-gray-500 hover:text-[#14171A]'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-[#1E2328] text-[#14171A] dark:text-[#FAF8F5] shadow-xs'
                  : 'text-gray-500 hover:text-[#14171A]'
              }`}
            >
              Tuần
            </button>
          </div>

          <Link
            href="/admin/bookings/new"
            className="px-4 py-2 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đặt</span>
          </Link>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E2328] border border-black/5 dark:border-white/5 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-gray-500 flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#C2A476]" /> Trạng thái:
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Đã xác nhận
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Chờ duyệt
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đang lưu trú
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Đã hoàn thành / Khóa phòng
          </span>
        </div>

        <p className="text-[11px] text-gray-400">
          * Click vào ô trống để tạo nhanh đơn đặt • Click vào thanh để xem chi tiết
        </p>
      </div>

      {/* Multi-villa Gantt Timeline Board */}
      <div className="bg-white dark:bg-[#1E2328] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header: Days Row */}
            <div
              style={{ gridTemplateColumns: `160px repeat(${daysInMonth}, minmax(32px, 1fr))` }}
              className="grid border-b border-black/5 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#14171A] text-center text-xs font-bold text-gray-500"
            >
              <div className="p-3.5 text-left border-r border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-300 font-extrabold">
                Biệt Thự
              </div>

              {daysArray.map((day) => {
                const dateObj = new Date(currentYear, currentMonth, day);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                const isToday = isCurrentMonthNow && day === todayDay;

                return (
                  <div
                    key={day}
                    className={`py-2 px-1 border-r border-black/[0.04] dark:border-white/[0.04] text-[11px] flex flex-col items-center justify-center ${
                      isToday
                        ? 'bg-[#C2A476]/20 text-[#C2A476] font-extrabold'
                        : isWeekend
                        ? 'bg-black/[0.02] dark:bg-white/[0.02] text-[#C2A476]'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-medium">
                      {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dateObj.getDay()]}
                    </span>
                    <span className="text-xs">{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Villa Rows */}
            {villasList.map((villa) => {
              const villaColor = getVillaColor(villa.id);

              const monthStartStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
              const monthEndStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

              // Filter bookings for this villa in this month
              const villaBookings = bookingsList.filter((b) => {
                if (b.villaId !== villa.id) return false;
                if (b.status === 'cancelled') return false;
                return b.checkIn <= monthEndStr && b.checkOut >= monthStartStr;
              });

              return (
                <div
                  key={villa.id}
                  style={{ gridTemplateColumns: `160px repeat(${daysInMonth}, minmax(32px, 1fr))` }}
                  className="grid border-b border-black/5 dark:border-white/5 relative min-h-[90px] group"
                >
                  {/* Villa Card Info on Left */}
                  <div className="p-3 border-r border-black/5 dark:border-white/10 bg-[#FAF8F5]/50 dark:bg-[#14171A]/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: villaColor }}
                      />
                      <span className="font-extrabold text-sm text-[#14171A] dark:text-[#FAF8F5]">
                        Villa {villa.id}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate">
                      {villa.bedrooms} PN • {villa.location}
                    </span>
                    <span className="text-[10px] text-[#C2A476] font-semibold mt-0.5">
                      {formatVND(bookingStore.getVillaPrice(villa.id))}/đêm
                    </span>
                  </div>

                  {/* Grid cells for each day */}
                  {daysArray.map((day) => {
                    const isToday = isCurrentMonthNow && day === todayDay;
                    return (
                      <div
                        key={day}
                        onClick={() => handleCellClick(villa.id, day)}
                        className={`border-r border-black/[0.03] dark:border-white/[0.03] transition-colors cursor-pointer hover:bg-[#C2A476]/10 relative ${
                          isToday ? 'bg-[#C2A476]/5' : ''
                        }`}
                        title={`Click để đặt Villa ${villa.id} ngày ${day}/${currentMonth + 1}`}
                      />
                    );
                  })}

                  {/* Render Bookings as Spanning Bars */}
                  {villaBookings.map((b) => {
                    // Clamp to current month days
                    let startDay = 1;
                    if (b.checkIn >= monthStartStr) {
                      startDay = parseInt(b.checkIn.slice(8, 10), 10);
                    }

                    let endDay = daysInMonth;
                    if (b.checkOut <= monthEndStr) {
                      endDay = parseInt(b.checkOut.slice(8, 10), 10);
                    }

                    const spanDays = Math.max(1, endDay - startDay);

                    // Grid column calculation: index 1 is villa column, days start at col 2
                    const gridColStart = startDay + 1;
                    const gridColEnd = gridColStart + spanDays;

                    const statusBg = getStatusColor(b.status);

                    return (
                      <div
                        key={b.id}
                        style={{
                          gridColumnStart: gridColStart,
                          gridColumnEnd: gridColEnd,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                          setSlideOverOpen(true);
                        }}
                        className="my-auto mx-1 h-14 rounded-xl shadow-md p-2 text-white cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-20 relative flex flex-col justify-between overflow-hidden"
                      >
                        {/* Background with custom status color */}
                        <div
                          className="absolute inset-0 opacity-90 transition-opacity hover:opacity-100"
                          style={{ backgroundColor: statusBg }}
                        />

                        <div className="relative z-10 flex items-center justify-between text-[11px] leading-tight font-bold">
                          <span className="truncate">{b.customerName}</span>
                          <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-mono ml-1 shrink-0">
                            {b.id.replace('BVN-2025-', '#')}
                          </span>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-[10px] text-white/90">
                          <span>{b.nights} đêm</span>
                          {/* Reschedule trigger pill */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRescheduleModal({
                                isOpen: true,
                                booking: b,
                                daysShift: 2,
                              });
                            }}
                            className="p-0.5 rounded bg-white/20 hover:bg-white/40 text-[9px] font-semibold"
                            title="Đổi dời lịch"
                          >
                            <Move className="w-2.5 h-2.5 inline mr-0.5" /> Dời
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Slide-Over Drawer */}
      <BookingSlideOver
        booking={selectedBooking}
        isOpen={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onUpdateStatus={async (id, st) => {
          await updateBookingStatusInDb(id, st);
          setBookingsList((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: st } : b))
          );
          if (selectedBooking) {
            setSelectedBooking((prev) => (prev ? { ...prev, status: st } : null));
          }
          addToast({
            type: 'success',
            title: 'Cập nhật trạng thái thành công',
            message: `Đơn ${id} đã chuyển sang trạng thái mới.`,
            duration: 4000,
          });
        }}
      />

      {/* Quick Add Modal */}
      {quickAddModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: getVillaColor(quickAddModal.villaId) }}
              />
              <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                Đặt Nhanh Villa {quickAddModal.villaId}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Khởi tạo đơn đặt mới bắt đầu từ ngày <strong>{quickAddModal.date}</strong>. Bạn muốn chuyển tới form đầy đủ để hoàn tất thông tin khách hàng và giá?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  setQuickAddModal({ isOpen: false, villaId: 'B1', date: '' })
                }
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <Link
                href={`/admin/bookings/new?villa=${quickAddModal.villaId}&checkIn=${quickAddModal.date}`}
                className="flex-1 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold text-center hover:bg-[#d4ba94] transition-colors"
              >
                Tiếp Tục Đặt Phòng
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Confirmation Dialog */}
      {rescheduleModal.isOpen && rescheduleModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                Xác Nhận Dời Lịch Đặt Phòng
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Bạn có chắc chắn muốn dời lịch của đơn <strong>{rescheduleModal.booking.id}</strong> ({rescheduleModal.booking.customerName}) thêm <strong>+{rescheduleModal.daysShift} ngày</strong>?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  setRescheduleModal({ isOpen: false, booking: null, daysShift: 0 })
                }
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={confirmReschedule}
                className="flex-1 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] transition-colors"
              >
                Xác Nhận Dời Lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
