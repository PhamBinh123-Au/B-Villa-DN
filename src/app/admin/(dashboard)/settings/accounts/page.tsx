'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  FolderOpen,
  Copy,
  Check,
} from 'lucide-react';

export default function SecurityAccountsSettingsPage() {
  const [role, setRole] = useState<'super_admin' | 'manager'>('super_admin');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  const relativePath = 'src/config/adminPinConfig.ts';

  const handleCopyPath = () => {
    navigator.clipboard.writeText(relativePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPin || !newPin || !confirmPin) {
      setFeedback({ type: 'error', message: 'Vui lòng điền đầy đủ tất cả các trường.' });
      return;
    }

    if (!/^\d{6}$/.test(newPin)) {
      setFeedback({ type: 'error', message: 'Mã PIN mới phải đúng chính xác 6 chữ số (0-9).' });
      return;
    }

    if (newPin !== confirmPin) {
      setFeedback({ type: 'error', message: 'Mã PIN mới và xác nhận mã PIN không khớp nhau.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `${data.message} File cấu hình tại ${data.filePath} đã được cập nhật đồng bộ.`,
        });
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Không thể đổi mã PIN. Vui lòng thử lại.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Lỗi kết nối máy chủ: ' + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#C2A476]/15 text-[#C2A476] border border-[#C2A476]/30 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#14171A] dark:text-[#FAF8F5] tracking-tight">
              Bảo Mật & Mã PIN Quản Trị
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quản lý mật khẩu đăng nhập, bảo vệ trung tâm điều hành B Villa Đà Nẵng
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct File Location Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: File Path Info */}
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C2A476] uppercase tracking-wider">
              <FileCode className="w-4 h-4" />
              <span>Đường Dẫn File Mật Khẩu (Mã PIN)</span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Toàn bộ danh sách mã PIN quản trị được lưu trữ an toàn trong tệp cấu hình chuyên dụng của dự án:
            </p>

            <div className="bg-[#FAF8F5] dark:bg-[#14171A] p-3.5 rounded-2xl border border-black/5 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#C2A476] break-all">
                  {relativePath}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-[#C2A476] text-gray-600 dark:text-gray-300 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Sao chép đường dẫn tuyệt đối"
                >
                  {copiedPath ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <p className="font-semibold text-[#14171A] dark:text-[#FAF8F5]">
                👉 Cách tự chỉnh sửa mã PIN trong code:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>Mở file <code className="text-[#C2A476] font-mono">{relativePath}</code> trong VS Code / trình soạn thảo.</li>
                <li>Tìm dòng <code className="text-[#C2A476] font-mono">'123456'</code> hoặc <code className="text-[#C2A476] font-mono">'654321'</code>.</li>
                <li>Đổi thành 6 số bạn muốn (ví dụ: <code className="text-emerald-500 font-mono">'987654'</code>).</li>
                <li>Lưu lại file (Ctrl + S), mã PIN mới sẽ có hiệu lực ngay!</li>
              </ol>
            </div>
          </div>

          {/* Card 2: Security Tips */}
          <div className="bg-gradient-to-br from-[#C2A476]/10 via-[#FAF8F5] dark:via-[#1E2328] to-transparent rounded-3xl p-6 border border-[#C2A476]/30 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8A6B3D] dark:text-[#C2A476] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Tiêu Chuẩn Bảo Mật Đã Bật</span>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Đã ẩn hoàn toàn</strong> mã PIN mẫu và nút điền nhanh trên trang đăng nhập.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Đã tắt tính năng ghi nhớ 7 ngày</strong>: đóng trình duyệt là phiên kết thúc an toàn.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Cơ chế khóa Exponential Backoff</strong>: Nhập sai quá 5 lần sẽ khóa an ninh chống dò mật khẩu.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Direct PIN Change Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#1E2328] rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/5 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#14171A] dark:text-[#FAF8F5]">
                Đổi Mã PIN Trực Tiếp Tại Đây
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bạn có thể đổi mã PIN ngay trên giao diện này mà không cần mở code. Hệ thống sẽ tự động cập nhật file <code className="text-[#C2A476] font-mono">adminPinConfig.ts</code>.
              </p>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-scale-up ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed flex-1">{feedback.message}</div>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Tài Khoản Muốn Đổi Mã PIN
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('super_admin')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      role === 'super_admin'
                        ? 'bg-[#C2A476]/15 border-[#C2A476] text-[#8A6B3D] dark:text-[#C2A476] shadow-xs'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 text-gray-500 hover:border-[#C2A476]/40'
                    }`}
                  >
                    <p className="text-sm font-extrabold">Super Admin</p>
                    <p className="text-[10px] font-normal opacity-80 mt-0.5">Toàn quyền hệ thống</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      role === 'manager'
                        ? 'bg-[#C2A476]/15 border-[#C2A476] text-[#8A6B3D] dark:text-[#C2A476] shadow-xs'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 text-gray-500 hover:border-[#C2A476]/40'
                    }`}
                  >
                    <p className="text-sm font-extrabold">Quản Lý Villa</p>
                    <p className="text-[10px] font-normal opacity-80 mt-0.5">Vận hành đặt phòng</p>
                  </button>
                </div>
              </div>

              {/* Current PIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mã PIN Hiện Tại (6 Số)
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    maxLength={6}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập mã PIN hiện tại (ví dụ: 123456)"
                    className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 rounded-2xl text-sm font-mono tracking-widest text-[#14171A] dark:text-[#FAF8F5] focus:outline-none focus:border-[#C2A476] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mã PIN Mới (6 Số Tùy Chọn)
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Nhập 6 chữ số mới của bạn"
                    className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 rounded-2xl text-sm font-mono tracking-widest text-[#14171A] dark:text-[#FAF8F5] focus:outline-none focus:border-[#C2A476] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New PIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Xác Nhận Lại Mã PIN Mới
                </label>
                <input
                  type={showNew ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập lại 6 chữ số mới"
                  className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#14171A] border border-black/10 dark:border-white/10 rounded-2xl text-sm font-mono tracking-widest text-[#14171A] dark:text-[#FAF8F5] focus:outline-none focus:border-[#C2A476] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#C2A476] via-[#d4ba94] to-[#C2A476] text-[#0E1114] font-bold text-sm shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang cập nhật mã PIN...</span>
                  ) : (
                    <>
                      <span>Cập Nhật Mã PIN Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
