"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { getLiveAmenities, DEFAULT_AMENITIES } from "@/lib/adminDataService";
import { bookingStore } from "@/lib/bookingStore";
import {
  Waves,
  Wifi,
  Sparkles,
  UtensilsCrossed,
  Utensils,
  Flame,
  Car,
  Eye,
  Coffee,
  Trees,
  Wind,
  Building,
  Shirt,
  ShieldCheck,
} from "lucide-react";

interface AmenityItem {
  icon: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves className="w-6 h-6 text-[#C2A476]" />,
  Wifi: <Wifi className="w-6 h-6 text-[#C2A476]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#C2A476]" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-[#C2A476]" />,
  Utensils: <Utensils className="w-6 h-6 text-[#C2A476]" />,
  Flame: <Flame className="w-6 h-6 text-[#C2A476]" />,
  Car: <Car className="w-6 h-6 text-[#C2A476]" />,
  Eye: <Eye className="w-6 h-6 text-[#C2A476]" />,
  Coffee: <Coffee className="w-6 h-6 text-[#C2A476]" />,
  Trees: <Trees className="w-6 h-6 text-[#C2A476]" />,
  Wind: <Wind className="w-6 h-6 text-[#C2A476]" />,
  Building: <Building className="w-6 h-6 text-[#C2A476]" />,
  Shirt: <Shirt className="w-6 h-6 text-[#C2A476]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#C2A476]" />,
};

const AMENITY_EN_MAP: Record<string, { title: string; desc: string }> = {
  "Hồ bơi riêng (Private Pool)": {
    title: "Exclusive Private Pool",
    desc: "Outdoor swimming pool with modern electrolyte salt water filtration system.",
  },
  "Hồ bơi riêng": {
    title: "Exclusive Private Pool",
    desc: "Outdoor swimming pool with modern electrolyte salt water filtration system.",
  },
  "WiFi Tốc Độ Cao": {
    title: "High-Speed Seamless Wi-Fi",
    desc: "Enterprise wireless network coverage across living room, bedrooms, and private garden.",
  },
  "Bếp Đầy Đủ Tiện Nghi": {
    title: "Fully Equipped Gourmet Kitchen",
    desc: "Side-by-side refrigerator, oven, microwave, induction hob, and premium dinnerware set.",
  },
  "Bếp Nướng BBQ Sân Vườn": {
    title: "Outdoor Garden BBQ Grill",
    desc: "Dedicated alfresco barbecue dining area for family gatherings and feasts.",
  },
};

function getAmenityEn(name: string, fallbackDesc: string): { title: string; desc: string } {
  const trimmed = name.trim();
  if (AMENITY_EN_MAP[trimmed]) return AMENITY_EN_MAP[trimmed];
  for (const [key, val] of Object.entries(AMENITY_EN_MAP)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed.toLowerCase())) {
      return val;
    }
  }
  return { title: trimmed, desc: fallbackDesc };
}

const INITIAL_AMENITIES: AmenityItem[] = DEFAULT_AMENITIES.map((item) => {
  const cleanName = item.name.replace(/\s*\(300Mbps\)/gi, "").trim();
  const enData = getAmenityEn(cleanName, item.description);
  return {
    icon: item.iconName || "Sparkles",
    titleVi: cleanName,
    titleEn: enData.title,
    descVi: item.description,
    descEn: enData.desc,
  };
});

export const AmenitiesSection: React.FC = () => {
  const { language } = useLanguage();
  const [amenities, setAmenities] = useState<AmenityItem[]>(INITIAL_AMENITIES);

  useEffect(() => {
    const syncAmenities = () => {
      const live = getLiveAmenities();
      if (live && live.length > 0) {
        setAmenities(
          live.map((item) => {
            const cleanName = item.name.replace(/\s*\(300Mbps\)/gi, "").trim();
            const enData = getAmenityEn(cleanName, item.description);
            return {
              icon: item.iconName || "Sparkles",
              titleVi: cleanName,
              titleEn: enData.title,
              descVi: item.description,
              descEn: enData.desc,
            };
          })
        );
      }
    };
    syncAmenities();
    const unsub = bookingStore.subscribe((payload) => {
      if (payload.action === "APP_DATA_UPDATE" || payload.action === "UPDATE") {
        syncAmenities();
      }
    });
    return () => unsub();
  }, []);

  return (
    <section id="amenities" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <span className="text-xs uppercase tracking-[0.25em] text-[#C2A476] font-bold">
          {language === "vi" ? "TIỆN NGHI TIÊU CHUẨN 5 SAO" : "Uncompromised Comfort"}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mt-2 mb-4 tracking-tight">
          {language === "vi" ? "Tiện Ích Đẳng Cấp Chuẩn Nghỉ Dưỡng" : "Signature Amenities"}
        </h2>
        <div className="w-16 h-1 bg-[#C2A476] rounded-full mx-auto mb-5" />
        <p className="text-neutral-600 text-sm sm:text-base font-normal leading-relaxed">
          {language === "vi"
            ? "Từ hồ bơi riêng tư đến tiêu chuẩn dọn phòng tinh tươm hàng ngày, mỗi chi tiết đều được chăm chút để mang lại sự thư thái tuyệt đối."
            : "From the temperature-controlled plunge waters to the highest standard of daily housekeeping, every detail is tuned for pure relaxation."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {amenities.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            className="p-7 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#C2A476] shadow-sm hover:shadow-[0_20px_40px_rgba(194,164,118,0.22)] transition-all duration-300 group flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6EE] border border-[#EAE5DC] flex items-center justify-center mb-5 group-hover:scale-115 group-hover:-rotate-6 group-hover:bg-gradient-to-br group-hover:from-[#C2A476] group-hover:to-[#8A6B3D] group-hover:border-transparent group-hover:shadow-lg transition-all duration-300">
                <span className="text-[#C2A476] group-hover:text-white transition-colors duration-300 [&>svg]:text-inherit">
                  {iconMap[item.icon] || <Sparkles className="w-6 h-6 text-inherit" />}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 leading-snug">
                {language === "vi" ? item.titleVi : item.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                {language === "vi" ? item.descVi : item.descEn}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-[11px] uppercase tracking-wider text-[#C2A476] font-bold">
              <span>{language === "vi" ? "Đã bao gồm trong kỳ nghỉ" : "Included in your stay"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
