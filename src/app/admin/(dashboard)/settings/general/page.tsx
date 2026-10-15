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
} from 'lucide-react';
import { useToastStore } from '@/lib/store';
import { getLiveSettings, updateSettingsInDb } from '@/lib/adminDataService';
import { bookingStore } from '@/lib/bookingStore';
import { useIsMounted } from '@/lib/useHydrated';

export default function SettingsGeneralPage() {
  const { addToast } = useToastStore();
  const [settings, setSettings] = useState(() => getLiveSettings());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(getLiveSettings());
    const unsub = bookingStore.subscribe((payload) => {
      if (payload.action === 'SETTINGS_UPDATE' || payload.action === 'APP_DATA_UPDATE') {
        setSettings(getLiveSettings());
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSettingsInDb(settings);
      addToast({
        type: 'success',
        title: 'Đã lưu cài đặt & đồng bộ',
        message: 'Cài đặt hệ thống chung của B Villa Da Nang đã được lưu và đồng bộ tức thì lên trang chủ.',
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
            Cài Đặt Chung Hệ Thống
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Thiết lập thông tin thương hiệu, tiền tệ, múi giờ và thuế VAT
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cài Đặt</span>
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
      </form>
    </div>
  );
}
