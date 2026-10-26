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
  X,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Navigation,
  ExternalLink,
  MessageCircle,
  Calendar,
  Eye,
} from "lucide-react";

interface VillaCardProps {
  villa: Villa;
  viewMode?: "editorial" | "grid";
  onInquire: (villa: Villa) => void;
  onOpenGallery?: (villa: Villa, photoIndex: number) => void;
}

export const VillaCard: React.FC<VillaCardProps> = ({
  villa,
  viewMode = "editorial",
  onInquire,
  onOpenGallery,
}) => {
  const { t, language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxTab, setLightboxTab] = useState<"gallery" | "details">("gallery");
  const [mounted, setMounted] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(() => DEFAULT_VILLA_PRICES[villa.id] || 3000000);
  const [usdRate, setUsdRate] = useState<number>(DEFAULT_USD_RATE);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState<VillaMaintenanceInfo | undefined>(undefined);
  const [villaOverrides, setVillaOverrides] = useState<Record<string, any>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const photos = villa.gallery && villa.gallery.length > 0 ? villa.gallery : [villa.image];

  // Persistent set of rendered slide indices so once loaded, slides NEVER unmount or turn black
  const [renderedIndices, setRenderedIndices] = useState<Set<number>>(() => {
    const init = new Set<number>([0, 1]);
    if (photos.length > 1) init.add(photos.length - 1);
    return init;
  });

  // Whenever currentPhotoIdx changes, expand rendered indices and prefetch upcoming images into browser cache
  useEffect(() => {
    setRenderedIndices((prev) => {
      const next = new Set(prev);
      const toAdd = [
        currentPhotoIdx,
        (currentPhotoIdx + 1) % photos.length,
        (currentPhotoIdx + 2) % photos.length,
        (currentPhotoIdx + 3) % photos.length,
        (currentPhotoIdx - 1 + photos.length) % photos.length,
      ];
      let changed = false;
      toAdd.forEach((i) => {
        if (!next.has(i)) {
          next.add(i);
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    // Proactive background browser prefetching
    if (typeof window !== "undefined") {
      const prefetchList = [
        (currentPhotoIdx + 1) % photos.length,
        (currentPhotoIdx + 2) % photos.length,
        (currentPhotoIdx + 3) % photos.length,
        (currentPhotoIdx - 1 + photos.length) % photos.length,
      ];
      prefetchList.forEach((idx) => {
        const src = photos[idx];
        if (src) {
          const img = new window.Image();
          img.src = src;
        }
      });
    }
  }, [currentPhotoIdx, photos]);

  // Idle background prefetch for first 6 photos of this villa
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      photos.slice(0, 6).forEach((p) => {
        const img = new window.Image();
        img.src = p;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [photos]);

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
  }, [isLightboxOpen, photos.length]);

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
    setLightboxTab("gallery");
    if (onOpenGallery) {
      onOpenGallery(villa, currentPhotoIdx);
    }
    setIsLightboxOpen(true);
  };

  const handleOpenDetailsModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxTab("details");
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
    maxAdults: myOverride.maxAdults ?? villa.maxAdults ?? (villa.bedrooms === 2 ? 4 : 8),
    maxChildren: myOverride.maxChildren ?? villa.maxChildren ?? (villa.bedrooms === 2 ? 1 : 2),
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
  const displayPoolType = language === "vi" ? (effectiveVilla.poolTypeVi || effectiveVilla.poolType) : effectiveVilla.poolType;
  const mapLink =
    effectiveVilla.mapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      (effectiveVilla.locationVi || effectiveVilla.location) + " Đà Nẵng"
    )}`;

  // Reusable Gallery Showcase Component (Multi-angle interactive slider with true-to-life aspect ratio)
  const renderPhotoGallerySlider = (isEditorial: boolean) => (
    <div
      className={`relative w-full overflow-hidden bg-[#181B1E] cursor-pointer select-none ${
        isEditorial
          ? "lg:col-span-6 xl:col-span-6 aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[480px]"
          : "aspect-[4/3] sm:aspect-[16/10]"
      }`}
      onClick={handleOpenPhotoViewer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hardware-Accelerated Instant Sliding Track (0ms Delay) */}
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(-${currentPhotoIdx * 100}%, 0, 0)`,
        }}
      >
        {photos.map((src, idx) => {
          const isRendered = renderedIndices.has(idx);
          const isCurrent = idx === currentPhotoIdx;

          return (
            <div
              key={idx}
              className="relative min-w-full h-full flex-shrink-0 overflow-hidden bg-[#14171A] flex items-center justify-center"
            >
              {/* Subtle loading shimmer placeholder while downloading */}
              {isRendered && (
                <div className="absolute inset-0 bg-[#181B1E] flex items-center justify-center pointer-events-none z-0">
                  <div className="w-6 h-6 rounded-full border-2 border-[#C2A476]/20 border-t-[#C2A476] animate-spin" />
                </div>
              )}

              {/* Ambient blurred backdrop: only rendered for the active slide */}
              {isCurrent && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${src})` }}
                />
              )}

              {isRendered && (
                <Image
                  src={src}
                  alt={`${displayName} - Photo ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 750px"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  className="relative z-10 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Elegant Bottom Scrim for Title Legibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />

      {/* Top Badges */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 flex gap-2 items-center z-20 flex-wrap">
        <span className="bg-[#14171A]/90 backdrop-blur-md text-[#C2A476] border border-[#C2A476]/35 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
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
      <div className="absolute top-4 sm:top-5 right-4 sm:right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenPhotoViewer}
          className="flex items-center gap-1.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-md"
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
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/55 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextPhoto}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/55 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Dot Progress and Pool Type Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <p className="text-xs text-[#EAE4D7] tracking-wider uppercase font-semibold drop-shadow-sm pointer-events-auto">
              {displayPoolType}
            </p>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {photos.slice(0, 8).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentPhotoIdx
                      ? "w-6 bg-[#C2A476]"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
              {photos.length > 8 && (
                <span className="text-[10px] text-white/80 font-mono self-center ml-0.5">
                  +{photos.length - 8}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Reusable Body Specs & Description Component
  const renderCardBody = (isEditorial: boolean) => (
    <div
      className={`p-5 sm:p-6 lg:p-6 xl:p-7 flex flex-col justify-between bg-white ${
        isEditorial
          ? "lg:col-span-6 xl:col-span-6 border-t lg:border-t-0 lg:border-l border-[#EAE5DC]"
          : "flex-1"
      }`}
    >
      <div>
        {/* Eyebrow & Directions Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#A88856]">
            {displayDistrict} • {effectiveVilla.bedrooms} {language === "vi" ? "Phòng Ngủ" : "Bedrooms"}
          </span>

          {/* Google Maps Directions Link */}
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#C2A476] text-[#8A6B3D] hover:text-white border border-[#EAE5DC] hover:border-[#C2A476] text-[11px] font-bold transition-all duration-300 shadow-2xs shrink-0 active:scale-95 group/map cursor-pointer"
            title={language === "vi" ? `Xem chỉ đường Google Maps tới ${displayName}` : `Get Google Maps directions to ${displayName}`}
          >
            <Navigation className="w-3 h-3 text-[#C2A476] group-hover/map:text-white transition-colors" />
            <span>{language === "vi" ? "Chỉ đường" : "Map"}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/map:opacity-100 group-hover/map:text-white transition-opacity" />
          </a>
        </div>

        {/* Villa Name */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug mb-1">
          {displayName}
        </h3>

        {/* Tagline / Subtitle */}
        {displayTagline && (
          <p className="text-xs font-medium text-neutral-500 mb-2 line-clamp-1 italic">
            "{displayTagline}"
          </p>
        )}

        {/* Address Location */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 mb-3">
          <div className="w-4 h-4 rounded-md bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-2.5 h-2.5 text-[#C2A476]" />
          </div>
          <span className="font-medium text-neutral-700 truncate">{displayLocation}</span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3.5 font-light">
          {displayDescription}
        </p>

        {/* Visual Specs Bar (Framed by border-y border-[#EAE5DC]) */}
        <div className="grid grid-cols-4 gap-2 py-2 px-1.5 border-y border-[#EAE5DC] text-center my-3 bg-[#FAF8F5]/70 rounded-2xl">
          {/* 1. Bedrooms */}
          <div className="group/spec flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
            <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] flex items-center justify-center mb-1 transition-all duration-300 shadow-2xs">
              <Bed className="w-3.5 h-3.5 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-tight">
              {effectiveVilla.bedrooms} {language === "vi" ? "Phòng" : "Beds"}
            </span>
            <span className="text-[9px] text-neutral-500 font-medium mt-0.5">
              {language === "vi" ? "Khép kín" : "Suites"}
            </span>
          </div>

          {/* 2. Bathrooms */}
          <div className="group/spec flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
            <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] flex items-center justify-center mb-1 transition-all duration-300 shadow-2xs">
              <Bath className="w-3.5 h-3.5 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-tight">
              {effectiveVilla.bathrooms} {language === "vi" ? "Tắm" : "Baths"}
            </span>
            <span className="text-[9px] text-neutral-500 font-medium mt-0.5">
              {language === "vi" ? "Hiện đại" : "En-suite"}
            </span>
          </div>

          {/* 3. Guests (Adults & Children) */}
          <div
            className="group/spec flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
            title={
              language === "vi"
                ? `Sức chứa tiêu chuẩn: ${effectiveVilla.maxAdults} Người lớn + ${effectiveVilla.maxChildren} Trẻ em`
                : `Capacity: ${effectiveVilla.maxAdults} Adults + ${effectiveVilla.maxChildren} Children`
            }
          >
            <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] flex items-center justify-center mb-1 transition-all duration-300 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
            </div>
            <span className="text-[11px] sm:text-xs font-extrabold text-neutral-800 leading-tight whitespace-nowrap">
              {effectiveVilla.maxChildren && effectiveVilla.maxChildren > 0
                ? (language === "vi"
                    ? `${effectiveVilla.maxAdults} Lớn • ${effectiveVilla.maxChildren} Trẻ`
                    : `${effectiveVilla.maxAdults} Ad • ${effectiveVilla.maxChildren} Ch`)
                : `${effectiveVilla.maxAdults} ${language === "vi" ? "Người lớn" : "Adults"}`}
            </span>
            <span className="text-[9px] text-neutral-500 font-medium mt-0.5">
              {language === "vi" ? "Sức chứa" : "Capacity"}
            </span>
          </div>

          {/* 4. Pool */}
          <div className="group/spec flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-white/80 hover:bg-white border border-[#EAE5DC]/60 hover:border-[#C2A476] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none">
            <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] group-hover/spec:bg-gradient-to-br group-hover/spec:from-[#C2A476] group-hover/spec:to-[#8A6B3D] border border-[#E8E0D2] flex items-center justify-center mb-1 transition-all duration-300 shadow-2xs">
              <Waves className="w-3.5 h-3.5 text-[#C2A476] group-hover/spec:text-white transition-colors duration-300" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-neutral-800 leading-tight">
              {language === "vi" ? "Hồ Bơi" : "Private"}
            </span>
            <span className="text-[9px] text-neutral-500 font-medium mt-0.5">
              {language === "vi" ? "Riêng" : "Pool"}
            </span>
          </div>
        </div>

        {/* Villa Nightly Rate with Live USD Conversion */}
        <div className="my-3 p-3 sm:p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between shadow-2xs hover:shadow-md hover:border-[#C2A476] transition-all duration-300">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-0.5">
              {language === "vi" ? "Đơn giá tiêu chuẩn" : "Standard Nightly Rate"}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                suppressHydrationWarning
                className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight"
              >
                {formatPriceVnd(currentPrice)}
              </span>
              <span className="text-xs text-neutral-600 font-medium">
                {language === "vi" ? "/ đêm" : "/ night"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-0.5">
              {language === "vi" ? "Quy đổi tương đương" : "USD Equivalent"}
            </span>
            <span
              suppressHydrationWarning
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold font-mono shadow-2xs"
            >
              ≈ ${formatPriceUsd(currentPrice, usdRate)} USD
            </span>
          </div>
        </div>

        {/* Highlights List */}
        <ul className="space-y-1.5 mb-3">
          {displayHighlights.slice(0, 2).map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-neutral-700 leading-snug"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2 h-2 text-[#C2A476]" />
              </div>
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>

        {/* Suitable For Banner */}
        {displaySuitableFor && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center gap-2 text-neutral-700">
            <div className="w-5 h-5 rounded-lg bg-[#FAF6EE] border border-[#E8E0D2] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#C2A476]" />
            </div>
            <span className="font-medium text-xs leading-tight text-neutral-800 truncate">
              {displaySuitableFor}
            </span>
          </div>
        )}

        {/* Scheduled Maintenance Banner */}
        {mounted && isUnderMaintenance && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
            <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                {language === "vi" ? "Chế Độ Bảo Trì Định Kỳ" : "Scheduled Maintenance Mode"}
              </p>
              {maintenanceInfo?.startDate && maintenanceInfo?.endDate && (
                <p className="text-[11px] font-bold text-amber-900 mt-0.5">
                  📅 {maintenanceInfo.startDate} → {maintenanceInfo.endDate}
                </p>
              )}
              <p className="text-[11px] text-amber-800 font-light mt-0.5 leading-relaxed">
                {maintenanceInfo?.reason || (language === "vi" ? "Biệt thự đang trong giai đoạn nâng cấp định kỳ. Tạm dừng nhận đặt phòng." : "This villa is undergoing scheduled luxury maintenance & renovation. Reservations are temporarily closed.")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 w-full">
          {/* Secondary Button: "Xem chi tiết / Khám phá không gian" */}
          <button
            type="button"
            onClick={handleOpenDetailsModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 xl:px-4 py-2.5 sm:py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 hover:text-neutral-950 border border-neutral-300 hover:border-neutral-900 text-xs font-semibold tracking-wide transition-all duration-300 shadow-2xs hover:shadow-sm active:scale-95 cursor-pointer shrink-0"
            title={language === "vi" ? "Khám phá không gian & toàn bộ ảnh thực tế" : "Explore space & full gallery"}
          >
            <Eye className="w-3.5 h-3.5 text-[#C2A476] shrink-0" />
            <span className="hidden xl:inline">
              {language === "vi" ? "Khám Phá Không Gian" : "Explore Space"}
            </span>
            <span className="xl:hidden">
              {language === "vi" ? "Khám Phá" : "Explore"}
            </span>
          </button>

          {/* Primary CTA Button: "ĐẶT PHÒNG NGAY" (Consistent with Header Capsule CTA) */}
          {mounted && isUnderMaintenance ? (
            <button
              type="button"
              disabled
              className="flex-1 min-w-0 bg-neutral-200 text-neutral-500 py-2.5 sm:py-3 px-3 sm:px-4 rounded-full text-xs font-semibold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1.5 border border-neutral-300 shadow-none shrink"
            >
              <Wrench className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{t("villas.maintenance_badge", "Under Maintenance")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onInquire(effectiveVilla)}
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-bold uppercase tracking-wider xl:tracking-widest px-3 sm:px-4 xl:px-5 py-2.5 sm:py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer shrink"
            >
              <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate">
                {t("nav.inquire", language === "vi" ? "ĐẶT PHÒNG NGAY" : "BOOK NOW")}
              </span>
            </button>
          )}

          {/* Quick Zalo Chat Button */}
          <a
            href={siteConfig.social.zalo}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0068FF]/10 hover:bg-[#0068FF] text-[#0068FF] hover:text-white border border-[#0068FF]/25 hover:border-[#0068FF] transition-all flex items-center justify-center text-xs font-bold shadow-2xs hover:shadow-md cursor-pointer shrink-0 active:scale-95"
            title={language === "vi" ? "Chat Zalo tư vấn trực tiếp" : "Chat on Zalo"}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
          </a>

          {/* Inline Space Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-neutral-200 hover:border-neutral-800 text-neutral-600 hover:text-neutral-900 transition-all flex items-center justify-center cursor-pointer shrink-0 active:scale-95"
            title={language === "vi" ? "Mở rộng tiện nghi ngay trên thẻ" : "Expand amenities inline"}
          >
            <ChevronRight
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                showDetails ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {/* Expandable Inline Details Drawer */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-700 space-y-4 animate-fade-in">
            {/* Real Space Layout Breakdown */}
            {displaySpaceDetails.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{language === "vi" ? "Bố Trí Không Gian Thực Tế" : "Actual Space Layout"}</span>
                </div>
                <ul className="space-y-1.5">
                  {displaySpaceDetails.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2 text-xs text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Furniture & Amenities Tags */}
            {displayFurniture.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{language === "vi" ? "Full Nội Thất & Tiện Nghi" : "Full Furniture & Amenities"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {displayFurniture.map((amenity, i) => (
                    <span
                      key={i}
                      className="bg-white text-neutral-800 border border-neutral-200 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Villa Showcase Card - Editorial (Horizontal 7/5 Grid) or Standard Grid */}
      {viewMode === "editorial" ? (
        <div className="group bg-white rounded-3xl overflow-hidden border border-[#EAE5DC] shadow-sm hover:shadow-2xl transition-all duration-500 grid grid-cols-1 lg:grid-cols-12">
          {renderPhotoGallerySlider(true)}
          {renderCardBody(true)}
        </div>
      ) : (
        <div className="group bg-white rounded-3xl overflow-hidden border border-[#EAE5DC] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
          {renderPhotoGallerySlider(false)}
          {renderCardBody(false)}
        </div>
      )}

      {/* Fullscreen Luxury Lightbox & Space Explorer Modal */}
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
            className="flex items-center justify-between z-10 gap-3 border-b border-white/10 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#C2A476] text-black font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {villa.code}
                </span>
                <h3 className="font-bold text-white text-base sm:text-lg truncate">
                  {displayName}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">
                {currentPhotoIdx + 1} / {photos.length} {language === "vi" ? "Ảnh Thực Tế Sắc Nét" : "High-Res Photos"} • {displayLocation}
              </p>
            </div>

            {/* Mode Switcher inside Lightbox: Photos vs Space Details */}
            <div className="hidden sm:flex items-center bg-white/10 p-1 rounded-full border border-white/15">
              <button
                type="button"
                onClick={() => setLightboxTab("gallery")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  lightboxTab === "gallery"
                    ? "bg-[#C2A476] text-black shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                📸 {language === "vi" ? "Album Ảnh" : "Photos"} ({photos.length})
              </button>
              <button
                type="button"
                onClick={() => setLightboxTab("details")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  lightboxTab === "details"
                    ? "bg-[#C2A476] text-black shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                🏡 {language === "vi" ? "Không Gian & Tiện Nghi" : "Space & Specs"}
              </button>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  onInquire(effectiveVilla);
                }}
                className="inline-flex items-center gap-1.5 bg-[#C2A476] hover:bg-[#a88a59] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === "vi" ? "Đặt Phòng Ngay" : "Book Now"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer"
                aria-label="Close fullscreen gallery"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Central Modal Content: Gallery Slider OR Rich Space Details */}
          {lightboxTab === "gallery" ? (
            <div
              className="relative flex-1 flex items-center justify-center my-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Main Image */}
              <div className="relative w-full h-[60vh] sm:h-[72vh] max-w-5xl">
                <Image
                  src={photos[currentPhotoIdx]}
                  alt={`${displayName} - Photo ${currentPhotoIdx + 1}`}
                  fill
                  priority
                  quality={92}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-contain"
                />
              </div>

              {/* Next Button */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-6 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          ) : (
            /* Space & Specifications Tab */
            <div
              className="flex-1 my-4 overflow-y-auto max-w-4xl mx-auto w-full p-4 sm:p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md text-neutral-200 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{displayName}</h4>
                <p className="text-sm text-neutral-300 leading-relaxed font-light">{displayDescription}</p>
              </div>

              {/* Space Layout */}
              {displaySpaceDetails.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 font-bold text-[#C2A476] text-xs uppercase tracking-wider mb-3">
                    <Compass className="w-4 h-4" />
                    <span>{language === "vi" ? "Bố Trí Kiến Trúc & Không Gian" : "Architecture & Space Layout"}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {displaySpaceDetails.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Furniture Amenities */}
              {displayFurniture.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 font-bold text-[#C2A476] text-xs uppercase tracking-wider mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === "vi" ? "Nội Thất & Tiện Nghi Đầy Đủ" : "Full Amenities & Inclusions"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayFurniture.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nightly Rate Summary inside Lightbox */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block">
                    {language === "vi" ? "Đơn giá tiêu chuẩn" : "Standard Rate"}
                  </span>
                  <div className="text-lg font-extrabold text-white">
                    {formatPriceVnd(currentPrice)} <span className="text-xs font-normal text-neutral-400">/ đêm</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLightboxOpen(false);
                    onInquire(effectiveVilla);
                  }}
                  className="bg-[#C2A476] hover:bg-[#a88a59] text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full shadow-lg transition-all"
                >
                  {language === "vi" ? "Đặt Villa Này" : "Book This Villa"}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Thumbnail Strip (When in gallery mode) */}
          {lightboxTab === "gallery" && (
            <div
              className="z-10 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 max-w-5xl mx-auto w-full overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 justify-start sm:justify-center overflow-x-auto py-1">
                {photos.map((pic, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setCurrentPhotoIdx(pIdx)}
                    className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      pIdx === currentPhotoIdx
                        ? "border-[#C2A476] scale-105 ring-2 ring-[#C2A476]/40"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={pic}
                      alt={`thumbnail ${pIdx + 1}`}
                      fill
                      quality={60}
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
          )}
        </div>
      )}
    </>
  );
};
