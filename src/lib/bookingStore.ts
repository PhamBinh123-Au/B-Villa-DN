import { BookingInquiry, InquiryStatus, VillaMaintenanceInfo } from "@/types";

const STORAGE_KEY = "danang_villa_booking_inquiries_v1";
const MAINTENANCE_STORAGE_KEY = "danang_villa_maintenance_v1";
export const SYNC_CHANNEL_NAME = "danang_villa_realtime_bookings";
export const LOCAL_EVENT_NAME = "danang_realtime_booking_event";

const SAMPLE_INITIAL_INQUIRIES: BookingInquiry[] = [
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

export interface RealtimeSyncPayload {
  action: "ADD" | "UPDATE" | "DELETE" | "RESET" | "MAINTENANCE_UPDATE";
  inquiry?: BookingInquiry;
  id?: string;
  villaId?: string;
  isMaintenance?: boolean;
  reason?: string;
  timestamp: number;
}

let isSyncing = false;
let initialSyncDone = false;
let knownInquiryIds = new Set<string>();

function broadcastSync(payload: RealtimeSyncPayload) {
  if (typeof window === "undefined") return;

  // 1. Dispatch custom event for current window
  try {
    window.dispatchEvent(
      new CustomEvent(LOCAL_EVENT_NAME, { detail: payload })
    );
  } catch (err) {
    console.warn("Local event dispatch error", err);
  }

  // 2. BroadcastChannel for instant cross-tab communication
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel error", err);
  }
}

/**
 * Stable signature helpers to detect genuine data changes and eliminate flickering re-renders
 */
export function getInquirySignature(list: BookingInquiry[]): string {
  if (!Array.isArray(list)) return "";
  return list
    .map((i) => `${i.id}:${i.status}:${i.checkIn}:${i.checkOut}:${i.villaId}`)
    .sort()
    .join("|");
}

export function getMaintenanceSignature(map: Record<string, VillaMaintenanceInfo>): string {
  if (!map) return "";
  return Object.keys(map)
    .sort()
    .map((k) => `${k}:${Boolean(map[k]?.isMaintenance)}:${map[k]?.reason || ""}`)
    .join("|");
}

/**
 * Robust non-destructive bidirectional sync between client browser and Next.js server API
 */
async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined" || isSyncing) return;
  if (typeof document !== "undefined" && document.hidden) return;
  isSyncing = true;

  try {
    const res = await fetch("/api/bookings", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!res.ok) return;

    const data = await res.json();
    const serverInquiries: BookingInquiry[] = Array.isArray(data.inquiries) && data.inquiries.length > 0
      ? data.inquiries
      : [];
    const serverMaintenance: Record<string, VillaMaintenanceInfo> = data.maintenance || {};

    const localInquiries = bookingStore.getInquiries();
    const localMaintenance = bookingStore.getMaintenanceMap();

    // 1. NON-DESTRUCTIVE UNION MERGE FOR INQUIRIES
    // Local inquiries that haven't reached the server yet are PRESERVED! Never deleted!
    const mergedMap = new Map<string, BookingInquiry>();

    // Put server inquiries first
    serverInquiries.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Merge local inquiries: preserve local entries and push unsynced items to server
    const unsyncedLocals: BookingInquiry[] = [];
    localInquiries.forEach((localItem) => {
      if (!mergedMap.has(localItem.id)) {
        mergedMap.set(localItem.id, localItem);
        unsyncedLocals.push(localItem);
      } else {
        const serverItem = mergedMap.get(localItem.id)!;
        // Merge fields, keeping the local edits if newer
        mergedMap.set(localItem.id, { ...serverItem, ...localItem });
      }
    });

    // If any local inquiry was missing on the server, push it in the background
    if (unsyncedLocals.length > 0) {
      unsyncedLocals.forEach((inq) => {
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inq),
        }).catch(() => {});
      });
    }

    let mergedInquiries = Array.from(mergedMap.values());
    if (mergedInquiries.length === 0) {
      mergedInquiries = [...SAMPLE_INITIAL_INQUIRIES];
    }

    // Sort: newest created first
    mergedInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 2. MERGE MAINTENANCE
    const mergedMaintenance: Record<string, VillaMaintenanceInfo> = {
      ...localMaintenance,
      ...serverMaintenance,
    };

    // 3. COMPARE SIGNATURES (Prevents flickering re-renders)
    const localSig = getInquirySignature(localInquiries);
    const mergedSig = getInquirySignature(mergedInquiries);

    const localMaintSig = getMaintenanceSignature(localMaintenance);
    const serverMaintSig = getMaintenanceSignature(mergedMaintenance);

    const inquiriesChanged = localSig !== mergedSig;
    const maintenanceChanged = localMaintSig !== serverMaintSig;

    // Detect genuine new remote inquiries
    const newlyArrivedRemote: BookingInquiry[] = [];
    if (initialSyncDone) {
      serverInquiries.forEach((i) => {
        if (!knownInquiryIds.has(i.id)) {
          newlyArrivedRemote.push(i);
        }
      });
    }

    // Update known IDs
    mergedInquiries.forEach((i) => knownInquiryIds.add(i.id));

    // Update storage only if signatures truly changed
    if (inquiriesChanged) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedInquiries));
    }
    if (maintenanceChanged) {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(mergedMaintenance));
    }

    if (!initialSyncDone) {
      initialSyncDone = true;
      if (inquiriesChanged || maintenanceChanged) {
        broadcastSync({ action: "UPDATE", timestamp: Date.now() });
      }
      return;
    }

    // Broadcast only on real changes
    if (newlyArrivedRemote.length > 0) {
      broadcastSync({
        action: "ADD",
        inquiry: newlyArrivedRemote[0],
        timestamp: Date.now(),
      });
    } else if (inquiriesChanged) {
      broadcastSync({
        action: "UPDATE",
        timestamp: Date.now(),
      });
    }

    if (maintenanceChanged) {
      broadcastSync({
        action: "MAINTENANCE_UPDATE",
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.debug("Server sync skipped:", err);
  } finally {
    isSyncing = false;
  }
}

// Background polling loop
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithServer();
  }, 100);

  // Poll smoothly every 2.5s
  setInterval(() => {
    syncWithServer();
  }, 2500);

  window.addEventListener("focus", () => syncWithServer());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncWithServer();
  });
}

