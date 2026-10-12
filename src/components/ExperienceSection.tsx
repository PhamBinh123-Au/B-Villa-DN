"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Sun, Compass, HeartHandshake, Waves } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const EXPERIENCE_PHOTOS = [
  {
    src: "/images/experience/experience-pool-main.jpg",
    tagVi: "Hồ Bơi Biệt Lập",
    tagEn: "Private Pool Living",
    titleVi: "Làn Nước Xanh Ngọc & Thác Nước Tự Nhiên",
    titleEn: "Crystal Turquoise Waters & Cascading Waterfall",
    descriptionVi: "Hồ bơi riêng dài tràn ngập ánh nắng, bao quanh bởi mảng xanh nhiệt đới và tường rào biệt lập.",
    descriptionEn: "Sunlit linear swimming pool bordered by lush tropical greens and privacy walls.",
  },
  {
    src: "/images/experience/experience-lounge.jpg",
    tagVi: "Thư Giãn Ngoài Trời",
    tagEn: "Alfresco Serenity",
    titleVi: "Sàn Tắm Nắng Hồ Bơi Tràn Ngập Ánh Sáng",
    titleEn: "Sun-Drenched Poolside Relaxation Deck",
    descriptionVi: "Kiến trúc màu trắng trang nhã với cửa kính chạm trần mở thẳng ra không gian hồ bơi thoáng đãng.",
    descriptionEn: "Pristine white architectural facade with seamless floor-to-ceiling glass access.",
  },
  {
    src: "/images/experience/experience-bath.jpg",
    tagVi: "Chăm Sóc Thân Tâm",
    tagEn: "Bespoke Wellness",
    titleVi: "Bồn Tắm Nằm Thư Giãn Phong Cách Spa",
    titleEn: "Sculpted Freestanding Soaking Bathtub",
    descriptionVi: "Phòng tắm khép kín sang trọng với gương led nghệ thuật và vòi sen tắm đứng chuẩn resort cao cấp.",
    descriptionEn: "Serene en-suite bathrooms with illuminated organic mirrors and walk-in showers.",
  },
  {
    src: "/images/experience/experience-waterfall.jpg",
    tagVi: "Tĩnh Lặng Tuyệt Đối",
    tagEn: "Architectural Stillness",
    titleVi: "Vườn Nhiệt Đới & Âm Thanh Thác Nước Róc Rách",
    titleEn: "Lush Poolside Garden & Waterfall Jets",
    descriptionVi: "Âm thanh êm dịu của dòng nước róc rách mang lại cảm giác bình yên và thư thái trọn vẹn.",
    descriptionEn: "The gentle acoustic sound of cascading water for meditative coastal peace.",
  },
];

