'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Clock, CheckCircle2 } from 'lucide-react';
import { PaymentStatus } from '@/lib/types';

interface LuxuryPaymentBadgeProps {
  status: PaymentStatus;
  onChange?: (newStatus: PaymentStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function LuxuryPaymentBadge({
  status,
  onChange,
  disabled = false,
  className = '',
}: LuxuryPaymentBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isPaid = status === 'paid';

  const handleSelect = (newStatus: PaymentStatus) => {
    if (newStatus !== status && onChange) {
      onChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Interactive Luxury Badge Trigger */}
      <button
        type="button"
        disabled={disabled || !onChange}
        onClick={() => onChange && !disabled && setIsOpen((prev) => !prev)}
        className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border select-none ${
          disabled || !onChange ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-95'
        } ${
          isPaid
            ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_2px_10px_rgba(16,185,129,0.12)]'
            : 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-400/60 shadow-[0_2px_10px_rgba(245,158,11,0.12)]'
        }`}
      >
        {/* Pulsing Status Dot / Icon */}
        <span className="flex items-center justify-center">
          {isPaid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </span>

        {/* Status Text */}
        <span className="tracking-wide">{isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span>

        {/* Small Chevron Arrow for Interactive Mode */}
        {onChange && !disabled && (
          <ChevronDown
            className={`w-3 h-3 text-[#C2A476] transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
            }`}
          />
        )}
      </button>

      {/* Floating Luxury Glassmorphism Menu */}
      <AnimatePresence>
        {isOpen && onChange && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-2 w-48 rounded-2xl bg-[#14171A]/95 dark:bg-[#1E2328]/95 backdrop-blur-2xl border border-[#C2A476]/30 shadow-[0_12px_36px_rgba(0,0,0,0.45),0_0_0_1px_rgba(194,164,118,0.15)] p-1.5 z-50 text-white overflow-hidden"
          >
            {/* Top decorative micro-glow */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C2A476] to-transparent opacity-60" />

            <div className="px-2.5 py-1.5 mb-1 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2A476] block">
                Cập nhật thanh toán
              </span>
            </div>

            <div className="space-y-1">
              {/* Option 1: Chưa Thanh Toán */}
              <button
                type="button"
                onClick={() => handleSelect('unpaid')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                  !isPaid
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Chưa Thanh Toán</span>
                </div>
                {!isPaid && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>

              {/* Option 2: Đã Thanh Toán */}
              <button
                type="button"
                onClick={() => handleSelect('paid')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isPaid
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>Đã Thanh Toán</span>
                </div>
                {isPaid && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
