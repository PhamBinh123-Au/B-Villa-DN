"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage, Language } from "@/context/LanguageContext";

/**
 * Pixel-perfect SVG Vietnam Flag circular badge
 */
export function VietnamFlag({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${className} flex-shrink-0 drop-shadow-sm`}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" fill="#DA251D" />
      {/* 5-pointed gold star */}
      <polygon
        points="16,5.5 19.3,12.2 26.6,12.2 20.7,16.5 23,23.2 16,19 9,23.2 11.3,16.5 5.4,12.2 12.7,12.2"
        fill="#FFFF00"
      />
    </svg>
  );
}

/**
 * Pixel-perfect SVG United Kingdom Flag (Union Jack) circular badge
 */
export function UKFlag({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`${className} flex-shrink-0 drop-shadow-sm`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="uk-flag-circle">
          <circle cx="16" cy="16" r="15" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-flag-circle)">
        {/* Navy Blue Field */}
        <rect width="32" height="32" fill="#012169" />

        {/* White Diagonal Crosses */}
        <line x1="0" y1="0" x2="32" y2="32" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="32" y1="0" x2="0" y2="32" stroke="#FFFFFF" strokeWidth="6" />

        {/* Red Diagonal Crosses */}
        <line x1="0" y1="0" x2="32" y2="32" stroke="#C8102E" strokeWidth="2.5" />
        <line x1="32" y1="0" x2="0" y2="32" stroke="#C8102E" strokeWidth="2.5" />

        {/* White St. George Cross */}
        <line x1="16" y1="0" x2="16" y2="32" stroke="#FFFFFF" strokeWidth="8" />
        <line x1="0" y1="16" x2="32" y2="16" stroke="#FFFFFF" strokeWidth="8" />

        {/* Red St. George Cross */}
        <line x1="16" y1="0" x2="16" y2="32" stroke="#C8102E" strokeWidth="4.5" />
        <line x1="0" y1="16" x2="32" y2="16" stroke="#C8102E" strokeWidth="4.5" />
      </g>
    </svg>
  );
}

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "md";
}

export function LanguageSwitcher({
  className = "",
  size = "md",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const isSmall = size === "sm";

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`relative inline-flex items-center p-1 rounded-full bg-[#14171A]/85 backdrop-blur-md border border-white/20 shadow-lg select-none transition-all duration-300 hover:border-[#C2A476]/50 ${
        isSmall ? "h-[34px] min-w-[126px]" : "h-[38px] min-w-[140px]"
      } ${className}`}
    >
      {/* Outer subtle champagne gold glow ring */}
      <div className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none" />

      {/* Animated Sliding Pill Thumb */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-white shadow-md border border-black/5"
        initial={false}
        animate={{
          left: language === "vi" ? "4px" : "calc(50% + 1px)",
          right: language === "vi" ? "calc(50% + 1px)" : "4px",
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 32,
        }}
      />

      {/* VI Option Button */}
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        aria-pressed={language === "vi"}
        aria-label="Switch to Vietnamese"
        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full px-2.5 rounded-full transition-colors cursor-pointer ${
          language === "vi"
            ? "text-neutral-900 font-bold"
            : "text-neutral-400 hover:text-white font-medium opacity-80"
        }`}
      >
        <VietnamFlag className={isSmall ? "w-4 h-4" : "w-[18px] h-[18px]"} />
        <span
          className={`tracking-wider ${
            isSmall ? "text-[11px]" : "text-xs"
          } transition-colors`}
        >
          VI
        </span>
      </button>

      {/* EN Option Button */}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        aria-label="Switch to English"
        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full px-2.5 rounded-full transition-colors cursor-pointer ${
          language === "en"
            ? "text-neutral-900 font-bold"
            : "text-neutral-400 hover:text-white font-medium opacity-80"
        }`}
      >
        <span
          className={`tracking-wider ${
            isSmall ? "text-[11px]" : "text-xs"
          } transition-colors`}
        >
          EN
        </span>
        <span
          className={`text-[10px] text-neutral-300 font-light opacity-60 ${
            language === "en" ? "inline-block" : "hidden sm:inline-block"
          }`}
        >
          |
        </span>
        <UKFlag className={isSmall ? "w-4 h-4" : "w-[18px] h-[18px]"} />
      </button>
    </div>
  );
}
