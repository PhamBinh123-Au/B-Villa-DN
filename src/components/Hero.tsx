"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroProps {
  onCheckAvailability?: (query: {
    villaId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => void;
}

const HERO_SLIDES = siteConfig.heroSlides || [
  {
    image: "/images/B2/B2.5.jpg",
    title: "B2 Villa • Hồ Bơi Giếng Trời & Phòng Ngủ Ấm Cúng",
    subtitle: "Nước Mặn 3, Ngũ Hành Sơn • Biệt Thự Ven Sông Yên Bình",
  },
  {
    image: "/images/B2/B2.2.jpg",
    title: "B2 Villa • Hồ Bơi Liền Kề & Không Gian Sống Mở",
    subtitle: "Ven Sông Ngũ Hành Sơn • Ánh Sáng Tự Nhiên & Tiện Nghi Đẳng Cấp",
  },
  {
    image: "/images/B2/B2.14.jpg",
    title: "B Villa Luxury • Bể Bơi Trong Nhà & Ánh Sáng Tuyệt Mỹ",
    subtitle: "Thiết Kế Kiến Trúc Sang Trọng • Thư Thái Tuyệt Đối",
  },
  {
    image: "/images/B2/B2.9.jpg",
    title: "B Villa Sanctuary • Góc Chill Hồ Bơi & Nội Thất Gỗ Ấm Áp",
    subtitle: "Không Gian Nghỉ Dưỡng Riêng Tư • Ấm Cúng & Tinh Tế",
  },
];

export const Hero: React.FC<HeroProps> = () => {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic slide rotation & smooth preloading
  useEffect(() => {
    // Preload all 4 hero slides in the background so transitions are 100% instant and flicker-free
    HERO_SLIDES.forEach((slide) => {
      if (typeof window !== "undefined") {
        const img = new window.Image();
        img.src = slide.image;
      }
    });
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{ backgroundColor: "#0D0F12" }}
      className="relative min-h-[100svh] sm:min-h-[100dvh] flex flex-col justify-between items-center text-white z-30 overflow-x-hidden pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-10 md:pb-12"
    >
      {/* Background Cinematic Architectural Slider - 100% Solid Dark Base, Zero Flash Between Slides */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: "#0D0F12" }}>
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;

          return (
            <motion.div
              key={slide.image}
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 1.05,
              }}
              transition={{
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 6.5, ease: "easeOut" },
              }}
              className="absolute inset-0 pointer-events-none"
              style={{
                zIndex: isActive ? 2 : 1,
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={idx === 0}
                unoptimized
                sizes="100vw"
                className="object-cover object-center"
              />
            </motion.div>
          );
        })}

        {/* Luminous Luxury Scrim - Bright, airy, and elegant without dark muddy corners */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      </div>

      {/* Top Spacer for perfect vertical distribution */}
      <div className="w-full flex-1 max-h-16 hidden md:block" />

      {/* Hero Central Content - Perfectly Proportioned & Balanced */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center flex flex-col items-center w-full my-auto">
        {/* Subtle Ambient Contrast Glow behind text */}
        <div className="absolute -inset-x-8 -inset-y-6 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,transparent_75%)] pointer-events-none -z-10" />

        {/* Subtle Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-[#FAF8F5] text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-lg animate-pulse-glow"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E6C687]" />
          <span className="font-medium">{t("hero.subtitle", "Exclusive Private Sanctuaries")}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.18] sm:leading-[1.12] text-white max-w-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.92)] drop-shadow-[0_8px_28px_rgba(0,0,0,0.75)]"
        >
          {language === "vi" ? (
            <>Nghỉ Dưỡng Đẳng Cấp <span className="font-extrabold text-[#F0C987] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Bên Bờ Biển</span> Đà Nẵng</>
          ) : (
            <>A Symphony of <span className="font-extrabold text-[#F0C987] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Light, Water</span> & Architectural Serenity</>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-white/90 font-normal max-w-2xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          {language === "vi"
            ? "Khám phá 4 biệt thự hồ bơi riêng tư tuyệt mỹ tại Sơn Trà & Ngũ Hành Sơn với kiến trúc tối giản hiện đại và dịch vụ đặc quyền."
            : "Four private, architecturally designed pool villas across Da Nang's coveted Son Tra and Ngu Hanh Sơn coastlines. Dedicated to absolute tranquility."}
        </motion.p>

        {/* Quick CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto"
        >
          <a
            href="#villas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs md:text-sm uppercase tracking-widest font-bold px-8 py-3.5 sm:py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{language === "vi" ? "Khám Phá 4 Biệt Thự" : "Explore The 4 Villas"}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#experience"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs md:text-sm uppercase tracking-widest font-semibold px-8 py-3.5 sm:py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{language === "vi" ? "Trải Nghiệm Nghỉ Dưỡng" : "The Villa Lifestyle"}</span>
          </a>
        </motion.div>
      </div>

      {/* Slide Indicator Progress Bars (anchored at bottom of Hero) */}
      <div className="relative z-30 w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 pt-5 border-t border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          {HERO_SLIDES.map((slide, idx) => {
            const isCurrent = currentSlide === idx;
            return (
              <button
                key={slide.image}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`text-left group transition-opacity cursor-pointer ${
                  isCurrent ? "opacity-100" : "opacity-60 hover:opacity-90"
                }`}
              >
                <div className="h-[2px] w-full bg-white/30 mb-2 overflow-hidden rounded-full">
                  {isCurrent && (
                    <motion.div
                      key={`progress-${idx}-${currentSlide}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6.5, ease: "linear" }}
                      className="h-full bg-[#E6C687]"
                    />
                  )}
                </div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#E6C687] font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  0{idx + 1} / SANCTUARY
                </p>
                <p className="font-serif text-xs sm:text-sm text-white truncate font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  {slide.title.split("•")[1] ? slide.title.split("•")[1].trim() : slide.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
