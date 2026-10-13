"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Villa, VillaMaintenanceInfo } from "@/types";
import {
  bookingStore,
  formatPriceVnd,
  formatPriceUsd,
  DEFAULT_VILLA_PRICES,
  DEFAULT_USD_RATE,
} from "@/lib/bookingStore";
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
  Maximize2,
  X,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  ExternalLink,
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(() => DEFAULT_VILLA_PRICES[villa.id] || 15000000);
  const [usdRate, setUsdRate] = useState<number>(DEFAULT_USD_RATE);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState<VillaMaintenanceInfo | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    setCurrentPrice(bookingStore.getVillaPrice(villa.id));
    setUsdRate(bookingStore.getUsdRate());
    setIsUnderMaintenance(bookingStore.isVillaUnderMaintenance(villa.id));
    setMaintenanceInfo(bookingStore.getVillaMaintenanceInfo(villa.id));

    const unsub = bookingStore.subscribe(() => {
      setCurrentPrice(bookingStore.getVillaPrice(villa.id));
      setUsdRate(bookingStore.getUsdRate());
      setIsUnderMaintenance(bookingStore.isVillaUnderMaintenance(villa.id));
      setMaintenanceInfo(bookingStore.getVillaMaintenanceInfo(villa.id));
    });
    return () => unsub();
  }, [villa.id]);

  // Keyboard navigation for full-screen lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, villa.gallery]);

  const photos = villa.gallery && villa.gallery.length > 0 ? villa.gallery : [villa.image];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleOpenPhotoViewer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenGallery) {
      onOpenGallery(villa, currentPhotoIdx);
    }
    setIsLightboxOpen(true);
  };

  // Localized texts
  const displayName = language === "vi" ? (villa.nameVi || villa.name) : villa.name;
  const displayTagline = language === "vi" ? (villa.taglineVi || villa.tagline) : villa.tagline;
  const displayLocation = language === "vi" ? (villa.locationVi || villa.location) : villa.location;
  const displayDistrict = language === "vi" ? (villa.districtVi || villa.district) : villa.district;
  const displayDescription = language === "vi" ? (villa.descriptionVi || villa.description) : villa.description;
  const displayHighlights = language === "vi" && villa.highlightsVi ? villa.highlightsVi : villa.highlights;
  const displaySpaceDetails = language === "vi" && villa.spaceDetailsVi ? villa.spaceDetailsVi : (villa.spaceDetails || []);
  const displayFurniture = language === "vi" && villa.furnitureAmenitiesVi ? villa.furnitureAmenitiesVi : (villa.furnitureAmenities || villa.amenities);
  const displaySuitableFor = language === "vi" ? (villa.suitableForVi || villa.suitableFor) : (villa.suitableFor || villa.suitableForVi);
  const displayFullTitle = language === "vi" ? (villa.fullTitleVi || villa.fullTitle) : (villa.fullTitle || villa.fullTitleVi);
  const displayPoolType = language === "vi" ? (villa.poolTypeVi || villa.poolType) : villa.poolType;
  const mapLink =
    villa.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      (villa.locationVi || villa.location) + " Đà Nẵng"
    )}`;

  return (
    <>
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
          onClick={handleOpenPhotoViewer}
        >
          <Image
            src={photos[currentPhotoIdx]}
            alt={`${displayName} - Photo ${currentPhotoIdx + 1}`}
            fill
            priority={currentPhotoIdx === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            className="transition-transform duration-700 ease-out hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-65 group-hover:opacity-50 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2 items-center z-10 flex-wrap">
            <span className="bg-[#14171A]/90 backdrop-blur-md text-[#C2A476] border border-[#C2A476]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              {villa.code}
            </span>
            <span className="bg-white/90 backdrop-blur-md text-neutral-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {displayDistrict}
            </span>
            {isUnderMaintenance && (
              <span className="bg-amber-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 border border-amber-300 animate-pulse">
                <Wrench className="w-3.5 h-3.5" />
                <span>{t("villas.maintenance_badge", "Under Maintenance")}</span>
              </span>
            )}
          </div>

          {/* Photo Count & Fullscreen Trigger Pill */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={handleOpenPhotoViewer}
              className="flex items-center gap-1.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105"
              title={language === "vi" ? "Bấm để xem toàn màn hình tất cả ảnh" : "Click to view fullscreen gallery"}
            >
              <Camera className="w-3.5 h-3.5 text-[#C2A476]" />
              <span>
                {currentPhotoIdx + 1}/{photos.length} {language === "vi" ? "Ảnh" : "Photos"}
              </span>
            </button>
          </div>

          {/* Next / Prev Photo Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10 hover:scale-110"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/10 hover:scale-110"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Bottom Mini Dot Progress */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-10 px-4">
                {photos.slice(0, 12).map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === currentPhotoIdx
                        ? "w-5 bg-[#C2A476]"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
                {photos.length > 12 && (
                  <span className="text-[10px] text-white/70 font-mono self-center ml-1">
                    +{photos.length - 12}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Bottom Overlay Title on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
            <p className="text-xs text-[#EAE4D7] tracking-wider uppercase font-semibold drop-shadow-sm">
              {displayPoolType}
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5 tracking-tight drop-shadow-md line-clamp-1">
              {displayName}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Tagline Header with Directions Button */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-snug">
                  {displayName}
                </h3>
                {displayFullTitle && (
                  <p className="text-xs font-semibold text-[#A88856] mt-1 line-clamp-1 tracking-wide">
                    {displayFullTitle}
                  </p>
                )}
              </div>

              {/* Nút Chỉ Đường Google Maps */}
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#C2A476] text-[#8A6B3D] hover:text-white border border-[#EAE5DC] hover:border-[#C2A476] text-xs font-bold transition-all duration-300 shadow-2xs hover:shadow-md shrink-0 mt-0.5 active:scale-95 group cursor-pointer"
                title={language === "vi" ? `Xem chỉ đường Google Maps tới ${displayName}` : `Get Google Maps directions to ${displayName}`}
              >
                <Navigation className="w-3.5 h-3.5 text-[#C2A476] group-hover:text-white transition-colors" />
                <span>{language === "vi" ? "Chỉ Đường" : "Directions"}</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:text-white transition-opacity" />
              </a>
            </div>

            {/* Location & Beach/River Proximity */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 mb-4">
              <MapPin className="w-3.5 h-3.5 text-[#C2A476] flex-shrink-0" />
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-700 hover:text-[#A88856] transition-colors truncate"
                title={language === "vi" ? "Mở chỉ đường trên Google Maps" : "Open directions on Google Maps"}
              >
                {displayLocation}
              </a>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-6 font-light">
              {displayDescription}
            </p>

            {/* Key Property Specs (Matching Real Capacities) */}
            <div
              className="grid grid-cols-4 gap-2 py-4 border-y border-[#EAE5DC] text-center mb-6 bg-[#FAF8F5]/70 rounded-xl"
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
                <span className="text-sm font-bold text-neutral-800">
                  {villa.bedrooms} {language === "vi" ? "Phòng" : "Beds"}
                </span>
                <span className="text-xs text-neutral-600 font-medium tracking-wide">
                  {language === "vi" ? "Khép kín" : "Suites"}
                </span>
              </div>
              <div
                className="flex flex-col items-center justify-center p-1"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <Bath className="w-4 h-4 text-[#C2A476] mb-1" />
                <span className="text-sm font-bold text-neutral-800">
                  {villa.bathrooms} {language === "vi" ? "Tắm" : "Baths"}
                </span>
                <span className="text-xs text-neutral-600 font-medium tracking-wide">
                  {language === "vi" ? "Hiện đại" : "En-suite"}
                </span>
              </div>
              <div
                className="flex flex-col items-center justify-center p-1"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <Users className="w-4 h-4 text-[#C2A476] mb-1" />
                <span className="text-sm font-bold text-neutral-800">
                  {villa.maxGuests} {language === "vi" ? "Khách" : "Guests"}
                </span>
                <span className="text-xs text-neutral-600 font-medium tracking-wide">
                  {language === "vi" ? "Tối đa" : "Capacity"}
                </span>
              </div>
              <div
                className="flex flex-col items-center justify-center p-1"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <Waves className="w-4 h-4 text-[#C2A476] mb-1" />
                <span className="text-sm font-bold text-neutral-800">
                  {language === "vi" ? "Hồ Bơi" : "Private"}
                </span>
                <span className="text-xs text-neutral-600 font-medium tracking-wide">
                  {language === "vi" ? "Riêng" : "Pool"}
                </span>
              </div>
            </div>

            {/* Villa Nightly Rate with Live USD Equivalent */}
            <div className="my-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 block mb-0.5">
                  {language === "vi" ? "Đơn giá tiêu chuẩn" : "Standard Nightly Rate"}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    suppressHydrationWarning
                    className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight"
                  >
                    {formatPriceVnd(currentPrice)}
                  </span>
                  <span className="text-xs text-neutral-600 font-medium">
                    {language === "vi" ? "/ đêm" : "/ night"}
                  </span>
                </div>
              </div>

              {/* Direct Realtime USD Equivalent Conversion */}
              <div className="text-right">
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 block mb-0.5">
                  {language === "vi" ? "Quy đổi tương đương" : "USD Equivalent"}
                </span>
                <span
                  suppressHydrationWarning
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono shadow-xs"
                >
                  ≈ ${formatPriceUsd(currentPrice, usdRate)} USD
                </span>
              </div>
            </div>

            {/* Highlights List */}
            <ul className="space-y-2.5 mb-6">
              {displayHighlights.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700 leading-relaxed">
                  <Check className="w-4 h-4 text-[#C2A476] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Suitable For Banner */}
            {displaySuitableFor && (
              <div className="mb-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center gap-2.5 text-neutral-700">
                <Sparkles className="w-4 h-4 text-[#C2A476] flex-shrink-0" />
                <span className="font-medium text-xs leading-relaxed text-neutral-800">
                  {displaySuitableFor}
                </span>
              </div>
            )}

            {/* Maintenance Notice Banner */}
            {mounted && isUnderMaintenance && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-fade-in shadow-sm">
                <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                    {language === "vi" ? "Chế Độ Bảo Trì Định Kỳ" : "Scheduled Maintenance Mode"}
                  </p>
                  {maintenanceInfo?.startDate && maintenanceInfo?.endDate && (
                    <p className="text-[11px] font-bold text-amber-900 mt-0.5 flex items-center gap-1">
                      <span>📅 {maintenanceInfo.startDate} → {maintenanceInfo.endDate}</span>
                    </p>
                  )}
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
              {mounted && isUnderMaintenance ? (
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
                className="px-3.5 py-3 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 transition-all flex items-center gap-1.5 text-xs font-semibold"
                title={language === "vi" ? "Xem chi tiết & toàn bộ ảnh" : "View details & all photos"}
              >
                <span>{showDetails ? (language === "vi" ? "Thu gọn" : "Collapse") : (language === "vi" ? "Chi tiết" : "Details")}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showDetails ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Expandable Rich Details Drawer */}
            {showDetails && (
              <div className="mt-5 pt-5 border-t border-neutral-200 text-xs text-neutral-700 animate-fade-in space-y-6">
                {/* Photo Thumbnails Gallery Preview */}
                {photos.length > 1 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#C2A476]" />
                        <span className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                          {language === "vi" ? `Toàn Bộ ${photos.length} Ảnh Thực Tế` : `All ${photos.length} Real Photos`}
                        </span>
                      </div>
                      <button
                        onClick={handleOpenPhotoViewer}
                        className="inline-flex items-center gap-1 text-xs text-[#A88856] hover:text-[#14171A] font-semibold transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{language === "vi" ? "Phóng to xem tất cả" : "View fullscreen"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {photos.map((pic, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            setCurrentPhotoIdx(pIdx);
                          }}
                          onDoubleClick={handleOpenPhotoViewer}
                          className={`relative h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            pIdx === currentPhotoIdx
                              ? "border-[#C2A476] ring-2 ring-[#C2A476]/30 scale-105 z-10"
                              : "border-transparent opacity-75 hover:opacity-100"
                          }`}
                          title={`Xem ảnh ${pIdx + 1}`}
                        >
                          <Image
                            src={pic}
                            alt={`${displayName} - ${pIdx + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                          <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-[10px] text-white px-1.5 rounded font-mono">
                            {pIdx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🏡 Real Architecture & Space Layout Specs */}
                {displaySpaceDetails.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                    <div className="flex items-center gap-2 mb-3">
                      <Compass className="w-4 h-4 text-[#C2A476]" />
                      <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-xs">
                        {language === "vi" ? "Bố Trí Không Gian & Kiến Trúc Thực Tế" : "Actual Space & Layout"}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {displaySpaceDetails.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 🛋 Full Furniture & Included Amenities */}
                {displayFurniture.length > 0 && (
                  <div>
                    <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-xs mb-2.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#C2A476]" />
                      <span>{language === "vi" ? "Full Nội Thất & Tiện Nghi Đầy Đủ" : "Full Furniture & Amenities"}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {displayFurniture.map((amenity, i) => (
                        <span
                          key={i}
                          className="bg-neutral-100 hover:bg-[#FAF8F5] text-neutral-800 border border-neutral-200/80 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📍 Proximity and Direct Contact CTA */}
                <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between border-t border-neutral-100">
                  <span>📍 {displayLocation}</span>
                  <button
                    onClick={() => onInquire(villa)}
                    className="text-[#A88856] hover:underline font-bold"
                  >
                    {language === "vi" ? "Đặt lịch giữ chỗ →" : "Reserve this villa →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Luxury Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 text-white animate-fade-in select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#C2A476] text-black font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {villa.code}
                </span>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {displayName}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentPhotoIdx + 1} / {photos.length} {language === "vi" ? "Ảnh Thực Tế Sắc Nét" : "High-Res Photos"} • {displayLocation}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  onInquire(villa);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#C2A476] hover:bg-[#A88856] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === "vi" ? "Đặt Villa Này" : "Book This Villa"}</span>
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all"
                aria-label="Close fullscreen gallery"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Central Main Image & Prev/Next Controls */}
          <div
            className="relative flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full h-[60vh] sm:h-[72vh] max-w-5xl">
              <Image
                src={photos[currentPhotoIdx]}
                alt={`${displayName} - Photo ${currentPhotoIdx + 1}`}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div
            className="z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 max-w-5xl mx-auto w-full overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 justify-start sm:justify-center overflow-x-auto py-1">
              {photos.map((pic, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setCurrentPhotoIdx(pIdx)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    pIdx === currentPhotoIdx
                      ? "border-[#C2A476] scale-105 ring-2 ring-[#C2A476]/40"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={pic}
                    alt={`thumbnail ${pIdx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-0 right-0.5 bg-black/70 text-[9px] text-white px-1 rounded font-mono">
                    {pIdx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
