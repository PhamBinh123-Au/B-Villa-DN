"use client";

import React, { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { GalleryItem, Villa } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface GallerySectionProps {
  onInquire: (villa?: Villa | null) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onInquire }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = siteConfig.galleryItems || [];

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const prevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
    );
  };

  const galleryTabs = [
    { id: "all", label: language === "vi" ? "Tất Cả Không Gian" : "All Spaces" },
    { id: "pool", label: language === "vi" ? "Hồ Bơi Riêng" : "Private Pools" },
    { id: "bedroom", label: language === "vi" ? "Phòng Ngủ Master" : "Master Suites" },
    { id: "exterior", label: language === "vi" ? "Sân Vườn & Mặt Tiền" : "Garden & Facade" },
    { id: "dining", label: language === "vi" ? "Phòng Bếp & Ăn" : "Dining & Kitchen" },
  ];

  return (
    <section id="gallery" className="py-28 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE5DC] text-[#C2A476] text-xs uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === "vi" ? "Góc Nhìn Không Gian" : "Visual Walkthrough"}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">
          {language === "vi" ? "Bộ Sưu Tập Không Gian Kiến Trúc" : "Spaces & Living Gallery"}
        </h2>
        <div className="w-16 h-1 bg-[#C2A476] rounded-full mx-auto mb-6" />
        <p className="text-neutral-600 text-sm sm:text-base font-normal leading-relaxed">
          {language === "vi"
            ? "Chiêm ngưỡng từng góc nhỏ tinh tế: hồ bơi xanh mát, sân vườn đón nắng, phòng ngủ master en-suite sang trọng và phòng bếp mở ấm cúng."
            : "Experience every dimension of our residences: from turquoise swimming pools and sunlit courtyards to minimalist master suites and gourmet open kitchens."}
        </p>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {galleryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? "bg-[#14171A] text-white shadow-md scale-105"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-[#C2A476] hover:text-[#C2A476]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-neutral-900 border border-[#EAE5DC]"
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
            {/* Elegant bottom scrim - keeps upper half of photo crystal clear & vibrant */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Top Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/60 backdrop-blur-md text-[#C2A476] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                {item.categoryLabel}
              </span>
            </div>

            {/* Zoom Icon Hover */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 text-white z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C2A476] block mb-1">
                {item.villaCode}
              </span>
              <h3 className="text-base font-bold leading-snug text-white group-hover:text-[#EAE4D7] transition-colors">
                {item.title}
              </h3>
              <p className="text-[11px] text-neutral-300 font-light mt-1 line-clamp-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left / Right Nav Arrows */}
          <button
            onClick={prevLightbox}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextLightbox}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Main Container */}
          <div className="max-w-5xl w-full flex flex-col items-center">
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].title}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-contain object-center"
              />
            </div>

            {/* Bottom Caption & Inquire Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-white px-2">
              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-bold tracking-widest text-[#C2A476]">
                  {filteredItems[lightboxIndex].villaCode} • {filteredItems[lightboxIndex].categoryLabel}
                </span>
                <h3 className="text-xl sm:text-2xl text-white font-bold mt-1 tracking-tight">
                  {filteredItems[lightboxIndex].title}
                </h3>
                <p className="text-xs text-neutral-400 font-light mt-1 max-w-xl">
                  {filteredItems[lightboxIndex].description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 font-mono">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
                <button
                  onClick={() => {
                    closeLightbox();
                    onInquire(null);
                  }}
                  className="bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve This Villa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
