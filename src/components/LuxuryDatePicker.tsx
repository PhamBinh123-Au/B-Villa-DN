"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  AlertCircle,
  Clock,
  Wrench,
} from "lucide-react";
import { bookingStore } from "@/lib/bookingStore";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Helper: Format "YYYY-MM-DD" -> "Wed, 14 Oct 2026"
export function formatLuxuryDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Helper: Add days to "YYYY-MM-DD"
export function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface LuxuryDatePickerProps {
  label: string;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  villaId?: string;
  minDate?: string;
  isCheckOut?: boolean;
  checkInDate?: string;
  excludeInquiryId?: string;
  placeholder?: string;
  error?: string;
}

export const LuxuryDatePicker: React.FC<LuxuryDatePickerProps> = ({
  label,
  selectedDate,
  onSelectDate,
  villaId,
  minDate,
  isCheckOut = false,
  checkInDate,
  excludeInquiryId,
  placeholder = "Select Date",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view month/year from selectedDate, checkInDate, or today
  const initDate = selectedDate || checkInDate || getTodayStr();
  const [partsY, partsM] = initDate.split("-").map(Number);
  const [calYear, setCalYear] = useState(partsY || new Date().getFullYear());
  const [calMonth, setCalMonth] = useState((partsM ? partsM - 1 : new Date().getMonth()));

  // Sync calendar month when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-").map(Number);
      if (y && m) {
        setCalYear(y);
        setCalMonth(m - 1);
      }
    }
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    onSelectDate(dateStr);
    setIsOpen(false);
  };

  const effectiveMin = minDate || getTodayStr();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  // Presets for quick stays (e.g. +1 Night, +2 Nights, +3 Nights, +5 Nights, +7 Nights)
  const durationPresets = [1, 2, 3, 5, 7];

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>{label}</span>
        </span>
        {selectedDate && (
          <span className="text-[10px] text-[#A6834F] font-bold">
            {isCheckOut && checkInDate ? (
              `${Math.max(1, Math.round((new Date(selectedDate).getTime() - new Date(checkInDate).getTime()) / 86400000))} Nights`
            ) : "Selected"}
          </span>
        )}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#FAF8F5] border rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between transition-all duration-200 cursor-pointer group ${
          isOpen
            ? "border-[#C2A476] ring-2 ring-[#C2A476]/30 bg-white"
            : error
            ? "border-rose-400 bg-rose-50/50"
            : "border-neutral-300 hover:border-[#C2A476]"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs sm:text-sm truncate ${
              selectedDate
                ? "font-bold text-neutral-900"
                : "text-neutral-500 font-normal"
            }`}
          >
            {selectedDate ? formatLuxuryDate(selectedDate) : placeholder}
          </p>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {selectedDate && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelectDate("");
              }}
              className="p-1 text-neutral-400 hover:text-rose-600 rounded-full hover:bg-neutral-200/60 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 ${
              isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
            }`}
          />
        </div>
      </button>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: "#ffffff" }}
            className={`absolute left-0 right-0 ${
              isCheckOut ? "sm:left-auto sm:right-0" : "sm:right-auto sm:left-0"
            } sm:w-80 top-[calc(100%+8px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-[#E2D9CC] p-3.5 sm:p-4 z-50 text-neutral-900`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5] mb-2.5 bg-[#FAF7F2] -m-4 mb-2.5 p-3 rounded-t-2xl">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#8A6B3D] block">
                  {label}
                </span>
                <h4 className="font-extrabold text-base text-neutral-900 leading-tight tracking-tight">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Availability Legend */}
            <div className="flex items-center justify-between text-xs text-neutral-700 py-1.5 px-2.5 bg-[#FAF8F5] rounded-lg mb-2 border border-[#EAE2D5]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="font-medium">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                <span className="font-medium">Booked</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-medium">Bảo trì</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2A476]" />
                <span className="font-medium">Selected</span>
              </span>
            </div>

            {/* Maintenance Warning Banner if Villa has Scheduled Maintenance */}
            {villaId && (() => {
              const maintInfo = bookingStore.getVillaMaintenanceInfo(villaId);
              if (!maintInfo?.isMaintenance) return null;
              const isIndefinite = !maintInfo.startDate || !maintInfo.endDate;

              return (
                <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-1.5 animate-fade-in">
                  <Wrench className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold">
                      {isIndefinite
                        ? "Bảo trì định kỳ — Tạm khóa nhận lịch"
                        : `Lịch bảo trì: ${maintInfo.startDate} → ${maintInfo.endDate}`}
                    </span>
                    {maintInfo.reason && (
                      <p className="text-[10px] text-amber-800 truncate opacity-90">{maintInfo.reason}</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_LABELS.map((d) => (
                <span key={d} className="text-xs font-bold text-neutral-600 py-0.5">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-8" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isPast = dateStr < effectiveMin;
                const isSelected = dateStr === selectedDate;
                const isDateUnderMaintenance = villaId ? bookingStore.isVillaDateUnderMaintenance(villaId, dateStr) : false;

                // Booked check for villa
                const bookedInfo = villaId ? bookingStore.isDateBooked(dateStr, villaId) : { isBooked: false, villaNames: [] };
                let isBooked = bookedInfo.isBooked;

                // For Check-out: check if this check-out date creates a range conflict across [checkInDate, dateStr)
                let hasRangeConflict = false;
                if (isCheckOut && checkInDate && villaId) {
                  const conflict = bookingStore.hasDateConflict(checkInDate, dateStr, villaId, excludeInquiryId);
                  if (conflict) {
                    hasRangeConflict = true;
                  }
                }

                // Is in between checkIn and checkOut
                const isInRange =
                  checkInDate &&
                  selectedDate &&
                  dateStr > checkInDate &&
                  dateStr < selectedDate;

                const isDisabled = isPast || isDateUnderMaintenance || (isCheckOut ? hasRangeConflict : isBooked);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(dateStr)}
                    title={
                      isDateUnderMaintenance
                        ? "Ngày này thuộc đợt bảo trì định kỳ của Villa"
                        : isBooked
                        ? `Reserved: ${bookedInfo.villaNames.join(", ") || "Booked"}`
                        : hasRangeConflict
                        ? "Stay overlaps with an existing reservation"
                        : isPast
                        ? "Past date"
                        : "Available"
                    }
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all relative ${
                      isSelected
                        ? "bg-[#C2A476] text-white font-bold shadow-md scale-105"
                        : isInRange
                        ? "bg-[#FAF6EE] text-[#8A6B3D] font-bold"
                        : isDateUnderMaintenance
                        ? "bg-amber-50 text-amber-700 border border-amber-300 line-through cursor-not-allowed opacity-80 font-bold"
                        : isCheckOut
                        ? hasRangeConflict
                          ? "bg-rose-50 text-rose-400 border border-rose-200 line-through cursor-not-allowed opacity-75"
                          : isPast
                          ? "text-neutral-300 cursor-not-allowed opacity-40"
                          : "text-neutral-900 hover:bg-[#FAF6EE] hover:text-[#8A6B3D] cursor-pointer"
                        : isBooked
                        ? "bg-rose-50 text-rose-400 border border-rose-200 line-through cursor-not-allowed opacity-75"
                        : isPast
                        ? "text-neutral-300 cursor-not-allowed opacity-40"
                        : "text-neutral-900 hover:bg-[#FAF6EE] hover:text-[#8A6B3D] cursor-pointer"
                    }`}
                  >
                    {dayNum}
                    {!isCheckOut && isBooked && !isDateUnderMaintenance && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    {isDateUnderMaintenance && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Stay Duration Presets (Đặt cách ngày / Số đêm) */}
            {isCheckOut && checkInDate && (
              <div className="mt-3 pt-2.5 border-t border-[#EAE2D5]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C2A476]" />
                    <span>Quick Stay (Nights):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {durationPresets.map((days) => {
                    const targetDate = addDays(checkInDate, days);
                    const conflict = villaId ? bookingStore.hasDateConflict(checkInDate, targetDate, villaId, excludeInquiryId) : undefined;
                    const disabled = !!conflict;

                    return (
                      <button
                        key={days}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDateClick(targetDate)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          selectedDate === targetDate
                            ? "bg-[#C2A476] text-white shadow-sm"
                            : disabled
                            ? "bg-neutral-100 text-neutral-400 line-through cursor-not-allowed opacity-50"
                            : "bg-[#FAF6EE] text-[#8A6B3D] hover:bg-[#f3ebd9] border border-[#E8E0D2]"
                        }`}
                        title={disabled ? "Conflicts with existing booking" : `Book ${days} night(s)`}
                      >
                        +{days} {days === 1 ? "Night" : "Nights"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
