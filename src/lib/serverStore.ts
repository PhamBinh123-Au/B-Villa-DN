import fs from "fs";
import path from "path";
import { BookingInquiry, InquiryStatus, VillaMaintenanceInfo } from "@/types";

export interface ServerData {
  inquiries: BookingInquiry[];
  maintenance: Record<string, VillaMaintenanceInfo>;
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
    maintenance: {},
    version: 1,
    lastUpdated: Date.now(),
  };
}

// Check for Vercel KV / Upstash Redis env vars
function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

async function fetchFromKv(): Promise<ServerData | null> {
  const kv = getKvConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/luxury_bookings_db_v1`, {
      headers: { Authorization: `Bearer ${kv.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
      return parsed as ServerData;
    }
  } catch (err) {
    console.warn("KV read error", err);
  }
  return null;
}

async function saveToKv(data: ServerData): Promise<void> {
  const kv = getKvConfig();
  if (!kv) return;
  try {
    await fetch(`${kv.url}/set/luxury_bookings_db_v1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch (err) {
    console.warn("KV write error", err);
  }
}

function readFromFile(): ServerData | null {
  // Try local data file first
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
      return JSON.parse(content) as ServerData;
    }
  } catch {
    // continue to tmp
  }

  // Try /tmp fallback
  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const content = fs.readFileSync(TMP_DATA_FILE, "utf-8");
      return JSON.parse(content) as ServerData;
    }
  } catch {
    // fallback
  }

  return null;
}

function saveToFile(data: ServerData): void {
  const serialized = JSON.stringify(data, null, 2);

  // Try local data dir
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, serialized, "utf-8");
  } catch {
    // Local write might fail in read-only serverless environment
  }

  // Also write to /tmp for serverless
  try {
    fs.writeFileSync(TMP_DATA_FILE, serialized, "utf-8");
  } catch {
    // ignore
  }
}

export const serverStore = {
  async getData(): Promise<ServerData> {
    // 1. If KV is configured, check KV
    const kvData = await fetchFromKv();
    if (kvData && kvData.inquiries) {
      globalThis.__luxury_server_store__ = kvData;
      return kvData;
    }

    // 2. Check in-memory global
    if (globalThis.__luxury_server_store__) {
      return globalThis.__luxury_server_store__;
    }

    // 3. Check disk file
    const diskData = readFromFile();
    if (diskData && diskData.inquiries) {
      globalThis.__luxury_server_store__ = diskData;
      return diskData;
    }

    // 4. Default to initial sample data
    const initial = getInitialData();
    globalThis.__luxury_server_store__ = initial;
    saveToFile(initial);
    return initial;
  },

  async setData(updater: (current: ServerData) => ServerData): Promise<ServerData> {
    const current = await this.getData();
    const updated = updater(current);
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
        return inquiryData.checkIn < inq.checkOut && inq.checkIn < inquiryData.checkOut;
      });

      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} (#${conflict.id} - ${conflict.guestName}). Please choose different dates.`
        );
      }
    }

    const newInquiry: BookingInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      createdAt: new Date().toISOString(),
    };

    await this.setData((curr) => ({
      ...curr,
      inquiries: [newInquiry, ...curr.inquiries],
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
};
