"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  X,
  Info,
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
  details,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isAlertOnly = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: LuxuryConfirmDialogProps) {
  const showCancelBtn = !isAlertOnly && cancelText !== null;

  const handleDismiss = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  // Variant styling
  const variantConfig = {
    danger: {
      icon: Trash2,
      badgeDefault: "Irreversible Action",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      iconBg: "bg-rose-100 text-rose-600 ring-4 ring-rose-50",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
    },
    warning: {
      icon: AlertTriangle,
      badgeDefault: "Attention Required",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      iconBg: "bg-amber-100 text-amber-600 ring-4 ring-amber-50",
      confirmBtn: "bg-[#14171A] hover:bg-neutral-800 text-white shadow-neutral-900/20",
    },
    info: {
      icon: Info,
      badgeDefault: "Information",
      badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
      iconBg: "bg-sky-100 text-sky-600 ring-4 ring-sky-50",
      confirmBtn: "bg-[#14171A] hover:bg-neutral-800 text-white shadow-neutral-900/20",
    },
    success: {
      icon: CheckCircle2,
      badgeDefault: "Completed",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50",
      confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE5DC] overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full ${
            variant === "danger"
              ? "bg-rose-500"
              : variant === "warning"
              ? "bg-amber-500"
              : variant === "success"
              ? "bg-emerald-500"
              : "bg-[#C2A476]"
          }`}
        />

        <div className="p-6 sm:p-7">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${variantConfig.iconBg}`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`inline-block text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full border mb-1 ${variantConfig.badgeClass}`}
                >
                  {badgeText || variantConfig.badgeDefault}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 leading-tight">
                  {title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description Message */}
          <div className="text-sm text-neutral-600 leading-relaxed mb-5 font-light whitespace-pre-line">
            {message}
          </div>

          {/* Optional Details Snippet Card */}
          {details && details.length > 0 && (
            <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 mb-6 space-y-2 text-xs">
              {details.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 border-b border-neutral-200/60 pb-1.5 last:border-b-0 last:pb-0"
                >
                  <span className="text-neutral-500 font-medium">{item.label}</span>
                  <span className="text-neutral-900 font-semibold text-right truncate max-w-[240px]">
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
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${variantConfig.confirmBtn}`}
            >
              {isLoading && (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
