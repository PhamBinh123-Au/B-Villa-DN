"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { Villa } from "@/types";
import { bookingStore, formatPriceVnd, formatPriceUsd } from "@/lib/bookingStore";
import { useLanguage } from "@/context/LanguageContext";
import {
  LuxuryDatePicker,
  formatLuxuryDate,
  addDays,
} from "./LuxuryDatePicker";
import {
  LuxuryConfirmDialog,
  DialogVariant,
  DetailItem,
} from "./LuxuryConfirmDialog";
import {
  X,
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ChevronDown,
  Check,
  Home,
  AlertCircle,
  Clock,
  Wrench,
  Tag,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedVilla?: Villa | null;
  initialDates?: { checkIn?: string; checkOut?: string; guests?: number };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedVilla,
  initialDates,
}) => {
  const { t, language } = useLanguage();
  const [villaId, setVillaId] = useState<string>("");
  const [isVillaSelectOpen, setIsVillaSelectOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<{
    isOpen: boolean;
    variant: DialogVariant;
    title: string;
    message: string;
    badgeText?: string;
    details?: DetailItem[];
  } | null>(null);

  const showModalAlert = (
    title: string,
    message: string,
    variant: DialogVariant = "warning",
    badgeText?: string,
    details?: DetailItem[]
  ) => {
    setModalAlert({
      isOpen: true,
      title,
      message,
      variant,
      badgeText,
      details,
    });
  };

  const modalSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedVilla) {
      setVillaId(preSelectedVilla.id);
    } else if (!villaId && siteConfig.villas.length > 0) {
      setVillaId(siteConfig.villas[0].id);
    }

    if (initialDates?.checkIn) setCheckIn(initialDates.checkIn);
    if (initialDates?.checkOut) setCheckOut(initialDates.checkOut);
    if (initialDates?.guests) setAdults(initialDates.guests);
  }, [preSelectedVilla, initialDates, isOpen]);

  // Click outside listener for modal villa selector
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalSelectRef.current && !modalSelectRef.current.contains(e.target as Node)) {
        setIsVillaSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for Escape key to close modal quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const [mounted, setMounted] = useState(false);
  const [priceVersion, setPriceVersion] = useState(0);
  useEffect(() => {
    setMounted(true);
    const unsubscribe = bookingStore.subscribe((payload) => {
      if (payload.action === "PRICE_UPDATE" || payload.action === "UPDATE") {
        setPriceVersion((v) => v + 1);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen || !mounted) return null;

  const currentVilla = siteConfig.villas.find((v) => v.id === villaId) || siteConfig.villas[0];
  const currentPrice = currentVilla ? bookingStore.getVillaPrice(currentVilla.id) : 0;
  const currentUsdRate = bookingStore.getUsdRate();
  const stayNights =
    checkIn && checkOut && checkOut > checkIn
      ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;
  const estimatedTotalVnd = stayNights > 0 ? currentPrice * stayNights : 0;
  const isUnderMaintenance = currentVilla ? bookingStore.isVillaUnderMaintenance(currentVilla.id) : false;
  const maintenanceInfo = currentVilla ? bookingStore.getVillaMaintenanceInfo(currentVilla.id) : undefined;

  const conflict =
    checkIn && checkOut && currentVilla
      ? bookingStore.hasDateConflict(checkIn, checkOut, currentVilla.id)
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUnderMaintenance) {
      showModalAlert(
        "Villa Under Maintenance",
        `${currentVilla.name} is currently undergoing scheduled maintenance. Reservations are temporarily paused for this property. Please choose another villa or contact our concierge directly.`,
        "warning",
        "Maintenance in Progress"
      );
      return;
    }

    if (!checkIn || !checkOut) {
      showModalAlert(
        "Dates Required",
        "Please select both check-in and check-out dates before submitting your reservation inquiry.",
        "warning",
        "Missing Dates"
      );
      return;
    }

    if (checkIn >= checkOut) {
      showModalAlert(
        "Invalid Stay Duration",
        "Check-out date must be strictly after check-in date. Please re-select your stay dates.",
        "warning",
        "Date Error"
      );
      return;
    }

    if (conflict) {
      showModalAlert(
        "Dates Already Booked",
        `${currentVilla.name} is already reserved for the chosen timeframe. Please select dates marked in white/green on the calendar.`,
        "warning",
        "Schedule Conflict",
        [
          { label: "Villa", value: currentVilla.name },
          { label: "Booked Dates", value: `${formatLuxuryDate(conflict.checkIn)} → ${formatLuxuryDate(conflict.checkOut)}` },
        ]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const newInquiry = await bookingStore.addInquiryAsync({
        villaId: currentVilla.id,
        villaName: currentVilla.name,
        guestName,
        email,
        phone,
        checkIn,
        checkOut,
        adults: Number(adults),
        children: Number(children),
        specialRequests,
      });

      setSubmittedInquiryId(newInquiry.id);
    } catch (err: any) {
      console.error(err);
      showModalAlert(
        "Submission Failed",
        err.message || "An error occurred while saving your inquiry. Please try again.",
        "danger",
        "Error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedInquiryId(null);
    setGuestName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in"
      data-lenis-prevent
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAE5DC] my-auto sm:my-8 max-h-[92vh] overflow-y-auto flex flex-col [scrollbar-width:thin] [scrollbar-color:#C2A476_transparent]"
      >
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-[#14171A] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 rounded-t-3xl shadow-sm shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C2A476] font-semibold">
              {t("modal.title", "Direct Reservation Inquiry")}
            </span>
            <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              {t("modal.heading", "Reserve Your Sanctuary")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-neutral-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold shadow-2xs"
            aria-label="Close modal"
          >
            <span>{language === "vi" ? "Đóng / Thoát" : "Close"}</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8">
          {submittedInquiryId ? (
            /* Success Confirmation State */
            <div className="text-center py-8 px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border-2 border-[#C2A476] flex items-center justify-center mx-auto mb-6 text-[#C2A476]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl sm:text-3xl text-neutral-900 font-extrabold tracking-tight mb-2">
                {t("modal.success_title", "Inquiry Successfully Received")}
              </h4>
              <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                {language === "vi" ? (
                  <>Cảm ơn quý khách, <span className="font-semibold text-neutral-900">{guestName}</span>. Yêu cầu đặt phòng <span className="font-semibold text-neutral-900">{currentVilla.name}</span> đã được chuyển trực tiếp tới đội ngũ quản gia.</>
                ) : (
                  <>Thank you, <span className="font-semibold text-neutral-900">{guestName}</span>. Your reservation inquiry for <span className="font-semibold text-neutral-900">{currentVilla.name}</span> has been logged directly with our concierge team.</>
                )}
              </p>

              <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 max-w-md mx-auto mb-8 text-left">
                <div className="flex justify-between items-center text-xs text-neutral-500 pb-2 border-b border-neutral-200">
                  <span>{language === "vi" ? "Mã Tra Cứu:" : "Reference Number:"}</span>
                  <span className="font-mono font-bold text-[#C2A476]">{submittedInquiryId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-2">
                  <span>{language === "vi" ? "Biệt Thự Đã Chọn:" : "Villa Selected:"}</span>
                  <span className="font-medium text-neutral-900">{currentVilla.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-1">
                  <span>{language === "vi" ? "Thời Gian Lưu Trú:" : "Dates:"}</span>
                  <span>{checkIn} → {checkOut}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-1">
                  <span>{language === "vi" ? "Trạng Thái:" : "Status:"}</span>
                  <span className="text-amber-600 font-medium uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded">
                    {language === "vi" ? "Đã Gửi Tới Bảng Quản Trị" : "Sent to Host Dashboard"}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 max-w-md mx-auto mb-6 text-center">
                <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                  {language === "vi" ? (
                    <>⚠️ Đội ngũ B-Villa sẽ <strong>gọi điện hoặc nhắn Zalo</strong> tới số <span className="font-mono font-bold text-amber-950">{phone || "của quý khách"}</span> trong 10-15 phút để kiểm tra lịch trống và xác nhận giữ căn.</>
                  ) : (
                    <>⚠️ Our concierge team will <strong>call or message via WhatsApp/Zalo</strong> within 10-15 minutes to verify calendar availability and confirm your stay.</>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <a
                  href={siteConfig.social.zalo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#0068FF] hover:bg-[#0055d4] text-white py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === "vi" ? "💬 Chat Zalo Xác Nhận Ngay" : "💬 Chat on Zalo Now"}</span>
                </a>

                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{language === "vi" ? "📞 Gọi Hotline 24/7" : "📞 Call Concierge"}</span>
                </a>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center bg-[#14171A] hover:bg-neutral-800 text-white py-3 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t("modal.close", "Done")}
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Custom Luxury Villa Selector */}
              <div ref={modalSelectRef} className="relative">
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2">
                  Select Villa Residence
                </label>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsVillaSelectOpen((prev) => !prev)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 hover:border-[#C2A476] rounded-2xl p-3 text-left flex items-center justify-between transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C2A476]/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 bg-neutral-100 shadow-sm">
                      <Image
                        src={currentVilla.image}
                        alt={currentVilla.name}
                        fill
                        unoptimized
                        sizes="88px"
                        className="object-cover"
                        style={{ imageRendering: "-webkit-optimize-contrast" }}
                      />
                      <div className="absolute top-0.5 left-0.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1 rounded">
                        {currentVilla.code}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                        {language === "vi" ? (currentVilla.nameVi || currentVilla.name) : currentVilla.name}
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate mt-0.5">
                        {language === "vi" ? (currentVilla.districtVi || currentVilla.district) : currentVilla.district} • {language === "vi" ? (currentVilla.poolTypeVi || currentVilla.poolType) : currentVilla.poolType}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 flex-shrink-0 ml-2 ${
                      isVillaSelectOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {isVillaSelectOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      data-lenis-prevent
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#EAE5DC] p-2 z-50 text-neutral-900 max-h-[290px] overflow-y-auto space-y-1 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#C2A476_transparent]"
                    >
                      {siteConfig.villas.map((v) => {
                        const isSelected = v.id === currentVilla.id;
                        const isVMaint = bookingStore.isVillaUnderMaintenance(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setVillaId(v.id);
                              setIsVillaSelectOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer ${
                              isSelected
                                ? "bg-[#FAF7F2] text-neutral-900 font-semibold ring-1 ring-[#C2A476]/40"
                                : "hover:bg-[#FAF8F5] text-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 shadow-sm bg-neutral-100">
                                <Image
                                  src={v.image}
                                  alt={v.name}
                                  fill
                                  unoptimized
                                  sizes="80px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                                />
                                <div className="absolute top-0.5 left-0.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1 rounded">
                                  {v.code}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-[#A6834F] transition-colors">
                                    {language === "vi" ? (v.nameVi || v.name) : v.name}
                                  </p>
                                  {isVMaint && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5 flex-shrink-0">
                                      <Wrench className="w-2.5 h-2.5" />
                                      <span>Maintenance</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-400 truncate">
                                  {language === "vi" ? (v.districtVi || v.district) : v.district} • {v.bedrooms} PN • {language === "vi" ? (v.poolTypeVi || v.poolType) : v.poolType}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#C2A476]/15 flex items-center justify-center text-[#A6834F] flex-shrink-0 ml-2">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-neutral-500 mt-1.5 italic">
                  Max capacity: {currentVilla.maxGuests} guests • {currentVilla.bedrooms} En-suite Bedrooms
                </p>

                {/* Nightly Price Banner with Live USD Conversion */}
                <div className="mt-2.5 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#C2A476]/15 text-[#8A6B3D] flex items-center justify-center font-bold flex-shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                        {language === "vi" ? "Đơn Giá Niêm Yết" : "Nightly Rate"}
                      </span>
                      <span className="font-extrabold text-neutral-900 text-sm tracking-tight">
                        {formatPriceVnd(currentPrice)}
                        <span className="text-xs font-normal text-neutral-500 font-sans ml-1">
                          /{language === "vi" ? "đêm" : "night"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE5DC] text-[11px] font-semibold text-neutral-700 shadow-2xs">
                    <span className="text-neutral-400">≈</span>
                    <span className="text-emerald-700 font-mono font-bold">
                      ${formatPriceUsd(currentPrice, currentUsdRate)} USD
                    </span>
                    <span className="text-[10px] text-neutral-400">/{language === "vi" ? "đêm" : "night"}</span>
                  </div>
                </div>

                {/* Prominent Maintenance Alert Banner if Selected Villa is Under Maintenance */}
                {isUnderMaintenance && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-start gap-3 animate-fade-in shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-amber-950 text-sm">
                        Sanctuary Under Maintenance
                      </h5>
                      <p className="text-amber-800 text-xs mt-0.5 leading-relaxed font-light">
                        {maintenanceInfo?.reason || `${currentVilla.name} is currently undergoing scheduled maintenance & renovation.`} Inquiries and reservations are temporarily closed for this property. Please choose another villa.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Luxury Check-in & Check-out Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LuxuryDatePicker
                  label="Check-in Date"
                  selectedDate={checkIn}
                  onSelectDate={(val) => {
                    setCheckIn(val);
                    if (val && (!checkOut || checkOut <= val)) {
                      setCheckOut(addDays(val, 2));
                    }
                  }}
                  villaId={currentVilla.id}
                  placeholder="Select Check-in Date"
                />

                <LuxuryDatePicker
                  label="Check-out Date"
                  selectedDate={checkOut}
                  onSelectDate={(val) => setCheckOut(val)}
                  villaId={currentVilla.id}
                  isCheckOut={true}
                  checkInDate={checkIn}
                  minDate={checkIn ? addDays(checkIn, 1) : undefined}
                  placeholder="Select Check-out Date"
                />
              </div>

              {/* Stay Duration & Price Estimate Card */}
              {checkIn && checkOut && checkOut > checkIn && !conflict && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-neutral-700 pb-2 border-b border-[#EAE5DC]/70">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
                      <span className="font-semibold text-neutral-900">
                        {language === "vi" ? "Thời Gian Lưu Trú:" : "Stay Duration:"}
                      </span>
                      <span className="font-bold text-neutral-900">
                        {stayNights} {language === "vi" ? "Đêm" : "Nights"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                      {language === "vi" ? "Ngày Hợp Lệ" : "Dates Available"}
                    </span>
                  </div>

                  {/* Calculated Estimated Total */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pt-0.5">
                    <div>
                      <span className="text-[11px] text-neutral-500 font-medium block">
                        {language === "vi" ? `Tổng tạm tính (${stayNights} đêm):` : `Estimated Stay Total (${stayNights} nights):`}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight">
                        {formatPriceVnd(estimatedTotalVnd)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                        <span>≈</span>
                        <span className="font-mono text-emerald-900 text-sm">
                          ${formatPriceUsd(estimatedTotalVnd, currentUsdRate)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-normal">USD</span>
                      </span>
                      <span className="block text-[9px] text-neutral-400 mt-0.5">
                        {language === "vi" ? "*Giá niêm yết tiêu chuẩn" : "*Standard published rates"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>{language === "vi" ? "Người Lớn" : "Adults"}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentVilla.maxGuests}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>{language === "vi" ? "Trẻ Em" : "Children"}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={6}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>{t("modal.guest_name", "Your Full Name")}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={language === "vi" ? "Ví dụ: Nguyễn Văn A" : "e.g. David Harrison"}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>{t("modal.phone", "Phone or WhatsApp")}</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={language === "vi" ? "Ví dụ: 0905 123 456" : "e.g. +84 905 123 456"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{t("modal.email", "Email Address")}</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                  required
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2">
                  {t("modal.special_requests", "Special Requests / Arrival Notes")}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === "vi" ? "Đón sân bay, nhận phòng sớm, tiệc nướng BBQ..." : "Airport pickup, early check-in, BBQ arrangement, etc."}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476] resize-none"
                />
              </div>

              {/* Conflict Warning if Dates Already Booked */}
              {conflict && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{t("modal.conflict_warning", "Villa Already Reserved On These Dates")}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                      {currentVilla.name} {language === "vi" ? "đã được đặt từ" : "is already booked from"} <span className="font-semibold">{conflict.checkIn}</span> {language === "vi" ? "đến" : "to"} <span className="font-semibold">{conflict.checkOut}</span>. {language === "vi" ? "Vui lòng chọn ngày khác hoặc chọn căn villa khác." : "Please choose different dates or select another villa."}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit CTA & Dedicated Cancel / Exit Button */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                  {/* Cancel / Exit Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl border-2 border-neutral-200 hover:border-neutral-400 bg-[#FAF8F5] hover:bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <X className="w-4 h-4 text-neutral-500" />
                    <span>{language === "vi" ? "Hủy / Thoát Ra" : "Cancel / Exit"}</span>
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !!conflict || !checkIn || !checkOut || isUnderMaintenance}
                    className="w-full sm:w-2/3 bg-[#14171A] hover:bg-[#C2A476] text-white py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isUnderMaintenance ? (
                      <>
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <span>{language === "vi" ? "Tạm Dừng — Biệt Thự Đang Bảo Trì" : "Unavailable — Villa Under Maintenance"}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#C2A476] group-hover:text-white" />
                        <span>
                          {conflict
                            ? (language === "vi" ? "Ngày Đã Kín — Chọn Ngày Khác" : "Dates Unavailable — Choose Other Dates")
                            : !checkIn || !checkOut
                            ? (language === "vi" ? "Chọn Ngày Nhận & Trả Phòng" : "Select Check-in & Check-out Dates")
                            : isSubmitting
                            ? t("modal.submitting", "Submitting Inquiry...")
                            : t("modal.submit_btn", "Submit Reservation Inquiry")}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-neutral-500 mt-2.5 leading-relaxed">
                  {language === "vi"
                    ? "✨ Quý khách chưa cần thanh toán ngay. Để đảm bảo không bị trùng lịch, B-Villa sẽ kiểm tra và gọi điện / nhắn Zalo xác nhận trong 10-15 phút!"
                    : "✨ No advance payment required now. Our team will verify calendar availability and contact via phone/Zalo within 10-15 minutes!"}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Luxury Notice / Error Alert Modal */}
      {modalAlert && (
        <LuxuryConfirmDialog
          isOpen={modalAlert.isOpen}
          variant={modalAlert.variant}
          badgeText={modalAlert.badgeText}
          title={modalAlert.title}
          message={modalAlert.message}
          details={modalAlert.details}
          confirmText="Understood"
          cancelText={null}
          isAlertOnly={true}
          onConfirm={() => setModalAlert(null)}
          onCancel={() => setModalAlert(null)}
        />
      )}
    </div>,
    document.body
  );
};
