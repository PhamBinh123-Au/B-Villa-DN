"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  X,
  Info,
  ShieldAlert,
} from "lucide-react";

export type DialogVariant = "danger" | "warning" | "info" | "success";

export interface DetailItem {
  label: string;
  value: string;
}

export interface LuxuryConfirmDialogProps {
  isOpen: boolean;
  variant?: DialogVariant;
  badgeText?: string;
  title: string;
  message: string;
  noticeText?: string;
  details?: DetailItem[];
  confirmText?: string;
  cancelText?: string | null;
  isAlertOnly?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function LuxuryConfirmDialog({
  isOpen,
  variant = "danger",
  badgeText,
  title,
  message,
  noticeText,
  details,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isAlertOnly = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: LuxuryConfirmDialogProps) {
  const showCancelBtn = !isAlertOnly && cancelText !== null;

  const handleDismiss = () => {
    if (isLoading) return;
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel, onConfirm]);

  if (!isOpen || !mounted) return null;

  // Variant styling configuration matching luxury resort aesthetic
  const variantConfig = {
    danger: {
      icon: Trash2,
      badgeDefault: "Cảnh Báo Thao Tác",
      badgeClass:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 dark:bg-rose-500/20",
      iconBg:
        "bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-red-600/5 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10 ring-4 ring-rose-500/10",
      topRim: "bg-gradient-to-r from-red-600 via-rose-500 to-red-600",
      ambientGlow: "bg-rose-500/20",
      confirmBtn:
        "bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:via-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-950/40 hover:shadow-rose-900/60 border border-rose-500/30",
    },
    warning: {
      icon: AlertTriangle,
      badgeDefault: "Cần Lưu Ý",
      badgeClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:bg-amber-500/20",
      iconBg:
        "bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-yellow-600/5 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/10",
      topRim: "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600",
      ambientGlow: "bg-amber-500/20",
      confirmBtn:
        "bg-[#14171A] hover:bg-neutral-800 text-white shadow-md dark:bg-[#C2A476] dark:hover:bg-[#d4ba94] dark:text-[#14171A] border border-black/10 dark:border-white/10",
    },
    info: {
      icon: Info,
      badgeDefault: "Thông Tin Hệ Thống",
      badgeClass:
        "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 dark:bg-sky-500/20",
      iconBg:
        "bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-blue-600/5 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10 ring-4 ring-sky-500/10",
      topRim: "bg-gradient-to-r from-[#8C734B] via-[#C2A476] to-[#8C734B]",
      ambientGlow: "bg-[#C2A476]/20",
      confirmBtn:
        "bg-[#14171A] hover:bg-neutral-800 text-white shadow-md dark:bg-[#C2A476] dark:hover:bg-[#d4ba94] dark:text-[#14171A]",
    },
    success: {
      icon: CheckCircle2,
      badgeDefault: "Thành Công",
      badgeClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20",
      iconBg:
        "bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-600/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/10",
      topRim: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600",
      ambientGlow: "bg-emerald-500/20",
      confirmBtn:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-950/30 border border-emerald-500/30",
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return createPortal(
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleDismiss}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181C20] rounded-3xl shadow-2xl border border-[#EAE5DC] dark:border-white/10 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient color bar */}
        <div className={`h-1.5 w-full ${variantConfig.topRim}`} />

        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-3xl pointer-events-none ${variantConfig.ambientGlow}`}
        />

        <div className="relative p-6 sm:p-7">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${variantConfig.iconBg}`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full border mb-1.5 ${variantConfig.badgeClass}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {badgeText || variantConfig.badgeDefault}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#14171A] dark:text-[#FAF8F5] leading-tight tracking-tight">
                  {title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              disabled={isLoading}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Content */}
          <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4 whitespace-pre-line font-normal">
            {message}
          </div>

          {/* Security Notice Banner */}
          {noticeText && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs mb-4">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-snug">{noticeText}</span>
            </div>
          )}

          {/* Optional Details Snippet Card */}
          {details && details.length > 0 && (
            <div className="bg-white/80 dark:bg-[#14171A]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-5 space-y-2 text-xs backdrop-blur-xs">
              {details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                    {item.label}
                  </span>
                  <span className="text-neutral-900 dark:text-[#FAF8F5] font-bold text-right truncate max-w-[260px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            {showCancelBtn && (
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${variantConfig.confirmBtn}`}
            >
              {isLoading && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>{isLoading ? "Đang xử lý..." : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
