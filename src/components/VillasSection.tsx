"use client";

import React, { useState } from "react";
import { siteConfig } from "@/config/siteConfig";
import { Villa } from "@/types";
import { VillaCard } from "./VillaCard";
import { useLanguage } from "@/context/LanguageContext";

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
    <section id="villas" className="py-28 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C2A476] font-semibold">
          {t("villas.section_subtitle", "Curated Private Living")}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-light text-neutral-900 mt-2 mb-4">
          {t("villas.section_title", "The Villa Collection")}
        </h2>
        <div className="w-16 h-0.5 bg-[#C2A476] mx-auto mb-6" />
        <p className="text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
          {t("villas.section_desc", "Each residence is an intimate architectural retreat bathed in coastal sunlight, featuring private swimming pools, expansive master bedrooms, and uncompromising discretion.")}
        </p>

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 font-medium ${
                activeFilter === tab.id
                  ? "bg-[#14171A] text-white shadow-md scale-105"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#C2A476] hover:text-[#C2A476]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Grid for 4 Villas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {filteredVillas.map((villa) => (
          <VillaCard
            key={villa.id}
            villa={villa}
            onInquire={onInquire}
            onOpenGallery={onOpenGallery}
          />
        ))}
      </div>
    </section>
  );
};
