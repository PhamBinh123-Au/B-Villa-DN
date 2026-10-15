'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, CheckCircle, Download } from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatVND, formatUSD } from '@/lib/utils';
import { getVillaColor, getStatusLabel } from '@/lib/mock-data';

interface InvoiceModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ booking, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E2328] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden my-8 animate-scale-in">
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/10 print:hidden bg-[#FAF8F5] dark:bg-[#14171A]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Phiếu Xác Nhận Đặt Phòng (Voucher)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In / Xuất PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-voucher" className="p-8 sm:p-12 text-[#14171A] dark:text-[#FAF8F5] space-y-8 bg-white">
          {/* Header with Luxury Brand */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b-2 border-[#C2A476]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C2A476] via-[#E2C799] to-[#a88d5f] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#14171A] rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="B Villa Da Nang Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(194,164,118,0.5)]"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-wider text-[#14171A]">
                  B VILLA DA NANG
                </h1>
                <p className="text-[11px] text-[#C2A476] font-bold tracking-widest uppercase">
                  Luxury Coastal Villa Retreats
                </p>
                <p className="text-[11px] text-gray-500">
                  Sơn Trà & Ngũ Hành Sơn, TP. Đà Nẵng
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#C2A476]/15 text-[#C2A476]">
                {booking.id}
              </span>
              <p className="text-xs text-gray-400 mt-1.5">
                Ngày phát hành: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Guest and Villa Info 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF8F5] border border-black/5">
              <p className="font-bold text-[#C2A476] uppercase tracking-wider text-[11px] mb-2">
                Thông Tin Khách Hàng
              </p>
              <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
              <p className="text-gray-600">SĐT: {booking.customerPhone}</p>
              <p className="text-gray-600">Email: {booking.customerEmail}</p>
              <p className="text-gray-600">CCCD/Hộ chiếu: {booking.customerIdNumber}</p>
              <p className="text-gray-600">
                Khách: {booking.adults} người lớn{booking.children > 0 && `, ${booking.children} trẻ em`}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF8F5] border border-black/5">
              <p className="font-bold text-[#C2A476] uppercase tracking-wider text-[11px] mb-2">
                Biệt Thự Đặt
              </p>
              <p className="text-sm font-bold text-gray-900">Villa {booking.villaId}</p>
              <p className="text-gray-600">
                Nhận phòng: <strong className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString('vi-VN')} (14:00)</strong>
              </p>
              <p className="text-gray-600">
                Trả phòng: <strong className="text-gray-900">{new Date(booking.checkOut).toLocaleDateString('vi-VN')} (12:00)</strong>
              </p>
              <p className="text-gray-600">
                Số đêm nghỉ: <strong className="text-[#C2A476]">{booking.nights} đêm</strong>
              </p>
              <p className="text-gray-600">
                Trạng thái: <strong className="text-blue-600">{getStatusLabel(booking.status)}</strong>
              </p>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="border border-black/10 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] text-gray-500 border-b border-black/5 font-semibold">
                <tr>
                  <th className="p-3.5">Hạng Mục</th>
                  <th className="p-3.5 text-center">Số Lượng</th>
                  <th className="p-3.5 text-right">Đơn Giá</th>
                  <th className="p-3.5 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="p-3.5 font-medium">Tiền phòng Villa {booking.villaId}</td>
                  <td className="p-3.5 text-center">{booking.nights} đêm</td>
                  <td className="p-3.5 text-right">{formatVND(Math.round(booking.totalAmount / Math.max(1, booking.nights)))}</td>
                  <td className="p-3.5 text-right font-semibold">
                    {formatVND(booking.totalAmount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-[#FAF8F5] border-t border-black/10 font-bold">
                <tr>
                  <td colSpan={3} className="p-3.5 text-right text-sm">
                    TỔNG CỘNG THANH TOÁN (VND):
                  </td>
                  <td className="p-3.5 text-right text-base text-[#C2A476]">
                    {formatVND(booking.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Terms & Footer Note */}
          <div className="pt-4 border-t border-black/5 text-[10px] text-gray-500 space-y-1 leading-relaxed">
            <p className="font-bold text-gray-700">Chính sách & Quy định lưu trú:</p>
            <p>• Giờ nhận phòng tiêu chuẩn: 14:00 - Giờ trả phòng: 12:00 trưa hôm sau.</p>
            <p>• Quý khách vui lòng xuất trình CCCD / Hộ chiếu bản gốc khi làm thủ tục nhận biệt thự.</p>
            <p>• Hotline hỗ trợ quản gia 24/7: 0236 1234 567 | Website: b-villa-dn.vercel.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
