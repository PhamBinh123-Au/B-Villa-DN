export interface Villa {
  id: string;
  name: string;
  nameVi?: string;
  code: string; // e.g. "B1", "B2", "B3", "B4"
  tagline: string;
  taglineVi?: string;
  fullTitle?: string;
  fullTitleVi?: string;
  location: string;
  locationVi?: string;
  district: string;
  districtVi?: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;
  area?: number;
  poolType: string;
  poolTypeVi?: string;
  image: string;
  gallery: string[];
  description: string;
  descriptionVi?: string;
  highlights: string[];
  highlightsVi?: string[];
  amenities: string[];
  amenitiesVi?: string[];
  priceVnd?: number; // Base nightly rate in VND
  spaceDetails?: string[];
  spaceDetailsVi?: string[];
  furnitureAmenities?: string[];
  furnitureAmenitiesVi?: string[];
  suitableFor?: string;
  suitableForVi?: string;
  mapUrl?: string; // Google Maps directions link for the villa
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "all" | "pool" | "bedroom" | "exterior" | "dining";
  categoryLabel: string;
  src: string;
  villaCode: string;
  description: string;
}

export type InquiryStatus = "pending" | "contacted" | "confirmed" | "cancelled";
export type CleaningStatus = "needs_cleaning" | "in_cleaning" | "cleaned";
export type PaymentStatus = "unpaid" | "paid" | "deposit";

export interface BookingInquiry {
  id: string;
  villaId: string;
  villaName: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string;
  status: InquiryStatus;
  createdAt: string;
  cleaningStatus?: CleaningStatus; // Housekeeping turnover status after stay expiration
  cleaningNotes?: string;
  cleanedAt?: string;
  totalPriceVnd?: number; // Total calculated or custom stay price in VND
  paymentStatus?: PaymentStatus; // "unpaid" (Chưa thu) | "paid" (Đã thu) | "deposit" (Đã cọc)
  paidAmountVnd?: number; // Amount collected so far
  paymentNotes?: string; // e.g. "Chuyển khoản Vietcombank"
  source?: string; // "direct" | "ota_booking" | "ota_agoda" | "ota_airbnb" | "phone"
  isCheckedIn?: boolean; // True when guest has checked in
  checkedInAt?: string;
  isCheckedOut?: boolean; // True when guest has checked out / moved to turnover section
  checkedOutAt?: string;
}

export interface VillaPriceConfig {
  prices: Record<string, number>; // villaId -> priceVnd
  usdRate: number; // e.g. 25400 VND = 1 USD
  updatedAt?: string;
}

export interface VillaMaintenanceInfo {
  villaId: string;
  isMaintenance: boolean;
  reason?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  updatedAt?: string;
}

export interface AmenityItem {
  icon: string;
  title: string;
  description: string;
}

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
  admin: {
    portalPath: string;
    passcode?: string;
  };
  social: {
    zalo?: string;
    instagram?: string;
    facebook: string;
    facebookPersonal?: string;
    tiktok: string;
  };
  heroSlides?: HeroSlide[];
  villas: Villa[];
  amenities: AmenityItem[];
  galleryItems: GalleryItem[];
}
