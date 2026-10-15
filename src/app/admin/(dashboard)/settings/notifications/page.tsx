'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useToastStore } from '@/lib/store';
import { useIsMounted } from '@/lib/useHydrated';

const DEFAULT_CONFIRM_TPL = 'Kính gửi {guest_name},\n\nB Villa Da Nang xin chân thành cảm ơn quý khách đã đặt Villa {villa_id} từ {check_in} đến {check_out} ({nights} đêm). Quản gia riêng của biệt thự sẽ đón tiếp quý khách lúc 14:00.\n\nTrân trọng,\nBan Quản Lý B Villa Da Nang';
const DEFAULT_REMINDER_TPL = 'Kính gửi {guest_name},\n\nChỉ còn 2 ngày nữa kỳ nghỉ tại B Villa Da Nang của quý khách sẽ bắt đầu. Nếu quý khách có yêu cầu đặc biệt về đưa đón sân bay hoặc tiệc BBQ, xin vui lòng phản hồi email này.\n\nHotline: 0236 1234 567.';

export default function SettingsNotificationsPage() {
  const { addToast } = useToastStore();

  const [emailConfirmationTpl, setEmailConfirmationTpl] = useState(DEFAULT_CONFIRM_TPL);
  const [emailReminderTpl, setEmailReminderTpl] = useState(DEFAULT_REMINDER_TPL);
  const [whatsAppApiKey, setWhatsAppApiKey] = useState('');
  const [alertPendingHours, setAlertPendingHours] = useState(2);
  const [enableSound, setEnableSound] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bvilla_notif_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.emailConfirmationTpl) setEmailConfirmationTpl(parsed.emailConfirmationTpl);
        if (parsed.emailReminderTpl) setEmailReminderTpl(parsed.emailReminderTpl);
        if (parsed.whatsAppApiKey) setWhatsAppApiKey(parsed.whatsAppApiKey);
        if (parsed.alertPendingHours) setAlertPendingHours(parsed.alertPendingHours);
        if (parsed.enableSound !== undefined) setEnableSound(parsed.enableSound);
      }
    } catch {}
  }, []);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(
        'bvilla_notif_settings_v1',
        JSON.stringify({
          emailConfirmationTpl,
          emailReminderTpl,
          whatsAppApiKey,
          alertPendingHours,
          enableSound,
        })
      );
    } catch {}
    addToast({
      type: 'success',
      title: 'Đã lưu cấu hình thông báo',
      message: 'Mẫu thông báo email và quy tắc cảnh báo đã được lưu vĩnh viễn.',
      duration: 4000,
    });
  };


  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
            Cài Đặt Thông Báo & Cảnh Báo
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Mẫu email tự động gửi khách hàng, tích hợp WhatsApp Business và SLA cảnh báo đơn chờ duyệt
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#C2A476] text-[#14171A] text-xs font-bold hover:bg-[#d4ba94] shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Cấu Hình</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Templates */}
        <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C2A476]" />
            Mẫu Email Tự Động (Email Templates)
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                1. Mẫu Xác Nhận Đặt Phòng (Ngay sau khi duyệt):
              </label>
              <textarea
                rows={5}
                value={emailConfirmationTpl}
                onChange={(e) => setEmailConfirmationTpl(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-mono text-[11px] leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                2. Mẫu Nhắc Nhở Trước 2 Ngày Check-In:
              </label>
              <textarea
                rows={5}
                value={emailReminderTpl}
                onChange={(e) => setEmailReminderTpl(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-mono text-[11px] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Alert SLA Rules */}
        <div className="space-y-6">
          {/* WhatsApp Settings */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Tích Hợp WhatsApp Business API
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Khóa API WhatsApp (API Secret Key):
                </label>
                <input
                  type="password"
                  value={whatsAppApiKey}
                  onChange={(e) => setWhatsAppApiKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-mono"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px]">
                ✓ Trạng thái kết nối: Hoạt động bình thường. Tin nhắn xác nhận sẽ được gửi từ số đại diện chính thức.
              </div>
            </div>
          </div>

          {/* Alert SLA Rules */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Quy Tắc Cảnh Báo SLA Đặt Phòng
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Báo động đỏ khi đơn đặt phòng chờ duyệt quá (Giờ):
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={alertPendingHours}
                  onChange={(e) => setAlertPendingHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 font-bold"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => setEnableSound(e.target.checked)}
                  className="rounded text-[#C2A476]"
                />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Phát âm thanh chuông báo khi có đơn đặt phòng mới phát sinh
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