export const ExperienceSection: React.FC = () => {
  const { language } = useLanguage();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Auto-rotate experience photos gently
  useEffect(() => {
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

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Story & Philosophy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#C2A476] text-xs uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "vi" ? "Triết Lý Nghỉ Dưỡng" : "The Sanctuary Philosophy"}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight mb-6">
              {language === "vi" ? (
                <>Nơi Kiến Trúc Ven Biển Gặp Gỡ <span className="italic text-[#C2A476]">Khoảng Lặng Bình Yên</span></>
              ) : (
                <>Where Coastal Architecture Meets <span className="italic text-[#C2A476]">Soulful Solitude</span></>
              )}
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base font-light leading-relaxed mb-6">
              {language === "vi"
                ? "Các biệt thự của chúng tôi được thiết kế tách biệt hoàn toàn khỏi sự ồn ào của khách sạn thông thường. Không sảnh đón đông đúc, bạn bước thẳng vào không gian riêng tư tuyệt đối với hồ bơi trong xanh, phòng khách bếp mở ngập tràn ánh sáng và phòng ngủ yên tĩnh bao quanh bởi mảng xanh nhiệt đới."
                : "Our residences were conceived as an escape from the conventional hotel paradigm. Here, no lobbies crowd your arrival. Instead, you step directly into a private realm of serene swimming pools, luminous open-plan kitchens, and whisper-quiet bedrooms framed by tropical greenery."}
            </p>
            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-10">
              {language === "vi"
                ? "Dù bạn chọn biệt thự 4 phòng ngủ tại Sơn Trà hay biệt thự 2 phòng ngủ ấm cúng tại Ngũ Hành Sơn, từng phút giây đều được chăm chút cho sự tĩnh tại, tiện nghi và hiếu khách chuẩn mực."
                : "Whether you choose our 4-bedroom sanctuaries in Son Tra or the intimate 2-bedroom plunge pool villa in Ngu Hanh Son, every hour is shaped around stillness, comfort, and gracious local hospitality."}
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border-l-2 border-[#C2A476] pl-4">
                <Sun className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="font-serif text-lg text-white font-medium">
                  {language === "vi" ? "Ánh Sáng Tự Nhiên Bất Tận" : "Endless Natural Light"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {language === "vi"
                    ? "Cửa kính chạm trần mở rộng kết nối liền mạch phòng khách với sàn hồ bơi ngoài trời."
                    : "Floor-to-ceiling glass sliding doors bridging indoor living with poolside decks."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <Compass className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="font-serif text-lg text-white font-medium">
                  {language === "vi" ? "Vị Trí Đắc Địa Ven Biển" : "Prime Enclaves"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {language === "vi"
                    ? "Khu phố yên bình, chỉ cách bãi biển Mỹ Khê và Bán đảo Sơn Trà vài phút di chuyển."
                    : "Quiet residential streets minutes from My Khe Beach and Son Tra Peninsula."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <HeartHandshake className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="font-serif text-lg text-white font-medium">
                  {language === "vi" ? "Quản Gia Tận Tâm Chu Đáo" : "Bespoke Concierge"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {language === "vi"
                    ? "Hỗ trợ 24/7 xe đưa đón sân bay, mua sắm chuẩn bị nguyên liệu và tổ chức tiệc BBQ riêng."
                    : "Direct support for airport chauffeurs, grocery stocking, and private BBQ setups."}
                </p>
              </div>

              <div className="border-l-2 border-[#C2A476] pl-4">
                <Waves className="w-5 h-5 text-[#C2A476] mb-2" />
                <h3 className="font-serif text-lg text-white font-medium">
                  {language === "vi" ? "Riêng Tư Tuyệt Đối" : "Pure Seclusion"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {language === "vi"
                    ? "Tường rào biệt lập, cổng khoá an ninh, hỗ trợ nhận phòng tự động hoặc đón tiếp trực tiếp."
                    : "High privacy walls, gated entrances, and dedicated self or host check-in."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="relative">
            {/* Main Interactive Image Frame */}
            <div className="relative h-[480px] sm:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-900 group">
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
                    className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              ))}

              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 z-20 pointer-events-none" />

              {/* Top Badge: General Collection Tag */}
              <div className="absolute top-6 left-6 z-30">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#EAE4D7] text-[11px] font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{language === "vi" ? "Bộ Sưu Tập Biệt Thự Chọn Lọc" : "Curated Sanctuary Collection"}</span>
                </span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-30">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs uppercase tracking-widest text-[#C2A476] font-semibold">
                    {language === "vi" ? currentPhoto.tagVi : currentPhoto.tagEn}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {EXPERIENCE_PHOTOS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          i === activePhotoIndex
                            ? "w-6 bg-[#C2A476]"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`View photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-white font-medium leading-snug">
                  {language === "vi" ? currentPhoto.titleVi : currentPhoto.titleEn}
                </h3>
                <p className="text-xs text-neutral-300 font-light mt-1 line-clamp-2">
                  {language === "vi" ? currentPhoto.descriptionVi : currentPhoto.descriptionEn}
                </p>

                {/* Thumbnail Previews Bar */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/15">
                  {EXPERIENCE_PHOTOS.map((thumb, tIdx) => (
                    <button
                      key={thumb.src}
                      type="button"
                      onClick={() => setActivePhotoIndex(tIdx)}
                      className={`relative h-12 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        tIdx === activePhotoIndex
                          ? "border-[#C2A476] ring-2 ring-[#C2A476]/50 scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={thumb.src}
                        alt={language === "vi" ? thumb.tagVi : thumb.tagEn}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlapping Guest Review Card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 z-40 bg-[#1e2329]/95 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl max-w-xs">
              <p className="text-[11px] text-[#C2A476] uppercase tracking-widest font-semibold mb-1">
                {language === "vi" ? "Đánh Giá Thực Tế Từ Khách" : "Verified Guest Experience"}
              </p>
              <p className="text-xs text-neutral-200 italic font-light leading-relaxed">
                {language === "vi"
                  ? "“Thức dậy với ánh nắng ban mai phản chiếu trên mặt hồ bơi riêng là khoảnh khắc đáng nhớ nhất trong chuyến du lịch Đà Nẵng của gia đình tôi.”"
                  : "“Waking up to the morning sun reflecting off our private pool was the highlight of our Da Nang vacation.”"}
              </p>
              <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                {language === "vi" ? "— Trải Nghiệm Khách Nghỉ Dưỡng" : "— Private Villa Guest Review"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
