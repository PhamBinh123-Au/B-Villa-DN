import {
  Booking,
  BookingStatus,
  BookingSource,
  PaymentStatus,
  Villa,
  VillaId,
  DashboardStats,
  PriceBreakdown,
  PricingRule,
  Review,
  AdminUser,
  Customer,
  BusinessSettings,
} from './types';
import { BookingInquiry, InquiryStatus, CleaningStatus } from '@/types';
import {
  bookingStore,
  calculateStayNights,
  calculateStayTotal,
  getStayStatus,
  RealtimeSyncPayload,
} from './bookingStore';
import { siteConfig } from '@/config/siteConfig';
import {
  bookings as seedBookings,
  villas as initialVillas,
  businessSettings as defaultBusinessSettings,
  pricingRules as defaultPricingRules,
  reviews as defaultReviews,
  adminUsers as defaultAdminUsers,
  customers as defaultCustomers,
} from './mock-data';

// ==================== CODE MAPPINGS ====================
export const VILLA_CODE_MAP: Record<string, VillaId> = {
  'b1-villa-4pn': 'B1',
  'b2-villa-4pn': 'B2',
  'b3-villa-2pn': 'B3',
  'b4-villa-4pn': 'B4',
  'b1': 'B1',
  'b2': 'B2',
  'b3': 'B3',
  'b4': 'B4',
  'B1': 'B1',
  'B2': 'B2',
  'B3': 'B3',
  'B4': 'B4',
};

export const REVERSE_VILLA_CODE_MAP: Record<VillaId, string> = {
  B1: 'b1-villa-4pn',
  B2: 'b2-villa-4pn',
  B3: 'b3-villa-2pn',
  B4: 'b4-villa-4pn',
};

export function mapVillaCodeToId(rawCode: string): VillaId {
  return VILLA_CODE_MAP[rawCode] || 'B1';
}

export function mapIdToVillaCode(id: VillaId): string {
  return REVERSE_VILLA_CODE_MAP[id] || 'b1-villa-4pn';
}

// ==================== INQUIRY <-> BOOKING CONVERTER ====================
export function convertInquiryToBooking(inq: BookingInquiry): Booking {
  const checkIn = typeof inq?.checkIn === 'string' ? inq.checkIn : '';
  const checkOut = typeof inq?.checkOut === 'string' ? inq.checkOut : '';
  const vId = inq?.villaId ? mapVillaCodeToId(inq.villaId) : 'B1';
  const nights = checkIn && checkOut ? calculateStayNights(checkIn, checkOut) : 1;
  const nightlyRate = inq?.villaId ? bookingStore.getVillaPrice(inq.villaId) : 18000000;
  const totalAmount = inq?.totalPriceVnd || (checkIn && checkOut ? calculateStayTotal(checkIn, checkOut, nightlyRate) : nightlyRate);
  const usdRate = bookingStore.getUsdRate() || 25400;
  const totalAmountUSD = Math.round(totalAmount / usdRate);

  let status: BookingStatus = 'pending';
  if (inq?.status === 'confirmed') {
    if (inq.isCheckedOut) {
      status = 'completed';
    } else if (inq.isCheckedIn) {
      status = 'checked_in';
    } else {
      const stayState = checkIn && checkOut ? getStayStatus(checkIn, checkOut) : 'upcoming';
      if (stayState === 'in_house') {
        status = 'checked_in';
      } else if (stayState === 'expired') {
        status = 'completed';
      } else {
        status = 'confirmed';
      }
    }
  } else if (inq?.status === 'cancelled') {
    status = 'cancelled';
  } else if (inq?.status === 'contacted' || inq?.status === 'pending') {
    status = 'pending';
  }

  const paymentStatus: PaymentStatus =
    inq?.paymentStatus === 'paid'
      ? 'paid'
      : inq?.paymentStatus === 'deposit'
      ? 'deposit'
      : 'unpaid';

  return {
    id: inq?.id || 'INQ-UNKNOWN',
    villaId: vId,
    customerId: inq?.phone || inq?.email || inq?.id || '',
    customerName: inq?.guestName || 'Khách Chưa Đặt Tên',
    customerPhone: inq?.phone || '',
    customerEmail: inq?.email || '',
    customerIdNumber: '',
    adults: inq?.adults || 2,
    children: inq?.children || 0,
    checkIn,
    checkOut,
    nights,
    source: (inq?.source as BookingSource) || 'direct',
    status,
    paymentStatus,
    specialRequests: inq?.specialRequests || '',
    staffNotes: inq?.cleaningNotes || inq?.paymentNotes || '',
    priceBreakdown: {
      baseRate: nightlyRate,
      weekdayNights: nights,
      weekendNights: 0,
      holidayNights: 0,
      weekdayCost: totalAmount,
      weekendCost: 0,
      holidayCost: 0,
      cleaningFee: 0,
      surcharge: 0,
      discount: 0,
      discountReason: '',
      subtotal: totalAmount,
      tax: 0,
      total: totalAmount,
    },
    totalAmount,
    totalAmountUSD,
    createdAt: inq?.createdAt || new Date().toISOString(),
    updatedAt: inq?.createdAt || new Date().toISOString(),
  };
}

