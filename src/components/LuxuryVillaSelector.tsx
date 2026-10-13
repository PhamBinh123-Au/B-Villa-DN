"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Home, Wrench, Sparkles, MapPin, BedDouble } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { Villa } from "@/types";
import { bookingStore, formatPriceVnd, formatPriceUsd } from "@/lib/bookingStore";

interface LuxuryVillaSelectorProps {
  label?: string;
  selectedVillaId: string;
  onSelectVilla: (villaId: string) => void;
  language?: "vi" | "en";
  error?: string;
  className?: string;
}

export const LuxuryVillaSelector: React.FC<LuxuryVillaSelectorProps> = ({
  label,
  selectedVillaId,
  onSelectVilla,
  language = "vi",
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active villa
  const currentVilla: Villa =
    siteConfig.villas.find((v) => v.id === selectedVillaId) || siteConfig.villas[0];

  // Close on outside click or Escape
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

  const currentPrice = bookingStore.getVillaPrice(currentVilla.id);
  const isCurrentUnderMaintenance = bookingStore.isVillaUnderMaintenance(currentVilla.id);
  const usdRate = bookingStore.getUsdRate();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs uppercase font-bold tracking-wider text-neutral-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[#C2A476]" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-[#A6834F] font-bold">
            {currentVilla.code} • {currentVilla.bedrooms} {language === "vi" ? "Phòng Ngủ" : "Bedrooms"}
          </span>
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-[#FAF8F5] border rounded-2xl p-2.5 sm:p-3 text-left flex items-center justify-between transition-all duration-200 cursor-pointer group ${
          isOpen
            ? "border-[#C2A476] ring-2 ring-[#C2A476]/30 bg-white shadow-md"
            : error
            ? "border-rose-400 bg-rose-50/50"
            : "border-neutral-300 hover:border-[#C2A476] hover:bg-white"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Villa Thumbnail with Code Badge */}
          <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 bg-neutral-100 shadow-xs">
            <Image
              src={currentVilla.image}
              alt={currentVilla.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-0.5 left-0.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-2xs">
              {currentVilla.code}
            </div>
          </div>

          {/* Villa Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                {language === "vi" ? (currentVilla.nameVi || currentVilla.name) : currentVilla.name}
              </h4>
              {isCurrentUnderMaintenance && (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded-md flex items-center gap-1 shrink-0">
                  <Wrench className="w-2.5 h-2.5" />
                  <span>{language === "vi" ? "Bảo trì" : "Maint"}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-0.5 font-medium text-neutral-600">
                <MapPin className="w-3 h-3 text-[#C2A476]" />
                <span>{language === "vi" ? (currentVilla.districtVi || currentVilla.district) : currentVilla.district}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-medium text-neutral-600">
                <BedDouble className="w-3 h-3 text-[#C2A476]" />
                <span>{currentVilla.bedrooms} PN</span>
              </span>
              <span>•</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {formatPriceVnd(currentPrice)}/đêm
              </span>
            </div>
          </div>
        </div>

        {/* Right Arrow indicator */}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-[#A6834F] bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#EAE2D5]">
            {language === "vi" ? "Thay đổi" : "Change"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 ${
              isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
            }`}
          />
        </div>
      </button>

      {error && (
        <p className="text-[11px] text-rose-600 font-medium mt-1">
          {error}
        </p>
      )}

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: "#ffffff" }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-2 border-[#E2D9CC] p-2 z-[90] text-neutral-900 max-h-[340px] overflow-y-auto space-y-1.5 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#C2A476_transparent]"
          >
            {/* Header info */}
            <div className="px-2.5 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#EAE2D5] flex items-center justify-between text-[10px] font-bold text-neutral-600 mb-1">
              <span className="flex items-center gap-1.5 text-[#8A6B3D] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#C2A476]" />
                <span>{language === "vi" ? "Chọn 1 trong 4 Biệt Thự Nghỉ Dưỡng" : "Select 1 of 4 Luxury Villas"}</span>
              </span>
              <span className="font-mono text-[#8A6B3D]">4 Villas</span>
            </div>

            {/* Villa list options */}
            {siteConfig.villas.map((v) => {
              const isSelected = v.id === currentVilla.id;
              const isVMaint = bookingStore.isVillaUnderMaintenance(v.id);
              const vPrice = bookingStore.getVillaPrice(v.id);

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    onSelectVilla(v.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer border ${
                    isSelected
                      ? "bg-[#FAF6EE] text-neutral-900 border-[#C2A476] ring-1 ring-[#C2A476]/40 shadow-xs"
                      : "bg-white hover:bg-[#FAF8F5] border-transparent hover:border-[#EAE2D5] text-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Villa Thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 bg-neutral-100 shadow-xs">
                      <Image
                        src={v.image}
                        alt={v.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-0.5 left-0.5 bg-black/85 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                        {v.code}
                      </div>
                    </div>

                    {/* Villa Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                          isSelected ? "text-[#8A6B3D]" : "group-hover:text-[#8A6B3D]"
                        }`}>
                          {language === "vi" ? (v.nameVi || v.name) : v.name}
                        </p>
                        {isVMaint && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                            <Wrench className="w-2.5 h-2.5" />
                            <span>{language === "vi" ? "Bảo trì" : "Maint"}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 flex-wrap">
                        <span className="font-medium text-neutral-600">
                          📍 {language === "vi" ? (v.districtVi || v.district) : v.district}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-neutral-600">
                          🛏️ {v.bedrooms} PN
                        </span>
                        <span>•</span>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {formatPriceVnd(vPrice)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                          (≈ ${formatPriceUsd(vPrice, usdRate)} USD)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Selected or Select Arrow */}
                  <div className="flex items-center ml-2 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#C2A476] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-[#8A6B3D] opacity-0 group-hover:opacity-100 transition-opacity">
                        {language === "vi" ? "Chọn →" : "Pick →"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
