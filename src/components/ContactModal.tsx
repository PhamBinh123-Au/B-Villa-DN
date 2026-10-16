"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLiveSettings } from "@/lib/adminDataService";
import { businessSettings as defaultBusinessSettings } from "@/lib/mock-data";
import { bookingStore } from "@/lib/bookingStore";
import {
  X,
  PhoneCall,
  MessageCircle,
  ExternalLink,
  Clock,
  Instagram,
  Facebook,
  User,
  Sparkles,
  Headphones,
} from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<typeof defaultBusinessSettings>(defaultBusinessSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(getLiveSettings());
    const unsub = bookingStore.subscribe((payload) => {
      if (payload.action === "SETTINGS_UPDATE" || payload.action === "APP_DATA_UPDATE") {
        setSettings(getLiveSettings());
      }
    });
    return () => unsub();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const activePhone = settings.phone || siteConfig.contact.phone;
  const phoneRaw = activePhone.replace(/[^0-9+]/g, "");
  const zaloPhone = activePhone.replace(/[^0-9]/g, "").replace(/^84/, "0");

  const contactChannels = [
    {
      id: "zalo",
      title: `Zalo: ${zaloPhone}`,
      subtitle: t("contact_modal.zalo_desc"),
      href: siteConfig.social.zalo || `https://zalo.me/${zaloPhone}`,
      iconBg: "bg-[#0068FF]",
      iconText: "text-white",
      borderHover: "hover:border-[#0068FF]/60",
      customIcon: (
        <span className="font-black text-xs tracking-tighter">Zalo</span>
      ),
    },
    {
      id: "hotline",
      title: `Hotline: ${activePhone}`,
      subtitle: t("contact_modal.hotline_desc"),
      href: `tel:${phoneRaw}`,
      iconBg: "bg-emerald-600",
      iconText: "text-white",
      borderHover: "hover:border-emerald-500",
      icon: PhoneCall,
    },
    {
      id: "whatsapp",
      title: `WhatsApp: ${activePhone}`,
      subtitle: t("contact_modal.whatsapp_desc"),
      href: siteConfig.contact.whatsapp || `https://wa.me/${phoneRaw.replace("+", "")}`,
      iconBg: "bg-[#25D366]",
      iconText: "text-white",
      borderHover: "hover:border-[#25D366]",
      icon: MessageCircle,
    },
    {
      id: "fb_fanpage",
      title: t("contact_modal.fb_fanpage_title"),
      subtitle: t("contact_modal.fb_fanpage_desc"),
      href: siteConfig.social.facebook,
      iconBg: "bg-[#1877F2]",
      iconText: "text-white",
      borderHover: "hover:border-[#1877F2]",
      icon: Facebook,
    },
    {
      id: "fb_personal",
      title: t("contact_modal.fb_personal_title"),
      subtitle: t("contact_modal.fb_personal_desc"),
      href: siteConfig.social.facebookPersonal || siteConfig.social.facebook,
      iconBg: "bg-[#0A66C2]",
      iconText: "text-white",
      borderHover: "hover:border-[#0A66C2]",
      icon: User,
    },
    // Tạm thời ẩn Instagram theo yêu cầu của quản trị viên
    // {
    //   id: "instagram",
    //   title: t("contact_modal.instagram_title"),
    //   subtitle: t("contact_modal.instagram_desc"),
    //   href: siteConfig.social.instagram || "https://instagram.com",
    //   iconBg: "bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584]",
    //   iconText: "text-white",
    //   borderHover: "hover:border-[#E1306C]",
    //   icon: Instagram,
    // },
    {
      id: "tiktok",
      title: t("contact_modal.tiktok_title"),
      subtitle: t("contact_modal.tiktok_desc"),
      href: siteConfig.social.tiktok,
      iconBg: "bg-[#14171A]",
      iconText: "text-white",
      borderHover: "hover:border-neutral-900",
      customIcon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.41a6.33 6.33 0 0 0-6.61 6.32 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.34a8.28 8.28 0 0 0 4.96 1.63v-3.41c-.59 0-1.19-.08-1.78-.28z"/>
        </svg>
      ),
    },
  ];

  return createPortal(
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EAE5DC] overflow-hidden my-auto flex flex-col max-h-[88vh]"
        >
          {/* Header Banner with Luxury Dark Gold Gradient */}
          <div className="relative bg-gradient-to-br from-[#111315] via-[#171A1D] to-[#121416] text-white p-5 sm:p-6 pb-6 border-b border-[#C2A476]/30 shrink-0">
            {/* Background subtle gold glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C2A476]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pr-8">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#C2A476] block mb-1">
                {t("contact_modal.badge")}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{t("contact_modal.title")}</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {t("contact_modal.desc")}
              </p>

              {/* Working Hours Badge */}
              <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] text-neutral-200 font-semibold shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#C2A476] shrink-0" />
                <span>{t("contact_modal.hours")}</span>
              </div>
            </div>
          </div>

          {/* Contact Channels List */}
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 min-h-0 bg-[#FAF8F5]/60 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#C2A476_transparent]"
          >
            {contactChannels.map((ch) => {
              const IconComp = ch.icon;
              return (
                <a
                  key={ch.id}
                  href={ch.href}
                  target={ch.href?.startsWith("tel:") ? undefined : "_blank"}
                  rel={ch.href?.startsWith("tel:") ? undefined : "noreferrer"}
                  className={`group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-[#EAE5DC] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${ch.borderHover}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${ch.iconBg} ${ch.iconText} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200`}
                    >
                      {IconComp ? <IconComp className="w-5 h-5" /> : ch.customIcon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-neutral-900 group-hover:text-[#8A6B3D] transition-colors truncate">
                        {ch.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {ch.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-neutral-50 group-hover:bg-[#FAF6EE] text-neutral-400 group-hover:text-[#8A6B3D] flex items-center justify-center shrink-0 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#EAE5DC] text-center text-[11px] text-neutral-500 flex items-center justify-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
            <span>
              {language === "vi"
                ? "B-Villa hân hạnh được đồng hành và phục vụ kỳ nghỉ của bạn!"
                : "B-Villa is delighted to accompany and host your luxury stay!"}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
