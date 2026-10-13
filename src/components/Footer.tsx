"use client";

import React from "react";
import { siteConfig } from "@/config/siteConfig";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, Mail, MapPin, MessageCircle, ArrowUp } from "lucide-react";

// Official Realistic Social Platform SVG Logos
const ZaloLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zalo-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0088FF" />
        <stop offset="100%" stopColor="#005CE6" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#zalo-grad-footer)" />
    <svg x="4" y="4" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="#FFFFFF"
        d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9453 0 1.0746.8697 1.9453 1.945 1.9453z"
      />
    </svg>
  </svg>
);

const FacebookLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fb-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#18ACFE" />
        <stop offset="100%" stopColor="#0163E0" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="16" fill="url(#fb-grad-footer)" />
    <path
      d="M19.5 16.8l.5-3.5h-3.4v-2.3c0-.9.4-1.8 1.9-1.8h1.5V6.2s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.7v2.6h-3.1v3.5h3.1V25.5c.6.1 1.3.1 2 .1s1.3 0 2-.1V16.8h2.8z"
      fill="#FFFFFF"
    />
  </svg>
);

const TikTokLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tt-grad-footer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1C1F24" />
        <stop offset="100%" stopColor="#08090C" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#tt-grad-footer)" />
    <rect width="32" height="32" rx="8" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
    <svg x="5" y="5" width="22" height="22" viewBox="0 0 24 24">
      {/* Cyan offset */}
      <path
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.5.18-1.92 1.12-3.72 2.5-4.96 1.01-.92 2.27-1.5 3.57-1.7v4.02c-.66.13-1.32.42-1.87.82-1.14.87-1.78 2.29-1.68 3.73.06 1.08.64 2.08 1.55 2.62.93.59 2.06.69 3.09.25 1.04-.45 1.77-1.42 1.88-2.55.08-2.12-.02-4.25.02-6.37.02-4.25-.01-8.5.02-12.75z"
        fill="#25F4EE"
        transform="translate(-0.8, -0.6)"
        opacity="0.85"
      />
      {/* Magenta offset */}
      <path
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.5.18-1.92 1.12-3.72 2.5-4.96 1.01-.92 2.27-1.5 3.57-1.7v4.02c-.66.13-1.32.42-1.87.82-1.14.87-1.78 2.29-1.68 3.73.06 1.08.64 2.08 1.55 2.62.93.59 2.06.69 3.09.25 1.04-.45 1.77-1.42 1.88-2.55.08-2.12-.02-4.25.02-6.37.02-4.25-.01-8.5.02-12.75z"
        fill="#FE2C55"
        transform="translate(0.8, 0.6)"
        opacity="0.85"
      />
      {/* Pure white foreground note */}
      <path
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.5.18-1.92 1.12-3.72 2.5-4.96 1.01-.92 2.27-1.5 3.57-1.7v4.02c-.66.13-1.32.42-1.87.82-1.14.87-1.78 2.29-1.68 3.73.06 1.08.64 2.08 1.55 2.62.93.59 2.06.69 3.09.25 1.04-.45 1.77-1.42 1.88-2.55.08-2.12-.02-4.25.02-6.37.02-4.25-.01-8.5.02-12.75z"
        fill="#FFFFFF"
      />
    </svg>
  </svg>
);

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-[#0E1114] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div>
            <span className="text-2xl font-extrabold tracking-widest uppercase text-white block">
              {siteConfig.name}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C2A476] mt-1 block">
              {t("brand.location", "Da Nang • Vietnam")}
            </span>
            <p className="text-xs sm:text-sm text-neutral-400 font-light mt-4 leading-relaxed">
              {siteConfig.description}
            </p>

            {/* Official Realistic Social Channels */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {/* Zalo Button */}
              <a
                href={siteConfig.social.zalo || `https://zalo.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-[#0068FF]/20 border border-white/10 hover:border-[#0068FF]/60 text-neutral-200 hover:text-white transition-all duration-300 shadow-2xs hover:shadow-[0_4px_16px_rgba(0,104,255,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                title="Nhắn Zalo chính thức: 0854 252 821"
              >
                <ZaloLogo className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                <span className="text-xs font-bold tracking-wide pr-1">Zalo</span>
              </a>

              {/* Facebook Button */}
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-[#1877F2]/20 border border-white/10 hover:border-[#1877F2]/60 text-neutral-200 hover:text-white transition-all duration-300 shadow-2xs hover:shadow-[0_4px_16px_rgba(24,119,242,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                title="Fanpage Facebook: Flamingo Villa Da Nang"
              >
                <FacebookLogo className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                <span className="text-xs font-bold tracking-wide pr-1">Facebook</span>
              </a>

              {/* TikTok Button */}
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/15 border border-white/10 hover:border-white/40 text-neutral-200 hover:text-white transition-all duration-300 shadow-2xs hover:shadow-[0_4px_16px_rgba(254,44,85,0.3)] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                title="Kênh TikTok: @bvilladanang43_"
              >
                <TikTokLogo className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                <span className="text-xs font-bold tracking-wide pr-1">TikTok</span>
              </a>
            </div>
          </div>

          {/* Curated Villas Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5 tracking-tight">
              {language === "vi" ? "Bộ Sưu Tập Biệt Thự" : "The Residences"}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-400 font-normal">
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
            <h4 className="text-lg font-bold text-white mb-5 tracking-tight">
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
                  <span className="font-bold text-[#C2A476] mr-1.5">Hotline:</span>
                  <span>{siteConfig.contact.phone}</span>
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
