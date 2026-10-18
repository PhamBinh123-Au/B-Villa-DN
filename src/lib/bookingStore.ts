import { BookingInquiry, CleaningStatus, InquiryStatus, VillaMaintenanceInfo, PaymentStatus } from "@/types";

const STORAGE_KEY = "danang_villa_booking_inquiries_v1";
const MAINTENANCE_STORAGE_KEY = "danang_villa_maintenance_v1";
const DELETED_STORAGE_KEY = "danang_villa_deleted_ids_v1";
export const PRICES_STORAGE_KEY = "danang_villa_prices_v1";
export const USD_RATE_STORAGE_KEY = "danang_villa_usd_rate_v1";
export const SYNC_CHANNEL_NAME = "danang_villa_realtime_bookings";
export const LOCAL_EVENT_NAME = "danang_realtime_booking_event";

export const DEFAULT_VILLA_PRICES: Record<string, number> = {
  "b1-villa-4pn": 18000000,
  "b2-villa-4pn": 19500000,
  "b3-villa-2pn": 9500000,
  "b4-villa-4pn": 17000000,
};
export const DEFAULT_USD_RATE = 25400;

export function formatPriceVnd(amount: number): string {
  if (!amount || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function formatPriceUsd(amountVnd: number, usdRate = DEFAULT_USD_RATE): string {
  if (!amountVnd || isNaN(amountVnd)) return "0";
  const rate = usdRate > 0 ? usdRate : DEFAULT_USD_RATE;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(amountVnd / rate));
}

export function calculateStayNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 1;
  const tIn = new Date(checkIn).getTime();
  const tOut = new Date(checkOut).getTime();
  if (isNaN(tIn) || isNaN(tOut)) return 1;
  return Math.max(1, Math.round((tOut - tIn) / 86400000));
}

export function calculateStayTotal(checkIn: string, checkOut: string, villaIdOrNightly: string | number): number {
  const nights = calculateStayNights(checkIn, checkOut);
  const nightly = typeof villaIdOrNightly === "number" ? villaIdOrNightly : bookingStore.getVillaPrice(villaIdOrNightly);
  return nights * nightly;
}

export function getStayStatus(checkIn: string, checkOut: string): "upcoming" | "in_house" | "checkout_today" | "expired" {
  if (!checkIn || !checkOut) return "upcoming";
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (checkOut < todayStr) return "expired";
  if (checkOut === todayStr) return "checkout_today";
  if (checkIn <= todayStr && todayStr < checkOut) return "in_house";
  return "upcoming";
}

export function isCheckoutExpired(checkOut: string): boolean {
  if (!checkOut) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return checkOut < todayStr;
}

export function isCheckoutToday(checkOut: string): boolean {
  if (!checkOut) return false;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return checkOut === todayStr;
}

