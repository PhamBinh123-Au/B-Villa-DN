'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  Printer,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { bookings } from '@/lib/mock-data';
import { VillaId, BookingSource, PaymentStatus, Booking } from '@/lib/types';
import { formatVND, formatUSD } from '@/lib/utils';
import { useToastStore } from '@/lib/store';
import { InvoiceModal } from '@/components/admin/bookings/InvoiceModal';
import { LuxuryDatePicker, addDays } from '@/components/LuxuryDatePicker';
import { createNewBookingInDb, mapIdToVillaCode, getLiveVillas } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';

export default function NewBookingPage() {
  const router = useRouter();
  const { addToast } = useToastStore();

  const today = new Date();
  const defaultInStr = today.toISOString().slice(0, 10);
  const defaultOutDate = new Date(today.getTime() + 2 * 86400000);
  const defaultOutStr = defaultOutDate.toISOString().slice(0, 10);

  const [initialVilla] = useState<VillaId>(() => {
    if (typeof window === 'undefined') return 'B1';
    const params = new URLSearchParams(window.location.search);
    return (params.get('villa') as VillaId) || 'B1';
  });

  const [initialCheckIn] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultInStr;
    const params = new URLSearchParams(window.location.search);
    return params.get('checkIn') || defaultInStr;
  });

  // Live Villas state synchronized with DB
  const [villasList, setVillasList] = useState(() => getLiveVillas());

  useEffect(() => {
    setVillasList(getLiveVillas());
    const unsub = bookingStore.subscribe(() => {
      setVillasList(getLiveVillas());
    });
    return () => unsub();
  }, []);

  // Form states
  const [selectedVillaId, setSelectedVillaId] = useState<VillaId>(initialVilla);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerIdNumber, setCustomerIdNumber] = useState('');
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(0);

  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultOutStr);
  const [bookingSource, setBookingSource] = useState<BookingSource>('direct');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [specialRequests, setSpecialRequests] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Villa Object
  const currentVilla = useMemo(() => {
    return villasList.find((v) => v.id === selectedVillaId) || villasList[0];
  }, [villasList, selectedVillaId]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // Live Pricing Engine: Direct nightly price * nights (no weekend/cleaning/discount surcharge)
  const priceCalculation = useMemo(() => {
    const baseRate = bookingStore.getVillaPrice(selectedVillaId);
    const totalBase = baseRate * nights;
    const totalVND = totalBase;
    const usdRate = bookingStore.getUsdRate() || 25450;
    const totalUSD = Math.round(totalVND / usdRate);

    return {
      baseRate,
      totalBase,
      totalVND,
      totalUSD,
    };
  }, [nights, selectedVillaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      addToast({
        type: 'error',
        title: 'Thiếu thông tin bắt buộc',
        message: 'Vui lòng nhập đầy đủ họ tên và số điện thoại liên hệ của khách hàng.',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newBooking = await createNewBookingInDb({
        villaId: selectedVillaId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || `${customerPhone}@guest.vn`,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        totalAmount: priceCalculation.totalVND,
        paymentStatus,
        status: 'confirmed',
        specialRequests,
        staffNotes,
      });

      setCreatedBooking(newBooking);
      addToast({
        type: 'success',
        title: 'Tạo đơn thành công!',
        message: `Đơn ${newBooking.id} của khách ${customerName} đã được lưu và khóa lịch trên toàn hệ thống.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Không thể tạo đơn',
        message: err.message || 'Lỗi trùng lịch hoặc lỗi hệ thống khi lưu đơn.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    const text = `Xin chào ${customerName}, B Villa Da Nang xin gửi xác nhận đặt phòng Villa ${selectedVillaId} từ ${checkInDate} đến ${checkOutDate} (${nights} đêm). Tổng tiền: ${formatVND(priceCalculation.totalVND)}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };


  return (
    <div className="space-y-6 animate-fade-in pb-16" suppressHydrationWarning>
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#C2A476] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đặt phòng</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
          Thêm Đặt Phòng Mới
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nhập thông tin chi tiết khách hàng và hệ thống sẽ tự động tính toán tổng chi phí
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Villa Selection (Card Picker) */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#C2A476]" />
              1. Chọn Biệt Thự Nghỉ Dưỡng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {villasList.map((villa) => {
                const isSelected = selectedVillaId === villa.id;
                const currentPrice = bookingStore.getVillaPrice(villa.id);
                return (
                  <div
                    key={villa.id}
                    onClick={() => setSelectedVillaId(villa.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C2A476] bg-[#C2A476]/5 shadow-sm'
                        : 'border-black/5 dark:border-white/10 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#1E2328]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                        Villa {villa.id}
                      </span>
                      <span className="text-xs font-bold text-[#C2A476]" suppressHydrationWarning>
                        {formatVND(currentPrice)}/đêm
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                      {villa.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{villa.bedrooms} PN</span> • <span>{villa.bathrooms} WC</span> • <span>Sức chứa: {villa.maxAdults || (villa.bedrooms === 2 ? 4 : 8)} Lớn + {villa.maxChildren ?? (villa.bedrooms === 2 ? 1 : 2)} Trẻ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Guest Details */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C2A476]" />
              2. Thông Tin Khách Hàng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Họ và Tên Khách *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Số Điện Thoại / Zalo *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0905 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="guest@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Số CCCD / Hộ Chiếu
                </label>
                <input
                  type="text"
                  placeholder="04809500xxxx"
                  value={customerIdNumber}
                  onChange={(e) => setCustomerIdNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Người Lớn
                </label>
                <input
                  type="number"
                  min={1}
                  max={currentVilla.maxGuests}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Trẻ Em (dưới 12 tuổi)
                </label>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476]"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Dates & Payment */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#C2A476]" />
              3. Lịch Lưu Trú & Thanh Toán
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <LuxuryDatePicker
                  label="Ngày Check-in (14:00)"
                  selectedDate={checkInDate}
                  onSelectDate={(val) => {
                    setCheckInDate(val);
                    if (val && (!checkOutDate || checkOutDate <= val)) {
                      setCheckOutDate(addDays(val, 2));
                    }
                  }}
                  villaId={selectedVillaId}
                  language="vi"
                  placeholder="Chọn ngày check-in"
                  cleanMode={false}
                />
              </div>

              <div>
                <LuxuryDatePicker
                  label="Ngày Check-out (12:00)"
                  selectedDate={checkOutDate}
                  onSelectDate={(val) => setCheckOutDate(val)}
                  villaId={selectedVillaId}
                  isCheckOut={true}
                  checkInDate={checkInDate}
                  minDate={checkInDate ? addDays(checkInDate, 1) : undefined}
                  language="vi"
                  placeholder="Chọn ngày check-out"
                  cleanMode={false}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>Tình Trạng Thanh Toán</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('unpaid')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentStatus === 'unpaid'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Chưa Thanh Toán</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('paid')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentStatus === 'paid'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Đã Thanh Toán</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">
                Yêu cầu đặc biệt của khách (BBQ, đưa đón sân bay, nôi trẻ em...):
              </label>
              <textarea
                rows={2}
                placeholder="Chuẩn bị set nướng BBQ lúc 18h..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">
                Ghi chú nội bộ dành cho nhân viên (Staff notes):
              </label>
              <textarea
                rows={2}
                placeholder="Khách VIP thân thiết, tặng giỏ trái cây tươi khi check-in..."
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 focus:outline-none focus:border-[#C2A476] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Price Breakdown & Submit: 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-md sticky top-24 space-y-6">
            <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C2A476]" />
              Bảng Tính Chi Phí
            </h3>

            {/* Detailed Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Số đêm lưu trú:</span>
                <span className="font-bold text-[#14171A] dark:text-[#FAF8F5]">
                  {nights} đêm
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Đơn giá / đêm:</span>
                <span className="font-semibold text-[#14171A] dark:text-[#FAF8F5]">{formatVND(priceCalculation.baseRate)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tổng tiền phòng:</span>
                <span className="font-semibold">{formatVND(priceCalculation.totalBase)}</span>
              </div>

              <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-baseline" suppressHydrationWarning>
                <div>
                  <span className="text-sm font-extrabold text-[#14171A] dark:text-[#FAF8F5] block">
                    Tổng Tiền (VNĐ):
                  </span>
                  <span className="text-[11px] text-gray-400" suppressHydrationWarning>
                    ≈ {formatUSD(priceCalculation.totalUSD)}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-[#C2A476]" suppressHydrationWarning>
                  {formatVND(priceCalculation.totalVND)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#C2A476] text-[#14171A] font-extrabold text-xs shadow-md hover:bg-[#d4ba94] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#14171A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Tạo Đặt Phòng</span>
                  </>
                )}
              </button>

              {createdBooking && (
                <div className="flex gap-2 pt-2 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setInvoiceModalOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 hover:border-[#C2A476] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-[#C2A476]" />
                    <span>In Phiếu</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Invoice Modal for preview and print */}
      <InvoiceModal
        booking={createdBooking}
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />
    </div>
  );
}


