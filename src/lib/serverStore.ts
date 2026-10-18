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
    id: "INQ-4692",
    villaId: "b4-villa-4pn",
    villaName: "B4 Villa • 4 Bedrooms",
    guestName: "Quang",
    email: "quang.guest@gmail.com",
    phone: "0393017666",
    checkIn: "2026-10-22",
    checkOut: "2026-10-24",
    adults: 4,
    children: 0,
    specialRequests: "Yêu cầu phòng sạch sẽ, chuẩn bị dép đi trong nhà.",
    status: "confirmed",
    totalPriceVnd: 6000000,
    paymentStatus: "paid",
    paidAmountVnd: 6000000,
    createdAt: "2026-10-17T09:30:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
  },
  {
    id: "INQ-1636",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Bình Phạm",
    email: "phambinh2092008@gmail.com",
    phone: "43243242423",
    checkIn: "2026-10-15",
    checkOut: "2026-10-17",
    adults: 4,
    children: 0,
    specialRequests: "Đang lưu trú, chuẩn bị đồ nướng BBQ buổi tối.",
    status: "confirmed",
    totalPriceVnd: 6000000,
    paymentStatus: "paid",
    paidAmountVnd: 6000000,
    createdAt: "2026-10-15T08:00:00.000Z",
    isCheckedIn: true,
    isCheckedOut: false,
  },
  {
    id: "INQ-1092",
    villaId: "b3-villa-2pn",
    villaName: "B3 Villa • 2 Bedrooms",
    guestName: "Direct Offline Booking",
    email: "offline@bvilladanang.com",
    phone: "+84854252821",
    checkIn: "2026-10-13",
    checkOut: "2026-10-14",
    adults: 2,
    children: 0,
    specialRequests: "Khách vãng lai đặt trực tiếp tại quầy lễ tân.",
    status: "confirmed",
    totalPriceVnd: 3000000,
    paymentStatus: "paid",
    paidAmountVnd: 3000000,
    createdAt: "2026-10-13T07:15:00.000Z",
    isCheckedIn: true,
    isCheckedOut: true,
  },
  {
    id: "INQ-3314",
    villaId: "b3-villa-2pn",
    villaName: "B3 Villa • 2 Bedrooms",
    guestName: "Bình Phạm",
    email: "phambinh2092008@gmail.com",
    phone: "13332342432",
    checkIn: "2026-10-12",
    checkOut: "2026-10-13",
    adults: 2,
    children: 0,
    specialRequests: "Khách đặt 1 đêm, hoàn tất thanh toán trước khi trả phòng.",
    status: "confirmed",
    totalPriceVnd: 3000000,
    paymentStatus: "paid",
    paidAmountVnd: 3000000,
    createdAt: "2026-10-12T11:00:00.000Z",
    isCheckedIn: true,
    isCheckedOut: true,
  },
  {
    id: "INQ-1945",
    villaId: "b2-villa-4pn",
    villaName: "B2 Villa • 4 Bedrooms",
    guestName: "Bình Phạm",
    email: "phambinh2092008@gmail.com",
    phone: "3333333333",
    checkIn: "2026-10-10",
    checkOut: "2026-10-18",
    adults: 4,
    children: 0,
    specialRequests: "Kỳ nghỉ dài 8 đêm.",
    status: "confirmed",
    totalPriceVnd: 24000000,
    paymentStatus: "paid",
    paidAmountVnd: 24000000,
    createdAt: "2026-10-10T10:20:00.000Z",
    isCheckedIn: false,
    isCheckedOut: false,
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
      // If cloud KV is empty (e.g. initial setup or wipe), auto-recover master inquiries from disk/seed
      if (kvData.inquiries.length === 0) {
        const diskData = readFromFile();
        const masterInquiries = (diskData && diskData.inquiries && diskData.inquiries.length > 0)
          ? diskData.inquiries
          : getInitialData().inquiries;

        if (masterInquiries.length > 0) {
          kvData.inquiries = deduplicateInquiries(masterInquiries);
          const masterIds = new Set(kvData.inquiries.map((i) => i.id));
          kvData.deletedIds = (kvData.deletedIds || []).filter((id) => !masterIds.has(id));
          kvData.version = (kvData.version || 0) + 1;
          kvData.lastUpdated = Date.now();
          await saveToKv(kvData);
        }
      }
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
    let status = inquiryData.status || "pending";
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
    if (status === "confirmed" && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = data.inquiries.find((inq) => {
        if (inq.status !== "confirmed" || inq.isCheckedOut || inq.villaId !== inquiryData.villaId) return false;
        if (requestedId && inq.id === requestedId) return false;
        return inquiryData.checkIn < inq.checkOut && inq.checkIn < inquiryData.checkOut;
      });

      if (conflict) {
        console.warn(
          `[serverStore] Overlapping booking prevented on creation for villa ${inquiryData.villaId}: Dates ${inquiryData.checkIn} to ${inquiryData.checkOut} conflict with #${conflict.id}. Set as pending.`
        );
        status = "pending";
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
      if (!target) {
        console.warn(`[serverStore] Booking #${id} not found for update.`);
        return curr;
      }

      const merged = { ...target, ...updatedFields };

      if (merged.paymentStatus === 'paid' && (!merged.paidAmountVnd || merged.paidAmountVnd === 0)) {
        merged.paidAmountVnd = merged.totalPriceVnd ?? 0;
      }

      // Conflict validation only applies when transitioning to 'confirmed' or changing dates on a confirmed booking
      const isBecomingConfirmed = target.status !== "confirmed" && merged.status === "confirmed";
      const areDatesChanging = Boolean(
        (updatedFields.checkIn && updatedFields.checkIn !== target.checkIn) ||
        (updatedFields.checkOut && updatedFields.checkOut !== target.checkOut) ||
        (updatedFields.villaId && updatedFields.villaId !== target.villaId)
      );

      if (merged.status === "confirmed" && (isBecomingConfirmed || areDatesChanging)) {
        const conflict = curr.inquiries.find((other) => {
          if (other.id === id || other.status !== "confirmed" || other.isCheckedOut || other.villaId !== merged.villaId) return false;
          return merged.checkIn < other.checkOut && other.checkIn < merged.checkOut;
        });

        if (conflict) {
          console.warn(
            `[serverStore] Overlapping booking prevented: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}). Reverted to pending.`
          );
          if (isBecomingConfirmed) {
            merged.status = "pending";
          }
        }
      }

      result = merged;
      return {
        ...curr,
        inquiries: curr.inquiries.map((i) => (i.id === id ? merged : i)),
      };
    });

    return result || ({ id, ...updatedFields } as BookingInquiry);
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
