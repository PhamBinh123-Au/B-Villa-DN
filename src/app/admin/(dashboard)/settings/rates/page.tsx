'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft,
  Building,
  Info,
  Sliders,
  FileSpreadsheet,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { villas as initialVillas, getVillaColor } from '@/lib/mock-data';
import { Villa, VillaId } from '@/lib/types';
import { formatVND, formatUSD, formatCompactVND } from '@/lib/utils';
import { useToastStore } from '@/lib/store';
import { updateVillaRatesInDb, mapIdToVillaCode } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';

interface VillaPricingState {
  id: VillaId;
  name: string;
  nameEn: string;
  location: string;
  bedrooms: number;
  maxGuests: number;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  cleaningFee: number;
  depositPercentage: number;
  minimumNights: number;
  isModified?: boolean;
}

export default function RoomRatesSettingsPage() {
  const { addToast } = useToastStore();

  // Exchange Rate State (VNĐ per 1 USD)
  const [exchangeRate, setExchangeRate] = useState<number>(25450);
  const [autoSyncRate, setAutoSyncRate] = useState<boolean>(true);
  const [calculatorVND, setCalculatorVND] = useState<number>(18000000);
  const [calculatorUSD, setCalculatorUSD] = useState<number>(Math.round(18000000 / 25450));

  // Villas Pricing State
  const [pricingData, setPricingData] = useState<VillaPricingState[]>(() =>
    initialVillas.map((v) => ({
      id: v.id,
      name: v.name,
      nameEn: v.nameEn,
      location: v.location,
      bedrooms: v.bedrooms,
      maxGuests: v.maxGuests,
      weekdayPrice: v.pricing.weekdayPrice,
      weekendPrice: v.pricing.weekendPrice,
      holidayPrice: v.pricing.holidayPrice,
      cleaningFee: v.pricing.cleaningFee,
      depositPercentage: v.pricing.depositPercentage,
      minimumNights: v.pricing.minimumNights,
      isModified: false,
    }))
  );

  // Sync with live DB on load and realtime updates
  useEffect(() => {
    const syncPrices = () => {
      const curPrices = bookingStore.getAllVillaPrices();
      const curUsdRate = bookingStore.getUsdRate();
      if (curUsdRate) {
        setExchangeRate(curUsdRate);
      }
      setPricingData((prev) =>
        prev.map((v) => {
          const livePrice = bookingStore.getVillaPrice(v.id);
          return {
            ...v,
            weekdayPrice: v.isModified ? v.weekdayPrice : livePrice,
            weekendPrice: v.isModified ? v.weekendPrice : Math.round(livePrice * 1.2),
            holidayPrice: v.isModified ? v.holidayPrice : Math.round(livePrice * 1.45),
          };
        })
      );
    };

    syncPrices();
    const unsub = bookingStore.subscribe(syncPrices);
    return () => unsub();
  }, []);

  // Currency helper
  const convertToUSD = (vnd: number): number => {
    if (!exchangeRate || exchangeRate <= 0) return 0;
    return vnd / exchangeRate;
  };

  // Handle calculator input
  const handleVNDCalcChange = (vndVal: number) => {
    setCalculatorVND(vndVal);
    if (exchangeRate > 0) {
      setCalculatorUSD(Number((vndVal / exchangeRate).toFixed(2)));
    }
  };

  const handleUSDCalcChange = (usdVal: number) => {
    setCalculatorUSD(usdVal);
    setCalculatorVND(Math.round(usdVal * exchangeRate));
  };

  // Update specific price field for a villa
  const handlePriceChange = (
    villaId: VillaId,
    field: keyof VillaPricingState,
    value: number
  ) => {
    setPricingData((prev) =>
      prev.map((v) => {
        if (v.id === villaId) {
          return {
            ...v,
            [field]: value,
            isModified: true,
          };
        }
        return v;
      })
    );
  };

  // Quick percentage adjustment for a villa (+5%, +10%, -5%)
  const handleQuickAdjust = (villaId: VillaId, percentage: number) => {
    setPricingData((prev) =>
      prev.map((v) => {
        if (v.id === villaId) {
          const factor = 1 + percentage / 100;
          return {
            ...v,
            weekdayPrice: Math.round((v.weekdayPrice * factor) / 100000) * 100000,
            weekendPrice: Math.round((v.weekendPrice * factor) / 100000) * 100000,
            holidayPrice: Math.round((v.holidayPrice * factor) / 100000) * 100000,
            isModified: true,
          };
        }
        return v;
      })
    );
    addToast({
      type: 'info',
      title: 'Điều chỉnh nhanh tỷ lệ',
      message: `Đã áp dụng ${percentage > 0 ? '+' : ''}${percentage}% cho biệt thự ${villaId}. Đừng quên nhấn "Lưu".`,
      duration: 3500,
    });
  };

  // Save single villa
  const handleSaveVilla = async (villaId: VillaId) => {
    const villa = pricingData.find((v) => v.id === villaId);
    if (!villa) return;

    try {
      await updateVillaRatesInDb({ [villaId]: villa.weekdayPrice }, exchangeRate);

      setPricingData((prev) =>
        prev.map((v) => (v.id === villaId ? { ...v, isModified: false } : v))
      );

      addToast({
        type: 'success',
        title: `Lưu thành công: Biệt Thự ${villaId}`,
        message: `Bảng giá mới: Ngày thường ${formatVND(villa.weekdayPrice)} (${formatUSD(convertToUSD(villa.weekdayPrice))}) đã được cập nhật vào hệ thống và trang chủ.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi cập nhật giá',
        message: err?.message || 'Không thể lưu giá vào hệ thống.',
        duration: 5000,
      });
    }
  };

  // Save all villas
  const handleSaveAll = async () => {
    try {
      const ratesToSave: Partial<Record<VillaId, number>> = {};
      pricingData.forEach((v) => {
        ratesToSave[v.id] = v.weekdayPrice;
      });

      await updateVillaRatesInDb(ratesToSave, exchangeRate);

      setPricingData((prev) => prev.map((v) => ({ ...v, isModified: false })));
      addToast({
        type: 'success',
        title: 'Đã lưu toàn bộ bảng giá phòng & tỷ giá USD',
        message: `Đã cập nhật bảng giá của 4 biệt thự với tỷ giá 1 USD = ${formatVND(exchangeRate)}. Toàn hệ thống và website khách hàng đã đồng bộ tức thời.`,
        duration: 5000,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Lỗi cập nhật bảng giá',
        message: err?.message || 'Không thể lưu bảng giá vào hệ thống.',
        duration: 5000,
      });
    }
  };

  const modifiedCount = pricingData.filter((v) => v.isModified).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">


      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2A476]/15 border border-[#C2A476]/30 text-[#C2A476] text-xs font-bold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Hệ Thống Thiết Lập Giá Thuê & Đa Tiền Tệ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Điều Chỉnh Giá Phòng & Quy Đổi USD
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Cấu hình giá thuê theo ngày thường, cuối tuần, ngày lễ cho từng biệt thự (B1 - B4) kèm tính toán quy đổi tức thời sang Đô la Mỹ (USD).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {modifiedCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse">
              Có {modifiedCount} phòng chưa lưu
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-extrabold shadow-md hover:bg-[#d4ba94] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Exchange Rate Master Controls & Quick Live Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Exchange Rate Card (8 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#C2A476]" />
                Tỷ Giá Quy Đổi Ngoại Tệ (USD / VNĐ)
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Vietcombank
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tất cả giá tiền VNĐ khi khách nước ngoài xem trên trang đặt phòng và xuất hóa đơn sẽ được chia trực tiếp theo tỷ giá này.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400">1 Đô La Mỹ ($1 USD) =</span>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Math.max(1, Number(e.target.value)))}
                  className="w-36 px-3 py-1.5 text-xl font-extrabold text-[#C2A476] bg-white dark:bg-[#1E2328] border border-[#C2A476]/40 rounded-xl focus:outline-none focus:border-[#C2A476]"
                />
                <span className="text-sm font-bold text-gray-500">VNĐ</span>
              </div>
            </div>

            {/* Preset Rates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block">Chọn nhanh tỷ giá:</span>
              <div className="flex flex-wrap gap-1.5">
                {[25000, 25300, 25450, 25500].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setExchangeRate(rate);
                      addToast({
                        type: 'info',
                        title: 'Đã đổi tỷ giá tham chiếu',
                        message: `Đã đặt 1 USD = ${formatVND(rate)}`,
                        duration: 2500,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      exchangeRate === rate
                        ? 'bg-[#C2A476] text-[#14171A]'
                        : 'bg-white dark:bg-[#1E2328] text-gray-600 dark:text-gray-400 border border-black/5 dark:border-white/10 hover:border-[#C2A476]'
                    }`}
                  >
                    {rate.toLocaleString('vi-VN')}₫
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Converter Widget (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#14171A] via-[#1E2328] to-[#14171A] rounded-3xl p-6 text-white border border-[#C2A476]/30 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#C2A476] flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Công Cụ Tính & Quy Đổi Nhanh
              </h3>
            </div>
            <p className="text-xs text-gray-400">
              Nhập số tiền VNĐ hoặc USD để kiểm tra số liệu quy đổi hai chiều tức thời.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300">Việt Nam Đồng (VNĐ):</label>
              <input
                type="number"
                step="500000"
                value={calculatorVND}
                onChange={(e) => handleVNDCalcChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-[#C2A476]"
              />
              <span className="text-[10px] text-gray-400 block truncate">
                {formatVND(calculatorVND)}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-300">Đô La Mỹ (USD):</label>
              <input
                type="number"
                step="10"
                value={calculatorUSD}
                onChange={(e) => handleUSDCalcChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#C2A476]/20 border border-[#C2A476]/50 text-[#C2A476] font-bold text-sm focus:outline-none focus:border-[#C2A476]"
              />
              <span className="text-[10px] text-[#C2A476] block">
                {formatUSD(calculatorUSD)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Villa Rates Cards (B1, B2, B3, B4 in a 2x2 Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#14171A] dark:text-[#FAF8F5] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#C2A476]" />
            Bảng Điều Chỉnh Giá Từng Biệt Thự (B1, B2, B3, B4)
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Tự động quy đổi tỷ giá 1 USD = {formatVND(exchangeRate)}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pricingData.map((villa) => {
            const villaColor = getVillaColor(villa.id);

            return (
              <div
                key={villa.id}
                className={`bg-white dark:bg-[#1E2328] rounded-3xl p-6 border transition-all duration-300 shadow-xs hover:shadow-md space-y-6 ${
                  villa.isModified
                    ? 'border-[#C2A476] ring-2 ring-[#C2A476]/20'
                    : 'border-black/5 dark:border-white/5'
                }`}
              >
                {/* Villa Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-sm shrink-0"
                      style={{
                        backgroundColor: `${villaColor}20`,
                        color: villaColor,
                        border: `1.5px solid ${villaColor}40`,
                      }}
                    >
                      {villa.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-[#14171A] dark:text-[#FAF8F5]">
                          {villa.name}
                        </h3>
                        {villa.isModified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
                            Chưa lưu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {villa.location} • {villa.bedrooms} phòng ngủ • Tối đa {villa.maxGuests} khách
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Input */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-700 dark:text-gray-300 text-xs">
                      Giá Thuê Phòng / Đêm
                    </label>
                    <span className="text-[11px] font-semibold text-gray-400">VNĐ / đêm</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="500000"
                        value={villa.weekdayPrice}
                        onChange={(e) =>
                          handlePriceChange(villa.id, 'weekdayPrice', Number(e.target.value))
                        }
                        className="w-full px-4 py-2.5 pr-8 rounded-xl bg-white dark:bg-[#1E2328] border border-black/10 dark:border-white/10 font-black text-[#14171A] dark:text-[#FAF8F5] text-base focus:outline-none focus:border-[#C2A476]"
                      />
                      <span className="absolute right-3 top-3 text-xs text-gray-400 font-bold">
                        ₫
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C2A476]/15 border border-[#C2A476]/30 text-xs shrink-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Quy đổi USD:</span>
                      <span className="font-extrabold text-[#C2A476]">
                        ≈ {formatUSD(convertToUSD(villa.weekdayPrice))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5 text-xs">
                  <Link
                    href={`/admin/bookings/calendar?villa=${villa.id}`}
                    className="text-[#C2A476] hover:underline font-bold flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Xem lịch đặt phòng {villa.id}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSaveVilla(villa.id)}
                    className="px-4 py-2 rounded-xl bg-[#14171A] dark:bg-white text-white dark:text-[#14171A] hover:bg-[#C2A476] dark:hover:bg-[#C2A476] hover:text-[#14171A] dark:hover:text-[#14171A] font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Biệt Thự {villa.id}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
