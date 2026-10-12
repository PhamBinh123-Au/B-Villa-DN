"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { bookingStore } from "@/lib/bookingStore";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Calendar as CalendarIcon,
  Home,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  X,
  AlertCircle,
  Info,
  Wrench,
} from "lucide-react";
import {
  LuxuryConfirmDialog,
  DialogVariant,
  DetailItem,
} from "./LuxuryConfirmDialog";
import { formatLuxuryDate } from "./LuxuryDatePicker";

interface HeroProps {
  onCheckAvailability: (query: {
    villaId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
}

const HERO_SLIDES = [
  {
    image: "/images/hero/hero-luxury-villa.jpg",
    title: "Crystal Turquoise Swimming Pool",
    subtitle: "Son Tra Coastline Sanctuary",
  },
  {
    image: "/images/gallery/garden-exterior.jpg",
    title: "Architectural Stone Facade & Tropical Lawn",
    subtitle: "Private Gated Coastal Living",
  },
  {
    image: "/images/gallery/bedroom-poolview.jpg",
    title: "Poolside En-Suite Master Residence",
    subtitle: "Floor-to-Ceiling Glass Harmony",
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Format "YYYY-MM-DD" to "Thu, 15 Oct"
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysToString(dateStr: string, days: number): string {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const Hero: React.FC<HeroProps> = ({ onCheckAvailability }) => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedVilla, setSelectedVilla] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Active open dropdown: null | 'villa' | 'checkIn' | 'checkOut'
  const [activeDropdown, setActiveDropdown] = useState<"villa" | "checkIn" | "checkOut" | null>(null);

  // Calendar month/year navigation state
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  // Version counter to force re-render when bookings change in real-time
  const [bookingsVersion, setBookingsVersion] = useState(0);

  // Luxury Dialog / Notice State
  const [heroAlert, setHeroAlert] = useState<{
    isOpen: boolean;
    variant: DialogVariant;
    title: string;
    message: string;
    badgeText?: string;
    details?: DetailItem[];
  } | null>(null);

  const barRef = useRef<HTMLDivElement>(null);

  const todayStr = getTodayString();

  // Automatic slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Listen to real-time booking changes from Admin or other tabs
  useEffect(() => {
    const unsubscribe = bookingStore.subscribe(() => {
      setBookingsVersion((v) => v + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Close all popovers when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update calendar view when opening date picker
  const openCalendar = (type: "checkIn" | "checkOut") => {
    const refDate = type === "checkIn" ? checkIn : checkOut;
    if (refDate) {
      const parts = refDate.split("-").map(Number);
      setCalYear(parts[0]);
      setCalMonth(parts[1] - 1);
    } else {
      const now = new Date();
      setCalYear(now.getFullYear());
      setCalMonth(now.getMonth());
    }
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handlePrevCalMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextCalMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleSelectCheckIn = (dateStr: string) => {
    setCheckIn(dateStr);
    // If checkOut is earlier or equal to new checkIn, automatically set checkOut = checkIn + 1 day
    if (!checkOut || checkOut <= dateStr) {
      const nextDay = addDaysToString(dateStr, 1);
      // Ensure next day is valid
      setCheckOut(nextDay);
    }
    // Automatically transition to Check-Out calendar smoothly
    setActiveDropdown("checkOut");
  };

  const handleSelectCheckOut = (dateStr: string) => {
    setCheckOut(dateStr);
    setActiveDropdown(null);
  };

  const selectedVillaData = siteConfig.villas.find((v) => v.id === selectedVilla);
  const isSelectedVillaUnderMaintenance = selectedVilla ? bookingStore.isVillaUnderMaintenance(selectedVilla) : false;
  const selectedVillaMaintenanceInfo = selectedVilla ? bookingStore.getVillaMaintenanceInfo(selectedVilla) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);

    // If selected villa is under maintenance, prohibit booking
    if (selectedVilla && isSelectedVillaUnderMaintenance) {
      setHeroAlert({
        isOpen: true,
        variant: "warning",
        badgeText: "Temporarily Closed",
        title: "Sanctuary Under Maintenance",
        message: `${selectedVillaData?.name || selectedVilla} is currently undergoing scheduled maintenance. Reservations are temporarily closed for this property.\n\nPlease select another villa or contact our concierge directly.`,
        details: [
          { label: "Villa", value: selectedVillaData?.name || selectedVilla },
          {
            label: "Notice",
            value: selectedVillaMaintenanceInfo?.reason || "Scheduled refurbishment in progress.",
          },
        ],
      });
      return;
    }

    // If dates are chosen for a specific villa, verify no conflict
    if (selectedVilla && checkIn && checkOut) {
      const conflict = bookingStore.hasDateConflict(checkIn, checkOut, selectedVilla);
      if (conflict) {
        setHeroAlert({
          isOpen: true,
          variant: "warning",
          badgeText: "Schedule Conflict",
          title: "Dates Unavailable",
          message: `These dates are already reserved for this villa. Please select available dates marked in green or white on the calendar.`,
          details: [
            { label: "Villa", value: selectedVillaData?.name || selectedVilla },
            {
              label: "Reserved Period",
              value: `${formatLuxuryDate(conflict.checkIn)} → ${formatLuxuryDate(conflict.checkOut)}`,
            },
          ],
        });
        return;
      }
    }

    onCheckAvailability({
      villaId: selectedVilla || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests || 2,
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Calendar Day Grid calculations
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center bg-[#0d0f12] text-white z-30 overflow-x-hidden">
      {/* Background Hero Image Slides with Smooth Cross-fade (Overflow clipped strictly here) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover object-center scale-105 transition-transform duration-[8000ms] ease-out"
            />
          </div>
        ))}

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e1114] via-black/45 to-black/75 backdrop-brightness-95" />
      </div>

      {/* Hero Content */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 pt-32 sm:pt-36 md:pt-40 pb-20 sm:pb-28 md:pb-36 text-center flex flex-col items-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EAE4D7] text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>{t("hero.subtitle", "Exclusive Private Sanctuaries")}</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.15] sm:leading-[1.1] text-white max-w-4xl drop-shadow-md">
          {language === "vi" ? (
            <>Nghỉ Dưỡng Đẳng Cấp <span className="italic font-normal text-[#C2A476]">Bên Bờ Biển</span> Đà Nẵng</>
          ) : (
            <>A Symphony of <span className="italic font-normal text-[#C2A476]">Light, Water</span> & Architectural Serenity</>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg lg:text-xl text-neutral-300 font-light max-w-2xl leading-relaxed">
          {language === "vi"
            ? "Khám phá 4 biệt thự hồ bơi riêng tư tuyệt mỹ tại Sơn Trà & Ngũ Hành Sơn với kiến trúc tối giản hiện đại và dịch vụ đặc quyền."
            : "Four private, architecturally designed pool villas across Da Nang's coveted Son Tra and Ngu Hanh Son coastlines. Dedicated to absolute tranquility."}
        </p>

        {/* Quick CTA Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="#villas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs md:text-sm uppercase tracking-widest font-semibold px-8 py-3.5 sm:py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{language === "vi" ? "Khám Phá 4 Biệt Thự" : "Explore The 4 Villas"}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#experience"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm uppercase tracking-widest font-medium px-8 py-3.5 sm:py-4 rounded-full transition-all duration-300 cursor-pointer"
          >
            <span>{language === "vi" ? "Trải Nghiệm Nghỉ Dưỡng" : "The Villa Lifestyle"}</span>
          </a>
        </div>

        {/* Floating Luxury Availability Bar (100% Solid White Surface) */}
        <div
          ref={barRef}
          style={{ backgroundColor: "#ffffff" }}
          className="mt-8 sm:mt-12 md:mt-14 w-full max-w-4xl bg-white text-neutral-900 rounded-3xl md:rounded-full p-3 sm:p-4 md:p-3 shadow-[0_25px_70px_rgba(0,0,0,0.38)] border-2 border-[#E2D9CC] relative z-40"
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 items-center"
          >
            {/* 1. VILLA SELECTOR (100% Solid White Popover) */}
            <div className="relative px-2 py-1 sm:px-3 sm:py-1.5 border-b md:border-b-0 md:border-r border-neutral-200">
              <button
                type="button"
                onClick={() => setActiveDropdown((prev) => (prev === "villa" ? null : "villa"))}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left focus:outline-none group cursor-pointer ${
                  activeDropdown === "villa" ? "bg-[#FAF6EE] ring-1 ring-[#C2A476]/50" : "hover:bg-neutral-50"
                }`}
                aria-haspopup="listbox"
                aria-expanded={activeDropdown === "villa"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center text-[#C2A476] flex-shrink-0 group-hover:scale-105 transition-all">
                  <Home className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-600 group-hover:text-[#8A6B3D] transition-colors">
                      {t("search.select_villa", "Select Sanctuary")}
                    </span>
                    {isSelectedVillaUnderMaintenance && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                        <Wrench className="w-2.5 h-2.5" />
                        <span>{t("villas.maintenance_badge", "Maintenance")}</span>
                      </span>
                    )}
                  </div>
                  <span className="block text-xs sm:text-sm font-bold text-neutral-900 truncate mt-0.5">
                    {selectedVillaData ? selectedVillaData.name : t("search.all_villas", "All 4 Villas")}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 flex-shrink-0 ${
                    activeDropdown === "villa" ? "rotate-180 text-[#8A6B3D]" : "group-hover:translate-y-0.5"
                  }`}
                />
              </button>

              {/* Villa Dropdown Popover (100% Solid White Background) */}
              <AnimatePresence>
                {activeDropdown === "villa" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ backgroundColor: "#ffffff" }}
                    className="absolute left-0 right-0 sm:right-auto sm:left-0 sm:w-84 md:w-96 top-[calc(100%+10px)] bg-white rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.38)] border-2 border-[#E2D9CC] p-3 z-50 text-neutral-900 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-3 py-2 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl mb-2 flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-700">
                        Choose Your Sanctuary
                      </span>
                      <span className="text-[10px] font-bold text-[#8A6B3D] bg-white px-2 py-0.5 rounded-full border border-[#E8E0D2]">
                        4 Residences
                      </span>
                    </div>

                    <div className="py-1 max-h-[360px] overflow-y-auto space-y-1.5">
                      {/* Option: All 4 Villas */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVilla("");
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer border ${
                          selectedVilla === ""
                            ? "bg-[#FAF7F2] border-[#C2A476] shadow-sm text-neutral-900 font-semibold"
                            : "bg-white border-transparent hover:bg-[#FAF8F5] text-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center text-[#C2A476] flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-[#8A6B3D] transition-colors text-neutral-900">
                              All 4 Villas
                            </p>
                            <p className="text-[11px] text-neutral-600 truncate">
                              Son Tra & Ngu Hanh Son Sanctuaries
                            </p>
                          </div>
                        </div>
                        {selectedVilla === "" && (
                          <div className="w-6 h-6 rounded-full bg-[#C2A476] flex items-center justify-center text-white flex-shrink-0 ml-2 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                      </button>

                      {/* All 4 Villas strictly listed */}
                      {siteConfig.villas.map((v) => {
                        const isSelected = selectedVilla === v.id;
                        const isUnderMaintenance = bookingStore.isVillaUnderMaintenance(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setSelectedVilla(v.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer border ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#C2A476] shadow-sm text-neutral-900 font-semibold"
                                : "bg-white border-transparent hover:bg-[#FAF8F5] text-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 shadow-sm bg-neutral-100">
                                <Image
                                  src={v.image}
                                  alt={v.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-0.5 left-0.5 bg-black/85 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  {v.code}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs sm:text-sm font-bold truncate group-hover:text-[#8A6B3D] transition-colors text-neutral-900">
                                    {v.name}
                                  </p>
                                  {isUnderMaintenance && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5 flex-shrink-0">
                                      <Wrench className="w-2.5 h-2.5" />
                                      <span>Maintenance</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-600 truncate mt-0.5 font-medium">
                                  {v.district} • {v.bedrooms} PN • {v.poolType}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#C2A476] flex items-center justify-center text-white flex-shrink-0 ml-2 shadow-sm">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. CHECK-IN DATE (With Real-Time Booked Dates Lock) */}
            <div className="relative px-2 py-1 sm:px-3 sm:py-1.5 border-b md:border-b-0 md:border-r border-neutral-200">
              <button
                type="button"
                onClick={() => openCalendar("checkIn")}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left focus:outline-none group cursor-pointer ${
                  activeDropdown === "checkIn" ? "bg-[#FAF6EE] ring-1 ring-[#C2A476]/50" : "hover:bg-neutral-50"
                }`}
                aria-haspopup="dialog"
                aria-expanded={activeDropdown === "checkIn"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center text-[#C2A476] flex-shrink-0 group-hover:scale-105 transition-all">
                  <CalendarIcon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-600 group-hover:text-[#8A6B3D] transition-colors">
                    {t("search.check_in", "Check-in Date")}
                  </span>
                  <span
                    className={`block text-xs sm:text-sm truncate mt-0.5 ${
                      checkIn
                        ? "font-bold text-neutral-900"
                        : "text-neutral-500 font-medium"
                    }`}
                  >
                    {checkIn ? formatDisplayDate(checkIn) : (language === "vi" ? "Chọn Ngày Đến" : "Select Arrival")}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 flex-shrink-0 ${
                    activeDropdown === "checkIn" ? "rotate-180 text-[#8A6B3D]" : "group-hover:translate-y-0.5"
                  }`}
                />
              </button>

              {/* Check-in Calendar Popover */}
              <AnimatePresence>
                {activeDropdown === "checkIn" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ backgroundColor: "#ffffff" }}
                    className="absolute left-0 right-0 sm:right-auto sm:left-0 sm:w-84 md:w-88 top-[calc(100%+10px)] bg-white rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.38)] border-2 border-[#E2D9CC] p-3 sm:p-4 z-50 text-neutral-900 overflow-hidden"
                  >
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5] mb-2.5 bg-[#FAF7F2] -m-4 mb-2.5 p-3.5 rounded-t-2xl">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A6B3D] block">
                          Check-in Date
                        </span>
                        <h4 className="font-serif font-bold text-lg text-neutral-900 leading-tight">
                          {MONTH_NAMES[calMonth]} {calYear}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevCalMonth}
                          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextCalMonth}
                          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Availability Legend */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-600 py-1.5 px-2 bg-[#FAF8F5] rounded-lg mb-2 border border-[#EAE2D5]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Available</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                        <span>Booked</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#C2A476]" />
                        <span>Selected</span>
                      </span>
                    </div>

                    {/* Villa-specific availability indicator message */}
                    {selectedVilla ? (
                      <p className="text-[10px] text-[#8A6B3D] font-medium mb-2 px-1 flex items-center gap-1">
                        <Info className="w-3 h-3 flex-shrink-0" />
                        <span>Checking availability for {selectedVillaData?.name}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-neutral-500 mb-2 px-1">
                        Select a specific villa to see exact reserved dates.
                      </p>
                    )}

                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {DAY_LABELS.map((label) => (
                        <span
                          key={label}
                          className="text-xs font-bold text-neutral-600 py-1"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Empty leading slots */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}

                      {/* Day cells */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const isPast = dateStr < todayStr;
                        const isSelected = dateStr === checkIn;
                        const isToday = dateStr === todayStr;

                        // Check real-time booked status
                        const bookedInfo = bookingStore.isDateBooked(dateStr, selectedVilla);
                        const isBooked = bookedInfo.isBooked;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            disabled={isPast || isBooked}
                            onClick={() => handleSelectCheckIn(dateStr)}
                            title={
                              isBooked
                                ? `Already Booked: ${bookedInfo.villaNames.join(", ")}`
                                : isPast
                                ? "Past Date"
                                : "Available to Book"
                            }
                            className={`h-9 w-9 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${
                              isSelected
                                ? "bg-[#C2A476] text-white font-bold shadow-md scale-105"
                                : isBooked
                                ? "bg-rose-50 text-rose-400 border border-rose-200 line-through cursor-not-allowed opacity-75"
                                : isPast
                                ? "text-neutral-300 cursor-not-allowed opacity-40"
                                : isToday
                                ? "border-2 border-[#C2A476] text-[#8A6B3D] hover:bg-[#FAF6EE] font-bold cursor-pointer"
                                : "text-neutral-900 hover:bg-[#FAF6EE] hover:text-[#8A6B3D] cursor-pointer"
                            }`}
                          >
                            {dayNum}
                            {isBooked && (
                              <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Preset Shortcuts */}
                    <div className="mt-3.5 pt-3 border-t border-[#EAE2D5] flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!bookingStore.isDateBooked(todayStr, selectedVilla).isBooked) {
                              handleSelectCheckIn(todayStr);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] text-[#8A6B3D] border border-[#E8E0D2] hover:bg-[#f5ede0] font-semibold transition-colors cursor-pointer"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tom = addDaysToString(todayStr, 1);
                            if (!bookingStore.isDateBooked(tom, selectedVilla).isBooked) {
                              handleSelectCheckIn(tom);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF6EE] text-[#8A6B3D] border border-[#E8E0D2] hover:bg-[#f5ede0] font-semibold transition-colors cursor-pointer"
                        >
                          Tomorrow
                        </button>
                      </div>

                      {checkIn && (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckIn("");
                            setActiveDropdown(null);
                          }}
                          className="text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. CHECK-OUT DATE (With Conflict Verification) */}
            <div className="relative px-2 py-1 sm:px-3 sm:py-1.5 border-b md:border-b-0 md:border-r border-neutral-200">
              <button
                type="button"
                onClick={() => openCalendar("checkOut")}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 text-left focus:outline-none group cursor-pointer ${
                  activeDropdown === "checkOut" ? "bg-[#FAF6EE] ring-1 ring-[#C2A476]/50" : "hover:bg-neutral-50"
                }`}
                aria-haspopup="dialog"
                aria-expanded={activeDropdown === "checkOut"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center text-[#C2A476] flex-shrink-0 group-hover:scale-105 transition-all">
                  <CalendarIcon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-neutral-600 group-hover:text-[#8A6B3D] transition-colors">
                    {t("search.check_out", "Check-out Date")}
                  </span>
                  <span
                    className={`block text-xs sm:text-sm truncate mt-0.5 ${
                      checkOut
                        ? "font-bold text-neutral-900"
                        : "text-neutral-500 font-medium"
                    }`}
                  >
                    {checkOut ? formatDisplayDate(checkOut) : (language === "vi" ? "Chọn Ngày Đi" : "Select Departure")}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 flex-shrink-0 ${
                    activeDropdown === "checkOut" ? "rotate-180 text-[#8A6B3D]" : "group-hover:translate-y-0.5"
                  }`}
                />
              </button>

              {/* Check-out Calendar Popover */}
              <AnimatePresence>
                {activeDropdown === "checkOut" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ backgroundColor: "#ffffff" }}
                    className="absolute left-0 right-0 sm:left-auto sm:right-0 md:right-0 md:left-auto sm:w-84 md:w-88 top-[calc(100%+10px)] bg-white rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.38)] border-2 border-[#E2D9CC] p-3 sm:p-4 z-50 text-neutral-900 overflow-hidden"
                  >
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5] mb-2.5 bg-[#FAF7F2] -m-4 mb-2.5 p-3.5 rounded-t-2xl">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A6B3D] block">
                          Check-out Date
                        </span>
                        <h4 className="font-serif font-bold text-lg text-neutral-900 leading-tight">
                          {MONTH_NAMES[calMonth]} {calYear}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevCalMonth}
                          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextCalMonth}
                          className="p-2 rounded-xl bg-white hover:bg-neutral-100 border border-[#E2D9CC] text-neutral-800 transition-colors cursor-pointer shadow-sm"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Availability Legend */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-600 py-1.5 px-2 bg-[#FAF8F5] rounded-lg mb-2 border border-[#EAE2D5]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Available</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                        <span>Booked</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#C2A476]" />
                        <span>Selected</span>
                      </span>
                    </div>

                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {DAY_LABELS.map((label) => (
                        <span
                          key={label}
                          className="text-xs font-bold text-neutral-600 py-1"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Empty leading slots */}
                      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-9" />
                      ))}

                      {/* Day cells */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const minCheckout = checkIn ? addDaysToString(checkIn, 1) : addDaysToString(todayStr, 1);
                        const isPast = dateStr < minCheckout;
                        const isSelected = dateStr === checkOut;

                        // Check if booking this range creates conflict with another reservation
                        const hasConflict =
                          checkIn && selectedVilla
                            ? !!bookingStore.hasDateConflict(checkIn, dateStr, selectedVilla)
                            : false;

                        const bookedInfo = bookingStore.isDateBooked(dateStr, selectedVilla);
                        const isBooked = bookedInfo.isBooked;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            disabled={isPast || hasConflict}
                            onClick={() => handleSelectCheckOut(dateStr)}
                            title={
                              hasConflict
                                ? "Stay overlaps an existing booking"
                                : isBooked
                                ? `Booked: ${bookedInfo.villaNames.join(", ")}`
                                : "Available Check-out"
                            }
                            className={`h-9 w-9 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative ${
                              isSelected
                                ? "bg-[#C2A476] text-white font-bold shadow-md scale-105"
                                : hasConflict
                                ? "bg-rose-50 text-rose-400 border border-rose-200 line-through cursor-not-allowed opacity-75"
                                : isPast
                                ? "text-neutral-300 cursor-not-allowed opacity-40"
                                : "text-neutral-900 hover:bg-[#FAF6EE] hover:text-[#8A6B3D] cursor-pointer"
                            }`}
                          >
                            {dayNum}
                            {isBooked && (
                              <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Preset Shortcuts */}
                    <div className="mt-3.5 pt-3 border-t border-[#EAE2D5] flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        {checkIn ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const target = addDaysToString(checkIn, 2);
                                if (!selectedVilla || !bookingStore.hasDateConflict(checkIn, target, selectedVilla)) {
                                  handleSelectCheckOut(target);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] text-[#8A6B3D] border border-[#E8E0D2] hover:bg-[#f5ede0] font-semibold transition-colors cursor-pointer"
                            >
                              +2 Nights
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const target = addDaysToString(checkIn, 3);
                                if (!selectedVilla || !bookingStore.hasDateConflict(checkIn, target, selectedVilla)) {
                                  handleSelectCheckOut(target);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] text-[#8A6B3D] border border-[#E8E0D2] hover:bg-[#f5ede0] font-semibold transition-colors cursor-pointer"
                            >
                              +3 Nights
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const target = addDaysToString(checkIn, 5);
                                if (!selectedVilla || !bookingStore.hasDateConflict(checkIn, target, selectedVilla)) {
                                  handleSelectCheckOut(target);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EE] text-[#8A6B3D] border border-[#E8E0D2] hover:bg-[#f5ede0] font-semibold transition-colors cursor-pointer"
                            >
                              +5 Nights
                            </button>
                          </>
                        ) : (
                          <span className="text-neutral-500 font-medium italic">
                            Select check-in first
                          </span>
                        )}
                      </div>

                      {checkOut && (
                        <button
                          type="button"
                          onClick={() => {
                            setCheckOut("");
                            setActiveDropdown(null);
                          }}
                          className="text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. SUBMIT CTA BUTTON */}
            <div className="px-2 pt-1 md:pt-0">
              <button
                type="submit"
                disabled={isSelectedVillaUnderMaintenance}
                className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl md:rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group ${
                  isSelectedVillaUnderMaintenance
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed border border-neutral-300 shadow-none"
                    : "bg-[#14171A] hover:bg-[#C2A476] text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                }`}
              >
                {isSelectedVillaUnderMaintenance ? (
                  <>
                    <Wrench className="w-4 h-4 text-neutral-500" />
                    <span>{t("villas.maintenance_badge", "Under Maintenance")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("search.check_availability", "Check Dates")}</span>
                    <ArrowRight className="w-4 h-4 text-[#C2A476] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Under Maintenance Notice for Selected Villa */}
          {isSelectedVillaUnderMaintenance && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>{selectedVillaData?.name}</strong> is currently undergoing scheduled maintenance. Reservations are temporarily closed.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVilla("")}
                className="text-amber-800 hover:text-amber-950 font-bold underline text-[11px] flex-shrink-0 cursor-pointer"
              >
                Choose Another Villa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Corner Slide Controls (Positioned on the left so it never collides with Floating WhatsApp) */}
      <div className="hidden md:flex absolute bottom-8 left-8 lg:left-12 z-30 items-center gap-3 bg-black/45 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs">
        <span className="text-[11px] text-neutral-300">
          {HERO_SLIDES[currentSlide].title}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={prevSlide}
            className="p-1 hover:text-[#C2A476] transition-colors cursor-pointer"
            aria-label="Previous Hero Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-neutral-300 font-mono px-1">
            0{currentSlide + 1} / 0{HERO_SLIDES.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-1 hover:text-[#C2A476] transition-colors cursor-pointer"
            aria-label="Next Hero Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Luxury Notice / Alert Modal */}
      {heroAlert && (
        <LuxuryConfirmDialog
          isOpen={heroAlert.isOpen}
          variant={heroAlert.variant}
          badgeText={heroAlert.badgeText}
          title={heroAlert.title}
          message={heroAlert.message}
          details={heroAlert.details}
          confirmText="Understood"
          cancelText={null}
          isAlertOnly={true}
          onConfirm={() => setHeroAlert(null)}
          onCancel={() => setHeroAlert(null)}
        />
      )}
    </section>
  );
};
