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
import { getLiveVillaOverrides } from "@/lib/adminDataService";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/config/siteConfig";
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
  MessageCircle,
  Zap,
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
  const [villaOverrides, setVillaOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    setMounted(true);
    setCurrentPrice(bookingStore.getVillaPrice(villa.id));
    setUsdRate(bookingStore.getUsdRate());
    setIsUnderMaintenance(bookingStore.isVillaUnderMaintenance(villa.id));
    setMaintenanceInfo(bookingStore.getVillaMaintenanceInfo(villa.id));
    setVillaOverrides(getLiveVillaOverrides());

    const unsub = bookingStore.subscribe(() => {
      setCurrentPrice(bookingStore.getVillaPrice(villa.id));
      setUsdRate(bookingStore.getUsdRate());
      setIsUnderMaintenance(bookingStore.isVillaUnderMaintenance(villa.id));
      setMaintenanceInfo(bookingStore.getVillaMaintenanceInfo(villa.id));
      setVillaOverrides(getLiveVillaOverrides());
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Preload all gallery images in browser cache for 0ms instantaneous carousel switching
  useEffect(() => {
    if (typeof window === "undefined" || !photos || photos.length === 0) return;
    photos.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [photos]);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
      } else {
        setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      }
    }
    setTouchStartX(null);
  };

  const handleOpenPhotoViewer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenGallery) {
      onOpenGallery(villa, currentPhotoIdx);
    }
    setIsLightboxOpen(true);
  };

  // Localized texts & dynamic overrides
  const myOverride =
    villaOverrides[villa.id] ||
    villaOverrides[villa.id?.toUpperCase()] ||
    villaOverrides[villa.code] ||
    {};
  const effectiveVilla: Villa = {
    ...villa,
    name: myOverride.name || villa.name,
    nameVi: myOverride.name || villa.nameVi || villa.name,
    bedrooms: myOverride.bedrooms ?? villa.bedrooms,
    bathrooms: myOverride.bathrooms ?? villa.bathrooms,
    maxGuests: myOverride.maxGuests ?? villa.maxGuests,
    area: myOverride.area ?? villa.area,
    description: myOverride.description || villa.description,
    descriptionVi: myOverride.description || villa.descriptionVi,
  };

  const displayName = language === "vi" ? (effectiveVilla.nameVi || effectiveVilla.name) : effectiveVilla.name;
  const displayTagline = language === "vi" ? (effectiveVilla.taglineVi || effectiveVilla.tagline) : effectiveVilla.tagline;
  const displayLocation = language === "vi" ? (effectiveVilla.locationVi || effectiveVilla.location) : effectiveVilla.location;
  const displayDistrict = language === "vi" ? (effectiveVilla.districtVi || effectiveVilla.district) : effectiveVilla.district;
  const displayDescription = language === "vi" ? (effectiveVilla.descriptionVi || effectiveVilla.description) : effectiveVilla.description;
  const displayHighlights = language === "vi" && effectiveVilla.highlightsVi ? effectiveVilla.highlightsVi : effectiveVilla.highlights;
  const displaySpaceDetails = language === "vi" && effectiveVilla.spaceDetailsVi ? effectiveVilla.spaceDetailsVi : (effectiveVilla.spaceDetails || []);
  const displayFurniture = language === "vi" && effectiveVilla.furnitureAmenitiesVi ? effectiveVilla.furnitureAmenitiesVi : (effectiveVilla.furnitureAmenities || effectiveVilla.amenities);
  const displaySuitableFor = language === "vi" ? (effectiveVilla.suitableForVi || effectiveVilla.suitableFor) : (effectiveVilla.suitableFor || effectiveVilla.suitableForVi);
  const displayFullTitle = language === "vi" ? (effectiveVilla.fullTitleVi || effectiveVilla.fullTitle) : (effectiveVilla.fullTitle || effectiveVilla.fullTitleVi);
  const displayPoolType = language === "vi" ? (effectiveVilla.poolTypeVi || effectiveVilla.poolType) : effectiveVilla.poolType;
  const mapLink =
    effectiveVilla.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      (effectiveVilla.locationVi || effectiveVilla.location) + " Đà Nẵng"
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
        {/* Interactive Photo Showcase with Zero-Delay Sliding Track */}
        <div
          className="relative w-full overflow-hidden bg-[#181B1E] cursor-pointer aspect-square select-none"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            backgroundColor: "#181B1E",
          }}
          onClick={handleOpenPhotoViewer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Hardware-Accelerated Instant Sliding Track (0ms Delay) */}
          <div
            className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(-${currentPhotoIdx * 100}%, 0, 0)`,
            }}
          >
            {photos.map((src, idx) => (
              <div
                key={idx}
                className="relative min-w-full h-full flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`${displayName} - Photo ${idx + 1}`}
                  fill
                  unoptimized
                  priority={idx < 2}
                  loading={idx < 4 ? "eager" : "lazy"}
                  sizes="100vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    imageRendering: "-webkit-optimize-contrast",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  className="transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                />
              </div>
            ))}
          </div>

          {/* Elegant Bottom Scrim for Title Legibility - keeps 80% of photo 100% luminous & sharp */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2 items-center z-20 flex-wrap">
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
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={handleOpenPhotoViewer}
              className="flex items-center gap-1.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 cursor-pointer"
              title={language === "vi" ? "Bấm để xem toàn màn hình tất cả ảnh" : "Click to view fullscreen gallery"}
            >
              <Camera className="w-3.5 h-3.5 text-[#C2A476]" />
              <span>
                {currentPhotoIdx + 1}/{photos.length} {language === "vi" ? "Ảnh" : "Photos"}
              </span>
            </button>
          </div>

          {/* Next / Prev Photo Arrows (Zero-lag switching) */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom Mini Dot Progress */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 z-20 px-4">
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
            {/* Location & Beach/River Proximity */}
            <div className="flex items-center gap-2 text-xs text-neutral-600 mb-4 group/loc w-fit">
              <div className="w-6 h-6 rounded-lg bg-[#FAF6EE] group-hover/loc:bg-[#C2A476] border border-[#E8E0D2] group-hover/loc:border-[#C2A476] flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/loc:scale-120 group-hover/loc:-translate-y-1 group-hover/loc:shadow-md">
                <MapPin className="w-3.5 h-3.5 text-[#C2A476] group-hover/loc:text-white transition-colors duration-300" />
              </div>
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-700 hover:text-[#8A6B3D] transition-colors truncate"
                title={language === "vi" ? "Mở chỉ đường trên Google Maps" : "Open directions on Google Maps"}
              >
                {displayLocation}
              </a>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-6 font-light">
              {displayDescription}
            </p>

            {/* Key Property Specs (Matching Real Capacities with Lively 3D Floating Hover) */}
            <div
              className="grid grid-cols-4 gap-2 sm:gap-2.5 py-2.5 px-2 border-y border-[#EAE5DC] text-center mb-6 bg-[#FAF8F5]/60 rounded-2xl"
            >
              {/* 1. Bedrooms */}
              <div
                className="group/spec flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-[0_12px_24px_rgba(194,164,118,0.22)] hover:-translate-y-2 hover:scale-[1.04] transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] group-hover/spec:border-transparent flex items-center justify-center mb-1.5 transition-all duration-300 shadow-2xs group-hover/spec:shadow-md group-hover/spec:scale-115 group-hover/spec:-rotate-6">
                  <Bed className="w-4 h-4 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover/spec:text-[#8A6B3D] transition-colors leading-tight">
                  {effectiveVilla.bedrooms} {language === "vi" ? "Phòng" : "Beds"}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium tracking-wide mt-0.5 group-hover/spec:text-neutral-800 transition-colors">
                  {language === "vi" ? "Khép kín" : "Suites"}
                </span>
              </div>

              {/* 2. Bathrooms */}
              <div
                className="group/spec flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-[0_12px_24px_rgba(194,164,118,0.22)] hover:-translate-y-2 hover:scale-[1.04] transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] group-hover/spec:border-transparent flex items-center justify-center mb-1.5 transition-all duration-300 shadow-2xs group-hover/spec:shadow-md group-hover/spec:scale-115 group-hover/spec:rotate-6">
                  <Bath className="w-4 h-4 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover/spec:text-[#8A6B3D] transition-colors leading-tight">
                  {effectiveVilla.bathrooms} {language === "vi" ? "Tắm" : "Baths"}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium tracking-wide mt-0.5 group-hover/spec:text-neutral-800 transition-colors">
                  {language === "vi" ? "Hiện đại" : "En-suite"}
                </span>
              </div>

              {/* 3. Guests */}
              <div
                className="group/spec flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-[0_12px_24px_rgba(194,164,118,0.22)] hover:-translate-y-2 hover:scale-[1.04] transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] group-hover/spec:border-transparent flex items-center justify-center mb-1.5 transition-all duration-300 shadow-2xs group-hover/spec:shadow-md group-hover/spec:scale-115 group-hover/spec:-rotate-6">
                  <Users className="w-4 h-4 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover/spec:text-[#8A6B3D] transition-colors leading-tight">
                  {effectiveVilla.maxGuests} {language === "vi" ? "Khách" : "Guests"}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium tracking-wide mt-0.5 group-hover/spec:text-neutral-800 transition-colors">
                  {language === "vi" ? "Tối đa" : "Capacity"}
                </span>
              </div>

              {/* 4. Pool */}
              <div
                className="group/spec flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-[0_12px_24px_rgba(194,164,118,0.22)] hover:-translate-y-2 hover:scale-[1.04] transition-all duration-300 ease-out cursor-pointer select-none"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] group-hover/spec:border-transparent flex items-center justify-center mb-1.5 transition-all duration-300 shadow-2xs group-hover/spec:shadow-md group-hover/spec:scale-115 group-hover/spec:rotate-6">
                  <Waves className="w-4 h-4 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover/spec:text-[#8A6B3D] transition-colors leading-tight">
                  {language === "vi" ? "Hồ Bơi" : "Private"}
                </span>
                <span className="text-[10px] sm:text-xs text-neutral-500 font-medium tracking-wide mt-0.5 group-hover/spec:text-neutral-800 transition-colors">
                  {language === "vi" ? "Riêng" : "Pool"}
                </span>
              </div>
            </div>

            {/* Villa Nightly Rate with Live USD Equivalent */}
            <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between shadow-2xs hover:shadow-[0_10px_25px_rgba(194,164,118,0.18)] hover:border-[#C2A476] hover:-translate-y-1.5 hover:bg-white transition-all duration-300 group/rate cursor-default">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 group-hover/rate:text-[#8A6B3D] block mb-0.5 transition-colors">
                  {language === "vi" ? "Đơn giá tiêu chuẩn" : "Standard Nightly Rate"}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    suppressHydrationWarning
                    className="text-lg sm:text-xl font-extrabold text-neutral-900 group-hover/rate:text-[#14171A] tracking-tight transition-colors"
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
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 group-hover/rate:text-[#8A6B3D] block mb-0.5 transition-colors">
                  {language === "vi" ? "Quy đổi tương đương" : "USD Equivalent"}
                </span>
                <span
                  suppressHydrationWarning
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 group-hover/rate:bg-emerald-100 border border-emerald-200 group-hover/rate:border-emerald-300 text-emerald-800 text-xs font-bold font-mono shadow-2xs hover:scale-110 hover:shadow-sm transition-all duration-300 cursor-pointer"
                >
                  ≈ ${formatPriceUsd(currentPrice, usdRate)} USD
                </span>
              </div>
            </div>

            {/* Highlights List */}
            <ul className="space-y-2 mb-6">
              {displayHighlights.slice(0, 3).map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-neutral-700 leading-relaxed p-1.5 -mx-1.5 rounded-xl hover:bg-[#FAF8F5] hover:translate-x-2 transition-all duration-200 group/item cursor-default"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-[#C2A476] group-hover/item:border-[#C2A476] group-hover/item:scale-125 group-hover/item:rotate-12 group-hover/item:shadow-sm transition-all duration-300">
                    <Check className="w-3 h-3 text-[#C2A476] group-hover/item:text-white transition-colors" />
                  </div>
                  <span className="group-hover/item:text-neutral-950 group-hover/item:font-medium transition-colors">{item}</span>
                </li>
              ))}
            </ul>

            {/* Suitable For Banner */}
            {displaySuitableFor && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center gap-3 text-neutral-700 hover:shadow-[0_10px_25px_rgba(194,164,118,0.2)] hover:border-[#C2A476] hover:-translate-y-1.5 hover:bg-white transition-all duration-300 group/suitable cursor-default">
                <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] group-hover/suitable:bg-gradient-to-br group-hover/suitable:from-[#C2A476] group-hover/suitable:to-[#8A6B3D] border border-[#E8E0D2] group-hover/suitable:border-transparent flex items-center justify-center flex-shrink-0 shadow-2xs group-hover/suitable:shadow-md group-hover/suitable:scale-125 group-hover/suitable:rotate-12 transition-all duration-300">
                  <Sparkles className="w-4 h-4 text-[#C2A476] group-hover/suitable:text-white transition-colors duration-300" />
                </div>
                <span className="font-medium text-xs leading-relaxed text-neutral-800 group-hover/suitable:text-neutral-950 transition-colors">
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

          {/* Action Buttons: High-conversion Room Sale CTAs */}
          <div>
            <div className="pt-2 flex items-center gap-2 sm:gap-2.5">
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
                  onClick={() => onInquire(effectiveVilla)}
                  className="flex-1 bg-gradient-to-r from-[#14171A] via-[#1f2429] to-[#14171A] hover:from-[#C2A476] hover:to-[#A88856] text-white py-3.5 px-3 sm:px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-95 border border-[#C2A476]/30 hover:border-[#C2A476] cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-[#C2A476] group-hover:text-white transition-colors animate-pulse" />
                  <span className="truncate">{language === "vi" ? "⚡ Đặt Căn Này Ngay" : "⚡ Book This Villa"}</span>
                </button>
              )}

              {/* Quick Zalo Chat Button for Direct Room Sale Inquiries */}
              <a
                href={siteConfig.social.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-3.5 py-3.5 rounded-xl bg-[#0068FF]/10 hover:bg-[#0068FF] text-[#0068FF] hover:text-white border border-[#0068FF]/25 hover:border-[#0068FF] transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:shadow-md cursor-pointer shrink-0 active:scale-95"
                title={language === "vi" ? "Chat Zalo tư vấn trực tiếp với Quản lý B-Villa" : "Chat on Zalo with Concierge"}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Zalo</span>
              </a>

              {/* View Details & Photo Drawer Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-3 sm:px-3.5 py-3.5 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer shrink-0 active:scale-95"
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
                            unoptimized
                            sizes="80px"
                            className="object-cover"
                            style={{ imageRendering: "-webkit-optimize-contrast" }}
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
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] hover:shadow-md hover:border-[#C2A476]/50 transition-all duration-300 group/space">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] group-hover/space:bg-[#C2A476] border border-[#E8E0D2] group-hover/space:border-[#C2A476] flex items-center justify-center transition-all duration-300 group-hover/space:scale-120 group-hover/space:rotate-12 shadow-2xs">
                        <Compass className="w-4 h-4 text-[#C2A476] group-hover/space:text-white transition-colors duration-300" />
                      </div>
                      <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-xs">
                        {language === "vi" ? "Bố Trí Không Gian & Kiến Trúc Thực Tế" : "Actual Space & Layout"}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {displaySpaceDetails.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2.5 text-xs text-neutral-700 hover:text-neutral-900 hover:translate-x-1.5 transition-all duration-200 group/detail cursor-default">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5 group-hover/detail:scale-125 transition-transform" />
                          <span className="leading-snug">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 🛋 Full Furniture & Included Amenities */}
                {displayFurniture.length > 0 && (
                  <div>
                    <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-xs mb-2.5 flex items-center gap-2 group/furn">
                      <div className="w-6 h-6 rounded-md bg-[#FAF6EE] group-hover/furn:bg-[#C2A476] border border-[#E8E0D2] flex items-center justify-center transition-all duration-300 group-hover/furn:scale-115">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C2A476] group-hover/furn:text-white transition-colors" />
                      </div>
                      <span>{language === "vi" ? "Full Nội Thất & Tiện Nghi Đầy Đủ" : "Full Furniture & Amenities"}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {displayFurniture.map((amenity, i) => (
                        <span
                          key={i}
                          className="bg-white hover:bg-[#C2A476] text-neutral-800 hover:text-white border border-neutral-200 hover:border-[#C2A476] px-3 py-1.5 rounded-xl text-xs font-medium hover:-translate-y-1 hover:shadow-sm transition-all duration-200 cursor-pointer select-none"
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
                    onClick={() => onInquire(effectiveVilla)}
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
          data-lenis-prevent
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
                unoptimized
                sizes="100vw"
                className="object-contain"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
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
                    unoptimized
                    sizes="64px"
                    className="object-cover"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
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