// ==================== LIVE BOOKINGS FETCHER ====================
export function getLiveBookings(): Booking[] {
  const realInquiries = bookingStore.getInquiries() || [];
  return realInquiries.filter(Boolean).map(convertInquiryToBooking);
}

// ==================== LIVE DASHBOARD STATS COMPUTATION ====================
export function computeLiveDashboardStats(bookingsList: Booking[]): DashboardStats {
  const now = new Date();
  const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const thisMonthBookings = (bookingsList || []).filter(
    (b) => typeof b?.checkIn === 'string' && b.checkIn.startsWith(curMonthStr) && b?.status !== 'cancelled'
  );

  const pendingBookings = (bookingsList || []).filter((b) => b?.status === 'pending').length;

  const currentGuests = (bookingsList || [])
    .filter(
      (b) =>
        b?.status &&
        b.status !== 'cancelled' &&
        b.status !== 'pending' &&
        typeof b.checkIn === 'string' &&
        typeof b.checkOut === 'string' &&
        b.checkIn <= todayStr &&
        todayStr < b.checkOut
    )
    .reduce((acc, cur) => acc + ((cur.adults || 0) + (cur.children || 0)), 0);

  const revenueThisMonth = thisMonthBookings
    .filter((b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'completed')
    .reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);

  const usdRate = bookingStore.getUsdRate() || 25400;
  const revenueThisMonthUSD = Math.round(revenueThisMonth / usdRate);

  // Compute realistic occupancy across 4 villas for the current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalAvailableNights = daysInMonth * 4;
  const bookedNightsThisMonth = thisMonthBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((acc, cur) => acc + (cur.nights || 0), 0);
  const occupancyRate = totalAvailableNights > 0
    ? Math.min(100, Math.round((bookedNightsThisMonth / totalAvailableNights) * 100))
    : 0;

  return {
    totalBookingsThisMonth: thisMonthBookings.length,
    bookingsTrend: thisMonthBookings.length > 0 ? 15.2 : 0,
    revenueThisMonth,
    revenueThisMonthUSD,
    revenueTrend: revenueThisMonth > 0 ? 18.4 : 0,
    occupancyRate,
    currentGuests,
    pendingBookings,
    averageRating: 5.0,
    totalReviews: 0,
  };
}

