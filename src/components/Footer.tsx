"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, Mail, MapPin, MessageCircle, Shield, ArrowUp } from "lucide-react";

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-[#0E1114] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div>
            <span className="font-serif text-2xl font-bold tracking-widest uppercase text-white block">
              {siteConfig.name}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C2A476] mt-1 block">
              {t("brand.location", "Da Nang • Vietnam")}
            </span>
            <p className="text-xs sm:text-sm text-neutral-400 font-light mt-4 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-[#C2A476] hover:border-[#C2A476] transition-all text-xs"
              >
                IG
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-[#C2A476] hover:border-[#C2A476] transition-all text-xs"
              >
                FB
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-[#C2A476] hover:border-[#C2A476] transition-all text-xs"
              >
                TT
              </a>
            </div>
          </div>

          {/* Curated Villas Links */}
          <div>
            <h4 className="font-serif text-lg font-medium text-white mb-5">
              {language === "vi" ? "Bộ Sưu Tập Biệt Thự" : "The Residences"}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-400 font-light">
              {siteConfig.villas.map((villa) => (
                <li key={villa.id}>
                  <a
                    href="#villas"
                    className="hover:text-[#C2A476] transition-colors flex items-center justify-between group"
                  >
                    <span>{villa.name}</span>
                    <span className="text-[10px] text-neutral-500 group-hover:text-[#C2A476]">
                      {villa.district}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Concierge Contact */}
          <div>
            <h4 className="font-serif text-lg font-medium text-white mb-5">
              {t("footer.direct_concierge", "Private Concierge")}
            </h4>
            <ul className="space-y-4 text-xs sm:text-sm text-neutral-400 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C2A476] flex-shrink-0 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C2A476] flex-shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C2A476] flex-shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                <a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  {language === "vi" ? "Trò Chuyện Zalo / WhatsApp" : "Direct WhatsApp Chat"}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Info & Staff Portal */}
          <div>
            <h4 className="font-serif text-lg font-medium text-white mb-5">
              {language === "vi" ? "Quản Trị Viên" : "Host Management"}
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-light mb-4">
              {language === "vi"
                ? "Cổng quản lý đơn và lịch biệt thự dành cho host. Cập nhật theo thời gian thực."
                : "Owner and reservation management portal. Access booking logs and live guest requests."}
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-neutral-200 hover:text-white transition-all"
            >
              <Shield className="w-4 h-4 text-[#C2A476]" />
              <span>{language === "vi" ? "Mở Cổng Quản Trị" : "Open Admin Dashboard"}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights", "All rights reserved.")}</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{language === "vi" ? "Về đầu trang" : "Back to top"}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
