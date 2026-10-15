'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Building,
} from 'lucide-react';
import { getVillaColor } from '@/lib/mock-data';
import { Booking } from '@/lib/types';
import { formatVND } from '@/lib/utils';
import { useToastStore } from '@/lib/store';
import {
  getLiveBookings,
  confirmBookingInDb,
  cancelBookingInDb,
  mapIdToVillaCode,
} from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

export default function PendingBookingsPage() {
  const [list, setList] = useState<Booking[]>(() =>
    getLiveBookings().filter((b) => b.status === 'pending')
  );
  const { addToast } = useToastStore();

  React.useEffect(() => {
    setList(getLiveBookings().filter((b) => b.status === 'pending'));
    const unsubscribe = bookingStore.subscribe(() => {
      setList(getLiveBookings().filter((b) => b.status === 'pending'));
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      await confirmBookingInDb(id);
      setList((prev) => prev.filter((b) => b.id !== id));
      addToast({
        type: 'success',
        title: 'Đã duyệt đặt phòng',
        message: `Đơn ${id} của ${name} đã được phê duyệt thành công. Phòng đã được chốt và khóa lịch trên trang web.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Không thể duyệt đơn',
        message: err?.message || 'Có xung đột phòng hoặc lỗi hệ thống.',
        duration: 5000,
      });
      setList(getLiveBookings().filter((b) => b.status === 'pending'));
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await cancelBookingInDb(id);
      setList((prev) => prev.filter((b) => b.id !== id));
      addToast({
        type: 'warning',
        title: 'Đã từ chối đơn',
        message: `Đơn ${id} của ${name} đã bị từ chối do không khả dụng.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi từ chối đơn',
        message: err?.message || 'Có lỗi xảy ra khi xử lý.',
        duration: 5000,
      });
      setList(getLiveBookings().filter((b) => b.status === 'pending'));
    }
  };


  return (
    <div className="space-y-6 animate-fade-in pb-16" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
              Yêu Cầu Chờ Duyệt
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {list.length} đơn cần xử lý
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Quy định SLA: Cần phản hồi phê duyệt hoặc liên hệ lại với khách trong vòng 2 giờ
          </p>
        </div>

        <Link
          href="/admin/bookings"
          className="text-xs text-[#C2A476] hover:underline font-bold inline-flex items-center gap-1"
        >
          Xem tất cả đơn đặt phòng <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards List */}
      {list.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#1E2328] rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
            Tuyệt vời! Không còn đơn đặt phòng nào đang chờ duyệt
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tất cả các yêu cầu mới đều đã được xử lý kịp thời.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((booking) => {
            const villaColor = getVillaColor(booking.villaId);
            const fullVillaCode = mapIdToVillaCode(booking.villaId);
            const conflict = bookingStore.hasDateConflict(booking.checkIn, booking.checkOut, fullVillaCode, booking.id);
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold"
                      style={{
                        backgroundColor: `${villaColor}15`,
                        color: villaColor,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: villaColor }} />
                      Villa {booking.villaId}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{booking.id}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                    {booking.customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#C2A476] font-semibold mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${booking.customerPhone}`} className="hover:underline">
                      {booking.customerPhone}
                    </a>
                  </div>

                  {/* Dates */}
                  <div className="mt-4 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lịch trình:</span>
                      <span className="font-bold">
                        {new Date(booking.checkIn).toLocaleDateString('vi-VN')} -{' '}
                        {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Thời lượng:</span>
                      <span className="font-semibold">{booking.nights} đêm ({booking.adults} lớn, {booking.children} trẻ)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-black/5 dark:border-white/5 font-extrabold text-[#C2A476]">
                      <span>Tổng tiền:</span>
                      <span>{formatVND(booking.totalAmount)}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <p className="mt-3 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl line-clamp-2">
                      Ghi chú: {booking.specialRequests}
                    </p>
                  )}

                  {conflict && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <p className="font-extrabold">Cảnh báo cấn phòng!</p>
                        <p className="text-[11px] mt-0.5 leading-relaxed">
                          Trùng lịch với #{conflict.id} ({conflict.guestName}) từ {new Date(conflict.checkIn).toLocaleDateString('vi-VN')} đến {new Date(conflict.checkOut).toLocaleDateString('vi-VN')}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5 flex gap-2">
                  <button
                    onClick={() => handleReject(booking.id, booking.customerName)}
                    className="flex-1 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 text-xs font-bold transition-colors"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(booking.id, booking.customerName)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Duyệt đơn
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