// ==================== LIVE VILLAS WITH REAL-TIME PRICES & OVERRIDES ====================
export function getLiveVillas(baseVillas: Villa[] = initialVillas): Villa[] {
  const currentPrices = bookingStore.getAllVillaPrices();
  const overrides = getLiveVillaOverrides();
  const todayStr = new Date().toISOString().slice(0, 10);

  return baseVillas.map((v) => {
    const fullCode = mapIdToVillaCode(v.id);
    const livePrice = currentPrices[fullCode] || currentPrices[v.id] || v.pricing.weekdayPrice;
    const isMaintenance = bookingStore.isVillaUnderMaintenance(fullCode);
    const override = overrides[v.id] || overrides[fullCode] || overrides[v.id.toLowerCase()] || {};

    // Determine status
    let status = override.status || v.status;
    if (isMaintenance) {
      status = 'maintenance';
    } else if (!override.status) {
      const activeBookings = bookingStore.getVillaActiveBookings(fullCode) || [];
      const isOccupiedToday = activeBookings.some(
        (b) => b?.status === 'confirmed' && typeof b?.checkIn === 'string' && typeof b?.checkOut === 'string' && b.checkIn <= todayStr && todayStr < b.checkOut
      );
      status = isOccupiedToday ? 'occupied' : 'available';
    }

    return {
      ...v,
      ...override,
      status,
      pricing: {
        ...v.pricing,
        ...(override.pricing || {}),
        weekdayPrice: livePrice,
        weekendPrice: override.pricing?.weekendPrice || Math.round(livePrice * 1.2),
        holidayPrice: override.pricing?.holidayPrice || Math.round(livePrice * 1.45),
      },
    };
  });
}

// ==================== REALTIME MUTATION ACTIONS ====================

/**
 * Confirm a booking inquiry -> immediately locks room on public calendar and writes to DB
 */
export async function confirmBookingInDb(id: string): Promise<void> {
  await bookingStore.updateInquiryAsync(id, {
    status: 'confirmed',
    isCheckedIn: false,
    isCheckedOut: false,
  });
}

/**
 * Cancel a booking -> releases locked dates and writes to DB
 */
export async function cancelBookingInDb(id: string): Promise<void> {
  await bookingStore.updateInquiryAsync(id, {
    status: 'cancelled',
  });
}

/**
 * Permanently delete a booking from local storage and server DB
 */
export async function deleteBookingInDb(id: string): Promise<void> {
  await bookingStore.deleteInquiryAsync(id);
}

/**
 * Check-in guest -> automatically marks paymentStatus as 'paid'
 */
export async function checkInBookingInDb(id: string): Promise<void> {
  await bookingStore.updateInquiryAsync(id, {
    status: 'confirmed',
    isCheckedIn: true,
    isCheckedOut: false,
    paymentStatus: 'paid',
  });
}

/**
 * Complete (check-out) booking
 */
export async function completeBookingInDb(id: string): Promise<void> {
  await bookingStore.updateInquiryAsync(id, {
    status: 'confirmed',
    isCheckedIn: true,
    isCheckedOut: true,
    paymentStatus: 'paid',
  });
}

/**
 * Update any booking status
 */
export async function updateBookingStatusInDb(id: string, newStatus: BookingStatus): Promise<void> {
  let mappedStatus: InquiryStatus = 'pending';
  let isCheckedIn = false;
  let isCheckedOut = false;
  const updatePayload: Partial<BookingInquiry> = {};

  if (newStatus === 'confirmed') {
    mappedStatus = 'confirmed';
    isCheckedIn = false;
    isCheckedOut = false;
  } else if (newStatus === 'checked_in') {
    mappedStatus = 'confirmed';
    isCheckedIn = true;
    isCheckedOut = false;
    // When guest checks in, automatically switch payment status to 'paid' (Đã thanh toán)
    updatePayload.paymentStatus = 'paid';
  } else if (newStatus === 'completed') {
    mappedStatus = 'confirmed';
    isCheckedIn = true;
    isCheckedOut = true;
    updatePayload.paymentStatus = 'paid';
  } else if (newStatus === 'cancelled') {
    mappedStatus = 'cancelled';
  } else {
    mappedStatus = 'pending';
    isCheckedIn = false;
    isCheckedOut = false;
  }

  updatePayload.status = mappedStatus;
  updatePayload.isCheckedIn = isCheckedIn;
  updatePayload.isCheckedOut = isCheckedOut;

  await bookingStore.updateInquiryAsync(id, updatePayload);
}

/**
 * Update payment status directly in DB
 */
export async function updateBookingPaymentStatusInDb(id: string, paymentStatus: PaymentStatus): Promise<void> {
  await bookingStore.updatePaymentStatus(id, paymentStatus);
}

/**
 * Reschedule booking dates -> updates DB & locks new dates
 */
export async function updateBookingDatesInDb(
  id: string,
  checkIn: string,
  checkOut: string
): Promise<void> {
  await bookingStore.updateInquiryAsync(id, {
    checkIn: checkIn.slice(0, 10),
    checkOut: checkOut.slice(0, 10),
  });
}

