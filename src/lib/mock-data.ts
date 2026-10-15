import {
  Villa,
  Booking,
  Customer,
  Review,
  AdminUser,
  Notification,
  ActivityFeedItem,
  DashboardStats,
  RevenueChartData,
  BookingSourceData,
  VillaComparisonData,
  BusinessSettings,
  PricingRule,
  ActivityLog,
  RevenueData,
  MonthlyReport,
  VillaId,
  BookingStatus,
  BookingSource,
  PaymentStatus,
  ReviewSource,
  LoyaltyTier,
} from './types';

// ==================== VILLAS ====================
export const villas: Villa[] = [
  {
    id: 'B1',
    name: 'Biệt Thự B1 - Sơn Trà Premium',
    nameEn: 'B1 Villa - Son Tra Premium',
    description: 'Biệt thự 4 phòng ngủ cao cấp với hồ bơi riêng, tọa lạc tại bán đảo Sơn Trà với tầm nhìn ra biển tuyệt đẹp.',
    descriptionEn: 'Premium 4-bedroom villa with private pool, located on Son Tra Peninsula with stunning ocean views.',
    location: 'Sơn Trà',
    address: '15 Đường Hoàng Sa, Thọ Quang, Sơn Trà, Đà Nẵng',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 10,
    area: 350,
    hasPool: true,
    amenities: ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Điều hòa', 'Bếp đầy đủ', 'Chỗ đỗ xe', 'BBQ', 'Máy giặt', 'Sân vườn', 'View biển'],
    highlightFeatures: ['Hồ bơi vô cực view biển', 'Phòng khách rộng 80m²', 'Sân thượng BBQ riêng', 'Cách biển 200m'],
    images: [
      { id: 'b1-1', url: '/images/b1-1.jpg', alt: 'B1 Villa exterior', caption: 'Mặt tiền biệt thự B1', order: 0 },
      { id: 'b1-2', url: '/images/b1-2.jpg', alt: 'B1 Pool', caption: 'Hồ bơi riêng', order: 1 },
      { id: 'b1-3', url: '/images/b1-3.jpg', alt: 'B1 Living room', caption: 'Phòng khách', order: 2 },
    ],
    coverImageIndex: 0,
    pricing: {
      weekdayPrice: 18000000,
      weekendPrice: 22000000,
      holidayPrice: 27000000,
      minimumNights: 2,
      depositPercentage: 50,
      cleaningFee: 500000,
    },
    status: 'available',
    seoTitle: 'B1 Villa Sơn Trà - Biệt thự cao cấp Đà Nẵng',
    seoDescription: 'Biệt thự 4 phòng ngủ với hồ bơi riêng tại Sơn Trà, Đà Nẵng',
    mapUrl: 'https://maps.google.com/?q=16.1180,108.2700',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'B2',
    name: 'Biệt Thự B2 - Ngũ Hành Sơn Retreat',
    nameEn: 'B2 Villa - Ngu Hanh Son Retreat',
    description: 'Biệt thự 4 phòng ngủ yên tĩnh gần biển Non Nước, thiết kế phong cách nhiệt đới hiện đại.',
    descriptionEn: '4-bedroom tranquil villa near Non Nuoc Beach, modern tropical design.',
    location: 'Ngũ Hành Sơn',
    address: '28 Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    area: 300,
    hasPool: true,
    amenities: ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Điều hòa', 'Bếp đầy đủ', 'Chỗ đỗ xe', 'Máy giặt', 'Sân vườn'],
    highlightFeatures: ['Gần biển Non Nước 5 phút', 'Sân vườn nhiệt đới 200m²', 'Phòng ngủ master view vườn', 'Khu BBQ ngoài trời'],
    images: [
      { id: 'b2-1', url: '/images/b2-1.jpg', alt: 'B2 Villa exterior', caption: 'Mặt tiền biệt thự B2', order: 0 },
      { id: 'b2-2', url: '/images/b2-2.jpg', alt: 'B2 Pool', caption: 'Hồ bơi riêng', order: 1 },
    ],
    coverImageIndex: 0,
    pricing: {
      weekdayPrice: 15000000,
      weekendPrice: 18000000,
      holidayPrice: 22500000,
      minimumNights: 2,
      depositPercentage: 50,
      cleaningFee: 400000,
    },
    status: 'occupied',
    seoTitle: 'B2 Villa Ngũ Hành Sơn - Biệt thự nghỉ dưỡng Đà Nẵng',
    seoDescription: 'Biệt thự 4 phòng ngủ gần biển Non Nước, Đà Nẵng',
    mapUrl: 'https://maps.google.com/?q=15.9940,108.2560',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-05-20T00:00:00Z',
  },
  {
    id: 'B3',
    name: 'Biệt Thự B3 - Sơn Trà Harmony',
    nameEn: 'B3 Villa - Son Tra Harmony',
    description: 'Biệt thự 4 phòng ngủ phong cách Á Đông với hồ bơi và sân vườn rộng, view núi Sơn Trà.',
    descriptionEn: '4-bedroom Asian-inspired villa with pool and spacious garden, Son Tra mountain views.',
    location: 'Sơn Trà',
    address: '42 Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 10,
    area: 320,
    hasPool: true,
    amenities: ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Điều hòa', 'Bếp đầy đủ', 'Chỗ đỗ xe', 'BBQ', 'Máy giặt', 'Sân vườn', 'Phòng gym'],
    highlightFeatures: ['Thiết kế Á Đông đặc trưng', 'Hồ bơi 15m', 'View núi Sơn Trà', 'Phòng gym riêng'],
    images: [
      { id: 'b3-1', url: '/images/b3-1.jpg', alt: 'B3 Villa exterior', caption: 'Mặt tiền biệt thự B3', order: 0 },
    ],
    coverImageIndex: 0,
    pricing: {
      weekdayPrice: 16000000,
      weekendPrice: 20000000,
      holidayPrice: 24000000,
      minimumNights: 2,
      depositPercentage: 50,
      cleaningFee: 450000,
    },
    status: 'available',
    seoTitle: 'B3 Villa Sơn Trà - Biệt thự phong cách Á Đông',
    seoDescription: 'Biệt thự 4 phòng ngủ phong cách Á Đông tại Sơn Trà, Đà Nẵng',
    mapUrl: 'https://maps.google.com/?q=16.0650,108.2450',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
  },
  {
    id: 'B4',
    name: 'Biệt Thự B4 - Ngũ Hành Sơn Cozy',
    nameEn: 'B4 Villa - Ngu Hanh Son Cozy',
    description: 'Biệt thự 2 phòng ngủ ấm cúng, phù hợp cho cặp đôi và gia đình nhỏ, gần biển.',
    descriptionEn: '2-bedroom cozy villa, perfect for couples and small families, near the beach.',
    location: 'Ngũ Hành Sơn',
    address: '56 Đường An Thượng, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    area: 180,
    hasPool: true,
    amenities: ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Điều hòa', 'Bếp nhỏ', 'Chỗ đỗ xe', 'Máy giặt'],
    highlightFeatures: ['Thiết kế ấm cúng', 'Hồ bơi nhỏ xinh', 'Cách biển 3 phút đi bộ', 'Phù hợp cặp đôi'],
    images: [
      { id: 'b4-1', url: '/images/b4-1.jpg', alt: 'B4 Villa exterior', caption: 'Mặt tiền biệt thự B4', order: 0 },
    ],
    coverImageIndex: 0,
    pricing: {
      weekdayPrice: 10000000,
      weekendPrice: 12000000,
      holidayPrice: 15000000,
      minimumNights: 1,
      depositPercentage: 50,
      cleaningFee: 300000,
    },
    status: 'available',
    seoTitle: 'B4 Villa Ngũ Hành Sơn - Biệt thự nhỏ xinh Đà Nẵng',
    seoDescription: 'Biệt thự 2 phòng ngủ ấm cúng gần biển tại Ngũ Hành Sơn, Đà Nẵng',
    mapUrl: 'https://maps.google.com/?q=16.0310,108.2400',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
];

// ==================== CUSTOMERS ====================
const vietnameseNames = [
  'Nguyễn Văn Minh', 'Trần Thị Hương', 'Lê Hoàng Nam', 'Phạm Thị Mai', 'Hoàng Đức Trí',
  'Vũ Thị Lan', 'Đặng Quốc Bảo', 'Bùi Thanh Hà', 'Đỗ Minh Tuấn', 'Ngô Thị Ngọc',
  'Dương Văn Hùng', 'Lý Thị Phượng', 'Trương Công Danh', 'Mai Thị Thảo', 'Phan Văn Đức',
  'Hồ Thị Yến', 'Đinh Văn Long', 'Tô Thị Kim', 'Lâm Quốc Việt', 'Châu Thị Mỹ',
  'Nguyễn Hoàng Sơn', 'Trần Minh Châu', 'Lê Thị Bích Ngọc', 'Phạm Đình Khoa', 'Hoàng Thị Diệu',
  'Vũ Đức Anh', 'Đặng Thị Thu Trang', 'Bùi Văn Khải', 'Đỗ Thị Hồng Nhung', 'Ngô Quang Hải',
  'Cao Thị Mộng Tuyền', 'Trịnh Văn Phú', 'Lưu Thị Thanh Thủy', 'Tạ Minh Quân',
];

const phoneNumbers = [
  '0901234567', '0912345678', '0923456789', '0934567890', '0945678901',
  '0856789012', '0867890123', '0878901234', '0389012345', '0390123456',
  '0701234567', '0762345678', '0773456789', '0584567890', '0595678901',
  '0366789012', '0377890123', '0388901234', '0569012345', '0570123456',
  '0801234567', '0812345678', '0823456789', '0834567890', '0845678901',
  '0556789012', '0567890123', '0578901234', '0589012345', '0590123456',
  '0321234567', '0332345678', '0343456789', '0354567890',
];

export const customers: Customer[] = vietnameseNames.map((name, i) => {
  const totalBookings = Math.floor(Math.random() * 8) + 1;
  const totalSpending = totalBookings * (Math.floor(Math.random() * 30) + 10) * 1000000;
  const loyaltyTiers: LoyaltyTier[] = ['new', 'regular', 'vip'];
  const tier = totalBookings >= 5 ? 'vip' : totalBookings >= 2 ? 'regular' : 'new';

  return {
    id: `KH-${String(i + 1).padStart(3, '0')}`,
    name,
    phone: phoneNumbers[i],
    email: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '.')}@gmail.com`,
    idNumber: `0${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=C2A476`,
    totalBookings,
    totalSpending,
    lastBookingDate: new Date(2025, Math.floor(Math.random() * 6) + 3, Math.floor(Math.random() * 28) + 1).toISOString(),
    loyaltyTier: tier,
    notes: [],
    isBlacklisted: false,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  };
});

// ==================== BOOKINGS ====================
const bookingStatuses: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'];
const bookingSources: BookingSource[] = ['direct', 'phone', 'airbnb', 'booking_com', 'agoda'];
const villaIds: VillaId[] = ['B1', 'B2', 'B3', 'B4'];

function generateBookings(): Booking[] {
  const bookings: Booking[] = [];

  for (let i = 0; i < 55; i++) {
    const villaId = villaIds[Math.floor(Math.random() * villaIds.length)];
    const villa = villas.find(v => v.id === villaId)!;
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const source = bookingSources[Math.floor(Math.random() * bookingSources.length)];

    // Generate dates within last 6 months to next 2 months
    const monthOffset = Math.floor(Math.random() * 8) - 6;
    const day = Math.floor(Math.random() * 28) + 1;
    const checkInDate = new Date(2025, 6 + monthOffset, day);
    const nights = Math.floor(Math.random() * 5) + 2;
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    // Determine status based on dates
    const now = new Date(2025, 9, 14); // Current date context
    let status: BookingStatus;
    if (i < 5) {
      status = 'pending';
    } else if (checkOutDate < now) {
      status = Math.random() > 0.1 ? 'completed' : 'cancelled';
    } else if (checkInDate <= now && checkOutDate >= now) {
      status = 'checked_in';
    } else {
      status = Math.random() > 0.15 ? 'confirmed' : 'pending';
    }

    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    let weekdayNights = 0;
    let weekendNights = 0;
    for (let d = 0; d < nights; d++) {
      const tempDate = new Date(checkInDate);
      tempDate.setDate(tempDate.getDate() + d);
      if (isWeekend(tempDate)) weekendNights++;
      else weekdayNights++;
    }

    const weekdayCost = weekdayNights * villa.pricing.weekdayPrice;
    const weekendCost = weekendNights * villa.pricing.weekendPrice;
    const cleaningFee = villa.pricing.cleaningFee;
    const subtotal = weekdayCost + weekendCost + cleaningFee;
    const discount = Math.random() > 0.7 ? Math.floor(subtotal * 0.1) : 0;
    const tax = Math.floor((subtotal - discount) * 0.08);
    const total = subtotal - discount + tax;
    const totalUSD = Math.round(total / 25000);

    const paymentStatuses: PaymentStatus[] = ['unpaid', 'deposit', 'paid'];
    const paymentStatus = status === 'completed' ? 'paid' :
      status === 'cancelled' ? 'unpaid' :
        paymentStatuses[Math.floor(Math.random() * 3)];

    bookings.push({
      id: `BVN-2025-${String(i + 1).padStart(3, '0')}`,
      villaId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerIdNumber: customer.idNumber,
      adults: Math.floor(Math.random() * 4) + 2,
      children: Math.floor(Math.random() * 3),
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      nights,
      source,
      status,
      paymentStatus,
      specialRequests: Math.random() > 0.5 ? 'Cần giường phụ cho trẻ em, check-in sớm nếu được' : '',
      staffNotes: Math.random() > 0.6 ? 'Khách VIP, cần chuẩn bị hoa tươi và trái cây' : '',
      priceBreakdown: {
        baseRate: villa.pricing.weekdayPrice,
        weekdayNights,
        weekendNights,
        holidayNights: 0,
        weekdayCost,
        weekendCost,
        holidayCost: 0,
        cleaningFee,
        surcharge: 0,
        discount,
        discountReason: discount > 0 ? 'Khách hàng thân thiết' : '',
        subtotal,
        tax,
        total,
      },
      totalAmount: total,
      totalAmountUSD: totalUSD,
      createdAt: new Date(checkInDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const bookings: Booking[] = generateBookings();

// ==================== REVIEWS ====================
const reviewContents = [
  { content: 'Villa tuyệt vời! Hồ bơi đẹp, view biển rất đẹp. Sẽ quay lại lần sau.', rating: 5 },
  { content: 'Phòng sạch sẽ, tiện nghi đầy đủ. Staff rất thân thiện và nhiệt tình.', rating: 5 },
  { content: 'Vị trí tốt, gần biển. Tuy nhiên bếp hơi nhỏ cho nhóm đông.', rating: 4 },
  { content: 'Chỗ ở rất thoải mái, rộng rãi. Trẻ con rất thích hồ bơi. Đáng giá tiền.', rating: 5 },
  { content: 'Villa đẹp nhưng wifi hơi yếu. Ngoài ra mọi thứ đều tuyệt vời.', rating: 4 },
  { content: 'Trải nghiệm hoàn hảo cho kỳ nghỉ gia đình. Cảm ơn B Villa!', rating: 5 },
  { content: 'Giá hơi cao so với mong đợi nhưng chất lượng xứng đáng.', rating: 4 },
  { content: 'Villa rất đẹp, sân vườn rộng. BBQ tối rất thú vị!', rating: 5 },
  { content: 'Khá ổn cho một chuyến đi ngắn. Phòng tắm cần cải thiện thêm.', rating: 3 },
  { content: 'Amazing villa! Private pool was the highlight. Highly recommended.', rating: 5 },
  { content: 'Beautiful property with great amenities. The staff went above and beyond.', rating: 5 },
  { content: 'Good location but the villa could use some maintenance updates.', rating: 3 },
  { content: 'Perfect for our family reunion. Kids loved the pool! Will definitely return.', rating: 5 },
  { content: 'Rất hài lòng với dịch vụ. Villa sạch đẹp, đồ dùng đầy đủ.', rating: 4 },
  { content: 'Kỳ nghỉ tuyệt vời nhất từ trước đến nay. View biển 10 điểm!', rating: 5 },
  { content: 'Villa đúng như hình, không gian yên tĩnh. Thích hợp nghỉ dưỡng.', rating: 4 },
  { content: 'Cần thêm đồ bếp. Ngoài ra mọi thứ hoàn hảo.', rating: 4 },
  { content: 'Nơi tuyệt vời để tổ chức tiệc sinh nhật. Cảm ơn team B Villa!', rating: 5 },
  { content: 'Vị trí gần biển, yên tĩnh. Có chỗ đỗ xe tiện lợi.', rating: 4 },
  { content: 'Wonderful stay! The villa exceeded our expectations in every way.', rating: 5 },
  { content: 'Phòng rộng rãi, thoáng mát. Hồ bơi sạch sẽ. 10 điểm!', rating: 5 },
  { content: 'Khá tốt nhưng hơi ồn từ đường lớn vào buổi sáng.', rating: 3 },
];

const reviewSources: ReviewSource[] = ['google', 'airbnb', 'booking_com', 'direct'];

export const reviews: Review[] = reviewContents.map((r, i) => {
  const villa = villaIds[Math.floor(Math.random() * villaIds.length)];
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const source = reviewSources[Math.floor(Math.random() * reviewSources.length)];
  const checkIn = new Date(2025, Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 5) + 2);

  return {
    id: `RV-${String(i + 1).padStart(3, '0')}`,
    villaId: villa,
    customerId: customer.id,
    customerName: customer.name,
    source,
    rating: r.rating,
    content: r.content,
    staffResponse: Math.random() > 0.4 ? 'Cảm ơn quý khách đã đánh giá! Chúng tôi rất vui khi được phục vụ quý khách. Hẹn gặp lại!' : '',
    stayCheckIn: checkIn.toISOString().split('T')[0],
    stayCheckOut: checkOut.toISOString().split('T')[0],
    status: Math.random() > 0.1 ? 'published' : 'hidden',
    isFeatured: r.rating === 5 && Math.random() > 0.5,
    createdAt: new Date(checkOut.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    respondedAt: Math.random() > 0.4 ? new Date(checkOut.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : '',
  };
});

// ==================== REVENUE CHART DATA ====================
export const revenueChartData: RevenueChartData[] = [
  { month: 'T11/24', B1: 180000000, B2: 150000000, B3: 160000000, B4: 80000000 },
  { month: 'T12/24', B1: 250000000, B2: 200000000, B3: 220000000, B4: 120000000 },
  { month: 'T1/25', B1: 320000000, B2: 280000000, B3: 300000000, B4: 160000000 },
  { month: 'T2/25', B1: 280000000, B2: 240000000, B3: 260000000, B4: 140000000 },
  { month: 'T3/25', B1: 200000000, B2: 170000000, B3: 180000000, B4: 95000000 },
  { month: 'T4/25', B1: 190000000, B2: 160000000, B3: 175000000, B4: 90000000 },
  { month: 'T5/25', B1: 250000000, B2: 210000000, B3: 230000000, B4: 120000000 },
  { month: 'T6/25', B1: 350000000, B2: 300000000, B3: 320000000, B4: 180000000 },
  { month: 'T7/25', B1: 400000000, B2: 350000000, B3: 380000000, B4: 200000000 },
  { month: 'T8/25', B1: 380000000, B2: 330000000, B3: 350000000, B4: 190000000 },
  { month: 'T9/25', B1: 300000000, B2: 260000000, B3: 280000000, B4: 150000000 },
  { month: 'T10/25', B1: 220000000, B2: 190000000, B3: 200000000, B4: 110000000 },
];

// ==================== BOOKING SOURCE DATA ====================
export const bookingSourceData: BookingSourceData[] = [
  { source: 'Đặt Trực Tiếp', count: 18, percentage: 33, color: '#C2A476' },
  { source: 'Điện Thoại', count: 10, percentage: 18, color: '#14171A' },
  { source: 'Airbnb', count: 12, percentage: 22, color: '#FF5A5F' },
  { source: 'Booking.com', count: 9, percentage: 16, color: '#003580' },
  { source: 'Agoda', count: 6, percentage: 11, color: '#5C2D91' },
];

// ==================== VILLA COMPARISON DATA ====================
export const villaComparisonData: VillaComparisonData[] = [
  { villa: 'B1', revenue: 3320000000, bookings: 48, occupancy: 78 },
  { villa: 'B2', revenue: 2840000000, bookings: 42, occupancy: 72 },
  { villa: 'B3', revenue: 3055000000, bookings: 45, occupancy: 75 },
  { villa: 'B4', revenue: 1635000000, bookings: 38, occupancy: 65 },
];

// ==================== DASHBOARD STATS ====================
export const dashboardStats: DashboardStats = {
  totalBookingsThisMonth: 12,
  bookingsTrend: 15.3,
  revenueThisMonth: 720000000,
  revenueThisMonthUSD: 28800,
  revenueTrend: 8.7,
  occupancyRate: 73,
  currentGuests: 6,
  pendingBookings: 3,
  averageRating: 4.6,
  totalReviews: 22,
};

// ==================== ACTIVITY FEED ====================
export const activityFeed: ActivityFeedItem[] = [
  {
    id: 'af-1',
    type: 'booking',
    title: 'Đặt phòng mới',
    description: 'Nguyễn Văn Minh đặt B1 từ 15/10 - 18/10',
    timestamp: new Date(2025, 9, 14, 9, 30).toISOString(),
    icon: 'calendar-plus',
    link: '/admin/bookings/BVN-2025-001',
  },
  {
    id: 'af-2',
    type: 'review',
    title: 'Đánh giá mới',
    description: 'Trần Thị Hương đánh giá 5⭐ cho B2',
    timestamp: new Date(2025, 9, 14, 8, 15).toISOString(),
    icon: 'star',
    link: '/admin/reviews',
  },
  {
    id: 'af-3',
    type: 'booking',
    title: 'Check-in',
    description: 'Lê Hoàng Nam check-in tại B3',
    timestamp: new Date(2025, 9, 13, 14, 0).toISOString(),
    icon: 'log-in',
    link: '/admin/bookings/BVN-2025-003',
  },
  {
    id: 'af-4',
    type: 'system',
    title: 'Thanh toán',
    description: 'Nhận thanh toán 36,000,000₫ từ Phạm Thị Mai',
    timestamp: new Date(2025, 9, 13, 11, 45).toISOString(),
    icon: 'credit-card',
    link: '/admin/finance/revenue',
  },
  {
    id: 'af-5',
    type: 'booking',
    title: 'Đặt phòng mới',
    description: 'Hoàng Đức Trí đặt B4 từ 20/10 - 22/10',
    timestamp: new Date(2025, 9, 13, 10, 20).toISOString(),
    icon: 'calendar-plus',
    link: '/admin/bookings/BVN-2025-005',
  },
  {
    id: 'af-6',
    type: 'message',
    title: 'Tin nhắn mới',
    description: 'Vũ Thị Lan hỏi về giá Tết Nguyên Đán',
    timestamp: new Date(2025, 9, 12, 16, 30).toISOString(),
    icon: 'message-circle',
    link: '/admin/customers/KH-006',
  },
  {
    id: 'af-7',
    type: 'booking',
    title: 'Check-out',
    description: 'Đặng Quốc Bảo check-out từ B1',
    timestamp: new Date(2025, 9, 12, 12, 0).toISOString(),
    icon: 'log-out',
    link: '/admin/bookings/BVN-2025-007',
  },
  {
    id: 'af-8',
    type: 'system',
    title: 'Cập nhật hệ thống',
    description: 'Đã cập nhật giá mùa cao điểm cho B1, B3',
    timestamp: new Date(2025, 9, 12, 9, 0).toISOString(),
    icon: 'settings',
    link: '/admin/settings/pricing',
  },
];

// ==================== NOTIFICATIONS ====================
export const notifications: Notification[] = [
  {
    id: 'n-1',
    type: 'booking',
    title: 'Đặt phòng mới cần duyệt',
    message: 'Nguyễn Văn Minh đặt B1 từ 15/10 - 18/10. Vui lòng xác nhận.',
    isRead: false,
    link: '/admin/bookings/pending',
    createdAt: new Date(2025, 9, 14, 9, 30).toISOString(),
  },
  {
    id: 'n-2',
    type: 'review',
    title: 'Đánh giá 5 sao mới',
    message: 'Trần Thị Hương vừa đánh giá 5 sao cho B2.',
    isRead: false,
    link: '/admin/reviews',
    createdAt: new Date(2025, 9, 14, 8, 15).toISOString(),
  },
  {
    id: 'n-3',
    type: 'payment',
    title: 'Thanh toán đã nhận',
    message: 'Nhận thanh toán 36,000,000₫ từ Phạm Thị Mai cho BVN-2025-004.',
    isRead: true,
    link: '/admin/finance/revenue',
    createdAt: new Date(2025, 9, 13, 11, 45).toISOString(),
  },
  {
    id: 'n-4',
    type: 'alert',
    title: 'Đặt phòng chờ quá lâu',
    message: 'BVN-2025-008 đã chờ duyệt hơn 2 giờ!',
    isRead: false,
    link: '/admin/bookings/pending',
    createdAt: new Date(2025, 9, 13, 10, 0).toISOString(),
  },
  {
    id: 'n-5',
    type: 'system',
    title: 'Backup hoàn tất',
    message: 'Backup dữ liệu hàng ngày đã hoàn tất thành công.',
    isRead: true,
    link: '#',
    createdAt: new Date(2025, 9, 13, 3, 0).toISOString(),
  },
];

// ==================== ADMIN USERS ====================
export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Nguyễn Admin',
    email: 'admin@bvilla.vn',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NA&backgroundColor=C2A476',
    lastLogin: new Date(2025, 9, 14, 8, 0).toISOString(),
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'Trần Quản Lý',
    email: 'manager@bvilla.vn',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TQL&backgroundColor=14171A',
    lastLogin: new Date(2025, 9, 13, 17, 30).toISOString(),
    isActive: true,
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'admin-3',
    name: 'Lê Nhân Viên',
    email: 'staff@bvilla.vn',
    role: 'staff',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LNV&backgroundColor=EAE5DC',
    lastLogin: new Date(2025, 9, 14, 7, 45).toISOString(),
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
  },
];

// ==================== ACTIVITY LOGS ====================
export const activityLogs: ActivityLog[] = [
  { id: 'log-1', userId: 'admin-1', userName: 'Nguyễn Admin', action: 'Đăng nhập', details: 'Đăng nhập thành công', timestamp: new Date(2025, 9, 14, 8, 0).toISOString(), ipAddress: '192.168.1.100' },
  { id: 'log-2', userId: 'admin-1', userName: 'Nguyễn Admin', action: 'Xác nhận đặt phòng', details: 'Xác nhận BVN-2025-045', timestamp: new Date(2025, 9, 14, 8, 30).toISOString(), ipAddress: '192.168.1.100' },
  { id: 'log-3', userId: 'admin-2', userName: 'Trần Quản Lý', action: 'Cập nhật giá', details: 'Cập nhật giá B1 cuối tuần', timestamp: new Date(2025, 9, 13, 15, 0).toISOString(), ipAddress: '192.168.1.101' },
  { id: 'log-4', userId: 'admin-3', userName: 'Lê Nhân Viên', action: 'Thêm đặt phòng', details: 'Thêm BVN-2025-055', timestamp: new Date(2025, 9, 13, 10, 0).toISOString(), ipAddress: '192.168.1.102' },
  { id: 'log-5', userId: 'admin-1', userName: 'Nguyễn Admin', action: 'Xuất báo cáo', details: 'Xuất báo cáo doanh thu T9', timestamp: new Date(2025, 9, 12, 16, 0).toISOString(), ipAddress: '192.168.1.100' },
];

// ==================== BUSINESS SETTINGS ====================
export const businessSettings: BusinessSettings = {
  businessName: 'B Villa Da Nang',
  address: '15 Đường Hoàng Sa, Thọ Quang, Sơn Trà, Đà Nẵng',
  phone: '0236 1234 567',
  email: 'info@bvilla.vn',
  website: 'https://b-villa-dn.vercel.app',
  currencyPrimary: 'VND',
  currencySecondary: 'USD',
  timezone: 'Asia/Ho_Chi_Minh',
  defaultCheckInTime: '14:00',
  defaultCheckOutTime: '12:00',
  taxRate: 8,
  logo: '/logo.png',
};

// ==================== PRICING RULES ====================
export const pricingRules: PricingRule[] = [
  {
    id: 'pr-1',
    name: 'Tết Nguyên Đán 2025',
    type: 'seasonal',
    discountPercentage: -50, // surcharge
    conditions: 'Áp dụng từ 25/1 - 5/2/2025',
    villaIds: ['B1', 'B2', 'B3', 'B4'],
    startDate: '2025-01-25',
    endDate: '2025-02-05',
    isActive: true,
  },
  {
    id: 'pr-2',
    name: 'Mùa Hè Cao Điểm',
    type: 'seasonal',
    discountPercentage: -30,
    conditions: 'Áp dụng từ 1/6 - 31/8',
    villaIds: ['B1', 'B2', 'B3', 'B4'],
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    isActive: true,
  },
  {
    id: 'pr-3',
    name: 'Đặt Sớm 30 Ngày',
    type: 'early_bird',
    discountPercentage: 10,
    conditions: 'Đặt trước 30 ngày trở lên',
    villaIds: ['B1', 'B2', 'B3', 'B4'],
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: true,
  },
  {
    id: 'pr-4',
    name: 'Lưu Trú Dài Ngày 7+',
    type: 'long_stay',
    discountPercentage: 15,
    conditions: 'Từ 7 đêm trở lên',
    villaIds: ['B1', 'B2', 'B3', 'B4'],
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: true,
  },
  {
    id: 'pr-5',
    name: 'Last Minute - 3 Ngày',
    type: 'last_minute',
    discountPercentage: 20,
    conditions: 'Đặt trong vòng 3 ngày trước check-in',
    villaIds: ['B2', 'B4'],
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
  },
];

// ==================== HELPER FUNCTIONS ====================
export function formatCurrency(amount: number, currency: string = 'VND'): string {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string, format: 'short' | 'long' | 'full' = 'short'): string {
  const date = new Date(dateStr);
  if (format === 'short') {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (format === 'long') {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export function getStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    checked_in: '#10B981',
    completed: '#6B7280',
    cancelled: '#EF4444',
  };
  return colors[status];
}

export function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Chờ Duyệt',
    confirmed: 'Đã Xác Nhận',
    checked_in: 'Đang Lưu Trú',
    completed: 'Hoàn Thành',
    cancelled: 'Đã Hủy',
  };
  return labels[status];
}

export function getSourceLabel(source: BookingSource): string {
  const labels: Record<BookingSource, string> = {
    direct: 'Trực Tiếp',
    phone: 'Điện Thoại',
    airbnb: 'Airbnb',
    booking_com: 'Booking.com',
    agoda: 'Agoda',
  };
  return labels[source];
}

export function getVillaColor(villaId: VillaId): string {
  const colors: Record<VillaId, string> = {
    B1: '#C2A476',
    B2: '#3B82F6',
    B3: '#10B981',
    B4: '#8B5CF6',
  };
  return colors[villaId];
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    unpaid: 'Chưa Thanh Toán',
    deposit: 'Đã Đặt Cọc',
    paid: 'Đã Thanh Toán',
  };
  return labels[status];
}

export function getLoyaltyLabel(tier: LoyaltyTier): string {
  const labels: Record<LoyaltyTier, string> = {
    new: 'Mới',
    regular: 'Thường Xuyên',
    vip: 'VIP',
  };
  return labels[tier];
}

export function getReviewSourceLabel(source: ReviewSource): string {
  const labels: Record<ReviewSource, string> = {
    google: 'Google',
    airbnb: 'Airbnb',
    booking_com: 'Booking.com',
    direct: 'Trực Tiếp',
  };
  return labels[source];
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}
