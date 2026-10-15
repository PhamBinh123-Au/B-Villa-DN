import fs from "fs";
import path from "path";
import { BookingInquiry, CleaningStatus, InquiryStatus, VillaMaintenanceInfo, PaymentStatus } from "@/types";

export const DEFAULT_VILLA_PRICES: Record<string, number> = {
  "b1-villa-4pn": 18000000,
  "b2-villa-4pn": 19500000,
  "b3-villa-2pn": 9500000,
  "b4-villa-4pn": 17000000,
};

export const DEFAULT_USD_RATE = 25400;

export interface ServerData {
  inquiries: BookingInquiry[];
  deletedIds: string[];
  maintenance: Record<string, VillaMaintenanceInfo>;
  prices?: Record<string, number>;
  usdRate?: number;
  settings?: any;
  pricingRules?: any[];
  amenities?: any[];
  gallery?: any[];
  reviews?: any[];
  adminUsers?: any[];
  customers?: any[];
  villas?: Record<string, any>;
  version: number;
  lastUpdated: number;
}

const INITIAL_SAMPLE_INQUIRIES: BookingInquiry[] = [
  {
    id: "INQ-3001",
    villaId: "b3-villa-2pn",
    villaName: "B3 Villa • 2 Bedrooms",
    guestName: "Trần Thị Hương",
    email: "huong.tran@gmail.com",
    phone: "0923456789",
    checkIn: "2026-10-22",
    checkOut: "2026-10-25",
    adults: 2,
    children: 1,
    specialRequests: "Khách cần xe đưa đón sân bay Đà Nẵng lúc 14:00 và set up bàn nướng BBQ.",
    status: "pending",
    totalPriceVnd: 9000000,
    paymentStatus: "unpaid",
    paidAmountVnd: 0,
    createdAt: "2026-10-14T08:30:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-3002",
    villaId: "b4-villa-4pn",
    villaName: "B4 Villa • 4 Bedrooms",
    guestName: "Nguyễn Văn Minh",
    email: "minh.nguyen@gmail.com",
    phone: "0987654321",
    checkIn: "2026-10-26",
    checkOut: "2026-10-29",
    adults: 6,
    children: 2,
    specialRequests: "Đoàn gia đình có người cao tuổi, xin phòng tầng trệt và cũi em bé.",
    status: "pending",
    totalPriceVnd: 9000000,
    paymentStatus: "unpaid",
    paidAmountVnd: 0,
    createdAt: "2026-10-14T09:15:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-4915",
    villaId: "b2-villa-4pn",
    villaName: "B2 Villa • 4 Bedrooms",
    guestName: "Nguyễn Hoàng Nam",
    email: "nam.nguyen@hoangnam.vn",
    phone: "0912345678",
    checkIn: "2026-10-13",
    checkOut: "2026-10-15",
    adults: 4,
    children: 1,
    specialRequests: "Khách VIP, chuẩn bị trái cây tươi chào mừng khi check-in.",
    status: "confirmed",
    totalPriceVnd: 6000000,
    paymentStatus: "paid",
    paidAmountVnd: 6000000,
    createdAt: "2026-10-12T10:00:00.000Z",
    isCheckedIn: true,
    isCheckedOut: false,
  },
  {
    id: "INQ-8573",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Bình Phạm",
    email: "phambinh2092008@gmail.com",
    phone: "0905111222",
    checkIn: "2026-10-13",
    checkOut: "2026-10-16",
    adults: 4,
    children: 0,
    specialRequests: "Cần dọn phòng hàng ngày lúc 10:00 sáng.",
    status: "confirmed",
    totalPriceVnd: 9000000,
    paymentStatus: "paid",
    paidAmountVnd: 9000000,
    createdAt: "2026-10-12T14:20:00.000Z",
    isCheckedIn: true,
    isCheckedOut: false,
  },
  {
    id: "INQ-6312",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Hoàng Đức Trí",
    email: "tri.hoang@investcorp.vn",
    phone: "0934567890",
    checkIn: "2026-10-16",
    checkOut: "2026-10-19",
    adults: 4,
    children: 2,
    specialRequests: "Nhận phòng lúc 14:00, yêu cầu chuẩn bị thêm 2 phao bơi cho trẻ em.",
    status: "confirmed",
    totalPriceVnd: 9000000,
    paymentStatus: "deposit",
    paidAmountVnd: 4500000,
    createdAt: "2026-10-13T11:00:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-2001",
    villaId: "b3-villa-2pn",
    villaName: "B3 Villa • 2 Bedrooms",
    guestName: "Vũ Thị Lan",
    email: "lan.vu@techasia.io",
    phone: "0945678901",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    adults: 2,
    children: 0,
    specialRequests: "Kỷ niệm ngày cưới, setup hoa tươi và nến thơm.",
    status: "confirmed",
    totalPriceVnd: 9000000,
    paymentStatus: "paid",
    paidAmountVnd: 9000000,
    createdAt: "2026-10-13T15:00:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-2002",
    villaId: "b4-villa-4pn",
    villaName: "B4 Villa • 4 Bedrooms",
    guestName: "Đặng Quốc Bảo",
    email: "bao.dang@vietnamtravel.com",
    phone: "0967890123",
    checkIn: "2026-10-18",
    checkOut: "2026-10-21",
    adults: 5,
    children: 1,
    specialRequests: "Cần hỗ trợ hướng dẫn viên tiếng Anh tham quan Sơn Trà.",
    status: "confirmed",
    totalPriceVnd: 9000000,
    paymentStatus: "deposit",
    paidAmountVnd: 4500000,
    createdAt: "2026-10-13T16:30:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-2003",
    villaId: "b2-villa-4pn",
    villaName: "B2 Villa • 4 Bedrooms",
    guestName: "Lê Thị Bích Ngọc",
    email: "ngoc.le@luxuryescape.vn",
    phone: "0978901234",
    checkIn: "2026-10-20",
    checkOut: "2026-10-24",
    adults: 6,
    children: 2,
    specialRequests: "Ăn sáng tại phòng, thực đơn chay cho 2 người lớn.",
    status: "confirmed",
    totalPriceVnd: 12000000,
    paymentStatus: "paid",
    paidAmountVnd: 12000000,
    createdAt: "2026-10-14T07:00:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-2004",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Alexander Wright",
    email: "alex.wright@ukglobal.co.uk",
    phone: "+44 7700 900123",
    checkIn: "2026-10-25",
    checkOut: "2026-10-28",
    adults: 4,
    children: 0,
    specialRequests: "Late check-in at 20:00 PM due to international flight.",
    status: "confirmed",
    totalPriceVnd: 9000000,
    paymentStatus: "deposit",
    paidAmountVnd: 4500000,
    createdAt: "2026-10-14T08:00:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-1001",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Phạm Thị Mai",
    email: "mai.pham@danangresort.vn",
    phone: "0981234567",
    checkIn: "2026-10-06",
    checkOut: "2026-10-10",
    adults: 4,
    children: 1,
    specialRequests: "Khách đã trả phòng hài lòng, đánh giá 5 sao.",
    status: "confirmed",
    totalPriceVnd: 12000000,
    paymentStatus: "paid",
    paidAmountVnd: 12000000,
    createdAt: "2026-10-05T09:00:00.000Z",
    isCheckedIn: true,
    isCheckedOut: true,
  },
  {
    id: "INQ-1002",
    villaId: "b2-villa-4pn",
    villaName: "B2 Villa • 4 Bedrooms",
    guestName: "Đỗ Minh Tuấn",
    email: "tuan.do@saigonbiz.vn",
    phone: "0918765432",
    checkIn: "2026-10-08",
    checkOut: "2026-10-12",
    adults: 4,
    children: 0,
    specialRequests: "Đoàn công tác, xuất hóa đơn VAT công ty.",
    status: "confirmed",
    totalPriceVnd: 12000000,
    paymentStatus: "paid",
    paidAmountVnd: 12000000,
    createdAt: "2026-10-07T11:00:00.000Z",
    isCheckedIn: true,
    isCheckedOut: true,
  },
];

