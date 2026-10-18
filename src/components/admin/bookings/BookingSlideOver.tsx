'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Printer,
  CheckCircle,
  XCircle,
  Edit3,
  Building,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Booking, PaymentStatus } from '@/lib/types';
import { LuxuryPaymentBadge } from './LuxuryPaymentBadge';
import {
  formatVND,
  formatUSD,
} from '@/lib/utils';
import {
  getStatusLabel,
  getStatusColor,
  getVillaColor,
  getPaymentStatusLabel,
} from '@/lib/mock-data';

interface BookingSlideOverProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, newStatus: Booking['status']) => void;
  onUpdatePaymentStatus?: (id: string, newPaymentStatus: PaymentStatus) => void;
  onOpenInvoice?: (booking: Booking) => void;
}

export function BookingSlideOver({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onOpenInvoice,
}: BookingSlideOverProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-[#1E2328] shadow-2xl border-l border-black/10 dark:border-white/10 flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: getVillaColor(booking.villaId) }}
              />
              <div>
                <h3 className="font-extrabold text-lg text-[#14171A] dark:text-[#FAF8F5]">
                  {booking.id}
                </h3>
                <p className="text-xs text-gray-500">
                  Villa {booking.villaId} • Đặt lúc {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            {/* Status & Payment Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5">
              <div>
                <span className="text-[11px] text-gray-500 block mb-1">Trạng thái đặt</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold inline-block"
                  style={{
                    backgroundColor: `${getStatusColor(booking.status)}20`,
                    color: getStatusColor(booking.status),
                  }}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 block mb-1">Thanh toán</span>
                <LuxuryPaymentBadge
                  status={booking.paymentStatus}
                  onChange={onUpdatePaymentStatus ? (newStatus) => onUpdatePaymentStatus(booking.id, newStatus) : undefined}
                />
              </div>
            </div>

            {/* Guest Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C2A476]" />
                Thông Tin Khách Hàng
              </h4>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2328] border border-black/5 dark:border-white/5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Họ và tên:</span>
                  <span className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                    {booking.customerName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Số điện thoại:</span>
                  <a
                    href={`tel:${booking.customerPhone}`}
                    className="font-semibold text-[#C2A476] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {booking.customerPhone}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Email:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {booking.customerEmail}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">CCCD / Hộ chiếu:</span>
                  <span className="font-mono text-xs">{booking.customerIdNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Số lượng khách:</span>
                  <span>
                    {booking.adults} người lớn{booking.children > 0 && `, ${booking.children} trẻ em`}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C2A476]" />
                Lịch Lưu Trú
              </h4>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-[#1E2328] rounded-xl shadow-xs">
                  <span className="text-[11px] text-gray-500 block mb-1">Nhận phòng (14:00)</span>
                  <p className="font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                    {new Date(booking.checkIn).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-[#1E2328] rounded-xl shadow-xs">
                  <span className="text-[11px] text-gray-500 block mb-1">Trả phòng (12:00)</span>
                  <p className="font-extrabold text-[#14171A] dark:text-[#FAF8F5]">
                    {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="col-span-2 text-center text-xs text-gray-500 font-medium">
                  Tổng thời gian lưu trú: <strong className="text-[#C2A476]">{booking.nights} đêm</strong>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#C2A476]" />
                Chi Tiết Thanh Toán
              </h4>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2328] border border-black/5 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Tiền phòng ({booking.nights} đêm):</span>
                  <span className="font-semibold">{formatVND(booking.totalAmount)}</span>
                </div>
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-[#14171A] dark:text-[#FAF8F5]">Tổng tiền thanh toán:</span>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-[#C2A476]">
                      {formatVND(booking.totalAmount)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      ≈ {formatUSD(booking.totalAmountUSD)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Request & Staff Notes */}
            {booking.specialRequests && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Yêu cầu đặc biệt của khách:
                </span>
                <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  {booking.specialRequests}
                </p>
              </div>
            )}

            {booking.staffNotes && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ghi chú nội bộ (Staff):
                </span>
                <p className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
                  {booking.staffNotes}
                </p>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="p-5 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-2.5">
            <div className="flex gap-2">
              {booking.status === 'pending' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Xác Nhận Đơn
                </button>
              )}

              {booking.status === 'confirmed' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'checked_in')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Khách Check-In
                </button>
              )}

              {booking.status === 'checked_in' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'completed')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn Thành (Check-Out)
                </button>
              )}

              {onOpenInvoice && (
                <button
                  onClick={() => onOpenInvoice(booking)}
                  className="py-2.5 px-3.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#C2A476] text-xs font-semibold flex items-center gap-1.5 text-[#14171A] dark:text-[#FAF8F5]"
                  title="In phiếu xác nhận / Hóa đơn"
                >
                  <Printer className="w-4 h-4 text-[#C2A476]" />
                  <span>In Phiếu</span>
                </button>
              )}

              <Link
                href={`/admin/bookings/${booking.id}`}
                className="py-2.5 px-3.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chi Tiết</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