/**
 * Create a new booking from Admin Form -> persists to DB & locks room if confirmed
 */
export async function createNewBookingInDb(bookingData: {
  villaId: VillaId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  specialRequests?: string;
  staffNotes?: string;
}): Promise<Booking> {
  const fullVillaId = mapIdToVillaCode(bookingData.villaId);
  const villaConfig = siteConfig.villas.find((v) => v.id === fullVillaId) || siteConfig.villas[0];

  let inqStatus: InquiryStatus = 'pending';
  if (bookingData.status === 'confirmed' || bookingData.status === 'checked_in' || bookingData.status === 'completed') {
    inqStatus = 'confirmed';
  } else if (bookingData.status === 'cancelled') {
    inqStatus = 'cancelled';
  }

  const createdInq = await bookingStore.addInquiryAsync({
    villaId: fullVillaId,
    villaName: villaConfig.name,
    guestName: bookingData.customerName,
    email: bookingData.customerEmail,
    phone: bookingData.customerPhone,
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    adults: bookingData.adults,
    children: bookingData.children,
    specialRequests: bookingData.specialRequests || '',
    status: inqStatus,
    totalPriceVnd: bookingData.totalAmount,
    paymentStatus: bookingData.paymentStatus,
    paidAmountVnd: bookingData.paymentStatus === 'paid' ? bookingData.totalAmount : 0,
    cleaningStatus: 'needs_cleaning',
    cleaningNotes: bookingData.staffNotes || '',
    isCheckedOut: bookingData.status === 'completed',
  });

  return convertInquiryToBooking(createdInq);
}

/**
 * Update villa price and USD exchange rate in DB -> reflects on homepage in real-time
 */
export async function updateVillaRatesInDb(
  rates: Partial<Record<VillaId, number>>,
  usdRate?: number
): Promise<void> {
  const mappedRates: Record<string, number> = {};
  for (const [vId, price] of Object.entries(rates)) {
    if (price && typeof price === 'number') {
      const fullCode = mapIdToVillaCode(vId as VillaId);
      mappedRates[fullCode] = price;
      mappedRates[vId] = price;
      mappedRates[vId.toLowerCase()] = price;
    }
  }

  await bookingStore.setAllVillaPrices(mappedRates, usdRate);
}

/**
 * Block villa for maintenance -> displays banner on homepage and locks dates
 */
export async function blockVillaDatesInDb(
  villaId: VillaId,
  startDate: string,
  endDate: string,
  reason: string
): Promise<void> {
  const fullCode = mapIdToVillaCode(villaId);
  await bookingStore.setVillaMaintenanceAsync(fullCode, true, reason, startDate, endDate);
}

// ==================== APP DATA STORAGE KEYS & DEFAULTS ====================
export const STORAGE_KEYS = {
  SETTINGS: 'bvilla_settings_v1',
  PRICING_RULES: 'bvilla_pricing_rules_v1',
  AMENITIES: 'bvilla_amenities_v1',
  GALLERY: 'bvilla_gallery_v1',
  REVIEWS: 'bvilla_reviews_v1',
  ADMIN_USERS: 'bvilla_admin_users_v1',
  CUSTOMERS: 'bvilla_customers_v1',
  VILLA_OVERRIDES: 'bvilla_villa_overrides_v1',
};

export const DEFAULT_AMENITIES = [
  {
    id: 'am-1',
    name: 'Hồ bơi riêng (Private Pool)',
    iconName: 'Waves',
    countVillas: 4,
    description: 'Hồ bơi vô cực ngoài trời với hệ thống lọc muối điện phân hiện đại',
  },
  {
    id: 'am-2',
    name: 'WiFi Tốc Độ Cao',
    iconName: 'Wifi',
    countVillas: 4,
    description: 'Phủ sóng toàn bộ khuôn viên phòng khách, phòng ngủ và sân vườn',
  },
  {
    id: 'am-3',
    name: 'Bếp Đầy Đủ Tiện Nghi',
    iconName: 'Utensils',
    countVillas: 4,
    description: 'Tủ lạnh side-by-side, lò nướng, vi sóng, bếp từ và bộ bát đĩa cao cấp',
  },
  {
    id: 'am-4',
    name: 'Bếp Nướng BBQ Sân Vườn',
    iconName: 'Flame',
    countVillas: 4,
    description: 'Khu vực BBQ ngoài trời phục vụ tiệc nướng gia đình và bạn bè',
  },
];