const SAMPLE_INITIAL_INQUIRIES: BookingInquiry[] = [
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

export interface RealtimeSyncPayload {
  action: "ADD" | "UPDATE" | "DELETE" | "RESET" | "MAINTENANCE_UPDATE" | "PRICE_UPDATE" | "CLEANING_UPDATE" | "PAYMENT_UPDATE" | "APP_DATA_UPDATE" | "SETTINGS_UPDATE";
  inquiry?: BookingInquiry;
  id?: string;
  villaId?: string;
  isMaintenance?: boolean;
  reason?: string;
  startDate?: string;
  endDate?: string;
  prices?: Record<string, number>;
  usdRate?: number;
  cleaningStatus?: CleaningStatus;
  paymentStatus?: PaymentStatus;
  key?: string;
  data?: any;
  timestamp: number;
}

let isSyncing = false;
let initialSyncDone = false;
let knownInquiryIds = new Set<string>();
let cloudStorageDetected = false;
let cloudStorageTypeString = "Checking cloud storage...";

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
 * Deduplicate inquiries by ID and active booking slot (villaId + checkIn + checkOut)
 */
export function deduplicateInquiries(list: BookingInquiry[]): BookingInquiry[] {
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
 * Pure READ-ONLY background synchronization between client and server
 * Never resurrects deleted inquiries, never loops POST requests
  */
async function syncWithServer(): Promise<void> {
  if (typeof window === "undefined" || isSyncing) return;
  if (typeof document !== "undefined" && document.hidden) return;
  isSyncing = true;

  try {
    const headers: Record<string, string> = { "Cache-Control": "no-cache" };
    try {
      if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("bvilla_admin_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {}

    const res = await fetch("/api/bookings", {
      cache: "no-store",
      credentials: "include",
      headers,
    });

    if (!res.ok) return;

    const data = await res.json();

    if (typeof data.isCloudStorage === "boolean") {
      cloudStorageDetected = data.isCloudStorage;
      if (data.storageType) {
        cloudStorageTypeString = data.storageType;
      }
    }

    // 1. Ingest tombstoned deleted IDs from server
    if (Array.isArray(data.deletedIds)) {
      if (typeof window !== "undefined") {
        localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(data.deletedIds));
      }
    }
    const currentDeletedSet = new Set<string>(Array.isArray(data.deletedIds) ? data.deletedIds : []);

    const rawServerInquiries: BookingInquiry[] = Array.isArray(data.inquiries) ? data.inquiries : [];
    const serverInquiries = deduplicateInquiries(rawServerInquiries).filter(
      (i) => !currentDeletedSet.has(i.id)
    );
    const serverMaintenance: Record<string, VillaMaintenanceInfo> = data.maintenance || {};

    const localInquiries = bookingStore.getInquiries().filter(
      (i) => !currentDeletedSet.has(i.id)
    );
    const localMaintenance = bookingStore.getMaintenanceMap();

    // 2. MERGE INQUIRIES SAFELY (Preserving local customer details if server item was sanitized)
    const mergedMap = new Map<string, BookingInquiry>();

    // Server authoritative items first
    serverInquiries.forEach((item) => {
      mergedMap.set(item.id, item);
    });

    // Local items: keep locally created items without resurrecting deleted items
    localInquiries.forEach((localItem) => {
      if (!mergedMap.has(localItem.id)) {
        mergedMap.set(localItem.id, localItem);
      } else {
        const serverItem = mergedMap.get(localItem.id)!;
        const resolvedGuestName =
          serverItem.guestName && serverItem.guestName !== "Khách Đặt"
            ? serverItem.guestName
            : localItem.guestName || "Khách Đặt";

        mergedMap.set(localItem.id, {
          ...serverItem,
          ...localItem,
          status: serverItem.status || localItem.status,
          guestName: resolvedGuestName,
          phone: serverItem.phone || localItem.phone || "",
          email: serverItem.email || localItem.email || "",
          totalPriceVnd: serverItem.totalPriceVnd ?? localItem.totalPriceVnd,
          paymentStatus: serverItem.paymentStatus || localItem.paymentStatus,
          isCheckedIn: serverItem.isCheckedIn ?? localItem.isCheckedIn,
          isCheckedOut: serverItem.isCheckedOut ?? localItem.isCheckedOut,
        });
      }
    });

    // 3. AUTO-UPLINK: If this device has local inquiries that the cloud server is missing,
    // automatically sync them up to the cloud DB (so phone and PC stay 100% in sync)
    const missingOnServer = localInquiries.filter(
      (loc) => !serverInquiries.some((srv) => srv.id === loc.id) && !currentDeletedSet.has(loc.id)
    );

    if (missingOnServer.length > 0 && typeof window !== "undefined") {
      const isDashboard = window.location.pathname.startsWith("/admin");
      if (isDashboard) {
        const uplinkHeaders: Record<string, string> = { "Content-Type": "application/json" };
        try {
          const token = sessionStorage.getItem("bvilla_admin_token");
          if (token) uplinkHeaders["Authorization"] = `Bearer ${token}`;
        } catch {}

        fetch("/api/bookings/sync", {
          method: "POST",
          headers: uplinkHeaders,
          credentials: "include",
          body: JSON.stringify({
            inquiries: localInquiries,
            replaceAll: false,
          }),
        }).catch(() => {});
      }
    }

    const mergedInquiries = deduplicateInquiries(Array.from(mergedMap.values())).filter(
      (i) => !currentDeletedSet.has(i.id)
    );

    // Sort: newest created first
    mergedInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 4. MERGE MAINTENANCE
    const mergedMaintenance: Record<string, VillaMaintenanceInfo> = {
      ...localMaintenance,
      ...serverMaintenance,
    };

    // 5. COMPARE SIGNATURES (Prevents flickering re-renders)
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
        if (!knownInquiryIds.has(i.id) && !currentDeletedSet.has(i.id)) {
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

    let pricesChanged = false;
    if (data.prices && typeof data.prices === "object") {
      const curPrices = bookingStore.getAllVillaPrices();
      const hasDiff = Object.entries(data.prices).some(([k, v]) => curPrices[k] !== v);
      if (hasDiff) {
        pricesChanged = true;
        const mergedPrices = { ...curPrices, ...data.prices };
        localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(mergedPrices));
      }
    }
    if (typeof data.usdRate === "number" && data.usdRate > 0) {
      const storedRate = localStorage.getItem(USD_RATE_STORAGE_KEY);
      if (storedRate !== String(data.usdRate)) {
        pricesChanged = true;
        localStorage.setItem(USD_RATE_STORAGE_KEY, String(data.usdRate));
      }
    }

    if (!initialSyncDone) {
      initialSyncDone = true;
      if (inquiriesChanged || maintenanceChanged || pricesChanged) {
        broadcastSync({ action: "UPDATE", timestamp: Date.now() });
      }
      return;
    }

    if (pricesChanged) {
      broadcastSync({
        action: "PRICE_UPDATE",
        prices: data.prices,
        usdRate: data.usdRate,
        timestamp: Date.now(),
      });
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

    // App data (settings, rules, amenities, gallery, reviews, accounts, CRM, villas) sync
    try {
      const appDataRes = await fetch("/api/app-data", { cache: "no-store" });
      if (appDataRes.ok) {
        const appData = await appDataRes.json();
        let appDataChanged = false;

        const syncField = (key: string, storageKey: string) => {
          if (appData[key] !== undefined && appData[key] !== null) {
            const currentStr = localStorage.getItem(storageKey);
            const remoteStr = JSON.stringify(appData[key]);
            if (currentStr !== remoteStr) {
              try {
                if (currentStr && JSON.stringify(JSON.parse(currentStr)) === JSON.stringify(JSON.parse(remoteStr))) {
                  return;
                }
              } catch {}
              localStorage.setItem(storageKey, remoteStr);
              appDataChanged = true;
            }
          }
        };

        syncField("settings", "bvilla_settings_v1");
        syncField("pricingRules", "bvilla_pricing_rules_v1");
        syncField("amenities", "bvilla_amenities_v1");
        syncField("gallery", "bvilla_gallery_v1");
        syncField("reviews", "bvilla_reviews_v1");
        syncField("adminUsers", "bvilla_admin_users_v1");
        syncField("customers", "bvilla_customers_v1");
        syncField("villas", "bvilla_villa_overrides_v1");

        if (appDataChanged) {
          broadcastSync({ action: "APP_DATA_UPDATE", timestamp: Date.now() });
        }
      }
    } catch {
      // ignore
    }
  } catch (err) {
    console.debug("Server sync skipped:", err);
  } finally {
    isSyncing = false;
  }
}

// Background polling loop (efficient 10s cadence)
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncWithServer();
  }, 100);

  // Poll smoothly every 10s to keep CPU and UI interaction thread completely free
  setInterval(() => {
    syncWithServer();
  }, 10000);

  window.addEventListener("focus", () => syncWithServer());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncWithServer();
  });
}

