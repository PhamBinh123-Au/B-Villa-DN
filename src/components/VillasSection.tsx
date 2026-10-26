"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { Villa } from "@/types";
import { VillaCard } from "./VillaCard";
import { useLanguage } from "@/context/LanguageContext";
import { LayoutGrid, LayoutList } from "lucide-react";

interface VillasSectionProps {
  onInquire: (villa: Villa) => void;
  onOpenGallery?: (villa: Villa, photoIndex: number) => void;
}

export const VillasSection: React.FC<VillasSectionProps> = ({
  onInquire,
  onOpenGallery,
}) => {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"editorial" | "grid">("editorial");

  const filteredVillas = siteConfig.villas.filter((v) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "4bed") return v.bedrooms === 4;
    if (activeFilter === "2bed") return v.bedrooms === 2;
    if (activeFilter === "sontra") return v.district.toLowerCase().includes("son tra");
    if (activeFilter === "nguhanhson") return v.district.toLowerCase().includes("ngu hanh son");
    return true;
  });

  const filterTabs = [
    { id: "all", label: language === "vi" ? "Tất Cả Biệt Thự (4)" : "All Villas (4)" },
    { id: "4bed", label: language === "vi" ? "4 Phòng Ngủ (3)" : "4-Bedroom Villas (3)" },
    { id: "2bed", label: language === "vi" ? "2 Phòng Ngủ (1)" : "2-Bedroom Villa (1)" },
    { id: "sontra", label: language === "vi" ? "Bán Đảo Sơn Trà (2)" : "Son Tra Coast (2)" },
    { id: "nguhanhson", label: language === "vi" ? "Ngũ Hành Sơn (2)" : "Ngu Hanh Son (2)" },
  ];

  return (
    <section id="villas" className="py-24 px-4 sm:px-6 md:px-10 lg:px-12 max-w-[1400px] mx-auto scroll-mt-20">
      {/* Section Header with Smooth Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <span className="text-xs uppercase tracking-[0.25em] text-[#C2A476] font-semibold">
          {t("villas.section_subtitle", "Curated Private Living")}
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 mt-2 mb-4 tracking-tight">
          {t("villas.section_title", "The Villa Collection")}
        </h2>
        <div className="w-16 h-1 bg-[#C2A476] rounded-full mx-auto mb-6" />
        <p className="text-neutral-600 text-sm sm:text-base font-normal leading-relaxed">
          {t("villas.section_desc", "Each residence is an intimate architectural retreat bathed in coastal sunlight, featuring private swimming pools, expansive master bedrooms, and uncompromising discretion.")}
        </p>

        {/* Toolbar: Category Filter Tabs & View Mode Switcher */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {filterTabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 font-semibold cursor-pointer ${
                  activeFilter === tab.id
                    ? "bg-[#14171A] text-white shadow-md scale-105"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#C2A476] hover:text-[#C2A476]"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* View Mode Switcher (Editorial vs Grid) */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1.5 rounded-full border border-[#EAE5DC] shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("editorial")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                viewMode === "editorial"
                  ? "bg-[#14171A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
              }`}
              title={language === "vi" ? "Chế độ Tạp chí Toàn cảnh (Editorial View)" : "Editorial Magazine View"}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                {language === "vi" ? "Tạp chí" : "Editorial"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#14171A] text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/60"
              }`}
              title={language === "vi" ? "Chế độ Lưới (Gallery Grid View)" : "Gallery Grid View"}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                {language === "vi" ? "Lưới 2 Cột" : "Grid"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Villa Showcase Layout according to View Mode */}
      <AnimatePresence mode="wait">
        {viewMode === "editorial" ? (
          <motion.div
            key="editorial-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-10 lg:gap-14"
          >
            <AnimatePresence mode="popLayout">
              {filteredVillas.map((villa, idx) => (
                <motion.div
                  key={villa.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <VillaCard
                    villa={villa}
                    viewMode="editorial"
                    onInquire={onInquire}
                    onOpenGallery={onOpenGallery}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredVillas.map((villa, idx) => (
                <motion.div
                  key={villa.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <VillaCard
                    villa={villa}
                    viewMode="grid"
                    onInquire={onInquire}
                    onOpenGallery={onOpenGallery}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