// File paths for persistence
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "bookings-db.json");
const TMP_DATA_FILE = path.join("/tmp", "luxury-danang-bookings.json");

declare global {
  // eslint-disable-next-line no-var
  var __luxury_server_store__: ServerData | undefined;
}

function getInitialData(): ServerData {
  return {
    inquiries: [...INITIAL_SAMPLE_INQUIRIES],
    deletedIds: [],
    maintenance: {},
    prices: { ...DEFAULT_VILLA_PRICES },
    usdRate: DEFAULT_USD_RATE,
    version: 1,
    lastUpdated: Date.now(),
  };
}

// Check for Vercel KV / Upstash Redis env vars
function getKvConfig() {
  const rawUrl =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_REST_URL;
  const rawToken =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_REST_TOKEN;

  if (rawUrl && rawToken) {
    const url = rawUrl.replace(/\/+$/, "");
    const token = rawToken.trim();
    return { url, token };
  }
  return null;
}

// Check for Firebase Realtime Database
function getFirebaseUrl() {
  const url = process.env.FIREBASE_DATABASE_URL;
  if (url) {
    return url.replace(/\/+$/, "");
  }
  return null;
}

async function fetchFromKv(): Promise<ServerData | null> {
  const kv = getKvConfig();
  if (kv) {
    try {
      // 1. Primary method: POST root with ["GET", "luxury_bookings_db_v1"]
      let res = await fetch(kv.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["GET", "luxury_bookings_db_v1"]),
        cache: "no-store",
      });

      // 2. Fallback method: GET /get/luxury_bookings_db_v1
      if (!res.ok) {
        res = await fetch(`${kv.url}/get/luxury_bookings_db_v1`, {
          headers: { Authorization: `Bearer ${kv.token}` },
          cache: "no-store",
        });
      }

      if (res.ok) {
        const json = await res.json();
        if (json && json.result !== undefined && json.result !== null) {
          const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
          if (parsed && Array.isArray(parsed.inquiries)) {
            return parsed as ServerData;
          }
        }
      }
    } catch (err) {
      console.warn("KV read error", err);
    }
  }

  // Firebase fallback
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl) {
    try {
      const res = await fetch(`${firebaseUrl}/luxury_bookings_db_v1.json`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.inquiries)) {
          return json as ServerData;
        }
      }
    } catch (err) {
      console.warn("Firebase read error", err);
    }
  }

  return null;
}

