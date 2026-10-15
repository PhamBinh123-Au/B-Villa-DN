// ==================== VILLA TYPES ====================
export type VillaId = 'B1' | 'B2' | 'B3' | 'B4';

export type VillaStatus = 'available' | 'occupied' | 'maintenance' | 'blocked';

export interface Villa {
  id: VillaId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area: number; // m²
  hasPool: boolean;
  amenities: string[];
  highlightFeatures: string[];
  images: VillaImage[];
  coverImageIndex: number;
  pricing: VillaPricing;
  status: VillaStatus;
  seoTitle: string;
  seoDescription: string;
  mapUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface VillaImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  order: number;
}

export interface VillaPricing {
  weekdayPrice: number; // VND
  weekendPrice: number;
  holidayPrice: number;
  minimumNights: number;
  depositPercentage: number;
  cleaningFee: number;
}

// ==================== BOOKING TYPES ====================
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export type BookingSource = 'direct' | 'phone' | 'airbnb' | 'booking_com' | 'agoda';

export type PaymentStatus = 'unpaid' | 'deposit' | 'paid';

export interface Booking {
  id: string; // BVN-2025-001 format
  villaId: VillaId;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerIdNumber: string; // CCCD/Passport
  adults: number;
  children: number;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nights: number;
  source: BookingSource;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests: string;
  staffNotes: string;
  priceBreakdown: PriceBreakdown;
  totalAmount: number; // VND
  totalAmountUSD: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceBreakdown {
  baseRate: number;
  weekdayNights: number;
  weekendNights: number;
  holidayNights: number;
  weekdayCost: number;
  weekendCost: number;
  holidayCost: number;
  cleaningFee: number;
  surcharge: number;
  discount: number;
  discountReason: string;
  subtotal: number;
  tax: number;
  total: number;
}

// ==================== CUSTOMER TYPES ====================
export type LoyaltyTier = 'new' | 'regular' | 'vip';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  avatar: string;
  totalBookings: number;
  totalSpending: number; // VND
  lastBookingDate: string;
  loyaltyTier: LoyaltyTier;
  notes: string[];
  isBlacklisted: boolean;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  author: string;
  createdAt: string;
}

// ==================== REVIEW TYPES ====================
export type ReviewSource = 'google' | 'airbnb' | 'booking_com' | 'direct';

export type ReviewStatus = 'published' | 'hidden' | 'flagged';

export interface Review {
  id: string;
  villaId: VillaId;
  customerId: string;
  customerName: string;
  source: ReviewSource;
  rating: number; // 1-5
  content: string;
  staffResponse: string;
  stayCheckIn: string;
  stayCheckOut: string;
  status: ReviewStatus;
  isFeatured: boolean;
  createdAt: string;
  respondedAt: string;
}

// ==================== FINANCE TYPES ====================
export interface RevenueData {
  date: string;
  villaId: VillaId;
  bookingId: string;
  customerName: string;
  nights: number;
  revenue: number;
  paymentStatus: PaymentStatus;
  source: BookingSource;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  averageRevPerNight: number;
  revenueByVilla: Record<VillaId, number>;
  bookingsBySource: Record<BookingSource, number>;
  topCustomers: { name: string; spending: number }[];
}

// ==================== AUTH TYPES ====================
export type AdminRole = 'super_admin' | 'manager' | 'staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType = 'booking' | 'review' | 'system' | 'payment' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

// ==================== SETTINGS TYPES ====================
export interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currencyPrimary: string;
  currencySecondary: string;
  timezone: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  taxRate: number;
  logo: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'early_bird' | 'last_minute' | 'long_stay' | 'seasonal';
  discountPercentage: number;
  conditions: string;
  villaIds: VillaId[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ==================== DASHBOARD TYPES ====================
export interface DashboardStats {
  totalBookingsThisMonth: number;
  bookingsTrend: number; // percentage
  revenueThisMonth: number;
  revenueThisMonthUSD: number;
  revenueTrend: number;
  occupancyRate: number;
  currentGuests: number;
  pendingBookings: number;
  averageRating: number;
  totalReviews: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'booking' | 'review' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  link: string;
}

// ==================== CHART DATA TYPES ====================
export interface RevenueChartData {
  month: string;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
}

export interface OccupancyHeatmapData {
  date: string;
  B1: boolean;
  B2: boolean;
  B3: boolean;
  B4: boolean;
  occupancyRate: number;
}

export interface BookingSourceData {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export interface VillaComparisonData {
  villa: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}