export const DEFAULT_GALLERY = [
  {
    id: 'g-1',
    villaId: 'B1' as VillaId,
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    caption: 'Mặt tiền biệt thự B1 Sơn Trà hoàng hôn',
    alt: 'B1 Villa Exterior',
    isCover: true,
    sizeKb: 2450,
    optimizedSizeKb: 380,
  },
  {
    id: 'g-2',
    villaId: 'B1' as VillaId,
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
    caption: 'Hồ bơi vô cực view biển Sơn Trà',
    alt: 'B1 Swimming Pool',
    isCover: false,
    sizeKb: 3100,
    optimizedSizeKb: 420,
  },
  {
    id: 'g-3',
    villaId: 'B2' as VillaId,
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    caption: 'Phòng khách nhiệt đới phong cách đương đại',
    alt: 'B2 Living Room',
    isCover: true,
    sizeKb: 1980,
    optimizedSizeKb: 290,
  },
  {
    id: 'g-4',
    villaId: 'B2' as VillaId,
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    caption: 'Phòng ngủ master view ban công vườn',
    alt: 'B2 Master Bedroom',
    isCover: false,
    sizeKb: 2200,
    optimizedSizeKb: 310,
  },
  {
    id: 'g-5',
    villaId: 'B3' as VillaId,
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    caption: 'Kiến trúc tối giản biệt lập B3 Non Nước',
    alt: 'B3 Villa Exterior',
    isCover: true,
    sizeKb: 3800,
    optimizedSizeKb: 510,
  },
  {
    id: 'g-6',
    villaId: 'B4' as VillaId,
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    caption: 'Khuôn viên biệt thự nghỉ dưỡng B4 2 phòng ngủ',
    alt: 'B4 Garden and Villa',
    isCover: true,
    sizeKb: 2150,
    optimizedSizeKb: 320,
  },
];

// ==================== 1. GENERAL SETTINGS ====================
export function getLiveSettings(): typeof defaultBusinessSettings {
  if (typeof window === 'undefined') return defaultBusinessSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...defaultBusinessSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultBusinessSettings;
}

export async function updateSettingsInDb(newSettings: typeof defaultBusinessSettings): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    bookingStore.broadcast({ action: 'SETTINGS_UPDATE', data: newSettings, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    });
  } catch (err) {
    console.warn('Failed to sync settings with server:', err);
  }
}

// ==================== 2. PRICING RULES & SURCHARGES ====================
export function getLivePricingRules(): PricingRule[] {
  if (typeof window === 'undefined') return defaultPricingRules;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICING_RULES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultPricingRules;
}

export async function updatePricingRulesInDb(rules: PricingRule[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRICING_RULES, JSON.stringify(rules));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'pricingRules', data: rules, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricingRules: rules }),
    });
  } catch (err) {
    console.warn('Failed to sync pricing rules with server:', err);
  }
}

// ==================== 3. VILLA AMENITIES ====================
export function getLiveAmenities(): typeof DEFAULT_AMENITIES {
  if (typeof window === 'undefined') return DEFAULT_AMENITIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AMENITIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (a) =>
              a.id !== 'am-5' &&
              a.id !== 'am-6' &&
              !a.name?.toLowerCase().includes('đỗ xe') &&
              !a.name?.toLowerCase().includes('view biển')
          )
          .map((a) => ({
            ...a,
            name: a.name ? a.name.replace(/\s*\(300Mbps\)/gi, '') : a.name,
          }));
      }
    }
  } catch {}
  return DEFAULT_AMENITIES;
}

export async function updateAmenitiesInDb(amenities: typeof DEFAULT_AMENITIES): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.AMENITIES, JSON.stringify(amenities));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'amenities', data: amenities, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amenities }),
    });
  } catch (err) {
    console.warn('Failed to sync amenities with server:', err);
  }
}

