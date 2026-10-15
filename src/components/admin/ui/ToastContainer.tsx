'use client';

import React from 'react';
import { useToastStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in-right',
              isSuccess && 'bg-white/95 dark:bg-[#1E2328]/95 border-emerald-500/30 text-emerald-950 dark:text-emerald-100',
              isError && 'bg-white/95 dark:bg-[#1E2328]/95 border-rose-500/30 text-rose-950 dark:text-rose-100',
              isWarning && 'bg-white/95 dark:bg-[#1E2328]/95 border-amber-500/30 text-amber-950 dark:text-amber-100',
              !isSuccess && !isError && !isWarning && 'bg-white/95 dark:bg-[#1E2328]/95 border-[#C2A476]/40 text-[#14171A] dark:text-[#FAF8F5]'
            )}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#C2A476]" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
