"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Villa } from "@/types";
import { bookingStore, formatPriceVnd, formatPriceUsd } from "@/lib/bookingStore";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Waves,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Camera,
  Wrench,
  AlertCircle,
} from "lucide-react";

interface VillaCardProps {
  villa: Villa;
  onInquire: (villa: Villa) => void;
  onOpenGallery?: (villa: Villa, photoIndex: number) => void;
}

export const VillaCard: React.FC<VillaCardProps> = ({
  villa,
  onInquire,
  onOpenGallery,
}) => {
  const { t, language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [maintenanceVer, setMaintenanceVer] = useState(0);

  useEffect(() => {
    const unsub = bookingStore.subscribe(() => {
      setMaintenanceVer((v) => v + 1);
    });
    return () => unsub();
  }, []);

  const isUnderMaintenance = bookingStore.isVillaUnderMaintenance(villa.id);
  const maintenanceInfo = bookingStore.getVillaMaintenanceInfo(villa.id);
  const currentPrice = bookingStore.getVillaPrice(villa.id);
  const usdRate = bookingStore.getUsdRate();

  const photos = villa.gallery && villa.gallery.length > 0 ? villa.gallery : [villa.image];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden border border-[#EAE5DC] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between"
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "1.5rem",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        border: "1px solid #EAE5DC",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Interactive Photo Showcase with Slider Controls */}
      <div
        className="relative w-full overflow-hidden bg-[#181B1E] cursor-pointer aspect-square"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          backgroundColor: "#181B1E",
        }}
        onClick={() => onOpenGallery?.(villa, currentPhotoIdx)}
      >
        <Image
          src={photos[currentPhotoIdx]}
          alt={`${villa.name} - Photo ${currentPhotoIdx + 1}`}
          fill
          priority={currentPhotoIdx === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            objectFit: currentPhotoIdx === 0 ? "contain" : "cover",
            objectPosition: "center",
          }}
          className="transition-transform duration-700 ease-out hover:scale-105"
        />
        {/* Subtle overlay only for secondary photos without text */}
        {currentPhotoIdx > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-60 transition-opacity" />
        )}

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2 items-center z-10 flex-wrap">
          <span className="bg-[#14171A]/90 backdrop-blur-md text-[#C2A476] border border-[#C2A476]/30 text-xs font-serif font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
            {villa.code}
          </span>
          <span className="bg-white/90 backdrop-blur-md text-neutral-800 text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {villa.district}
          </span>
          {isUnderMaintenance && (
            <span className="bg-amber-600/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 border border-amber-300 animate-pulse">
              <Wrench className="w-3 h-3" />
              <span>{t("villas.maintenance_badge", "Under Maintenance")}</span>
            </span>
          )}
        </div>

        {/* Photo Count Pill */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGallery?.(villa, currentPhotoIdx);
            }}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/20 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-[#C2A476]" />
            <span>
              {currentPhotoIdx + 1}/{photos.length} {language === "vi" ? "Ảnh" : "Photos"}
            </span>
          </button>
        </div>

        {/* Next / Prev Photo Arrows (Visible on hover & touch) */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Dots */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-10">
              {photos.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentPhotoIdx
                      ? "w-5 bg-[#C2A476]"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom Tagline on Image (only for secondary photos) */}
        {currentPhotoIdx > 0 && (
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
            <p className="text-xs text-[#EAE4D7] tracking-wider uppercase font-medium">
              {villa.poolType}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mt-0.5">
              {villa.name}
            </h3>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#C2A476] flex-shrink-0" />
            <span className="truncate">{villa.location}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-6 font-light">
            {villa.description}
          </p>

          {/* Key Property Specs (No Price, Luxury Capacity Focus) */}
          <div
            className="grid grid-cols-4 gap-2 py-4 border-y border-[#EAE5DC] text-center mb-6 bg-[#FAF8F5]/60 rounded-xl"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "0.5rem",
              padding: "1rem 0.5rem",
              margin: "1rem 0",
              borderTop: "1px solid #EAE5DC",
              borderBottom: "1px solid #EAE5DC",
              borderRadius: "0.75rem",
            }}
          >
            <div
              className="flex flex-col items-center justify-center p-1"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <Bed className="w-4 h-4 text-[#C2A476] mb-1" />
              <span className="text-xs font-semibold text-neutral-800">
                {villa.bedrooms} {language === "vi" ? "Phòng" : "Beds"}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase">{language === "vi" ? "Khép Kín" : "Suites"}</span>
            </div>
            <div
              className="flex flex-col items-center justify-center p-1"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <Bath className="w-4 h-4 text-[#C2A476] mb-1" />
              <span className="text-xs font-semibold text-neutral-800">
                {villa.bathrooms} {language === "vi" ? "Tắm" : "Baths"}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase">En-suite</span>
            </div>
            <div
              className="flex flex-col items-center justify-center p-1"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <Users className="w-4 h-4 text-[#C2A476] mb-1" />
              <span className="text-xs font-semibold text-neutral-800">
                {villa.maxGuests} {language === "vi" ? "Khách" : "Guests"}
              </span>
              <span className="text-[10px] text-neutral-400 uppercase">{language === "vi" ? "Tối Đa" : "Capacity"}</span>
            </div>
            <div
              className="flex flex-col items-center justify-center p-1"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
              <Waves className="w-4 h-4 text-[#C2A476] mb-1" />
              <span className="text-xs font-semibold text-neutral-800">{language === "vi" ? "Hồ Bơi" : "Private"}</span>
              <span className="text-[10px] text-neutral-400 uppercase">{language === "vi" ? "Riêng" : "Pool"}</span>
            </div>
          </div>

          {/* Villa Nightly Rate with Live USD Equivalent */}
          <div className="my-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                {language === "vi" ? "Đơn giá tiêu chuẩn" : "Standard Nightly Rate"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  {formatPriceVnd(currentPrice)}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {language === "vi" ? "/ đêm" : "/ night"}
                </span>
              </div>
            </div>

            {/* Direct Realtime USD Equivalent Conversion */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-0.5">
                {language === "vi" ? "Quy đổi tương đương" : "USD Equivalent"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono shadow-xs">
                ≈ ${formatPriceUsd(currentPrice, usdRate)} USD
              </span>
            </div>
          </div>

          {/* Highlights */}
          <ul className="space-y-2 mb-6">
            {villa.highlights.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                <Check className="w-3.5 h-3.5 text-[#C2A476] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Maintenance Notice Banner */}
          {isUnderMaintenance && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-fade-in shadow-sm">
              <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                  {language === "vi" ? "Chế Độ Bảo Trì Định Kỳ" : "Scheduled Maintenance Mode"}
                </p>
                <p className="text-[11px] text-amber-800 font-light mt-0.5 leading-relaxed">
                  {maintenanceInfo?.reason || (language === "vi" ? "Biệt thự đang trong giai đoạn nâng cấp định kỳ. Tạm dừng nhận đặt phòng." : "This villa is undergoing scheduled luxury maintenance & renovation. Reservations are temporarily closed.")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div>
          <div className="pt-2 flex items-center gap-3">
            {isUnderMaintenance ? (
              <button
                type="button"
                disabled
                className="flex-1 bg-neutral-200 text-neutral-500 py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2 border border-neutral-300 shadow-none"
              >
                <Wrench className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t("villas.maintenance_badge", "Under Maintenance")}</span>
              </button>
            ) : (
              <button
                onClick={() => onInquire(villa)}
                className="flex-1 bg-[#14171A] hover:bg-[#C2A476] text-white py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === "vi" ? "Gửi Yêu Cầu Đặt Biệt Thự" : "Request Availability"}</span>
              </button>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-3 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 transition-colors"
              title="View More Details & Spaces"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${
                  showDetails ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          {/* Expandable Details Drawer */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600 animate-fade-in space-y-4">
              {/* Photo Thumbnails Switcher */}
              {photos.length > 1 && (
                <div>
                  <span className="font-semibold text-neutral-800 text-[11px] uppercase tracking-wider block mb-2">
                    Click to preview all spaces:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {photos.map((pic, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setCurrentPhotoIdx(pIdx)}
                        className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          pIdx === currentPhotoIdx
                            ? "border-[#C2A476] scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={pic}
                          alt="thumbnail"
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">
                  All Included Amenities:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {villa.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md text-[11px]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
