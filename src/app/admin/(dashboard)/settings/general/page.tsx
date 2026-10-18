'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Building,
  DollarSign,
  Clock,
  Percent,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Sparkles,
} from 'lucide-react';
import { useToastStore } from '@/lib/store';
import {
  getLiveSettings,
  updateSettingsInDb,
  getLiveVillaOverrides,
  updateVillaOverrideInDb,
} from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';

const VILLA_META = [
  { id: 'B1', name: 'Villa B1 - Sơn Trà Premium', bedrooms: 4, location: 'Thành Vinh 3, Sơn Trà' },
  { id: 'B2', name: 'Villa B2 - Ngũ Hành Sơn Riverside', bedrooms: 4, location: 'Nước Mặn 3, Ngũ Hành Sơn' },
  { id: 'B3', name: 'Villa B3 - Ngũ Hành Sơn Cozy', bedrooms: 2, location: 'Nước Mặn 7, Ngũ Hành Sơn' },
  { id: 'B4', name: 'Villa B4 - Sơn Trà Luxury Oasis', bedrooms: 4, location: 'Thành Vinh 2, Sơn Trà' },
];

export default function SettingsGeneralPage() {
  const { addToast } = useToastStore();
  const [settings, setSettings] = useState(() => getLiveSettings());
  const [saving, setSaving] = useState(false);

  // Villa Capacities (Adults & Children)
  const [capacities, setCapacities] = useState<Record<string, { adults: number; children: number }>>(() => {
    const liveOverrides = getLiveVillaOverrides();
    const liveSettings = getLiveSettings();
    const sc = (liveSettings as any)?.villaCapacities || {};
    return {
      B1: {
        adults: liveOverrides['B1']?.maxAdults ?? liveOverrides['b1-villa-4pn']?.maxAdults ?? sc.B1?.adults ?? 8,
        children: liveOverrides['B1']?.maxChildren ?? liveOverrides['b1-villa-4pn']?.maxChildren ?? sc.B1?.children ?? 2,
      },
      B2: {
        adults: liveOverrides['B2']?.maxAdults ?? liveOverrides['b2-villa-4pn']?.maxAdults ?? sc.B2?.adults ?? 8,
        children: liveOverrides['B2']?.maxChildren ?? liveOverrides['b2-villa-4pn']?.maxChildren ?? sc.B2?.children ?? 2,
      },
      B3: {
        adults: liveOverrides['B3']?.maxAdults ?? liveOverrides['b3-villa-2pn']?.maxAdults ?? sc.B3?.adults ?? 4,
        children: liveOverrides['B3']?.maxChildren ?? liveOverrides['b3-villa-2pn']?.maxChildren ?? sc.B3?.children ?? 1,
      },
      B4: {
        adults: liveOverrides['B4']?.maxAdults ?? liveOverrides['b4-villa-4pn']?.maxAdults ?? sc.B4?.adults ?? 8,
        children: liveOverrides['B4']?.maxChildren ?? liveOverrides['b4-villa-4pn']?.maxChildren ?? sc.B4?.children ?? 2,
      },
    };
  });

  const syncStateFromDb = () => {
    const liveSettings = getLiveSettings();
    const liveOverrides = getLiveVillaOverrides();
    setSettings(liveSettings);

    const sc = (liveSettings as any)?.villaCapacities || {};
    setCapacities({
      B1: {
        adults: liveOverrides['B1']?.maxAdults ?? liveOverrides['b1-villa-4pn']?.maxAdults ?? sc.B1?.adults ?? 8,
        children: liveOverrides['B1']?.maxChildren ?? liveOverrides['b1-villa-4pn']?.maxChildren ?? sc.B1?.children ?? 2,
      },
      B2: {
        adults: liveOverrides['B2']?.maxAdults ?? liveOverrides['b2-villa-4pn']?.maxAdults ?? sc.B2?.adults ?? 8,
        children: liveOverrides['B2']?.maxChildren ?? liveOverrides['b2-villa-4pn']?.maxChildren ?? sc.B2?.children ?? 2,
      },
      B3: {
        adults: liveOverrides['B3']?.maxAdults ?? liveOverrides['b3-villa-2pn']?.maxAdults ?? sc.B3?.adults ?? 4,
        children: liveOverrides['B3']?.maxChildren ?? liveOverrides['b3-villa-2pn']?.maxChildren ?? sc.B3?.children ?? 1,
      },
      B4: {
        adults: liveOverrides['B4']?.maxAdults ?? liveOverrides['b4-villa-4pn']?.maxAdults ?? sc.B4?.adults ?? 8,
        children: liveOverrides['B4']?.maxChildren ?? liveOverrides['b4-villa-4pn']?.maxChildren ?? sc.B4?.children ?? 2,
      },
    });
  };

  useEffect(() => {
    syncStateFromDb();
    const unsub = bookingStore.subscribe((payload) => {
      if (
        payload.action === 'SETTINGS_UPDATE' ||
        payload.action === 'APP_DATA_UPDATE' ||
        payload.action === 'UPDATE'
      ) {
        syncStateFromDb();
      }
    });
    return () => unsub();
  }, []);

  const handleCapChange = (villaId: string, field: 'adults' | 'children', val: number) => {
    setCapacities((prev) => ({
      ...prev,
      [villaId]: {
        ...prev[villaId],
        [field]: val,
      },
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      // 1. Save general settings including capacities
      const newSettings = {
        ...settings,
        villaCapacities: capacities,
      };
      await updateSettingsInDb(newSettings as any);

      // 2. Persist directly to Villa Overrides so VillaCards on homepage update in real-time
      await Promise.all([
        updateVillaOverrideInDb('B1', {
          maxAdults: capacities.B1.adults,
          maxChildren: capacities.B1.children,
          maxGuests: capacities.B1.adults + capacities.B1.children,
        }),
        updateVillaOverrideInDb('B2', {
          maxAdults: capacities.B2.adults,
          maxChildren: capacities.B2.children,
          maxGuests: capacities.B2.adults + capacities.B2.children,
        }),
        updateVillaOverrideInDb('B3', {
          maxAdults: capacities.B3.adults,
          maxChildren: capacities.B3.children,
          maxGuests: capacities.B3.adults + capacities.B3.children,
        }),
        updateVillaOverrideInDb('B4', {
          maxAdults: capacities.B4.adults,
          maxChildren: capacities.B4.children,
          maxGuests: capacities.B4.adults + capacities.B4.children,
        }),
      ]);

      addToast({
        type: 'success',
        title: 'Đã lưu cài đặt & sức chứa khách',
        message: 'Cài đặt hệ thống và cấu hình Người Lớn / Trẻ Em cho 4 biệt thự đã được lưu và đồng bộ tức thì lên trang chủ.',
        duration: 4000,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Lỗi lưu cài đặt',
        message: 'Không thể lưu cài đặt. Vui lòng thử lại.',
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Cài Đặt Chung & Sức Chứa Villa
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Thiết lập thông tin thương hiệu, múi giờ và số lượng khách Người Lớn & Trẻ Em cho từng biệt thự
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang Lưu...' : 'Lưu Cài Đặt'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Business Information */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#C2A476]" />
            Thông Tin Doanh Nghiệp
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Tên Thương Hiệu:
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Địa Chỉ Trụ Sở Quản Trị:
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Hotline / Điện Thoại:
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Tiếp Nhận Đặt:
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Website Chính Thức:
              </label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Standards & Preferences */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C2A476]" />
            Tiêu Chuẩn Giờ & Tiền Tệ
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Giờ Check-In Tiêu Chuẩn:
                </label>
                <input
                  type="text"
                  value={settings.defaultCheckInTime}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCheckInTime: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-center font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Giờ Check-Out Tiêu Chuẩn:
                </label>
                <input
                  type="text"
                  value={settings.defaultCheckOutTime}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCheckOutTime: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 text-center font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Đơn Vị Tiền Tệ Chính:
                </label>
                <input
                  type="text"
                  disabled
                  value="VNĐ (Việt Nam Đồng)"
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold opacity-80"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Múi Giờ Hệ Thống:
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Ho_Chi_Minh (GMT+7)"
                  className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-bold opacity-80"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Thuế Suất VAT Áp Dụng (%):
              </label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) =>
                  setSettings({ ...settings, taxRate: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Villa Guests & Capacity Configuration */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
            <div>
              <h3 className="font-extrabold text-base uppercase tracking-wider text-[#14171A] dark:text-[#FAF8F5] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C2A476]" />
                Cấu Hình Sức Chứa Khách (Người Lớn & Trẻ Em) Từng Biệt Thự
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Điều chỉnh số lượng khách Người Lớn và Trẻ Em tiêu chuẩn cho 4 biệt thự hiển thị trên thẻ ngoài trang chủ
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#C2A476]/15 text-[#8A6B3D] dark:text-[#E2C799] border border-[#C2A476]/30 self-start sm:self-auto flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
              Đồng bộ tức thì lên Trang Chủ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VILLA_META.map((villa) => {
              const cap = capacities[villa.id] || { adults: 8, children: 2 };
              return (
                <div
                  key={villa.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/5 dark:border-white/5 space-y-4 hover:border-[#C2A476]/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-[#C2A476] text-[#14171A] font-black text-xs flex items-center justify-center shadow-xs">
                        {villa.id}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#14171A] dark:text-[#FAF8F5]">
                          {villa.name}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {villa.bedrooms} Phòng Ngủ • {villa.location}
                        </p>
                      </div>
                    </div>

                    {/* Preview Pill Badge matching the user's screenshot */}
                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E2328] border border-[#C2A476]/40 text-center shadow-2xs">
                      <div className="text-[11px] font-black text-[#14171A] dark:text-[#FAF8F5] leading-tight">
                        {cap.adults} Lớn • {cap.children} Trẻ
                      </div>
                      <div className="text-[9px] text-[#C2A476] font-bold">
                        Sức chứa
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Adults Input */}
                    <div className="bg-white dark:bg-[#1E2328] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        Người Lớn (≥ 12 tuổi):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCapChange(villa.id, 'adults', Math.max(1, cap.adults - 1))}
                          className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#14171A] hover:bg-[#C2A476] hover:text-white border border-black/10 dark:border-white/10 font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="25"
                          value={cap.adults}
                          onChange={(e) => handleCapChange(villa.id, 'adults', Math.max(1, Number(e.target.value)))}
                          className="w-full text-center font-black text-sm p-1 bg-transparent border-0 focus:outline-none text-[#14171A] dark:text-[#FAF8F5]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCapChange(villa.id, 'adults', cap.adults + 1)}
                          className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#14171A] hover:bg-[#C2A476] hover:text-white border border-black/10 dark:border-white/10 font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children Input */}
                    <div className="bg-white dark:bg-[#1E2328] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        Trẻ Em (0 - 11 tuổi):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCapChange(villa.id, 'children', Math.max(0, cap.children - 1))}
                          className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#14171A] hover:bg-[#C2A476] hover:text-white border border-black/10 dark:border-white/10 font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={cap.children}
                          onChange={(e) => handleCapChange(villa.id, 'children', Math.max(0, Number(e.target.value)))}
                          className="w-full text-center font-black text-sm p-1 bg-transparent border-0 focus:outline-none text-[#14171A] dark:text-[#FAF8F5]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCapChange(villa.id, 'children', cap.children + 1)}
                          className="w-7 h-7 rounded-lg bg-[#FAF8F5] dark:bg-[#14171A] hover:bg-[#C2A476] hover:text-white border border-black/10 dark:border-white/10 font-bold text-xs flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-black/5 dark:border-white/5">
                    <span>Tổng sức chứa tối đa:</span>
                    <span className="font-extrabold text-[#C2A476]">
                      {cap.adults + cap.children} khách ({cap.adults} Lớn, {cap.children} Trẻ)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
