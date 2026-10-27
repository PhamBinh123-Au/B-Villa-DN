"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Sun, Compass, HeartHandshake, Waves } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const EXPERIENCE_PHOTOS = [
  {
    src: "/images/B1/B1.11.jpg",
    tagVi: "Tĩnh Lặng Tuyệt Đối",
    tagEn: "Architectural Stillness",
    titleVi: "Vườn Nhiệt Đới & Âm Thanh Thác Nước Róc Rách",
    titleEn: "Lush Poolside Garden & Waterfall Jets",
    descriptionVi: "Âm thanh êm dịu của dòng nước róc rách mang lại cảm giác bình yên và thư thái trọn vẹn trong không gian biệt lập.",
    descriptionEn: "The gentle acoustic sound of cascading water for meditative coastal peace within your private sanctuary.",
  },
  {
    src: "/images/B2/B2.5.jpg",
    tagVi: "Hồ Bơi Biệt Lập",
    tagEn: "Private Pool Living",
    titleVi: "Làn Nước Xanh Ngọc & Giếng Trời Đón Nắng",
    titleEn: "Crystal Turquoise Waters & Skylight Atrium",
    descriptionVi: "Hồ bơi riêng dài với vòi phun thác nước, giếng trời đón trọn ánh sáng tự nhiên và mở trực tiếp ra các phòng ngủ master.",
    descriptionEn: "Private linear swimming pool beneath a sunlit skylight atrium, with direct access from master suites.",
  },
  {
    src: "/images/B1/B1.14.jpg",
    tagVi: "Chăm Sóc Thân Tâm",
    tagEn: "Bespoke Wellness",
    titleVi: "Bồn Tắm Nằm Thư Giãn Chuẩn Spa Resort",
    titleEn: "Sculpted Freestanding Soaking Bathtub",
    descriptionVi: "Phòng tắm khép kín sang trọng với gương LED nghệ thuật, bồn tắm nằm thư giãn và thiết bị vệ sinh thông minh cao cấp.",
    descriptionEn: "Serene en-suite bathrooms with illuminated organic mirrors, freestanding soaking tub, and smart modern amenities.",
  },
  {
    src: "/images/B1/B1.15.jpg",
    tagVi: "Thư Giãn Ngoài Trời",
    tagEn: "Alfresco Serenity",
    titleVi: "Sân Vườn Nhiệt Đới & Lối Đi Lát Đá Tự Nhiên",
    titleEn: "Sun-Drenched Garden Deck & Natural Stone Walkway",
    descriptionVi: "Kiến trúc đá trắng trang nhã với lối đi lát đá tự nhiên, ghế tắm nắng hồ bơi và không gian mở đón trọn gió biển Sơn Trà.",
    descriptionEn: "Pristine white stone architecture with natural stone pathways, poolside sun loungers, and refreshing ocean breezes.",
  },
];

