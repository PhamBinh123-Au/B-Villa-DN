"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X, Shield, Calendar, Phone } from "lucide-react";

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#14171A]/90 backdrop-blur-md py-3.5 shadow-xl border-b border-white/10"
          : "bg-gradient-to-b from-black/75 via-black/35 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="group flex flex-col flex-shrink-0">
          <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-widest text-white uppercase group-hover:text-[#C2A476] transition-colors">
            {siteConfig.name}
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#C2A476] uppercase">
            {t("brand.location")}
          </span>
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
          <a
            href="#contact"
            className="hover:text-[#C2A476] transition-colors duration-200"
          >
            {t("nav.contact")}
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1 rounded-full border border-white/10 hover:border-[#C2A476]/40 hover:bg-white/5 transition-all"
            title="Owner & Staff Portal"
          >
            <Shield className="w-3.5 h-3.5 text-[#C2A476]" />
            <span>{t("nav.admin")}</span>
          </Link>
        </nav>

        {/* Action Buttons & Language Switcher */}
        <div className="hidden sm:flex items-center space-x-3.5 md:space-x-4 flex-shrink-0">
          {/* Quick Language Switcher Button (VI 🇻🇳 | EN 🇬🇧) */}
          <LanguageSwitcher size="sm" />

          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
            className="hidden xl:flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-300 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-[#C2A476] flex-shrink-0" />
            <span className="whitespace-nowrap font-medium tracking-normal text-xs">
              {siteConfig.contact.phone}
            </span>
          </a>

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-semibold uppercase tracking-widest px-4 sm:px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("nav.inquire")}</span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="sm:hidden flex items-center space-x-2.5">
          <LanguageSwitcher size="sm" />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#C2A476] focus:outline-none"
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
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#C2A476] py-1 border-b border-white/5"
            >
              {t("nav.contact")}
            </a>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-neutral-300 hover:text-white px-3 py-1.5 rounded-full border border-white/15"
              >
                <Shield className="w-3.5 h-3.5 text-[#C2A476]" />
                <span>{t("nav.admin")}</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="text-xs bg-[#C2A476] hover:bg-[#aa8c5b] text-white px-4 py-2 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("nav.inquire")}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