export const bookingStore = {
  syncWithServer,

  getMaintenanceMap(): Record<string, VillaMaintenanceInfo> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to read maintenance data from storage", err);
      return {};
    }
  },

  isVillaUnderMaintenance(villaId: string): boolean {
    if (!villaId) return false;
    const map = this.getMaintenanceMap();
    return Boolean(map[villaId]?.isMaintenance);
  },

  getVillaMaintenanceInfo(villaId: string): VillaMaintenanceInfo | undefined {
    if (!villaId) return undefined;
    const map = this.getMaintenanceMap();
    return map[villaId];
  },

  setVillaMaintenance(villaId: string, isMaintenance: boolean, reason?: string): void {
    if (typeof window === "undefined") return;
    try {
      const map = this.getMaintenanceMap();
      const info: VillaMaintenanceInfo = {
        villaId,
        isMaintenance,
        reason: reason || (isMaintenance ? "Scheduled luxury maintenance & seasonal care" : undefined),
        updatedAt: new Date().toISOString(),
      };
      map[villaId] = info;
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(map));
      broadcastSync({
        action: "MAINTENANCE_UPDATE",
        villaId,
        isMaintenance,
        reason: info.reason,
        timestamp: Date.now(),
      });

      // Fire and forget server sync
      fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villaId, isMaintenance, reason: info.reason }),
      }).catch(() => {});
    } catch (err) {
      console.error("Failed to update villa maintenance in storage", err);
    }
  },

  async setVillaMaintenanceAsync(villaId: string, isMaintenance: boolean, reason?: string): Promise<VillaMaintenanceInfo> {
    const info: VillaMaintenanceInfo = {
      villaId,
      isMaintenance,
      reason: reason || (isMaintenance ? "Scheduled luxury maintenance & seasonal care" : undefined),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villaId, isMaintenance, reason: info.reason }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allMaintenance && typeof window !== "undefined") {
          localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(data.allMaintenance));
        }
      }
    } catch (err) {
      console.warn("Server maintenance call failed, applying locally", err);
    }

    this.setVillaMaintenance(villaId, isMaintenance, reason);
    return info;
  },

  getInquiries(): BookingInquiry[] {
    if (typeof window === "undefined") return [...SAMPLE_INITIAL_INQUIRIES];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_INQUIRIES));
        return [...SAMPLE_INITIAL_INQUIRIES];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_INQUIRIES));
        return [...SAMPLE_INITIAL_INQUIRIES];
      }
      return parsed as BookingInquiry[];
    } catch (err) {
      console.error("Failed to read inquiries from storage", err);
      return [...SAMPLE_INITIAL_INQUIRIES];
    }
  },

  async addInquiryAsync(
    inquiryData: Omit<BookingInquiry, "id" | "createdAt" | "status"> & { status?: InquiryStatus }
  ): Promise<BookingInquiry> {
    const status = inquiryData.status || "pending";

    // Strictly check if villa is currently under maintenance
    if (inquiryData.villaId && this.isVillaUnderMaintenance(inquiryData.villaId)) {
      throw new Error(
        `Reservation Prohibited: Villa is currently under scheduled maintenance. Reservations are temporarily closed for this property.`
      );
    }

    // Strictly validate against overlapping reservations for the same villa
    if (status !== "cancelled" && inquiryData.villaId && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = this.hasDateConflict(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId);
      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} (#${conflict.id} - ${conflict.guestName}). Please choose non-overlapping dates.`
        );
      }
    }

    // Immediately save locally so client has 0ms latency and NEVER loses the booking
    const localInquiry = this.addInquiry(inquiryData);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        // If server detected overlap conflict, rollback local
        if (errJson.error && (errJson.error.includes("Overlapping") || errJson.error.includes("Prohibited"))) {
          this.deleteInquiry(localInquiry.id);
          throw new Error(errJson.error);
        }
      } else {
        const data = await res.json();
        if (data.inquiry) {
          knownInquiryIds.add(data.inquiry.id);
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("Overlapping") || err.message.includes("Prohibited") || err.message.includes("reserved"))) {
        throw err;
      }
      console.warn("Background server booking POST failed, local reservation saved safely:", err);
    }

    return localInquiry;
  },

  addInquiry(
    inquiryData: Omit<BookingInquiry, "id" | "createdAt" | "status"> & { status?: InquiryStatus }
  ): BookingInquiry {
    const status = inquiryData.status || "pending";

    // Strictly check if villa is currently under maintenance
    if (inquiryData.villaId && this.isVillaUnderMaintenance(inquiryData.villaId)) {
      throw new Error(
        `Reservation Prohibited: Villa is currently under scheduled maintenance. Reservations are temporarily closed for this property.`
      );
    }

    // Strictly validate against overlapping reservations for the same villa
    if (status !== "cancelled" && inquiryData.villaId && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = this.hasDateConflict(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId);
      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} (#${conflict.id} - ${conflict.guestName}). Please choose non-overlapping dates.`
        );
      }
    }

    const inquiries = this.getInquiries();
    const newInquiry: BookingInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      createdAt: new Date().toISOString(),
    };

    const updated = [newInquiry, ...inquiries.filter((i) => i.id !== newInquiry.id)];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      knownInquiryIds.add(newInquiry.id);
      broadcastSync({
        action: "ADD",
        inquiry: newInquiry,
        timestamp: Date.now(),
      });

      // Fire and forget server sync in background
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      }).catch(() => {});
    }
    return newInquiry;
  },

  async updateInquiryAsync(id: string, updatedFields: Partial<BookingInquiry>): Promise<void> {
    const inquiries = this.getInquiries();
    const target = inquiries.find((item) => item.id === id);
    if (!target) return;

    const merged = { ...target, ...updatedFields };

    if (merged.status !== "cancelled") {
      const conflict = this.hasDateConflict(merged.checkIn, merged.checkOut, merged.villaId, id);
      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}).`
        );
      }
    }

    this.updateInquiry(id, updatedFields);

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && errJson.error.includes("Overlapping")) {
          throw new Error(errJson.error);
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes("Overlapping")) {
        throw err;
      }
    }
  },

  updateInquiry(id: string, updatedFields: Partial<BookingInquiry>): void {
    const inquiries = this.getInquiries();
    const target = inquiries.find((item) => item.id === id);
    if (!target) return;

    const merged = { ...target, ...updatedFields };

    // Strictly validate that update does not create an overlap with another reservation
    if (merged.status !== "cancelled") {
      const conflict = this.hasDateConflict(merged.checkIn, merged.checkOut, merged.villaId, id);
      if (conflict) {
        throw new Error(
          `Overlapping Booking Prohibited: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}).`
        );
      }
    }

    let updatedInquiry: BookingInquiry | undefined;
    const updated = inquiries.map((item) => {
      if (item.id === id) {
        updatedInquiry = merged;
        return updatedInquiry;
      }
      return item;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      broadcastSync({
        action: "UPDATE",
        id,
        inquiry: updatedInquiry,
        timestamp: Date.now(),
      });

      fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      }).catch(() => {});
    }
  },

  findConflictsForInquiry(inquiry: BookingInquiry): BookingInquiry[] {
    if (inquiry.status === "cancelled") return [];
    const inquiries = this.getInquiries();
    return inquiries.filter(
      (other) =>
        other.id !== inquiry.id &&
        other.villaId === inquiry.villaId &&
        other.status !== "cancelled" &&
        inquiry.checkIn < other.checkOut &&
        other.checkIn < inquiry.checkOut
    );
  },

  updateStatus(id: string, status: InquiryStatus): void {
    this.updateInquiry(id, { status });
  },

  async deleteInquiryAsync(id: string): Promise<void> {
    this.deleteInquiry(id);
    try {
      await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Server delete failed:", err);
    }
  },

  deleteInquiry(id: string): void {
    const inquiries = this.getInquiries();
    const updated = inquiries.filter((item) => item.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      knownInquiryIds.delete(id);
      broadcastSync({
        action: "DELETE",
        id,
        timestamp: Date.now(),
      });

      fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => {});
    }
  },

  async resetSampleDataAsync(): Promise<void> {
    this.resetSampleData();
    try {
      await fetch("/api/bookings/reset", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Server reset failed:", err);
    }
  },

  resetSampleData(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_INQUIRIES));
      knownInquiryIds = new Set(SAMPLE_INITIAL_INQUIRIES.map((i) => i.id));
      broadcastSync({
        action: "RESET",
        timestamp: Date.now(),
      });

      fetch("/api/bookings/reset", {
        method: "POST",
      }).catch(() => {});
    }
  },

  isDateBooked(dateStr: string, villaId?: string): { isBooked: boolean; villaNames: string[]; status?: InquiryStatus } {
    const inquiries = this.getInquiries();
    const activeInquiries = inquiries.filter(
      (inq) => inq.status !== "cancelled" && dateStr >= inq.checkIn && dateStr < inq.checkOut
    );

    if (villaId) {
      if (this.isVillaUnderMaintenance(villaId)) {
        return { isBooked: true, villaNames: ["Under Maintenance"], status: "confirmed" };
      }
      const match = activeInquiries.find((inq) => inq.villaId === villaId);
      if (match) {
        return { isBooked: true, villaNames: [match.villaName], status: match.status };
      }
      return { isBooked: false, villaNames: [] };
    }

    const bookedVillaIds = new Set(activeInquiries.map((i) => i.villaId));
    const maintenanceMap = this.getMaintenanceMap();
    Object.keys(maintenanceMap).forEach((id) => {
      if (maintenanceMap[id]?.isMaintenance) {
        bookedVillaIds.add(id);
      }
    });
    if (bookedVillaIds.size >= 4) {
      return {
        isBooked: true,
        villaNames: Array.from(bookedVillaIds),
        status: "confirmed",
      };
    }

    return {
      isBooked: false,
      villaNames: Array.from(bookedVillaIds),
    };
  },

  hasDateConflict(
    checkIn: string,
    checkOut: string,
    villaId: string,
    excludeInqId?: string
  ): BookingInquiry | undefined {
    if (villaId && this.isVillaUnderMaintenance(villaId)) {
      const info = this.getVillaMaintenanceInfo(villaId);
      return {
        id: "MAINTENANCE",
        villaId,
        villaName: "Under Maintenance",
        guestName: "Property Under Maintenance",
        email: "",
        phone: "",
        checkIn: checkIn || "2020-01-01",
        checkOut: checkOut || "2099-12-31",
        adults: 0,
        children: 0,
        status: "confirmed",
        createdAt: info?.updatedAt || new Date().toISOString(),
        specialRequests: info?.reason || "Scheduled luxury maintenance & seasonal care. Inquiries temporarily paused.",
      };
    }

    const inquiries = this.getInquiries();
    return inquiries.find((inq) => {
      if (inq.status === "cancelled" || inq.villaId !== villaId) return false;
      if (excludeInqId && inq.id === excludeInqId) return false;

      return checkIn < inq.checkOut && inq.checkIn < checkOut;
    });
  },

  subscribe(callback: (payload: RealtimeSyncPayload) => void): () => void {
    if (typeof window === "undefined") return () => {};

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event: MessageEvent<RealtimeSyncPayload>) => {
          if (event.data) {
            callback(event.data);
          }
        };
      }
    } catch (err) {
      console.warn("Failed to create BroadcastChannel", err);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === MAINTENANCE_STORAGE_KEY) {
        callback({
          action: "UPDATE",
          timestamp: Date.now(),
        });
      }
    };
    window.addEventListener("storage", handleStorage);

    const handleLocal = (event: Event) => {
      const customEvent = event as CustomEvent<RealtimeSyncPayload>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(LOCAL_EVENT_NAME, handleLocal);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_EVENT_NAME, handleLocal);
    };
  },
};