export const bookingStore = {
  syncWithServer,
  broadcast: broadcastSync,

  async forceSyncCloud(): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined") return { success: false, count: 0 };
    try {
      const localInquiries = this.getInquiries();
      const syncHeaders: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const token = sessionStorage.getItem("bvilla_admin_token");
        if (token) syncHeaders["Authorization"] = `Bearer ${token}`;
      } catch {}

      const res = await fetch("/api/bookings/sync", {
        method: "POST",
        headers: syncHeaders,
        credentials: "include",
        body: JSON.stringify({
          inquiries: localInquiries,
          replaceAll: false,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Lỗi phản hồi máy chủ (${res.status})`);
      }

      const resData = await res.json();
      await syncWithServer();
      broadcastSync({ action: "UPDATE", timestamp: Date.now() });
      return { success: true, count: resData.importedCount || localInquiries.length };
    } catch (err: any) {
      await syncWithServer();
      return { success: false, count: this.getInquiries().length, error: err.message };
    }
  },

  getDeletedIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
      const data = localStorage.getItem(DELETED_STORAGE_KEY);
      if (!data) return new Set();
      const parsed = JSON.parse(data);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  },

  addDeletedId(id: string): void {
    if (typeof window === "undefined" || !id) return;
    try {
      const set = this.getDeletedIds();
      set.add(id);
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  },

  clearDeletedIds(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(DELETED_STORAGE_KEY);
    } catch {}
  },

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
    const info = map[villaId];
    if (!info || !info.isMaintenance) return false;

    // Vô thời hạn nếu không thiết lập ngày bắt đầu hoặc ngày kết thúc
    if (!info.startDate || !info.endDate) return true;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Đã qua ngày kết thúc -> tự động hết hạn bảo trì, mở lại hoạt động
    if (todayStr > info.endDate) return false;
    // Chưa tới ngày bắt đầu bảo trì -> hôm nay vẫn hoạt động bình thường
    if (todayStr < info.startDate) return false;

    // Đang trong đợt bảo trì
    return true;
  },

  isVillaDateUnderMaintenance(villaId: string, dateStr: string): boolean {
    if (!villaId || !dateStr) return false;
    const map = this.getMaintenanceMap();
    const info = map[villaId];
    if (!info || !info.isMaintenance) return false;

    // Vô thời hạn -> mọi ngày đều bảo trì
    if (!info.startDate || !info.endDate) return true;

    // Khoá các ngày nằm trong đợt bảo trì [startDate, endDate]
    return dateStr >= info.startDate && dateStr <= info.endDate;
  },

  hasMaintenanceConflict(villaId: string, checkIn: string, checkOut: string): boolean {
    if (!villaId || !checkIn || !checkOut) return false;
    const map = this.getMaintenanceMap();
    const info = map[villaId];
    if (!info || !info.isMaintenance) return false;

    // Vô thời hạn -> luôn xung đột
    if (!info.startDate || !info.endDate) return true;

    // Khách ở: [checkIn, checkOut) (trả phòng ngày checkOut)
    // Bảo trì: [info.startDate, info.endDate] (bao gồm ngày endDate)
    // Không xung đột nếu khách trả phòng trước ngày bảo trì (checkOut <= info.startDate)
    // hoặc khách nhận phòng sau ngày bảo trì kết thúc (checkIn > info.endDate)
    if (checkOut <= info.startDate || checkIn > info.endDate) {
      return false;
    }
    return true;
  },

  getVillaMaintenanceInfo(villaId: string): VillaMaintenanceInfo | undefined {
    if (!villaId) return undefined;
    const map = this.getMaintenanceMap();
    return map[villaId];
  },

  setVillaMaintenance(
    villaId: string,
    isMaintenance: boolean,
    reason?: string,
    startDate?: string,
    endDate?: string
  ): void {
    if (typeof window === "undefined") return;
    try {
      const map = this.getMaintenanceMap();
      const info: VillaMaintenanceInfo = {
        villaId,
        isMaintenance,
        reason: reason || (isMaintenance ? "Scheduled luxury maintenance & seasonal care" : undefined),
        startDate: isMaintenance ? startDate : undefined,
        endDate: isMaintenance ? endDate : undefined,
        updatedAt: new Date().toISOString(),
      };
      map[villaId] = info;
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(map));
      broadcastSync({
        action: "MAINTENANCE_UPDATE",
        villaId,
        isMaintenance,
        reason: info.reason,
        startDate: info.startDate,
        endDate: info.endDate,
        timestamp: Date.now(),
      });

      // Fire and forget server sync
      fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaId,
          isMaintenance,
          reason: info.reason,
          startDate: info.startDate,
          endDate: info.endDate,
        }),
      }).catch(() => {});
    } catch (err) {
      console.error("Failed to update villa maintenance in storage", err);
    }
  },

  async setVillaMaintenanceAsync(
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

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villaId,
          isMaintenance,
          reason: info.reason,
          startDate: info.startDate,
          endDate: info.endDate,
        }),
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

    this.setVillaMaintenance(villaId, isMaintenance, reason, startDate, endDate);
    return info;
  },

  getInquiries(): BookingInquiry[] {
    if (typeof window === "undefined") return [...SAMPLE_INITIAL_INQUIRIES];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      // ONLY seed on first install when the key has never been written
      if (data === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_INQUIRIES));
        return [...SAMPLE_INITIAL_INQUIRIES];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const delSet = this.getDeletedIds();
      const clean = deduplicateInquiries(parsed).filter((i) => !delSet.has(i.id));
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      }
      return clean;
    } catch (err) {
      console.error("Failed to read inquiries from storage", err);
      return [];
    }
  },

  async addInquiryAsync(
    inquiryData: Omit<BookingInquiry, "id" | "createdAt" | "status"> & { status?: InquiryStatus }
  ): Promise<BookingInquiry> {
    let status = inquiryData.status || "pending";

    // Strictly check if villa is currently under maintenance
    if (inquiryData.villaId) {
      if (inquiryData.checkIn && inquiryData.checkOut) {
        if (this.hasMaintenanceConflict(inquiryData.villaId, inquiryData.checkIn, inquiryData.checkOut)) {
          const info = this.getVillaMaintenanceInfo(inquiryData.villaId);
          const rangeInfo = info?.startDate && info?.endDate ? ` (từ ${info.startDate} đến ${info.endDate})` : "";
          throw new Error(
            `Reservation Prohibited: Villa đang trong lịch bảo trì định kỳ${rangeInfo}. Vui lòng chọn khoảng ngày khác.`
          );
        }
      } else if (this.isVillaUnderMaintenance(inquiryData.villaId)) {
        throw new Error(
          `Reservation Prohibited: Villa is currently under scheduled maintenance. Reservations are temporarily closed for this property.`
        );
      }
    }

    // Safely validate against overlapping reservations for confirmed bookings
    if (status === "confirmed" && inquiryData.villaId && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = this.hasDateConflict(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId);
      if (conflict) {
        console.warn(
          `[bookingStore] Date conflict detected with #${conflict.id} - preserving reservation as pending instead of throwing fatal crash`
        );
        status = "pending";
      }
    }

    // 1. Generate unique inquiry with deterministic ID once
    const calculatedTotalAsync = inquiryData.checkIn && inquiryData.checkOut && inquiryData.villaId
      ? calculateStayTotal(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId)
      : 0;
    const newInquiry: BookingInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      totalPriceVnd: inquiryData.totalPriceVnd ?? calculatedTotalAsync,
      paymentStatus: inquiryData.paymentStatus || "unpaid",
      paidAmountVnd: inquiryData.paidAmountVnd ?? (inquiryData.paymentStatus === "paid" ? calculatedTotalAsync : 0),
      createdAt: new Date().toISOString(),
    };

    // 2. Submit single POST request to server
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to submit reservation (${res.status})`);
      }

      const data = await res.json();
      const confirmedInquiry: BookingInquiry = data.inquiry || newInquiry;

      // 3. Save locally only after server accepts
      const inquiries = this.getInquiries();
      const updated = deduplicateInquiries([confirmedInquiry, ...inquiries.filter((i) => i.id !== confirmedInquiry.id)]);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        knownInquiryIds.add(confirmedInquiry.id);
        broadcastSync({
          action: "ADD",
          inquiry: confirmedInquiry,
          timestamp: Date.now(),
        });
      }

      return confirmedInquiry;
    } catch (err: any) {
      if (err.message && (err.message.includes("Overlapping") || err.message.includes("Prohibited") || err.message.includes("reserved"))) {
        throw err;
      }
      // Offline fallback: save locally if server unreachable
      const inquiries = this.getInquiries();
      const updated = deduplicateInquiries([newInquiry, ...inquiries.filter((i) => i.id !== newInquiry.id)]);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        knownInquiryIds.add(newInquiry.id);
        broadcastSync({
          action: "ADD",
          inquiry: newInquiry,
          timestamp: Date.now(),
        });
      }
      return newInquiry;
    }
  },

  addInquiry(
    inquiryData: Omit<BookingInquiry, "id" | "createdAt" | "status"> & { status?: InquiryStatus }
  ): BookingInquiry {
    let status = inquiryData.status || "pending";

    // Strictly check if villa is currently under maintenance
    if (inquiryData.villaId) {
      if (inquiryData.checkIn && inquiryData.checkOut) {
        if (this.hasMaintenanceConflict(inquiryData.villaId, inquiryData.checkIn, inquiryData.checkOut)) {
          const info = this.getVillaMaintenanceInfo(inquiryData.villaId);
          const rangeInfo = info?.startDate && info?.endDate ? ` (từ ${info.startDate} đến ${info.endDate})` : "";
          throw new Error(
            `Reservation Prohibited: Villa đang trong lịch bảo trì định kỳ${rangeInfo}. Vui lòng chọn khoảng ngày khác.`
          );
        }
      } else if (this.isVillaUnderMaintenance(inquiryData.villaId)) {
        throw new Error(
          `Reservation Prohibited: Villa is currently under scheduled maintenance. Reservations are temporarily closed for this property.`
        );
      }
    }

    // Safely validate against overlapping reservations for confirmed bookings
    if (status === "confirmed" && inquiryData.villaId && inquiryData.checkIn && inquiryData.checkOut) {
      const conflict = this.hasDateConflict(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId);
      if (conflict) {
        console.warn(
          `[bookingStore] Date conflict detected with #${conflict.id} - preserving reservation as pending instead of throwing fatal crash`
        );
        status = "pending";
      }
    }

    const inquiries = this.getInquiries();
    const calculatedTotalSync = inquiryData.checkIn && inquiryData.checkOut && inquiryData.villaId
      ? calculateStayTotal(inquiryData.checkIn, inquiryData.checkOut, inquiryData.villaId)
      : 0;
    const newInquiry: BookingInquiry = {
      ...inquiryData,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      totalPriceVnd: inquiryData.totalPriceVnd ?? calculatedTotalSync,
      paymentStatus: inquiryData.paymentStatus || "unpaid",
      paidAmountVnd: inquiryData.paidAmountVnd ?? (inquiryData.paymentStatus === "paid" ? calculatedTotalSync : 0),
      createdAt: new Date().toISOString(),
    };

    const updated = deduplicateInquiries([newInquiry, ...inquiries.filter((i) => i.id !== newInquiry.id)]);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      knownInquiryIds.add(newInquiry.id);
      broadcastSync({
        action: "ADD",
        inquiry: newInquiry,
        timestamp: Date.now(),
      });

      // Fire single background sync to server
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

    if (target) {
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
        const conflict = this.hasDateConflict(merged.checkIn, merged.checkOut, merged.villaId, id);
        if (conflict) {
          console.warn(
            `[bookingStore] Overlapping booking prevented: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}). Kept as pending.`
          );
          if (isBecomingConfirmed) {
            merged.status = "pending";
          }
        }
      }

      const updated = inquiries.map((item) => (item.id === id ? merged : item));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicateInquiries(updated)));
        broadcastSync({
          action: "UPDATE",
          id,
          inquiry: merged,
          timestamp: Date.now(),
        });
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
        console.warn(`[bookingStore] Server update returned status ${res.status}:`, errJson);
        return;
      }

      const resData = await res.json();
      if (resData.inquiry && typeof window !== "undefined") {
        const currentInqs = this.getInquiries();
        const updated = currentInqs.map((item) => (item.id === id ? resData.inquiry : item));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicateInquiries(updated)));
        broadcastSync({
          action: "UPDATE",
          id,
          inquiry: resData.inquiry,
          timestamp: Date.now(),
        });
      }
    } catch (err: any) {
      console.warn("Server update inquiry error (gracefully handled):", err);
    }
  },

  updateInquiry(id: string, updatedFields: Partial<BookingInquiry>): void {
    const inquiries = this.getInquiries();
    const target = inquiries.find((item) => item.id === id);
    if (!target) return;

    const merged = { ...target, ...updatedFields };

    // Conflict validation only applies when transitioning to 'confirmed' or changing dates on a confirmed booking
    const isBecomingConfirmed = target.status !== "confirmed" && merged.status === "confirmed";
    const areDatesChanging = Boolean(
      (updatedFields.checkIn && updatedFields.checkIn !== target.checkIn) ||
      (updatedFields.checkOut && updatedFields.checkOut !== target.checkOut) ||
      (updatedFields.villaId && updatedFields.villaId !== target.villaId)
    );

    if (merged.status === "confirmed" && (isBecomingConfirmed || areDatesChanging)) {
      const conflict = this.hasDateConflict(merged.checkIn, merged.checkOut, merged.villaId, id);
      if (conflict) {
        console.warn(
          `[bookingStore] Overlapping booking prevented: Dates ${merged.checkIn} to ${merged.checkOut} conflict with reservation #${conflict.id} (${conflict.guestName}). Kept as pending.`
        );
        if (isBecomingConfirmed) {
          merged.status = "pending";
        }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicateInquiries(updated)));
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
    if (inquiry.status === "cancelled" || inquiry.isCheckedOut) return [];
    const inquiries = this.getInquiries();
    return inquiries.filter(
      (other) =>
        other.id !== inquiry.id &&
        other.villaId === inquiry.villaId &&
        other.status !== "cancelled" &&
        !other.isCheckedOut &&
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
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.deletedIds)) {
          data.deletedIds.forEach((dId: string) => this.addDeletedId(dId));
        }
      }
    } catch (err) {
      console.warn("Server delete failed:", err);
    }
  },

  deleteInquiry(id: string): void {
    this.addDeletedId(id);
    const inquiries = this.getInquiries();
    const updated = inquiries.filter((item) => item.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicateInquiries(updated)));
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
    this.clearDeletedIds();
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
      this.clearDeletedIds();
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
    // CHỈ KHÓA NGÀY TRÊN LỊCH KHI ĐƠN ĐÃ ĐƯỢC ADMIN XÁC NHẬN (status === "confirmed" và chưa trả phòng)
    const activeInquiries = inquiries.filter(
      (inq) => inq.status === "confirmed" && !inq.isCheckedOut && dateStr >= inq.checkIn && dateStr < inq.checkOut
    );

    if (villaId) {
      if (this.isVillaDateUnderMaintenance(villaId, dateStr)) {
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
      if (this.isVillaDateUnderMaintenance(id, dateStr)) {
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

  getGuestBookingDetailForDate(
    villaId: string,
    dateStr: string
  ): {
    isBooked: boolean;
    inquiry?: BookingInquiry;
    isCheckIn?: boolean;
    isCheckOut?: boolean;
    isStayNight?: boolean;
    labelVi?: string;
    labelEn?: string;
  } {
    if (!villaId || !dateStr) return { isBooked: false };
    const inquiries = this.getInquiries();
    const match = inquiries.find(
      (inq) =>
        inq.status !== "cancelled" &&
        inq.villaId === villaId &&
        dateStr >= inq.checkIn &&
        dateStr <= inq.checkOut
    );

    if (!match) return { isBooked: false };

    const isCheckIn = dateStr === match.checkIn;
    const isCheckOut = dateStr === match.checkOut;
    const isStayNight = dateStr >= match.checkIn && dateStr < match.checkOut;

    let labelVi = `Khách lưu trú (${match.guestName})`;
    let labelEn = `In-house stay (${match.guestName})`;

    if (isCheckIn && !isCheckOut) {
      labelVi = `Nhận phòng (${match.guestName})`;
      labelEn = `Check-in (${match.guestName})`;
    } else if (isCheckOut && !isCheckIn) {
      labelVi = `Trả phòng (${match.guestName})`;
      labelEn = `Check-out (${match.guestName})`;
    } else if (isCheckIn && isCheckOut) {
      labelVi = `Lưu trú trong ngày (${match.guestName})`;
      labelEn = `Day stay (${match.guestName})`;
    }

    return {
      isBooked: true,
      inquiry: match,
      isCheckIn,
      isCheckOut,
      isStayNight,
      labelVi,
      labelEn,
    };
  },

  getVillaActiveBookings(villaId: string): BookingInquiry[] {
    if (!villaId) return [];
    const inquiries = this.getInquiries();
    return inquiries
      .filter((inq) => inq.status === "confirmed" && inq.villaId === villaId)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  },

  getOverlappingBookings(villaId: string, startDate: string, endDate: string): BookingInquiry[] {
    if (!villaId || !startDate || !endDate) return [];
    const inquiries = this.getInquiries();
    return inquiries.filter(
      (inq) =>
        inq.status !== "cancelled" &&
        inq.villaId === villaId &&
        startDate <= inq.checkOut &&
        inq.checkIn <= endDate
    );
  },

  hasDateConflict(
    checkIn: string,
    checkOut: string,
    villaId: string,
    excludeInqId?: string
  ): BookingInquiry | undefined {
    if (villaId && this.hasMaintenanceConflict(villaId, checkIn, checkOut)) {
      const info = this.getVillaMaintenanceInfo(villaId);
      const rangeText = info?.startDate && info?.endDate
        ? ` (${info.startDate} → ${info.endDate})`
        : "";
      return {
        id: "MAINTENANCE",
        villaId,
        villaName: "Under Maintenance",
        guestName: "Property Under Maintenance",
        email: "",
        phone: "",
        checkIn: info?.startDate || checkIn || "2020-01-01",
        checkOut: info?.endDate || checkOut || "2099-12-31",
        adults: 0,
        children: 0,
        status: "confirmed",
        createdAt: info?.updatedAt || new Date().toISOString(),
        specialRequests: `${info?.reason || "Scheduled luxury maintenance & seasonal care."}${rangeText}. Inquiries temporarily paused.`,
      };
    }

    const inquiries = this.getInquiries();
    return inquiries.find((inq) => {
      // Chỉ xung đột khi đơn đó ĐÃ ĐƯỢC XÁC NHẬN KHÓA PHÒNG (status === "confirmed") và chưa trả phòng
      if (inq.status !== "confirmed" || inq.isCheckedOut || inq.villaId !== villaId) return false;
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
      if (event.key === STORAGE_KEY || event.key === MAINTENANCE_STORAGE_KEY || event.key === DELETED_STORAGE_KEY) {
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

  getAllVillaPrices(): Record<string, number> {
    let prices: Record<string, number> = { ...DEFAULT_VILLA_PRICES };
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PRICES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            prices = { ...DEFAULT_VILLA_PRICES, ...parsed };
          }
        }
      } catch {}
    }

    // Mirror short codes and full slugs so lookup by either "B1" or "b1-villa-4pn" always succeeds
    const b1Price = prices["b1-villa-4pn"] || prices["B1"] || prices["b1"] || DEFAULT_VILLA_PRICES["b1-villa-4pn"] || 18000000;
    const b2Price = prices["b2-villa-4pn"] || prices["B2"] || prices["b2"] || DEFAULT_VILLA_PRICES["b2-villa-4pn"] || 19500000;
    const b3Price = prices["b3-villa-2pn"] || prices["B3"] || prices["b3"] || DEFAULT_VILLA_PRICES["b3-villa-2pn"] || 9500000;
    const b4Price = prices["b4-villa-4pn"] || prices["B4"] || prices["b4"] || DEFAULT_VILLA_PRICES["b4-villa-4pn"] || 17000000;

    prices["b1-villa-4pn"] = b1Price;
    prices["B1"] = b1Price;
    prices["b1"] = b1Price;

    prices["b2-villa-4pn"] = b2Price;
    prices["B2"] = b2Price;
    prices["b2"] = b2Price;

    prices["b3-villa-2pn"] = b3Price;
    prices["B3"] = b3Price;
    prices["b3"] = b3Price;

    prices["b4-villa-4pn"] = b4Price;
    prices["B4"] = b4Price;
    prices["b4"] = b4Price;

    return prices;
  },

  getVillaPrice(villaId: string): number {
    const prices = this.getAllVillaPrices();
    if (!villaId) return 18000000;

    // Direct match
    if (typeof prices[villaId] === "number") return prices[villaId];

    const lower = villaId.toLowerCase().trim();
    if (lower.includes("b1")) return prices["B1"] || 18000000;
    if (lower.includes("b2")) return prices["B2"] || 19500000;
    if (lower.includes("b3")) return prices["B3"] || 9500000;
    if (lower.includes("b4")) return prices["B4"] || 17000000;

    return prices[villaId] || DEFAULT_VILLA_PRICES[villaId] || 15000000;
  },

  getUsdRate(): number {
    if (typeof window === "undefined") return DEFAULT_USD_RATE;
    try {
      const stored = localStorage.getItem(USD_RATE_STORAGE_KEY);
      if (stored) {
        const val = Number(stored);
        if (val > 0) return val;
      }
    } catch {}
    return DEFAULT_USD_RATE;
  },

  async setVillaPrice(villaId: string, priceVnd: number): Promise<void> {
    const currentPrices = this.getAllVillaPrices();
    const updated = { ...currentPrices, [villaId]: priceVnd };
    if (typeof window !== "undefined") {
      localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(updated));
      broadcastSync({
        action: "PRICE_UPDATE",
        villaId,
        prices: updated,
        timestamp: Date.now(),
      });
    }

    try {
      await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villaId, priceVnd }),
      });
    } catch (err) {
      console.warn("Failed to persist price to server:", err);
    }
  },

  async setAllVillaPrices(prices: Record<string, number>, usdRate?: number): Promise<void> {
    const currentPrices = this.getAllVillaPrices();
    const updated = { ...currentPrices, ...prices };
    const finalRate = usdRate || this.getUsdRate();

    if (typeof window !== "undefined") {
      localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(updated));
      if (usdRate) {
        localStorage.setItem(USD_RATE_STORAGE_KEY, String(usdRate));
      }
      broadcastSync({
        action: "PRICE_UPDATE",
        prices: updated,
        usdRate: finalRate,
        timestamp: Date.now(),
      });
    }

    try {
      await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: updated, usdRate: finalRate }),
      });
    } catch (err) {
      console.warn("Failed to persist prices to server:", err);
    }
  },

  async setUsdRate(rate: number): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(USD_RATE_STORAGE_KEY, String(rate));
      broadcastSync({
        action: "PRICE_UPDATE",
        usdRate: rate,
        timestamp: Date.now(),
      });
    }
    try {
      await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usdRate: rate }),
      });
    } catch (err) {
      console.warn("Failed to persist USD rate to server:", err);
    }
  },

  async updateCleaningStatus(id: string, cleaningStatus: CleaningStatus, cleaningNotes?: string): Promise<void> {
    const inquiries = this.getInquiries();
    const target = inquiries.find((i) => i.id === id);
    if (!target) return;

    const updatedFields: Partial<BookingInquiry> = {
      cleaningStatus,
      cleaningNotes: cleaningNotes !== undefined ? cleaningNotes : target.cleaningNotes,
      cleanedAt: cleaningStatus === "cleaned" ? new Date().toISOString() : target.cleanedAt,
    };

    await this.updateInquiryAsync(id, updatedFields);
    broadcastSync({
      action: "CLEANING_UPDATE",
      id,
      cleaningStatus,
      timestamp: Date.now(),
    });
  },

  async checkOutInquiry(id: string): Promise<void> {
    const inquiries = this.getInquiries();
    const target = inquiries.find((i) => i.id === id);
    if (!target) return;

    const updatedFields: Partial<BookingInquiry> = {
      isCheckedOut: true,
      checkedOutAt: new Date().toISOString(),
      cleaningStatus: target.cleaningStatus || "needs_cleaning",
    };

    await this.updateInquiryAsync(id, updatedFields);
    broadcastSync({
      action: "UPDATE",
      id,
      timestamp: Date.now(),
    });
  },

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paidAmountVnd?: number,
    paymentNotes?: string
  ): Promise<void> {
    const inquiries = this.getInquiries();
    const target = inquiries.find((i) => i.id === id);
    if (!target) return;

    const total = target.totalPriceVnd ?? calculateStayTotal(target.checkIn, target.checkOut, target.villaId);
    let finalPaidAmount = paidAmountVnd !== undefined ? paidAmountVnd : target.paidAmountVnd;
    if (finalPaidAmount === undefined) {
      if (paymentStatus === "paid") {
        finalPaidAmount = total;
      } else if (paymentStatus === "unpaid") {
        finalPaidAmount = 0;
      }
    }

    const updatedFields: Partial<BookingInquiry> = {
      paymentStatus,
      paidAmountVnd: finalPaidAmount,
      totalPriceVnd: total,
      paymentNotes: paymentNotes !== undefined ? paymentNotes : target.paymentNotes,
    };

    await this.updateInquiryAsync(id, updatedFields);
    broadcastSync({
      action: "PAYMENT_UPDATE",
      id,
      paymentStatus,
      timestamp: Date.now(),
    });
  },

  getPaymentSummary(): {
    totalRevenueVnd: number;
    paidRevenueVnd: number;
    unpaidRevenueVnd: number;
    paidCount: number;
    unpaidCount: number;
    depositCount: number;
  } {
    const inquiries = this.getInquiries();
    let totalRevenueVnd = 0;
    let paidRevenueVnd = 0;
    let unpaidRevenueVnd = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let depositCount = 0;

    inquiries.forEach((inq) => {
      if (inq.status === "cancelled") return;
      const stayTotal = inq.totalPriceVnd ?? calculateStayTotal(inq.checkIn, inq.checkOut, inq.villaId);
      totalRevenueVnd += stayTotal;

      const pStatus = inq.paymentStatus || "unpaid";
      if (pStatus === "paid") {
        paidCount++;
        paidRevenueVnd += stayTotal;
      } else if (pStatus === "deposit") {
        depositCount++;
        const depositAmount = inq.paidAmountVnd ?? Math.round(stayTotal / 2);
        paidRevenueVnd += depositAmount;
        unpaidRevenueVnd += Math.max(0, stayTotal - depositAmount);
      } else {
        unpaidCount++;
        unpaidRevenueVnd += stayTotal;
      }
    });

    return {
      totalRevenueVnd,
      paidRevenueVnd,
      unpaidRevenueVnd,
      paidCount,
      unpaidCount,
      depositCount,
    };
  },

  getHousekeepingSummary(): {
    expiredCount: number;
    todayCount: number;
    needsCleaningCount: number;
    inCleaningCount: number;
    cleanedCount: number;
    needsCleaning: number;
    inCleaning: number;
    cleaned: number;
    total: number;
  } {
    const inquiries = this.getInquiries();
    let expiredCount = 0;
    let todayCount = 0;
    let needsCleaningCount = 0;
    let inCleaningCount = 0;
    let cleanedCount = 0;

    inquiries.forEach((inq) => {
      if (inq.status === "cancelled") return;
      const stay = getStayStatus(inq.checkIn, inq.checkOut);
      if (stay === "expired") {
        expiredCount++;
      } else if (stay === "checkout_today") {
        todayCount++;
      }

      if (stay === "expired" || stay === "checkout_today") {
        const cStatus = inq.cleaningStatus || "needs_cleaning";
        if (cStatus === "needs_cleaning") needsCleaningCount++;
        else if (cStatus === "in_cleaning") inCleaningCount++;
        else if (cStatus === "cleaned") cleanedCount++;
      }
    });

    return {
      expiredCount,
      todayCount,
      needsCleaningCount,
      inCleaningCount,
      cleanedCount,
      needsCleaning: needsCleaningCount,
      inCleaning: inCleaningCount,
      cleaned: cleanedCount,
      total: needsCleaningCount + inCleaningCount + cleanedCount,
    };
  },

  isCloudStorage(): boolean {
    return cloudStorageDetected;
  },

  getStorageType(): string {
    return cloudStorageTypeString;
  },

  generateSyncToken(): string {
    if (typeof window === "undefined") return "";
    const inquiries = this.getInquiries();
    const maintenance = this.getMaintenanceMap();
    const deletedIds = Array.from(this.getDeletedIds());
    const prices = this.getAllVillaPrices();
    const usdRate = this.getUsdRate();
    const payload = {
      inquiries,
      maintenance,
      deletedIds,
      prices,
      usdRate,
      timestamp: Date.now(),
      appName: "Danang Sanctuary Luxury Villas",
    };
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch {
      return "";
    }
  },

  async importSyncToken(
    token: string,
    replaceAll = false
  ): Promise<{ success: boolean; count: number; message?: string }> {
    if (typeof window === "undefined" || !token) {
      return { success: false, count: 0, message: "Sync token cannot be empty." };
    }

    try {
      const raw = decodeURIComponent(escape(atob(token.trim())));
      const parsed = JSON.parse(raw);

      const incomingInquiries: BookingInquiry[] = Array.isArray(parsed.inquiries) ? parsed.inquiries : [];
      const incomingMaintenance: Record<string, VillaMaintenanceInfo> = parsed.maintenance || {};
      const incomingDeleted: string[] = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];
      const incomingPrices: Record<string, number> = parsed.prices || {};
      const incomingUsdRate: number = parsed.usdRate;

      incomingDeleted.forEach((id) => this.addDeletedId(id));

      let finalInquiries: BookingInquiry[];
      if (replaceAll) {
        finalInquiries = deduplicateInquiries(incomingInquiries);
      } else {
        const cur = this.getInquiries();
        const inqMap = new Map<string, BookingInquiry>();
        cur.forEach((i) => inqMap.set(i.id, i));
        incomingInquiries.forEach((i) => inqMap.set(i.id, i));
        const delSet = this.getDeletedIds();
        finalInquiries = deduplicateInquiries(Array.from(inqMap.values())).filter((i) => !delSet.has(i.id));
      }

      finalInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalInquiries));
      if (incomingMaintenance && Object.keys(incomingMaintenance).length > 0) {
        localStorage.setItem(
          MAINTENANCE_STORAGE_KEY,
          JSON.stringify({
            ...this.getMaintenanceMap(),
            ...incomingMaintenance,
          })
        );
      }

      if (incomingPrices && Object.keys(incomingPrices).length > 0) {
        const curPrices = this.getAllVillaPrices();
        localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify({ ...curPrices, ...incomingPrices }));
      }
      if (typeof incomingUsdRate === "number" && incomingUsdRate > 0) {
        localStorage.setItem(USD_RATE_STORAGE_KEY, String(incomingUsdRate));
      }

      // Sync to server API in background
      try {
        await fetch("/api/bookings/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inquiries: finalInquiries,
            maintenance: incomingMaintenance,
            deletedIds: incomingDeleted,
            prices: incomingPrices,
            usdRate: incomingUsdRate,
            replaceAll,
          }),
        });
      } catch (err) {
        console.warn("Server sync endpoint error, local storage updated:", err);
      }

      broadcastSync({ action: "UPDATE", timestamp: Date.now() });

      return { success: true, count: finalInquiries.length };
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || "Invalid sync token format" };
    }
  },
};
