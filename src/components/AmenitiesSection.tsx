"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Waves,
  ShieldCheck,
  Wifi,
  Sparkles,
  Car,
  UtensilsCrossed,
} from "lucide-react";

interface AmenityItem {
  icon: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
}

const AMENITIES_LIST: AmenityItem[] = [
  {
    icon: "Waves",
    titleVi: "Hồ Bơi Riêng Biệt Lập",
    titleEn: "Exclusive Private Pool",
    descVi: "Mỗi biệt thự đều sở hữu hồ bơi riêng làn nước trong xanh, từ hồ bơi sân vườn đón nắng đến hồ giếng trời tự nhiên.",
    descEn: "Each villa is equipped with its own crystal-clear private pool, from sunlit garden lap pools to indoor skylight atriums.",
  },
  {
    icon: "ShieldCheck",
    titleVi: "Quản Gia Riêng 24/7",
    titleEn: "24/7 Dedicated Concierge",
    descVi: "Đội ngũ quản gia địa phương túc trực sẵn sàng hỗ trợ đưa đón, gợi ý ẩm thực và đáp ứng các yêu cầu đặc quyền.",
    descEn: "Our local host is on standby around the clock to arrange private transfers, dining recommendations, and bespoke requests.",
  },
  {
    icon: "Wifi",
    titleVi: "Wi-Fi Tốc Độ Cao Liền Mạch",
    titleEn: "High-Speed Seamless Wi-Fi",
    descVi: "Mạng internet không dây chuẩn doanh nghiệp phủ sóng mạnh mẽ khắp phòng ngủ, sân vườn và khu vực hồ bơi.",
    descEn: "Enterprise-grade high-speed wireless network coverage across every bedroom, terrace, and living space.",
  },
  {
    icon: "Sparkles",
    titleVi: "Dọn Phòng Chuyên Nghiệp Hàng Ngày",
    titleEn: "Daily Housekeeping",
    descVi: "Dịch vụ phòng tận tâm giữ không gian luôn thơm mát, thay khăn ga cao cấp và bổ sung tiện nghi tắm chuẩn spa.",
    descEn: "Professional housekeeping service maintaining impeccable cleanliness, fresh linen, and luxury bath amenities.",
  },
  {
    icon: "Car",
    titleVi: "Dịch Vụ Đưa Đón Sân Bay Riêng",
    titleEn: "Airport Chauffeur Service",
    descVi: "Xe riêng đón tiễn tận nơi từ sân bay quốc tế Đà Nẵng về biệt thự một cách chu đáo, nhanh chóng và an toàn.",
    descEn: "Seamless door-to-door private airport pickups and city transfers upon reservation inquiry.",
  },
  {
    icon: "UtensilsCrossed",
    titleVi: "Bếp Nấu Cao Cấp Đầy Đủ Tiện Nghi",
    titleEn: "Fully Equipped Gourmet Kitchen",
    descVi: "Được trang bị đầy đủ lò vi sóng, tủ lạnh lớn, dụng cụ bếp nấu hiện đại và bếp nướng BBQ cho các bữa tiệc sum vầy.",
    descEn: "Complete with high-end appliances, microwave, refrigerator, cookware, and barbecue setup for private feasts.",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves className="w-6 h-6 text-[#C2A476]" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#C2A476]" />,
  Wifi: <Wifi className="w-6 h-6 text-[#C2A476]" />,
  Sparkles: <Sparkles className="w-6 h-6 text-[#C2A476]" />,
  Car: <Car className="w-6 h-6 text-[#C2A476]" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6 text-[#C2A476]" />,
};

export const AmenitiesSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section id="amenities" className="py-28 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C2A476] font-semibold">
          {language === "vi" ? "TIỆN NGHI TIÊU CHUẨN 5 SAO" : "Uncompromised Comfort"}
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-light text-neutral-900 mt-2 mb-4">
          {language === "vi" ? "Tiện Ích Đẳng Cấp Chuẩn Nghỉ Dưỡng" : "Signature Amenities"}
        </h2>
        <div className="w-16 h-0.5 bg-[#C2A476] mx-auto mb-6" />
        <p className="text-neutral-600 text-sm sm:text-base font-light leading-relaxed">
          {language === "vi"
            ? "Từ hồ bơi riêng tư đến tiêu chuẩn dọn phòng tinh tươm hàng ngày, mỗi chi tiết đều được chăm chút để mang lại sự thư thái tuyệt đối."
            : "From the temperature-controlled plunge waters to the highest standard of daily housekeeping, every detail is tuned for pure relaxation."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {AMENITIES_LIST.map((item, index) => (
          <div
            key={index}
            className="p-8 rounded-3xl bg-white border border-[#EAE5DC] hover:border-[#C2A476]/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#14171A] group-hover:border-[#14171A] transition-all duration-300">
                {iconMap[item.icon] || <Sparkles className="w-6 h-6 text-[#C2A476]" />}
              </div>
              <h3 className="font-serif text-xl font-normal text-neutral-900 mb-2">
                {language === "vi" ? item.titleVi : item.titleEn}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                {language === "vi" ? item.descVi : item.descEn}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-[11px] uppercase tracking-wider text-[#C2A476] font-semibold">
              <span>{language === "vi" ? "Đã bao gồm trong kỳ nghỉ" : "Included in your stay"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
