'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  Building,
  CheckCircle,
  XCircle,
  Printer,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  Shield,
  FileText,
  Trash2,
} from 'lucide-react';
import { bookings, getStatusLabel, getStatusColor, getVillaColor, getPaymentStatusLabel } from '@/lib/mock-data';
import { Booking, BookingStatus, PaymentStatus } from '@/lib/types';
import { formatVND, formatUSD } from '@/lib/utils';
import { InvoiceModal } from '@/components/admin/bookings/InvoiceModal';
import { LuxuryPaymentBadge } from '@/components/admin/bookings/LuxuryPaymentBadge';
import { LuxuryConfirmDialog } from '@/components/LuxuryConfirmDialog';
import { useToastStore } from '@/lib/store';
import { getLiveBookings, updateBookingStatusInDb, updateBookingPaymentStatusInDb, deleteBookingInDb } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

function BookingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToastStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(() => {
    const list = getLiveBookings();
    return list.find((b) => b.id === bookingId) || bookings.find((b) => b.id === bookingId) || null;
  });
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    const loadBooking = () => {
      const list = getLiveBookings();
      const found = list.find((b) => b.id === bookingId) || bookings.find((b) => b.id === bookingId) || null;
      setBooking(found);
    };
    loadBooking();
    const unsub = bookingStore.subscribe(loadBooking);
    return () => unsub();
  }, [bookingId]);

  const updateStatus = async (newStatus: BookingStatus) => {
    if (!booking) return;
    try {
      const willBePaid = newStatus === 'checked_in' || newStatus === 'completed';
      await updateBookingStatusInDb(booking.id, newStatus);
      setBooking((prev) => (prev ? { 
        ...prev, 
        status: newStatus,
        ...(willBePaid ? { paymentStatus: 'paid' as PaymentStatus } : {})
      } : null));
      addToast({
        type: 'success',
        title: 'Cập nhật trạng thái',
        message: willBePaid
          ? `Đơn ${booking.id} đã chuyển sang "${getStatusLabel(newStatus)}" và tự động cập nhật "Đã Thanh Toán".`
          : `Đơn ${booking.id} đã chuyển sang "${getStatusLabel(newStatus)}" và đồng bộ hệ thống.`,
        duration: 4000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi cập nhật',
        message: err?.message || 'Không thể cập nhật trạng thái',
        duration: 4000,
      });
    }
  };

  const updatePaymentStatus = async (newPaymentStatus: PaymentStatus) => {
    if (!booking) return;
    try {
      await updateBookingPaymentStatusInDb(booking.id, newPaymentStatus);
      setBooking((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus } : null));
      addToast({
        type: 'success',
        title: 'Cập nhật thanh toán',
        message: `Đơn ${booking.id} đã chuyển sang "${getPaymentStatusLabel(newPaymentStatus)}".`,
        duration: 3500,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi cập nhật thanh toán',
        message: err?.message || 'Không thể cập nhật trạng thái thanh toán',
        duration: 4000,
      });
    }
  };

  const handleConfirmDeleteBooking = async () => {
    if (!booking) return;
    setIsDeleting(true);
    try {
      await deleteBookingInDb(booking.id);
      addToast({
        type: 'info',
        title: 'Đã xóa đơn đặt phòng',
        message: `Đơn ${booking.id} đã được xóa vĩnh viễn khỏi hệ thống.`,
        duration: 4000,
      });
      setDeleteOpen(false);
      router.push('/admin/bookings');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi xóa đơn',
        message: err?.message || 'Có lỗi xảy ra khi xóa đơn.',
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };


  if (!booking) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-4 shadow-sm">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#14171A] dark:text-[#FAF8F5] mb-2">
          Không Tìm Thấy Đơn Đặt Phòng #{bookingId}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          Mã đơn đặt phòng này có thể đã bị xóa hoặc không tồn tại trong hệ thống cơ sở dữ liệu.
        </p>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] font-bold text-xs hover:bg-[#d4ba94] transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đặt phòng</span>
        </Link>
      </div>
    );
  }

  const statusColor = getStatusColor(booking.status);

  return (
    <div className="space-y-6 animate-fade-in pb-16" suppressHydrationWarning>
      {/* Top back */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#C2A476] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInvoiceOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#C2A476] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#C2A476]" />
            <span>In Phiếu Xác Nhận</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md"
            style={{ backgroundColor: getVillaColor(booking.villaId) }}
          >
            {booking.villaId}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                {booking.id}
              </h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold inline-block"
                style={{
                  backgroundColor: `${statusColor}15`,
                  color: statusColor,
                }}
              >
                {getStatusLabel(booking.status)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Khách hàng: <strong className="text-[#14171A] dark:text-[#FAF8F5]">{booking.customerName}</strong>
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {booking.status === 'pending' && (
            <button
              onClick={() => updateStatus('confirmed')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Xác Nhận Đặt Phòng
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => updateStatus('checked_in')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Khách Nhận Phòng (Check-in)
            </button>
          )}
          {booking.status === 'checked_in' && (
            <button
              onClick={() => updateStatus('completed')}
              className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Khách Trả Phòng (Check-out)
            </button>
          )}
          {booking.status !== 'cancelled' ? (
            <button
              onClick={() => updateStatus('cancelled')}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-bold transition-all"
            >
              Hủy Đơn Này
            </button>
          ) : (
            <button
              onClick={() => setDeleteOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Vĩnh Viễn Đơn Này</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Columns Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Guest Card */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C2A476]" />
              Hồ Sơ Khách Hàng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Họ và tên:</span>
                <span className="font-bold text-sm text-[#14171A] dark:text-[#FAF8F5]">{booking.customerName}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Số điện thoại:</span>
                <span className="font-bold text-[#C2A476]">{booking.customerPhone}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Email:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{booking.customerEmail}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">CCCD / Hộ chiếu:</span>
                <span className="font-mono">{booking.customerIdNumber}</span>
              </div>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C2A476]" />
              Chi Tiết Thời Gian Lưu Trú
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Nhận phòng</span>
                <p className="font-extrabold text-sm">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</p>
                <span className="text-[10px] text-gray-400">Từ 14:00</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Trả phòng</span>
                <p className="font-extrabold text-sm">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</p>
                <span className="text-[10px] text-gray-400">Trước 12:00 trưa</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A]">
                <span className="text-gray-400 block mb-1">Thời lượng</span>
                <p className="font-extrabold text-sm text-[#C2A476]">{booking.nights} đêm</p>
                <span className="text-[10px] text-gray-400">{booking.adults} lớn, {booking.children} trẻ em</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Financial summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C2A476]" />
              Hóa Đơn & Thanh Toán
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-gray-500">
                <span className="font-medium">Thanh toán:</span>
                <LuxuryPaymentBadge
                  status={booking.paymentStatus}
                  onChange={updatePaymentStatus}
                />
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Tiền phòng ({booking.nights} đêm):</span>
                <span className="font-semibold">{formatVND(booking.totalAmount)}</span>
              </div>
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-baseline">
                <span className="font-extrabold text-sm">Tổng cộng:</span>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-[#C2A476]">{formatVND(booking.totalAmount)}</p>
                  <p className="text-[11px] text-gray-400">≈ {formatUSD(booking.totalAmountUSD)}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setInvoiceOpen(true)}
                className="w-full py-3 rounded-xl bg-[#C2A476] text-[#14171A] font-bold text-xs hover:bg-[#d4ba94] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Xem & In Hóa Đơn Chi Tiết</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <InvoiceModal
        booking={booking}
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
      />

      {/* Luxury Deletion Confirmation Modal */}
      <LuxuryConfirmDialog
        isOpen={deleteOpen}
        variant="danger"
        badgeText="Bảo Mật & Cảnh Báo"
        title="Xác Nhận Xóa Vĩnh Viễn"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt phòng ${booking.id} không?\nThao tác này sẽ gỡ bỏ hoàn toàn hồ sơ và giải phóng các ngày lưu trú trên trang web.`}
        noticeText="Lưu ý: Dữ liệu sau khi xóa vĩnh viễn sẽ không thể phục hồi dưới bất kỳ hình thức nào."
        details={[
          { label: 'Mã đơn đặt phòng', value: `#${booking.id}` },
          { label: 'Khách hàng', value: booking.customerName },
          { label: 'Biệt thự lưu trú', value: booking.villaId },
          {
            label: 'Thời gian lưu trú',
            value: `${booking.checkIn} → ${booking.checkOut} (${booking.nights} đêm)`,
          },
          {
            label: 'Tổng giá trị đơn',
            value: formatVND(booking.totalAmount),
          },
          {
            label: 'Trạng thái hiện tại',
            value: getStatusLabel(booking.status),
          },
        ]}
        confirmText="Xác Nhận Xóa Vĩnh Viễn"
        cancelText="Hủy Bỏ"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteBooking}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Đang tải thông tin đặt phòng...</div>}>
      <BookingDetailContent />
    </React.Suspense>
  );
}