export const ExperienceSection: React.FC = () => {
  const { language } = useLanguage();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Auto-rotate experience photos gently & preload all 4 slides for instant transition
  useEffect(() => {
    if (typeof window !== "undefined") {
      EXPERIENCE_PHOTOS.forEach((item) => {
        const img = new window.Image();
        img.src = item.src;
      });
    }
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % EXPERIENCE_PHOTOS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentPhoto = EXPERIENCE_PHOTOS[activePhotoIndex];

  return (
    <section id="experience" className="py-24 bg-[#14171A] text-white relative overflow-hidden">
      {/* Decorative Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2A476]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C2A476]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-stretch">
          {/* Left Column: Story & Philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#C2A476] text-xs uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "vi" ? "Triết Lý Nghỉ Dưỡng" : "The Sanctuary Philosophy"}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              {language === "vi" ? (
                <>Nơi Kiến Trúc Ven Biển Gặp Gỡ <span className="font-extrabold text-[#C2A476]">Khoảng Lặng Bình Yên</span></>
              ) : (
                <>Where Coastal Architecture Meets <span className="font-extrabold text-[#C2A476]">Soulful Solitude</span></>
              )}
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base font-normal leading-relaxed mb-6">
              {language === "vi"
                ? "Các biệt thự của chúng tôi được thiết kế tách biệt hoàn toàn khỏi sự ồn ào của khách sạn thông thường. Không sảnh đón đông đúc, bạn bước thẳng vào không gian riêng tư tuyệt đối với hồ bơi trong xanh, phòng khách bếp mở ngập tràn ánh sáng và phòng ngủ yên tĩnh bao quanh bởi mảng xanh nhiệt đới."
                : "Our residences were conceived as an escape from the conventional hotel paradigm. Here, no lobbies crowd your arrival. Instead, you step directly into a private realm of serene swimming pools, luminous open-plan kitchens, and whisper-quiet bedrooms framed by tropical greenery."}
            </p>
            <p className="text-neutral-400 text-sm font-normal leading-relaxed mb-10">
              {language === "vi"
                ? "Dù bạn chọn biệt thự 4 phòng ngủ tại Sơn Trà hay biệt thự 2 phòng ngủ ấm cúng tại Ngũ Hành Sơn, từng phút giây đều được chăm chút cho sự tĩnh tại, tiện nghi và hiếu khách chuẩn mực."
                : "Whether you choose our 4-bedroom sanctuaries in Son Tra or the intimate 2-bedroom plunge pool villa in Ngu Hanh Son, every hour is shaped around stillness, comfort, and gracious local hospitality."}
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-l-2 border-[#C2A476] pl-4">
                <Sun className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="text-lg text-white font-bold tracking-tight">
                  {language === "vi" ? "Ánh Sáng Tự Nhiên Bất Tận" : "Endless Natural Light"}
                </h3>
                <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed font-normal">
                  {language === "vi"
                    ? "Cửa kính chạm trần mở rộng kết nối liền mạch phòng khách với sàn hồ bơi ngoài trời."
                    : "Floor-to-ceiling glass sliding doors bridging indoor living with poolside decks."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <Compass className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="text-lg text-white font-bold tracking-tight">
                  {language === "vi" ? "Vị Trí Đắc Địa Ven Biển" : "Prime Enclaves"}
                </h3>
                <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed font-normal">
                  {language === "vi"
                    ? "Khu phố yên bình, chỉ cách bãi biển Mỹ Khê và Bán đảo Sơn Trà vài phút di chuyển."
                    : "Quiet residential streets minutes from My Khe Beach and Son Tra Peninsula."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <HeartHandshake className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="text-lg text-white font-bold tracking-tight">
                  {language === "vi" ? "Quản Gia Tận Tâm Chu Đáo" : "Bespoke Concierge"}
                </h3>
                <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed font-normal">
                  {language === "vi"
                    ? "Hỗ trợ trực tiếp dịch vụ quản gia, mua sắm tạp hóa và thiết lập tiệc BBQ riêng tư."
                    : "Direct support for VIP concierge services, grocery stocking, and private BBQ setups."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <Waves className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="text-lg text-white font-bold tracking-tight">
                  {language === "vi" ? "Riêng Tư Tuyệt Đối" : "Pure Seclusion"}
                </h3>
                <p className="text-sm text-neutral-300 mt-1.5 leading-relaxed font-normal">
                  {language === "vi"
                    ? "Tường rào biệt lập, cổng khoá an ninh, hỗ trợ nhận phòng tự động hoặc đón tiếp trực tiếp."
                    : "High privacy walls, gated entrances, and dedicated self or host check-in."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7 flex flex-col h-full"
          >
            {/* Main Interactive Image Frame - Expansive & Majestic */}
            <div className="relative w-full h-[540px] sm:h-[620px] lg:h-full lg:min-h-[660px] xl:min-h-[720px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 group">
              {EXPERIENCE_PHOTOS.map((photo, idx) => (
                <div
                  key={photo.src}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === activePhotoIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={language === "vi" ? photo.titleVi : photo.titleEn}
                    fill
                    priority={idx === 0}
                    quality={82}
                    sizes="(max-width: 1024px) 100vw, 750px"
                    className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              ))}

              {/* Bottom Scrim for Text Contrast - leaves top 65% of photo crystal clear & vibrant */}
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-20 pointer-events-none" />

              {/* Top Badge: General Collection Tag */}
              <div className="absolute top-6 left-6 z-30">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#EAE4D7] text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{language === "vi" ? "Bộ Sưu Tập Biệt Thự Chọn Lọc" : "Curated Sanctuary Collection"}</span>
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-30">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs sm:text-sm uppercase tracking-widest text-[#C2A476] font-semibold">
                    {language === "vi" ? currentPhoto.tagVi : currentPhoto.tagEn}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {EXPERIENCE_PHOTOS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIndex(i)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          i === activePhotoIndex
                            ? "w-7 sm:w-8 bg-[#C2A476]"
                            : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`View photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl text-white font-bold leading-snug tracking-tight">
                  {language === "vi" ? currentPhoto.titleVi : currentPhoto.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-light mt-1.5 line-clamp-2 max-w-2xl leading-relaxed">
                  {language === "vi" ? currentPhoto.descriptionVi : currentPhoto.descriptionEn}
                </p>

                {/* Thumbnail Previews Bar */}
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 mt-5 pt-4 border-t border-white/15">
                  {EXPERIENCE_PHOTOS.map((thumb, tIdx) => (
                    <button
                      key={thumb.src}
                      type="button"
                      onClick={() => setActivePhotoIndex(tIdx)}
                      className={`relative h-14 sm:h-16 lg:h-18 rounded-xl sm:rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                        tIdx === activePhotoIndex
                          ? "border-[#C2A476] ring-2 ring-[#C2A476]/50 scale-[1.03]"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={thumb.src}
                        alt={language === "vi" ? thumb.tagVi : thumb.tagEn}
                        fill
                        sizes="160px"
                        quality={85}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