async function saveToKv(data: ServerData): Promise<boolean> {
  let saved = false;
  const kv = getKvConfig();

  if (kv) {
    try {
      const payload = JSON.stringify(data);

      // 1. Primary Upstash REST array command POST to root URL: ["SET", key, value]
      const res = await fetch(kv.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${kv.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(["SET", "luxury_bookings_db_v1", payload]),
        cache: "no-store",
      });

      if (res.ok) {
        saved = true;
      } else {
        console.warn("KV command SET returned non-ok status:", res.status);
        // Fallback: Path-based
        const fallbackRes = await fetch(
          `${kv.url}/set/luxury_bookings_db_v1/${encodeURIComponent(payload)}`,
          {
            headers: { Authorization: `Bearer ${kv.token}` },
            cache: "no-store",
          }
        );
        if (fallbackRes.ok) {
          saved = true;
        }
      }
    } catch (err) {
      console.warn("KV write error", err);
    }
  }

  // Firebase fallback
  const firebaseUrl = getFirebaseUrl();
  if (firebaseUrl) {
    try {
      const res = await fetch(`${firebaseUrl}/luxury_bookings_db_v1.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (res.ok) {
        saved = true;
      }
    } catch (err) {
      console.warn("Firebase write error", err);
    }
  }

  return saved;
}

function readFromFile(): ServerData | null {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      const parsed = JSON.parse(content) as ServerData;
      if (parsed && Array.isArray(parsed.inquiries)) {
        return parsed;
      }
    }
  } catch {
    // continue to tmp
  }

  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const content = fs.readFileSync(TMP_DATA_FILE, "utf-8");
      const parsed = JSON.parse(content) as ServerData;
      if (parsed && Array.isArray(parsed.inquiries)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  return null;
}

function saveToFile(data: ServerData): void {
  const serialized = JSON.stringify(data, null, 2);

  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, serialized, "utf-8");
  } catch {
    // Read-only serverless environment
  }

  try {
    fs.writeFileSync(TMP_DATA_FILE, serialized, "utf-8");
  } catch {
    // ignore
  }
}

function deduplicateInquiries(list: BookingInquiry[]): BookingInquiry[] {
  if (!Array.isArray(list)) return [];
  const seenIds = new Set<string>();
  const seenSlots = new Set<string>();
  const clean: BookingInquiry[] = [];

  for (const inq of list) {
    if (!inq || !inq.id) continue;
    if (seenIds.has(inq.id)) continue;
    seenIds.add(inq.id);

    if (inq.status !== "cancelled" && inq.checkIn && inq.checkOut && inq.villaId) {
      const slotKey = `${inq.villaId}:${inq.checkIn}:${inq.checkOut}`;
      if (seenSlots.has(slotKey)) {
        continue; // duplicate overlapping booking
      }
      seenSlots.add(slotKey);
    }

    clean.push(inq);
  }

  return clean;
}

export const serverStore = {
  async getData(): Promise<ServerData> {
    let result: ServerData;

    // 1. If KV is configured, check KV
    const kvData = await fetchFromKv();
    if (kvData && Array.isArray(kvData.inquiries)) {
      result = kvData;
    } else if (
      globalThis.__luxury_server_store__ &&
      Array.isArray(globalThis.__luxury_server_store__.inquiries)
    ) {
      // 2. Check in-memory global
      result = globalThis.__luxury_server_store__;
    } else {
      // 3. Check disk file
      const diskData = readFromFile();
      if (diskData && Array.isArray(diskData.inquiries)) {
        result = diskData;
      } else {
        // 4. Default to initial sample data
        result = getInitialData();
        saveToFile(result);
      }
    }

    if (!Array.isArray(result.deletedIds)) {
      result.deletedIds = [];
    }

    result.prices = { ...DEFAULT_VILLA_PRICES, ...(result.prices || {}) };
    result.usdRate = result.usdRate || DEFAULT_USD_RATE;

    // Filter out deleted IDs and deduplicate
    const delSet = new Set(result.deletedIds);
    result.inquiries = deduplicateInquiries(result.inquiries).filter((i) => !delSet.has(i.id));

    globalThis.__luxury_server_store__ = result;
    return result;
  },

  async setData(updater: (current: ServerData) => ServerData): Promise<ServerData> {
    const current = await this.getData();
    const updated = updater(current);

    if (!Array.isArray(updated.deletedIds)) {
      updated.deletedIds = current.deletedIds || [];
    }

    updated.prices = { ...DEFAULT_VILLA_PRICES, ...(updated.prices || current.prices || {}) };
    updated.usdRate = updated.usdRate || current.usdRate || DEFAULT_USD_RATE;

    const delSet = new Set(updated.deletedIds);
    updated.inquiries = deduplicateInquiries(updated.inquiries).filter((i) => !delSet.has(i.id));
    updated.version = (current.version || 0) + 1;
    updated.lastUpdated = Date.now();

    globalThis.__luxury_server_store__ = updated;
    saveToFile(updated);
    await saveToKv(updated);

    return updated;
  },

  async getInquiries(): Promise<BookingInquiry[]> {
    const data = await this.getData();
    return data.inquiries;
  },

  async addInquiry(
    inquiryData: Omit<BookingInquiry, "id" | "createdAt" | "status"> & { status?: InquiryStatus }
  ): Promise<BookingInquiry> {
    const status = inquiryData.status || "pending";
    const data = await this.getData();

    const requestedId = (inquiryData as any).id;
    if (requestedId) {
      const existing = data.inquiries.find((i) => i.id === requestedId);
      if (existing) {
        return existing;
      }
    }

    // Check if villa is under maintenance
    const isMaintenance = Boolean(data.maintenance[inquiryData.villaId]?.isMaintenance);
    if (isMaintenance) {
      throw new Error(
        `Reservation Prohibited: Villa is currently under scheduled maintenance. Online bookings are temporarily closed.`
      );
    }

    // Check overlap conflict (only against confirmed bookings)
    if (status !== "cancelled" && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = data.inquiries.find((inq) => {
        if (inq.status !== "confirmed" || inq.isCheckedOut || inq.villaId !== inquiryData.villaId) return false;
        if (requestedId && inq.id === requestedId) return false;
        return inquiryData.checkIn < inq.checkOut && inq.checkIn < inquiryData.checkOut;
      });

      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} (#${conflict.id} - ${conflict.guestName}). Please choose different dates.`
        );
      }
    }

    let calculatedTotal = inquiryData.totalPriceVnd;
    if (calculatedTotal === undefined && inquiryData.checkIn && inquiryData.checkOut) {
      const nightly = (data.prices && data.prices[inquiryData.villaId]) || DEFAULT_VILLA_PRICES[inquiryData.villaId] || 15000000;
      const tIn = new Date(inquiryData.checkIn).getTime();
      const tOut = new Date(inquiryData.checkOut).getTime();
      const nights = !isNaN(tIn) && !isNaN(tOut) ? Math.max(1, Math.round((tOut - tIn) / 86400000)) : 1;
      calculatedTotal = nights * nightly;
    }

    const newInquiry: BookingInquiry = {
      ...inquiryData,
      id: requestedId || `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      totalPriceVnd: calculatedTotal,
      paymentStatus: inquiryData.paymentStatus || "unpaid",
      paidAmountVnd: inquiryData.paidAmountVnd ?? (inquiryData.paymentStatus === "paid" ? calculatedTotal : 0),
      createdAt: (inquiryData as any).createdAt || new Date().toISOString(),
    };

    await this.setData((curr) => ({
      ...curr,
      // If was previously marked deleted, unmark it
      deletedIds: (curr.deletedIds || []).filter((dId) => dId !== newInquiry.id),
      inquiries: [newInquiry, ...curr.inquiries.filter((i) => i.id !== newInquiry.id)],
    }));

    return newInquiry;
  },

  async updateInquiry(id: string, updatedFields: Partial<BookingInquiry>): Promise<BookingInquiry> {
    let result: BookingInquiry | undefined;

    await this.setData((curr) => {
      const target = curr.inquiries.find((i) => i.id === id);
      if (!target) throw new Error(`Booking #${id} not found.`);

      const merged = { ...target, ...updatedFields };

      if (merged.status === "confirmed" && merged.checkIn && merged.checkOut) {
        const conflict = curr.inquiries.find((other) => {
          if (other.id === id || other.status !== "confirmed" || other.isCheckedOut || other.villaId !== merged.villaId) return false;
          return merged.checkIn < other.checkOut && other.checkIn < merged.checkOut;
        });

        if (conflict) {
          throw new Error(
            `Overlapping Booking Prohibited: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}).`
          );
        }
      }

      result = merged;
      return {
        ...curr,
        inquiries: curr.inquiries.map((i) => (i.id === id ? merged : i)),
      };
    });

    return result!;
  },

  async deleteInquiry(id: string): Promise<void> {
    await this.setData((curr) => ({
      ...curr,
      deletedIds: Array.from(new Set([...(curr.deletedIds || []), id])),
      inquiries: curr.inquiries.filter((i) => i.id !== id),
    }));
  },

  async resetSample(): Promise<void> {
    const initial = getInitialData();
    await this.setData(() => initial);
  },

  async setMaintenance(
    villaId: string,
    isMaintenance: boolean,
    reason?: string,
    startDate?: string,
    endDate?: string
  ): Promise<VillaMaintenanceInfo> {
    const info: VillaMaintenanceInfo = {
      villaId,
      isMaintenance,
      reason: reason || (isMaintenance ? "Scheduled luxury maintenance & seasonal care" : undefined),
      startDate: isMaintenance ? startDate : undefined,
      endDate: isMaintenance ? endDate : undefined,
      updatedAt: new Date().toISOString(),
    };

    await this.setData((curr) => ({
      ...curr,
      maintenance: {
        ...curr.maintenance,
        [villaId]: info,
      },
    }));

    return info;
  },

  async getMaintenanceMap(): Promise<Record<string, VillaMaintenanceInfo>> {
    const data = await this.getData();
    return data.maintenance;
  },

  async getPrices(): Promise<{ prices: Record<string, number>; usdRate: number }> {
    const data = await this.getData();
    return {
      prices: { ...DEFAULT_VILLA_PRICES, ...(data.prices || {}) },
      usdRate: data.usdRate || DEFAULT_USD_RATE,
    };
  },

  async setPrices(prices: Record<string, number>, usdRate?: number): Promise<{ prices: Record<string, number>; usdRate: number }> {
    await this.setData((curr) => ({
      ...curr,
      prices: { ...(curr.prices || DEFAULT_VILLA_PRICES), ...prices },
      usdRate: usdRate || curr.usdRate || DEFAULT_USD_RATE,
    }));
    return this.getPrices();
  },

  async updateCleaningStatus(inquiryId: string, cleaningStatus: CleaningStatus, notes?: string): Promise<BookingInquiry | null> {
    return this.updateInquiry(inquiryId, {
      cleaningStatus,
      cleaningNotes: notes,
      cleanedAt: cleaningStatus === "cleaned" ? new Date().toISOString() : undefined,
    });
  },

  isCloudStorage(): boolean {
    return Boolean(getKvConfig() || getFirebaseUrl());
  },

  getStorageType(): string {
    if (getKvConfig()) return "Vercel KV / Upstash Redis";
    if (getFirebaseUrl()) return "Google Firebase Realtime DB";
    return "Standalone / Ephemeral (Vercel Serverless)";
  },

  async importData(
    imported: {
      inquiries?: BookingInquiry[];
      maintenance?: Record<string, VillaMaintenanceInfo>;
      deletedIds?: string[];
    },
    replaceAll = false
  ): Promise<ServerData> {
    return this.setData((curr) => {
      const incomingInqs = Array.isArray(imported.inquiries) ? imported.inquiries : [];
      const incomingDel = Array.isArray(imported.deletedIds) ? imported.deletedIds : [];
      const incomingMaint = imported.maintenance || {};

      if (replaceAll) {
        return {
          ...curr,
          inquiries: deduplicateInquiries(incomingInqs),
          deletedIds: incomingDel,
          maintenance: incomingMaint,
          version: (curr.version || 0) + 1,
          lastUpdated: Date.now(),
        };
      }

      // Merge intelligently
      const mergedDel = Array.from(new Set([...(curr.deletedIds || []), ...incomingDel]));
      const delSet = new Set(mergedDel);

      const inqMap = new Map<string, BookingInquiry>();
      curr.inquiries.forEach((i) => {
        if (!delSet.has(i.id)) inqMap.set(i.id, i);
      });
      incomingInqs.forEach((i) => {
        if (!delSet.has(i.id)) inqMap.set(i.id, i);
      });

      const mergedInqs = deduplicateInquiries(Array.from(inqMap.values()));
      mergedInqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        ...curr,
        inquiries: mergedInqs,
        deletedIds: mergedDel,
        maintenance: {
          ...curr.maintenance,
          ...incomingMaint,
        },
        version: (curr.version || 0) + 1,
        lastUpdated: Date.now(),
      };
    });
  },

  async getAppData(): Promise<Partial<ServerData>> {
    const data = await this.getData();
    return {
      settings: data.settings,
      pricingRules: data.pricingRules,
      amenities: data.amenities,
      gallery: data.gallery,
      reviews: data.reviews,
      adminUsers: data.adminUsers,
      customers: data.customers,
      villas: data.villas,
      prices: data.prices,
      usdRate: data.usdRate,
      version: data.version,
      lastUpdated: data.lastUpdated,
    };
  },

  async updateAppData(patch: Partial<ServerData>): Promise<ServerData> {
    return this.setData((curr) => {
      return {
        ...curr,
        settings: patch.settings !== undefined ? patch.settings : curr.settings,
        pricingRules: patch.pricingRules !== undefined ? patch.pricingRules : curr.pricingRules,
        amenities: patch.amenities !== undefined ? patch.amenities : curr.amenities,
        gallery: patch.gallery !== undefined ? patch.gallery : curr.gallery,
        reviews: patch.reviews !== undefined ? patch.reviews : curr.reviews,
        adminUsers: patch.adminUsers !== undefined ? patch.adminUsers : curr.adminUsers,
        customers: patch.customers !== undefined ? patch.customers : curr.customers,
        villas: patch.villas !== undefined ? { ...(curr.villas || {}), ...patch.villas } : curr.villas,
        prices: patch.prices !== undefined ? { ...(curr.prices || {}), ...patch.prices } : curr.prices,
        usdRate: patch.usdRate !== undefined ? patch.usdRate : curr.usdRate,
      };
    });
  },
};
