"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Clock,
  Wrench,
} from "lucide-react";
import { bookingStore } from "@/lib/bookingStore";

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

const DAY_LABELS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_LABELS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// Helper: Format "YYYY-MM-DD" -> "Wed, 14 Oct 2026" or "Th 4, 14 thg 10, 2026"
export function formatLuxuryDate(dateStr: string, lang: "vi" | "en" = "vi"): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (lang === "vi") {
    const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    return `${days[d.getDay()]}, ${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
  }
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
  cleanMode?: boolean;
  forMaintenanceSetup?: boolean;
  maintenanceAdminMode?: boolean;
  language?: "vi" | "en";
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
  placeholder = "Chọn ngày",
  error,
  cleanMode = false,
  forMaintenanceSetup = false,
  maintenanceAdminMode = false,
  language = "vi",
}) => {
  const isClean = cleanMode || forMaintenanceSetup;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = language === "vi" ? MONTH_NAMES_VI : MONTH_NAMES_EN;
  const dayLabels = language === "vi" ? DAY_LABELS_VI : DAY_LABELS_EN;

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

  // Presets for quick stays (e.g. +1 Đêm, +2 Đêm, +3 Đêm, +5 Đêm, +7 Đêm)
  const durationPresets = [1, 2, 3, 5, 7];

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>{label}</span>
        </span>
        {selectedDate && (
          <span className="text-[10px] text-[#C2A476] font-bold">
            {isCheckOut && checkInDate ? (
              `${Math.max(1, Math.round((new Date(selectedDate).getTime() - new Date(checkInDate).getTime()) / 86400000))} ${language === "vi" ? "Đêm" : "Nights"}`
            ) : (language === "vi" ? "Đã chọn" : "Selected")}
          </span>
        )}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#FAF8F5] dark:bg-[#14171A] border rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-xs ${
          isOpen
            ? "border-[#C2A476] ring-2 ring-[#C2A476]/30 bg-white dark:bg-[#1E2328]"
            : error
            ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20"
            : "border-black/10 dark:border-white/10 hover:border-[#C2A476] dark:hover:border-[#C2A476]"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs sm:text-sm truncate ${
              selectedDate
                ? "font-bold text-[#14171A] dark:text-[#FAF8F5]"
                : "text-gray-400 dark:text-gray-500 font-normal"
            }`}
          >
            {selectedDate ? formatLuxuryDate(selectedDate, language) : placeholder}
          </p>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {selectedDate && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelectDate("");
              }}
              className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={language === "vi" ? "Xóa ngày" : "Clear date"}
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
            data-lenis-prevent
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute left-0 right-0 ${
              isCheckOut ? "sm:left-auto sm:right-0" : "sm:right-auto sm:left-0"
            } sm:w-84 top-[calc(100%+8px)] bg-white dark:bg-[#1E2328] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.38)] border-2 border-[#E2D9CC] dark:border-[#C2A476]/30 z-[70] text-[#14171A] dark:text-[#FAF8F5] flex flex-col max-h-[min(460px,calc(100vh-140px))] overflow-hidden`}
          >
            {/* Header (Pinned at Top) */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] dark:bg-[#14171A] border-b border-[#EAE2D5] dark:border-white/10 rounded-t-2xl shrink-0 z-20 shadow-xs">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[#C2A476] block">
                  {label}
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-[#14171A] dark:text-[#FAF8F5] leading-tight tracking-tight">
                  {monthNames[calMonth]} {calYear}
                </h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#252B31] hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-[#E2D9CC] dark:border-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-sm"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#252B31] hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-[#E2D9CC] dark:border-white/10 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-sm"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Calendar Body */}
            <div
              data-lenis-prevent
              className="p-3 sm:p-3.5 overflow-y-auto flex-1 space-y-2 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#C2A476_transparent]"
            >

            {/* Availability Legend */}
            {maintenanceAdminMode ? (
              <div className="flex items-center justify-between text-[11px] text-neutral-700 dark:text-neutral-300 py-1.5 px-2 bg-[#FAF8F5] dark:bg-[#14171A] rounded-xl mb-2.5 border border-[#EAE2D5] dark:border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                  <span className="font-semibold">{language === "vi" ? "Ngày trống" : "Available"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-2xs" />
                  <span className="font-semibold text-violet-600 dark:text-violet-400">{language === "vi" ? "Khách đã đặt" : "Guest Booked"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C2A476] shadow-2xs" />
                  <span className="font-semibold text-[#8A6B3D] dark:text-[#C2A476]">{language === "vi" ? "Đang chọn" : "Selected"}</span>
                </span>
              </div>
            ) : !isClean ? (
              <div className="flex items-center justify-around text-xs text-neutral-700 dark:text-neutral-300 py-1.5 px-3 bg-[#FAF8F5] dark:bg-[#14171A] rounded-xl mb-2 border border-[#EAE2D5] dark:border-white/10">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="font-medium">{language === "vi" ? "Trống" : "Available"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                  <span className="font-medium">{language === "vi" ? "Đã đặt" : "Booked"}</span>
                </span>
              </div>
            ) : null}

            {/* Maintenance Warning Banner if Villa has Scheduled Maintenance (Only in guest booking mode) */}
            {!isClean && !maintenanceAdminMode && villaId && (() => {
              const maintInfo = bookingStore.getVillaMaintenanceInfo(villaId);
              if (!maintInfo?.isMaintenance) return null;
              const isIndefinite = !maintInfo.startDate || !maintInfo.endDate;

              return (
                <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5 animate-fade-in">
                  <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold">
                      {isIndefinite
                        ? "Bảo trì định kỳ — Tạm khóa nhận lịch"
                        : `Lịch bảo trì: ${maintInfo.startDate} → ${maintInfo.endDate}`}
                    </span>
                    {maintInfo.reason && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400/90 truncate">{maintInfo.reason}</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {dayLabels.map((d) => (
                <span key={d} className="text-xs font-bold text-gray-500 dark:text-gray-400 py-0.5">
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

                // Detailed guest booking check for maintenanceAdminMode
                const guestBookingDetail = (maintenanceAdminMode && villaId)
                  ? bookingStore.getGuestBookingDetailForDate(villaId, dateStr)
                  : { isBooked: false };
                const hasGuestBooking = guestBookingDetail.isBooked;

                // Standard public booking checks (skipped in cleanMode or maintenanceAdminMode)
                const isDateUnderMaintenance = (!isClean && !maintenanceAdminMode && villaId)
                  ? bookingStore.isVillaDateUnderMaintenance(villaId, dateStr)
                  : false;
                const bookedInfo = (!isClean && !maintenanceAdminMode && villaId)
                  ? bookingStore.isDateBooked(dateStr, villaId)
                  : { isBooked: false, villaNames: [] };
                const isBooked = bookedInfo.isBooked;

                let hasRangeConflict = false;
                if (!isClean && !maintenanceAdminMode && isCheckOut && checkInDate && villaId) {
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

                // Disabled logic: In maintenanceAdminMode, Admin is NEVER locked out of choosing future dates!
                const isDisabled = maintenanceAdminMode
                  ? isPast
                  : isClean
                  ? isPast
                  : (isPast || isDateUnderMaintenance || (isCheckOut ? hasRangeConflict : isBooked));

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(dateStr)}
                    title={
                      maintenanceAdminMode
                        ? hasGuestBooking
                          ? `👤 ${language === "vi" ? "Đã có khách đặt" : "Guest Reservation"}: ${guestBookingDetail.inquiry?.guestName} (${guestBookingDetail.inquiry?.checkIn} → ${guestBookingDetail.inquiry?.checkOut})`
                          : isPast
                          ? (language === "vi" ? "Ngày trong quá khứ" : "Past date")
                          : isSelected
                          ? (language === "vi" ? "Ngày đang chọn" : "Selected date")
                          : (language === "vi" ? "🟢 Ngày trống — Nhấn để chọn" : "Available — Click to select")
                        : isClean
                        ? (isPast ? "Ngày quá khứ" : isSelected ? "Đang chọn" : "Chọn ngày")
                        : isDateUnderMaintenance
                        ? "Ngày này thuộc đợt bảo trì định kỳ của Villa"
                        : isBooked
                        ? `Đã đặt: ${bookedInfo.villaNames.join(", ") || "Booked"}`
                        : hasRangeConflict
                        ? "Khoảng ngày bị trùng với đơn đặt hiện hữu"
                        : isPast
                        ? "Ngày quá khứ"
                        : "Còn trống"
                    }
                    className={`h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${
                      isSelected
                        ? "bg-gradient-to-r from-[#C2A476] to-[#d4ba94] text-[#14171A] font-extrabold shadow-md scale-105 z-10 ring-2 ring-[#C2A476]/50"
                        : isInRange
                        ? "bg-[#FAF6EE] dark:bg-[#C2A476]/15 text-[#8A6B3D] dark:text-[#C2A476] font-bold"
                        : isDisabled
                        ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed opacity-40"
                        : isDateUnderMaintenance
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 line-through cursor-not-allowed opacity-80 font-bold"
                        : (isCheckOut ? hasRangeConflict : isBooked)
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-400 dark:text-rose-400 border border-rose-200 dark:border-rose-900 line-through cursor-not-allowed opacity-75"
                        : "text-neutral-800 dark:text-neutral-200 hover:bg-[#FAF6EE] dark:hover:bg-[#C2A476]/20 hover:text-[#8A6B3D] dark:hover:text-[#C2A476] cursor-pointer"
                    }`}
                  >
                    {dayNum}
                    {/* Guest Booking indicator in maintenanceAdminMode */}
                    {maintenanceAdminMode && hasGuestBooking && (
                      <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-violet-600"
                        }`}
                      />
                    )}
                    {!isClean && !maintenanceAdminMode && !isCheckOut && isBooked && !isDateUnderMaintenance && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                    )}
                    {!isClean && !maintenanceAdminMode && isDateUnderMaintenance && (
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Stay Duration Presets (Only in booking checkout mode) */}
            {isCheckOut && checkInDate && !isClean && !maintenanceAdminMode && (
              <div className="mt-3 pt-2.5 border-t border-[#EAE2D5] dark:border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C2A476]" />
                    <span>{language === "vi" ? "Chọn nhanh thời gian:" : "Quick Stay (Nights):"}</span>
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedDate === targetDate
                            ? "bg-[#C2A476] text-[#14171A] shadow-sm font-extrabold"
                            : disabled
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through cursor-not-allowed opacity-50"
                            : "bg-[#FAF6EE] dark:bg-[#14171A] text-[#8A6B3D] dark:text-[#C2A476] hover:bg-[#f3ebd9] dark:hover:bg-[#C2A476]/20 border border-[#E8E0D2] dark:border-white/10"
                        }`}
                        title={disabled ? (language === "vi" ? "Trùng ngày đã đặt" : "Conflicts with existing booking") : (language === "vi" ? `Đặt ${days} đêm` : `Book ${days} night(s)`)}
                      >
                        +{days} {language === "vi" ? "Đêm" : (days === 1 ? "Night" : "Nights")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Villa Existing Bookings Note in maintenanceAdminMode */}
            {maintenanceAdminMode && villaId && (() => {
              const activeBookings = bookingStore.getVillaActiveBookings(villaId);
              if (activeBookings.length === 0) return null;
              return (
                <div className="mt-2.5 pt-2 border-t border-[#EAE2D5] dark:border-white/10">
                  <div className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-violet-800 dark:text-violet-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                      <span>{language === "vi" ? "Khách đã đặt Villa này:" : "Existing bookings:"}</span>
                    </span>
                    <span className="text-[9px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/50 px-1.5 py-0.5 rounded-full">
                      {activeBookings.length} {language === "vi" ? "đơn" : "total"}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                    {activeBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="text-[10px] bg-violet-50 dark:bg-violet-950/30 border border-violet-200/90 dark:border-violet-900/50 rounded-lg px-2 py-1 flex items-center justify-between text-violet-950 dark:text-violet-200"
                      >
                        <div className="min-w-0 pr-1.5">
                          <span className="font-bold truncate block">{b.guestName}</span>
                          <span className="text-[9px] text-violet-600 dark:text-violet-400 font-mono">#{b.id}</span>
                        </div>
                        <span className="font-mono text-[9px] font-bold text-violet-800 dark:text-violet-300 bg-white dark:bg-[#14171A] px-1.5 py-0.5 rounded border border-violet-200 dark:border-violet-800 shrink-0">
                          {b.checkIn} → {b.checkOut}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
