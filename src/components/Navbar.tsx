"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X, Calendar, Phone, Headphones } from "lucide-react";
import { ContactModal } from "./ContactModal";

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#14171A]/90 backdrop-blur-md py-3.5 shadow-xl border-b border-white/10"
          : "bg-gradient-to-b from-black/75 via-black/35 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex-shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_10px_rgba(194,164,118,0.35)]">
            <Image
              src="/images/logo.png"
              alt="B Villa Da Nang Logo"
              fill
              priority
              quality={95}
              className="object-contain"
              sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 44px"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm sm:text-lg md:text-xl font-extrabold tracking-wider text-white uppercase group-hover:text-[#C2A476] transition-colors leading-tight">
              {siteConfig.name}
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-[#C2A476] uppercase font-semibold mt-0.5">
              {t("brand.location")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs xl:text-sm font-medium tracking-wider uppercase text-neutral-200">
          <a
            href="#villas"
            className="hover:text-[#C2A476] transition-colors duration-200"
          >
            {t("nav.villas")}
          </a>
          <a
            href="#experience"
            className="hover:text-[#C2A476] transition-colors duration-200"
          >
            {t("nav.experience")}
          </a>
          <a
            href="#amenities"
            className="hover:text-[#C2A476] transition-colors duration-200"
          >
            {t("nav.amenities")}
          </a>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div className="hidden sm:flex items-center space-x-3 md:space-x-3.5 flex-shrink-0">
          {/* Quick Language Switcher Button (VI 🇻🇳 | EN 🇬🇧) */}
          <LanguageSwitcher size="sm" />

          {/* Luxury Contact Pill Button (Inspired by Image 2, with B-Villa luxury theme) */}
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="group inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-[#1C1F23]/95 hover:bg-[#14171A] border border-[#C2A476]/60 hover:border-[#C2A476] shadow-sm hover:shadow-[0_4px_20px_rgba(194,164,118,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title={t("nav.contact")}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#14171A] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Headphones className="w-3.5 h-3.5 text-[#C2A476]" />
            </span>
            <span className="text-xs font-bold tracking-wide text-white group-hover:text-[#C2A476] transition-colors whitespace-nowrap">
              {t("nav.contact")}
            </span>
          </button>

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-semibold uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("nav.inquire")}</span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="sm:hidden flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Quick Contact Button */}
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="inline-flex items-center gap-1.5 p-1 min-[360px]:pl-1 min-[360px]:pr-2.5 py-1 rounded-full bg-[#1C1F23] border border-[#C2A476]/60 text-white shadow-xs cursor-pointer active:scale-95 shrink-0"
            title={t("nav.contact")}
          >
            <span className="w-5 h-5 rounded-full bg-white text-[#14171A] flex items-center justify-center">
              <Headphones className="w-3 h-3 text-[#C2A476]" />
            </span>
            <span className="hidden min-[360px]:inline text-[11px] font-bold text-white">
              {t("nav.contact")}
            </span>
          </button>

          {/* Language switcher visible on >=430px screens or in mobile drawer */}
          <div className="hidden min-[430px]:block">
            <LanguageSwitcher size="sm" />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#C2A476] focus:outline-none shrink-0"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14171A] border-b border-white/10 px-6 py-6 transition-all animate-fade-in">
          {/* Mobile Language Switcher Center Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <span className="text-xs uppercase font-medium text-neutral-400 tracking-wider">
              {t("brand.location")}
            </span>
            <LanguageSwitcher size="sm" />
          </div>

          <nav className="flex flex-col space-y-4 text-sm font-medium tracking-wider uppercase text-neutral-200">
            <a
              href="#villas"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C2A476] py-1 border-b border-white/5"
            >
              {t("nav.villas")}
            </a>
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C2A476] py-1 border-b border-white/5"
            >
              {t("nav.experience")}
            </a>
            <a
              href="#amenities"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C2A476] py-1 border-b border-white/5"
            >
              {t("nav.amenities")}
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsContactOpen(true);
              }}
              className="text-left hover:text-[#C2A476] py-1 border-b border-white/5 uppercase cursor-pointer"
            >
              {t("nav.contact")}
            </button>

            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full text-xs bg-[#C2A476] hover:bg-[#aa8c5b] text-white px-5 py-3 rounded-full font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{t("nav.inquire")}</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      </header>

      {/* Contact Channels Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
};
