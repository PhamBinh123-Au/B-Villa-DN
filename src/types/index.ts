export interface Villa {
  id: string;
  name: string;
  code: string; // e.g. "B1", "B2", "B3", "B4"
  tagline: string;
  location: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  poolType: string;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  amenities: string[];
  priceVnd?: number; // Base nightly rate in VND
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
  updatedAt?: string;
}

export interface AmenityItem {
  icon: string;
  title: string;
  description: string;
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
    passcode: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  villas: Villa[];
  amenities: AmenityItem[];
  galleryItems: GalleryItem[];
}