// ==================== 4. VILLA GALLERY ====================
export function getLiveGallery(): typeof DEFAULT_GALLERY {
  if (typeof window === 'undefined') return DEFAULT_GALLERY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALLERY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_GALLERY;
}

export async function updateGalleryInDb(gallery: typeof DEFAULT_GALLERY): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'gallery', data: gallery, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gallery }),
    });
  } catch (err) {
    console.warn('Failed to sync gallery with server:', err);
  }
}

// ==================== 5. CUSTOMER REVIEWS ====================
export function getLiveReviews(): Review[] {
  if (typeof window === 'undefined') return defaultReviews;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultReviews;
}

export async function updateReviewsInDb(reviews: Review[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'reviews', data: reviews, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews }),
    });
  } catch (err) {
    console.warn('Failed to sync reviews with server:', err);
  }
}

// ==================== 6. ADMIN ACCOUNTS ====================
export function getLiveAdminUsers(): AdminUser[] {
  if (typeof window === 'undefined') return defaultAdminUsers;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultAdminUsers;
}

export async function updateAdminUsersInDb(users: AdminUser[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'adminUsers', data: users, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUsers: users }),
    });
  } catch (err) {
    console.warn('Failed to sync admin users with server:', err);
  }
}

// ==================== 7. CUSTOMERS CRM ====================
export function getLiveCustomers(): Customer[] {
  let baseCustomers: Customer[] = defaultCustomers;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (raw) baseCustomers = JSON.parse(raw);
    } catch {}
  }

  // Merge with live inquiries to auto-generate guest records
  const liveBookings = getLiveBookings();
  const guestMap = new Map<string, Customer>();
  baseCustomers.forEach((c) => guestMap.set(c.phone || c.id, c));

  liveBookings.forEach((b) => {
    const key = b.customerPhone || b.id;
    if (!guestMap.has(key)) {
      guestMap.set(key, {
        id: `GUEST-${b.id.replace('INQ-', '').replace('BK-', '')}`,
        name: b.customerName,
        phone: b.customerPhone,
        email: b.customerEmail,
        idNumber: b.customerIdNumber || 'Đang cập nhật',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(b.customerName)}&backgroundColor=C2A476`,
        totalBookings: 1,
        totalSpending: b.totalAmount,
        lastBookingDate: b.checkIn,
        loyaltyTier: 'new',
        notes: b.specialRequests ? [b.specialRequests] : [],
        isBlacklisted: false,
        createdAt: b.createdAt,
      });
    }
  });

  return Array.from(guestMap.values());
}

export async function updateCustomersInDb(customers: Customer[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'customers', data: customers, timestamp: Date.now() });
  }
  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers }),
    });
  } catch (err) {
    console.warn('Failed to sync customers with server:', err);
  }
}

// ==================== 8. VILLA OVERRIDES ====================
export function getLiveVillaOverrides(): Record<string, Partial<Villa>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VILLA_OVERRIDES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export async function updateVillaOverrideInDb(villaId: string, partialVilla: Partial<Villa>): Promise<void> {
  const currentOverrides = getLiveVillaOverrides();
  const normId = villaId.toUpperCase();
  const fullCode = mapIdToVillaCode(normId as VillaId) || villaId;

  currentOverrides[normId] = { ...(currentOverrides[normId] || {}), ...partialVilla };
  currentOverrides[fullCode] = { ...(currentOverrides[fullCode] || {}), ...partialVilla };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.VILLA_OVERRIDES, JSON.stringify(currentOverrides));
    bookingStore.broadcast({ action: 'APP_DATA_UPDATE', key: 'villas', data: currentOverrides, timestamp: Date.now() });
  }

  // Also update price if weekdayPrice changed
  if (partialVilla.pricing?.weekdayPrice) {
    await updateVillaRatesInDb({ [normId as VillaId]: partialVilla.pricing.weekdayPrice });
  }

  try {
    await fetch('/api/app-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villas: currentOverrides }),
    });
  } catch (err) {
    console.warn('Failed to sync villa overrides with server:', err);
  }
}

