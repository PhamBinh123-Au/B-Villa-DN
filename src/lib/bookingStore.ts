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
 * Background bidirectional sync between client browser and Next.js server API
 */
async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined" || isSyncing) return;
  isSyncing = true;

  try {
    const res = await fetch("/api/bookings", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!res.ok) return;

    const data = await res.json();
    const serverInquiries: BookingInquiry[] = Array.isArray(data.inquiries) ? data.inquiries : [];
    const serverMaintenance: Record<string, VillaMaintenanceInfo> = data.maintenance || {};

    const localInquiries = bookingStore.getInquiries();
    const localMaintenance = bookingStore.getMaintenanceMap();

    const localInquiriesJson = JSON.stringify(localInquiries);
    const serverInquiriesJson = JSON.stringify(serverInquiries);
    const localMaintJson = JSON.stringify(localMaintenance);
    const serverMaintJson = JSON.stringify(serverMaintenance);

    if (!initialSyncDone) {
      initialSyncDone = true;
      knownInquiryIds = new Set(serverInquiries.map((i) => i.id));
      localStorage.setItem(STORAGE_KEY, serverInquiriesJson);
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, serverMaintJson);

      if (localInquiriesJson !== serverInquiriesJson || localMaintJson !== serverMaintJson) {
        broadcastSync({ action: "UPDATE", timestamp: Date.now() });
      }
      return;
    }

    // Identify brand new inquiries sent from another device (e.g., mobile phone or other browser)
    const newInquiries = serverInquiries.filter((i) => !knownInquiryIds.has(i.id));

    // Update known set
    serverInquiries.forEach((i) => knownInquiryIds.add(i.id));

    const inquiriesChanged = localInquiriesJson !== serverInquiriesJson;
    const maintenanceChanged = localMaintJson !== serverMaintJson;

    if (inquiriesChanged) {
      localStorage.setItem(STORAGE_KEY, serverInquiriesJson);
    }
    if (maintenanceChanged) {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, serverMaintJson);
    }

    if (newInquiries.length > 0) {
      // Broadcast ADD for newest arrival to trigger sound chime & real-time toast
      broadcastSync({
        action: "ADD",
        inquiry: newInquiries[0],
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

// Background poller on client
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithServer();
  }, 100);

  // Poll every 1.5s for instant multi-device synchronization
  setInterval(() => {
    syncWithServer();
  }, 1500);

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
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_INQUIRIES));
        return SAMPLE_INITIAL_INQUIRIES;
      }
      return JSON.parse(data) as BookingInquiry[];
    } catch (err) {
      console.error("Failed to read inquiries from storage", err);
      return [];
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

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to submit reservation (${res.status})`);
      }

      const data = await res.json();
      const created: BookingInquiry = data.inquiry;

      // Update local storage
      const inquiries = this.getInquiries();
      const updated = [created, ...inquiries.filter((i) => i.id !== created.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        knownInquiryIds.add(created.id);
        broadcastSync({
          action: "ADD",
          inquiry: created,
          timestamp: Date.now(),
        });
      }

      return created;
    } catch (err: any) {
      if (err.message && (err.message.includes("Overlapping") || err.message.includes("Prohibited") || err.message.includes("reserved"))) {
        throw err;
      }
      // Offline fallback
      return this.addInquiry(inquiryData);
    }
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

    const updated = [newInquiry, ...inquiries];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      knownInquiryIds.add(newInquiry.id);
      broadcastSync({
        action: "ADD",
        inquiry: newInquiry,
        timestamp: Date.now(),
      });

      // Fire and forget server sync
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
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

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to update reservation (${res.status})`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("Overlapping")) {
        throw err;
      }
    }

    this.updateInquiry(id, updatedFields);
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

  /**
   * Find any other active inquiries that overlap with the specified inquiry
   */
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
    try {
      await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Server delete failed, applying locally:", err);
    }
    this.deleteInquiry(id);
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
    try {
      await fetch("/api/bookings/reset", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Server reset failed, applying locally:", err);
    }
    this.resetSampleData();
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

  /**
   * Check if a specific date (YYYY-MM-DD) is occupied by any active reservation for a given villa.
   * If villaId is not specified or empty (All 4 villas), checks if ALL 4 villas are occupied on that date.
   */
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

    // If "All 4 Villas": marked fully booked only if 4 distinct villas are booked or under maintenance
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

  /**
   * Check if a requested stay date range overlaps with existing bookings
   */
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

      // Overlap condition: startA < endB and startB < endA
      return checkIn < inq.checkOut && inq.checkIn < checkOut;
    });
  },

  /**
   * Subscribe to real-time events across all tabs, local events, and storage updates
   */
  subscribe(callback: (payload: RealtimeSyncPayload) => void): () => void {
    if (typeof window === "undefined") return () => {};

    // 1. BroadcastChannel listener (cross-tab)
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

    // 2. Storage event listener (standard browser cross-tab event)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === MAINTENANCE_STORAGE_KEY) {
        callback({
          action: "UPDATE",
          timestamp: Date.now(),
        });
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Local custom event listener (same-tab)
    const handleLocal = (event: Event) => {
      const customEvent = event as CustomEvent<RealtimeSyncPayload>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(LOCAL_EVENT_NAME, handleLocal);

    // Return cleanup function
    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LOCAL_EVENT_NAME, handleLocal);
    };
  },
};
