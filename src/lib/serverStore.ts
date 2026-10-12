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
  version: number;
  lastUpdated: number;
}

const INITIAL_SAMPLE_INQUIRIES: BookingInquiry[] = [
  {
    id: "INQ-9480",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "David Sterling",
    email: "david.sterling@sanctuary.co",
    phone: "+84 905 111 222",
    checkIn: "2026-10-18",
    checkOut: "2026-10-23",
    adults: 6,
    children: 2,
    specialRequests: "VIP arrival. Early check-in requested.",
    status: "confirmed",
    totalPriceVnd: 90000000,
    paymentStatus: "deposit",
    paidAmountVnd: 45000000,
    paymentNotes: "Đã cọc 50% (45.000.000 ₫). Còn lại thu khi nhận phòng.",
    createdAt: "2026-10-09T10:00:00.000Z",
  },
  {
    id: "INQ-9481",
    villaId: "b1-villa-4pn",
    villaName: "B1 Villa • 4 Bedrooms",
    guestName: "Alexander Wright",
    email: "alexander.wright@luxurytravel.co",
    phone: "+44 7700 900123",
    checkIn: "2026-11-15",
    checkOut: "2026-11-20",
    adults: 6,
    children: 2,
    specialRequests: "Requesting early check-in at 12:00 PM and airport chauffeur pickup.",
    status: "confirmed",
    totalPriceVnd: 90000000,
    paymentStatus: "unpaid",
    paidAmountVnd: 0,
    paymentNotes: "Chưa thu tiền - chờ khách chốt vé máy bay.",
    createdAt: "2026-10-08T14:20:00.000Z",
  },
  {
    id: "INQ-9482",
    villaId: "b2-villa-4pn",
    villaName: "B2 Villa • 4 Bedrooms",
    guestName: "Elena Rostova",
    email: "elena.rostova@designstudio.ch",
    phone: "+41 79 123 4567",
    checkIn: "2026-10-25",
    checkOut: "2026-10-30",
    adults: 8,
    children: 0,
    specialRequests: "Celebrating birthday. Need private chef dining setup for one evening.",
    status: "confirmed",
    totalPriceVnd: 97500000,
    paymentStatus: "paid",
    paidAmountVnd: 97500000,
    paymentNotes: "Đã thu đủ 97.500.000 ₫.",
    createdAt: "2026-10-09T08:15:00.000Z",
  },
  {
    id: "INQ-9483",
    villaId: "b3-villa-2pn",
    villaName: "B3 Villa • 2 Bedrooms",
    guestName: "Marcus & Chloe Vance",
    email: "chloe.vance@honeymoon.org",
    phone: "+61 400 123 987",
    checkIn: "2026-11-25",
    checkOut: "2026-11-30",
    adults: 2,
    children: 0,
    specialRequests: "Honeymoon stay. Would love flower arrangements by the plunge pool.",
    status: "contacted",
    totalPriceVnd: 47500000,
    paymentStatus: "unpaid",
    paidAmountVnd: 0,
    paymentNotes: "Đang liên hệ tư vấn gói Honeymoon.",
    createdAt: "2026-10-09T18:45:00.000Z",
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

    // Check overlap conflict
    if (status !== "cancelled" && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = data.inquiries.find((inq) => {
        if (inq.status === "cancelled" || inq.villaId !== inquiryData.villaId) return false;
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

      if (merged.status !== "cancelled" && merged.checkIn && merged.checkOut) {
        const conflict = curr.inquiries.find((other) => {
          if (other.id === id || other.status === "cancelled" || other.villaId !== merged.villaId) return false;
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

  async setMaintenance(villaId: string, isMaintenance: boolean, reason?: string): Promise<VillaMaintenanceInfo> {
    const info: VillaMaintenanceInfo = {
      villaId,
      isMaintenance,
      reason: reason || (isMaintenance ? "Scheduled luxury maintenance & seasonal care" : undefined),
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
};
