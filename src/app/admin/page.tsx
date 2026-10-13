"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import {
  bookingStore,
  RealtimeSyncPayload,
  getInquirySignature,
  formatPriceVnd,
  formatPriceUsd,
  calculateStayNights,
  calculateStayTotal,
  getStayStatus,
  isCheckoutExpired,
  isCheckoutToday,
} from "@/lib/bookingStore";
import { BookingInquiry, InquiryStatus, Villa, VillaMaintenanceInfo, CleaningStatus, PaymentStatus } from "@/types";
import {
  LuxuryDatePicker,
  addDays,
  formatLuxuryDate,
  getTodayStr,
} from "@/components/LuxuryDatePicker";
import { LuxuryVillaSelector } from "@/components/LuxuryVillaSelector";
import {
  LuxuryConfirmDialog,
  DialogVariant,
  DetailItem,
} from "@/components/LuxuryConfirmDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import {
  Shield,
  Lock,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PhoneCall,
  XCircle,
  MessageCircle,
  Trash2,
  RefreshCw,
  Calendar,
  Users,
  Mail,
  Phone,
  AlertCircle,
  Radio,
  Sparkles,
  BellRing,
  Edit3,
  Plus,
  X,
  Save,
  AlertTriangle,
  Check,
  Wrench,
  Cloud,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Tag,
  DollarSign,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Home,
  Zap,
} from "lucide-react";

// Web Audio Luxury Chime generator (Pure synthesized browser audio)
function playLuxuryChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // First note: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Second note: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.15);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.debug("Web Audio notice", err);
  }
}

export default function AdminPage() {
  const { t, language } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inquiries, setInquiries] = useState<BookingInquiry[]>(() => bookingStore.getInquiries());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [villaFilter, setVillaFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);
  const [newlyArrivedId, setNewlyArrivedId] = useState<string | null>(null);

  // Editing Inquiry State (Full Editor Modal)
  const [editingInquiry, setEditingInquiry] = useState<BookingInquiry | null>(null);

  // Manual Add / Block Dates Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    villaId: siteConfig.villas[0]?.id || "b1-villa-4pn",
    guestName: "Direct Offline Booking",
    email: "direct@booking.com",
    phone: siteConfig.contact.phone,
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    specialRequests: "Host blocked dates or direct reservation.",
    status: "confirmed" as InquiryStatus,
    paymentStatus: "unpaid" as PaymentStatus,
  });

  // Maintenance State & Dialog
  const [maintenanceMap, setMaintenanceMap] = useState<Record<string, VillaMaintenanceInfo>>(() => bookingStore.getMaintenanceMap());
  const [maintenanceDialogVilla, setMaintenanceDialogVilla] = useState<Villa | null>(null);
  const [maintenanceNoteInput, setMaintenanceNoteInput] = useState("");
  const [maintenanceStartDate, setMaintenanceStartDate] = useState("");
  const [maintenanceEndDate, setMaintenanceEndDate] = useState("");
  const [maintenanceIsIndefinite, setMaintenanceIsIndefinite] = useState(false);

  // Admin Active View Tab
  const [adminViewTab, setAdminViewTab] = useState<"all_bookings" | "turnover" | "pricing" | "maintenance">("all_bookings");

  // Turnover & Housekeeping States
  const [turnoverFilter, setTurnoverFilter] = useState<"all" | "needs_cleaning" | "in_cleaning" | "cleaned" | "today">("all");
  const [turnoverSearchQuery, setTurnoverSearchQuery] = useState("");
  const [editingTurnoverNoteId, setEditingTurnoverNoteId] = useState<string | null>(null);
  const [turnoverNoteInput, setTurnoverNoteInput] = useState("");
  const [isUpdatingTurnover, setIsUpdatingTurnover] = useState(false);

  // Villa Pricing & USD Rate States
  const [villaPrices, setVillaPrices] = useState<Record<string, number>>(() => bookingStore.getAllVillaPrices());
  const [usdRate, setUsdRate] = useState<number>(() => bookingStore.getUsdRate());
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [priceSaveFeedback, setPriceSaveFeedback] = useState(false);



  // Luxury Dialog States
  const [inquiryToDelete, setInquiryToDelete] = useState<BookingInquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [adminNotice, setAdminNotice] = useState<{
    isOpen: boolean;
    variant: DialogVariant;
    title: string;
    message: string;
    badgeText?: string;
    details?: DetailItem[];
  } | null>(null);

  const showAdminNotice = (
    title: string,
    message: string,
    variant: DialogVariant = "warning",
    badgeText?: string,
    details?: DetailItem[]
  ) => {
    setAdminNotice({
      isOpen: true,
      title,
      message,
      variant,
      badgeText,
      details,
    });
  };

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cloud Sync & Multi-Device State
  const [isCloudStorage, setIsCloudStorage] = useState(false);
  const [isSyncBannerCollapsed, setIsSyncBannerCollapsed] = useState(true);
  const [storageType, setStorageType] = useState("Checking cloud storage...");
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncModalTab, setSyncModalTab] = useState<"guide" | "export" | "import">("guide");
  const [syncTokenInput, setSyncTokenInput] = useState("");
  const [exportedToken, setExportedToken] = useState("");
  const [copyTokenFeedback, setCopyTokenFeedback] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Check cloud storage status
  const checkStorageStatus = async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsCloudStorage(Boolean(data.isCloudStorage));
        if (data.storageType) {
          setStorageType(data.storageType);
        }
      }
    } catch {
      setIsCloudStorage(bookingStore.isCloudStorage());
      setStorageType(bookingStore.getStorageType());
    }
  };

  const handleOpenExport = () => {
    const token = bookingStore.generateSyncToken();
    setExportedToken(token);
    setSyncModalTab("export");
    setIsSyncModalOpen(true);
  };

  const handleOpenImport = () => {
    setSyncTokenInput("");
    setSyncModalTab("import");
    setIsSyncModalOpen(true);
  };

  const handleCopyExportToken = () => {
    if (!exportedToken) return;
    navigator.clipboard.writeText(exportedToken);
    setCopyTokenFeedback(true);
    setTimeout(() => setCopyTokenFeedback(false), 2500);
  };

  const handleExecuteImport = async () => {
    if (!syncTokenInput.trim()) {
      showAdminNotice(
        language === "vi" ? "Mã đồng bộ trống" : "Empty Sync Token",
        language === "vi" ? "Vui lòng dán mã đồng bộ được sao chép từ thiết bị trước." : "Please paste the sync token copied from your previous device.",
        "warning",
        language === "vi" ? "Nhập dữ liệu" : "Import Sync"
      );
      return;
    }

    try {
      setIsImporting(true);
      const res = await bookingStore.importSyncToken(syncTokenInput.trim(), false);
      if (res.success) {
        reloadInquiries();
        setIsSyncModalOpen(false);
        showNotification(
          language === "vi" ? "Đồng bộ đa thiết bị thành công!" : "Multi-Device Sync Successful!",
          language === "vi" ? `Đã nạp ${res.count} đơn đặt phòng và cập nhật lịch tức thì.` : `Imported ${res.count} reservations and refreshed calendars instantly.`
        );
      } else {
        showAdminNotice(
          language === "vi" ? "Nhập thất bại" : "Import Failed",
          res.message || (language === "vi" ? "Mã đồng bộ không hợp lệ." : "Invalid sync token."),
          "danger",
          language === "vi" ? "Lỗi nhập dữ liệu" : "Import Error"
        );
      }
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Nhập thất bại" : "Import Failed",
        err.message || (language === "vi" ? "Không thể nạp dữ liệu." : "Could not import data."),
        "danger",
        language === "vi" ? "Lỗi nhập dữ liệu" : "Import Error"
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Check initial mounting & session authentication
  useEffect(() => {
    setHasMounted(true);
    checkStorageStatus();
    if (typeof window !== "undefined") {
      const sessionAuth = sessionStorage.getItem("admin_auth_status");
      if (sessionAuth === "authenticated") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const showNotification = (title: string, subtitle?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ title, subtitle });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  // Load inquiries, maintenance and prices from reactive store
  const reloadInquiries = () => {
    const list = bookingStore.getInquiries();
    setInquiries(list);
    setMaintenanceMap(bookingStore.getMaintenanceMap());
    setVillaPrices(bookingStore.getAllVillaPrices());
    setUsdRate(bookingStore.getUsdRate());
    return list;
  };



  // Housekeeping & Turnover status update handler
  const handleUpdateTurnoverStatus = async (
    inquiryId: string,
    status: CleaningStatus,
    notes?: string
  ) => {
    try {
      setIsUpdatingTurnover(true);
      await bookingStore.updateCleaningStatus(inquiryId, status, notes);
      reloadInquiries();
      playLuxuryChime();
      const statusLabel =
        status === "cleaned"
          ? (language === "vi" ? "✨ Đã dọn dẹp sạch & sẵn sàng nhận khách" : "✨ Marked as Cleaned & Inspected")
          : status === "in_cleaning"
          ? (language === "vi" ? "🟡 Đang tiến hành dọn dẹp buồng phòng" : "🟡 In Cleaning Progress")
          : (language === "vi" ? "🔴 Đã chuyển về Cần dọn phòng" : "🔴 Marked as Needs Cleaning");
      showNotification(
        language === "vi" ? "Cập nhật buồng phòng thành công!" : "Turnover Updated!",
        `${inquiryId}: ${statusLabel}`
      );
      if (editingTurnoverNoteId === inquiryId) {
        setEditingTurnoverNoteId(null);
      }
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Lỗi cập nhật buồng phòng" : "Turnover Update Failed",
        err.message || "Could not update housekeeping status."
      );
    } finally {
      setIsUpdatingTurnover(false);
    }
  };

  // Payment status update handler (1-Click toggle between Chưa thu / Đã cọc / Đã thu)
  const handleUpdatePaymentStatus = async (
    inquiryId: string,
    paymentStatus: PaymentStatus,
    paidAmount?: number,
    notes?: string
  ) => {
    try {
      await bookingStore.updatePaymentStatus(inquiryId, paymentStatus, paidAmount, notes);
      reloadInquiries();
      playLuxuryChime();
      const statusLabel =
        paymentStatus === "paid"
          ? (language === "vi" ? "🟢 Đã thu đủ tiền phòng" : "🟢 Fully Paid & Collected")
          : paymentStatus === "deposit"
          ? (language === "vi" ? "🟡 Đã thu tiền đặt cọc" : "🟡 Deposit Collected")
          : (language === "vi" ? "🔴 Đã chuyển về Chưa thu tiền" : "🔴 Marked as Unpaid");
      showNotification(
        language === "vi" ? "Cập nhật thanh toán thành công!" : "Payment Status Updated!",
        `${inquiryId}: ${statusLabel}`
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Lỗi cập nhật thanh toán" : "Payment Update Failed",
        err.message || "Could not update payment status."
      );
    }
  };

  // Pricing update handlers
  const handleSaveVillaPrice = async (villaId: string, price: number) => {
    try {
      setIsSavingPrices(true);
      await bookingStore.setVillaPrice(villaId, price);
      setVillaPrices((prev) => ({ ...prev, [villaId]: price }));
      playLuxuryChime();
      const vMatch = siteConfig.villas.find((v) => v.id === villaId);
      showNotification(
        language === "vi" ? "Cập nhật đơn giá thành công!" : "Villa Nightly Rate Updated!",
        `${vMatch?.name || villaId}: ${formatPriceVnd(price)}/đêm`
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Lỗi cập nhật giá" : "Price Update Failed",
        err.message || "Failed to update price."
      );
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleSaveAllPricesAndUsd = async () => {
    try {
      setIsSavingPrices(true);
      await bookingStore.setAllVillaPrices(villaPrices, usdRate);
      setPriceSaveFeedback(true);
      setTimeout(() => setPriceSaveFeedback(false), 3000);
      playLuxuryChime();
      showNotification(
        language === "vi" ? "Cập nhật đơn giá & tỷ giá USD thành công!" : "Villa Rates & USD Conversion Updated!",
        language === "vi"
          ? `Đã lưu đơn giá 4 villa và tỷ giá 1 USD = ${formatPriceVnd(usdRate).replace(' ₫', '')} VND.`
          : `Saved nightly rates and exchange rate (1 USD = ${formatPriceVnd(usdRate).replace(' ₫', '')} VND).`
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Lỗi cập nhật giá" : "Price Update Failed",
        err.message || "Failed to update prices."
      );
    } finally {
      setIsSavingPrices(false);
    }
  };

  // Open Maintenance modal with pre-filled or default dates
  const openMaintenanceModal = (villa: Villa) => {
    const currentInfo = maintenanceMap[villa.id];
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    setMaintenanceDialogVilla(villa);
    setMaintenanceNoteInput(
      currentInfo?.reason || (language === "vi" ? "Bảo trì định kỳ nâng cấp không gian nghỉ dưỡng." : "Scheduled seasonal maintenance & deep renovation.")
    );

    if (currentInfo?.startDate && currentInfo?.endDate) {
      setMaintenanceStartDate(currentInfo.startDate);
      setMaintenanceEndDate(currentInfo.endDate);
      setMaintenanceIsIndefinite(false);
    } else if (currentInfo?.isMaintenance && (!currentInfo?.startDate || !currentInfo?.endDate)) {
      setMaintenanceStartDate(todayStr);
      setMaintenanceEndDate(addDays(todayStr, 3));
      setMaintenanceIsIndefinite(true);
    } else {
      setMaintenanceStartDate(todayStr);
      setMaintenanceEndDate(addDays(todayStr, 3));
      setMaintenanceIsIndefinite(false);
    }
  };

  // Toggle or update villa maintenance status
  const handleToggleMaintenance = (villaId: string, customReason?: string) => {
    const currentMaint = Boolean(maintenanceMap[villaId]?.isMaintenance);
    const newStatus = !currentMaint;
    const vMatch = siteConfig.villas.find((v) => v.id === villaId);
    const vName = vMatch ? (language === "vi" ? (vMatch.nameVi || vMatch.name) : vMatch.name) : villaId;

    bookingStore.setVillaMaintenance(
      villaId,
      newStatus,
      customReason || (newStatus ? "Scheduled seasonal maintenance & deep renovation" : undefined)
    );

    setMaintenanceMap(bookingStore.getMaintenanceMap());
    playLuxuryChime();

    showNotification(
      newStatus
        ? (language === "vi" ? `🛠️ ${vName} Đã chuyển sang chế độ Bảo trì` : `🛠️ ${vName} is now Under Maintenance`)
        : (language === "vi" ? `✅ ${vName} Đã hoạt động trở lại` : `✅ ${vName} Restored to Active`),
      newStatus
        ? (language === "vi" ? "Lịch phòng và tính năng đặt trực tuyến đã được khóa trong thời gian thực." : "Public inquiries and calendar dates are strictly locked in real-time.")
        : (language === "vi" ? "Website công khai hiện đã sẵn sàng nhận đơn đặt phòng mới." : "Public website can now receive new booking inquiries.")
    );
  };

  // Save maintenance config with dates
  const handleSaveMaintenance = (
    villaId: string,
    enableMaintenance: boolean,
    reason?: string,
    startDate?: string,
    endDate?: string,
    isIndefinite?: boolean
  ) => {
    const vMatch = siteConfig.villas.find((v) => v.id === villaId);
    const vName = vMatch ? (language === "vi" ? (vMatch.nameVi || vMatch.name) : vMatch.name) : villaId;

    if (!enableMaintenance) {
      bookingStore.setVillaMaintenance(villaId, false);
      setMaintenanceMap(bookingStore.getMaintenanceMap());
      playLuxuryChime();
      showNotification(
        language === "vi" ? `✅ ${vName} Đã mở lại hoạt động` : `✅ ${vName} Restored to Active`,
        language === "vi" ? "Biệt thự đã mở nhận đặt phòng công khai trên website." : "Public bookings are now open for this villa."
      );
      return;
    }

    const finalStart = isIndefinite ? undefined : (startDate || undefined);
    const finalEnd = isIndefinite ? undefined : (endDate || undefined);
    const finalReason = reason?.trim() || (language === "vi" ? "Bảo trì nâng cấp tiện nghi định kỳ." : "Scheduled luxury maintenance & seasonal care.");

    bookingStore.setVillaMaintenance(villaId, true, finalReason, finalStart, finalEnd);
    setMaintenanceMap(bookingStore.getMaintenanceMap());
    playLuxuryChime();

    const timeNotice = finalStart && finalEnd
      ? ` (${formatLuxuryDate(finalStart)} → ${formatLuxuryDate(finalEnd)})`
      : (language === "vi" ? " (Vô thời hạn)" : " (Indefinite)");

    showNotification(
      language === "vi" ? `🛠️ Đã kích hoạt bảo trì cho ${vName}` : `🛠️ Maintenance Activated for ${vName}`,
      language === "vi"
        ? `Thời gian: ${timeNotice}. Hệ thống đã khóa các ngày tương ứng trên lịch.`
        : `Window: ${timeNotice}. Public inquiries and dates are locked accordingly.`
    );
  };

  // Setup Real-time Multi-Channel Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial load
    reloadInquiries();

    // Subscribe to cross-tab BroadcastChannel + storage events
    const unsubscribe = bookingStore.subscribe((payload: RealtimeSyncPayload) => {
      reloadInquiries();

      if (payload.action === "ADD") {
        playLuxuryChime();
        const guest = payload.inquiry?.guestName || "New Guest";
        const villa = payload.inquiry?.villaName || "Villa Residence";
        showNotification(
          `🛎️ New Booking Received: ${guest}`,
          `Reserved ${villa} (${payload.inquiry?.checkIn} - ${payload.inquiry?.checkOut})`
        );
        if (payload.inquiry?.id) {
          setNewlyArrivedId(payload.inquiry.id);
          setTimeout(() => {
            setNewlyArrivedId(null);
          }, 12000);
        }
      } else if (payload.action === "MAINTENANCE_UPDATE") {
        playLuxuryChime();
        const vMatch = siteConfig.villas.find((v) => v.id === payload.villaId);
        const vName = vMatch ? vMatch.name : payload.villaId || "Villa";
        showNotification(
          payload.isMaintenance ? `🛠️ ${vName} Placed Under Maintenance` : `✅ ${vName} Restored to Active`,
          payload.isMaintenance ? "Public bookings are strictly locked." : "Public bookings are now open."
        );
      } else if (payload.action === "PRICE_UPDATE") {
        setVillaPrices(bookingStore.getAllVillaPrices());
        setUsdRate(bookingStore.getUsdRate());
        showNotification(
          language === "vi" ? "Đơn giá villa & tỷ giá USD vừa cập nhật." : "Villa rates & USD exchange updated."
        );
      } else if (payload.action === "CLEANING_UPDATE") {
        reloadInquiries();
        showNotification(
          language === "vi" ? "Trạng thái buồng phòng vừa cập nhật." : "Housekeeping status updated."
        );
      } else if (payload.action === "PAYMENT_UPDATE") {
        reloadInquiries();
        showNotification(
          language === "vi" ? "Trạng thái thanh toán vừa cập nhật." : "Payment status updated."
        );
      } else if (payload.action === "UPDATE") {
        showNotification("Reservation updated & synced across public site.");
      } else if (payload.action === "DELETE") {
        showNotification("Reservation removed & dates released in real-time.");
      } else if (payload.action === "RESET") {
        showNotification("Reset to sample inquiries completed.");
      }
    });

    // Periodic background sync using stable signature comparison (prevents flickering)
    const poller = setInterval(() => {
      const latest = bookingStore.getInquiries();
      setMaintenanceMap((prev) => {
        const cur = bookingStore.getMaintenanceMap();
        return JSON.stringify(prev) !== JSON.stringify(cur) ? cur : prev;
      });
      setInquiries((prev) => {
        if (getInquirySignature(prev) !== getInquirySignature(latest)) {
          return latest;
        }
        return prev;
      });
    }, 3500);

    return () => {
      unsubscribe();
      clearInterval(poller);
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === siteConfig.admin.passcode) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth_status", "authenticated");
      }
      setErrorMsg("");
      playLuxuryChime();
    } else {
      setErrorMsg(
        language === "vi"
          ? "Mật khẩu bảo mật không chính xác. Vui lòng kiểm tra lại."
          : "Incorrect passcode. Please check siteConfig.ts or try again."
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_auth_status");
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: InquiryStatus) => {
    bookingStore.updateStatus(id, newStatus);
    reloadInquiries();
    if (newStatus === "cancelled") {
      showNotification(
        language === "vi" ? `Đơn đặt phòng #${id} đã HỦY` : `Reservation #${id} Cancelled`,
        language === "vi" ? "Các ngày đã chọn đã được mở lại trên website." : "Dates have been released on public site calendar."
      );
    } else {
      showNotification(
        language === "vi" ? `Đơn #${id} cập nhật: ${newStatus.toUpperCase()}` : `Reservation #${id} marked as ${newStatus.toUpperCase()}`,
        language === "vi" ? "Lịch phòng đã cập nhật theo thời gian thực." : "Calendar updated in real-time."
      );
    }
  };

  const handleCheckOutGuest = async (id: string, guestName: string) => {
    try {
      await bookingStore.checkOutInquiry(id);
      reloadInquiries();
      playLuxuryChime();
      showNotification(
        language === "vi" ? `Đã hoàn tất trả phòng #${id}` : `Checked out #${id}`,
        language === "vi"
          ? `Khách ${guestName} đã trả phòng. Đơn đã được chuyển qua mục "Trả Phòng & Dọn Dẹp".`
          : `Guest ${guestName} checked out. Moved to Turnover & Housekeeping.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestDelete = (inq: BookingInquiry) => {
    setInquiryToDelete(inq);
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    try {
      setIsDeleting(true);
      await bookingStore.deleteInquiryAsync(inquiryToDelete.id);
      reloadInquiries();
      showNotification(
        language === "vi" ? `Đã xóa đơn #${inquiryToDelete.id}` : `Inquiry #${inquiryToDelete.id} removed`,
        language === "vi" ? "Các ngày đã được mở khóa trên lịch website." : "Dates released on public website calendar."
      );
      setInquiryToDelete(null);
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Xóa thất bại" : "Deletion Failed",
        err.message || (language === "vi" ? "Không thể xóa đơn." : "Failed to remove inquiry."),
        "danger"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;

    if (!editingInquiry.checkIn || !editingInquiry.checkOut) {
      showAdminNotice(
        language === "vi" ? "Yêu cầu chọn ngày" : "Dates Required",
        language === "vi" ? "Vui lòng chọn cả ngày nhận phòng và trả phòng." : "Please select both check-in and check-out dates.",
        "warning",
        language === "vi" ? "Kiểm tra" : "Validation"
      );
      return;
    }

    if (editingInquiry.checkIn >= editingInquiry.checkOut) {
      showAdminNotice(
        language === "vi" ? "Thời gian ở không hợp lệ" : "Invalid Stay Duration",
        language === "vi" ? "Ngày trả phòng phải sau ngày nhận phòng." : "Check-out date must be strictly after check-in date.",
        "warning",
        language === "vi" ? "Kiểm tra" : "Validation"
      );
      return;
    }

    // Check conflict
    const conflict = bookingStore.hasDateConflict(
      editingInquiry.checkIn,
      editingInquiry.checkOut,
      editingInquiry.villaId,
      editingInquiry.id
    );

    if (conflict && editingInquiry.status !== "cancelled") {
      showAdminNotice(
        language === "vi" ? "Trùng ngày không thể lưu" : "Overlapping Booking Prohibited",
        language === "vi"
          ? `Khoảng ngày này trùng với đơn #${conflict.id} (${conflict.guestName}). Không thể lưu trùng ngày để tránh double booking. Vui lòng chọn khoảng ngày khác.`
          : `These dates conflict with reservation #${conflict.id} (${conflict.guestName}). Overlapping bookings are strictly prohibited to avoid double reservation. Please select non-overlapping dates or cancel the conflicting booking first.`,
        "warning",
        language === "vi" ? "Xung đột lịch" : "Schedule Conflict",
        [
          { label: language === "vi" ? "Mã đơn trùng" : "Conflicting ID", value: `#${conflict.id}` },
          { label: language === "vi" ? "Tên khách" : "Guest Name", value: conflict.guestName },
          { label: language === "vi" ? "Khoảng ngày đã đặt" : "Reserved Dates", value: `${formatLuxuryDate(conflict.checkIn)} → ${formatLuxuryDate(conflict.checkOut)}` },
        ]
      );
      return;
    }

    const villaMatch = siteConfig.villas.find((v) => v.id === editingInquiry.villaId);
    const updatedWithVillaName = {
      ...editingInquiry,
      villaName: villaMatch ? villaMatch.name : editingInquiry.villaName,
    };

    try {
      await bookingStore.updateInquiryAsync(editingInquiry.id, updatedWithVillaName);
      reloadInquiries();
      setEditingInquiry(null);
      showNotification(
        language === "vi" ? `Đã cập nhật đơn #${editingInquiry.id}!` : `Reservation #${editingInquiry.id} Updated!`,
        language === "vi" ? "Lịch phòng công khai đã được làm mới tức thì trên mọi thiết bị." : "Public website calendar has been refreshed immediately across all devices."
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Cập nhật thất bại" : "Update Failed",
        err.message || (language === "vi" ? "Không thể cập nhật đơn đặt phòng." : "Failed to update reservation."),
        "danger"
      );
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBookingData.checkIn || !newBookingData.checkOut) {
      showAdminNotice(
        language === "vi" ? "Yêu cầu chọn ngày" : "Dates Required",
        language === "vi" ? "Vui lòng chọn cả ngày nhận phòng và trả phòng." : "Please select both check-in and check-out dates.",
        "warning",
        language === "vi" ? "Kiểm tra" : "Validation"
      );
      return;
    }

    if (newBookingData.checkIn >= newBookingData.checkOut) {
      showAdminNotice(
        language === "vi" ? "Thời gian ở không hợp lệ" : "Invalid Stay Duration",
        language === "vi" ? "Ngày trả phòng phải sau ngày nhận phòng." : "Check-out date must be strictly after check-in date.",
        "warning",
        language === "vi" ? "Kiểm tra" : "Validation"
      );
      return;
    }

    // Check conflict
    const conflict = bookingStore.hasDateConflict(
      newBookingData.checkIn,
      newBookingData.checkOut,
      newBookingData.villaId
    );

    if (conflict && newBookingData.status !== "cancelled") {
      showAdminNotice(
        language === "vi" ? "Trùng ngày không thể tạo" : "Overlapping Booking Prohibited",
        language === "vi"
          ? `Biệt thự này đã có lịch đặt từ ${conflict.guestName} (#${conflict.id}). Không thể tạo đơn trùng ngày.`
          : `This villa is already reserved by ${conflict.guestName} (#${conflict.id}). Overlapping bookings cannot be created. Please select non-overlapping dates.`,
        "warning",
        language === "vi" ? "Xung đột lịch" : "Schedule Conflict",
        [
          { label: language === "vi" ? "Đơn hiện có" : "Existing Reservation", value: `#${conflict.id}` },
          { label: language === "vi" ? "Tên khách" : "Guest Name", value: conflict.guestName },
          { label: language === "vi" ? "Khoảng ngày đã đặt" : "Reserved Dates", value: `${formatLuxuryDate(conflict.checkIn)} → ${formatLuxuryDate(conflict.checkOut)}` },
        ]
      );
      return;
    }

    const villaMatch = siteConfig.villas.find((v) => v.id === newBookingData.villaId);
    const villaName = villaMatch ? villaMatch.name : "Villa Residence";

    try {
      await bookingStore.addInquiryAsync({
        ...newBookingData,
        villaName,
      });

      reloadInquiries();
      setIsAddModalOpen(false);
      showNotification(
        language === "vi" ? "Đã khóa ngày / Thêm đơn thành công!" : "Dates Blocked / New Reservation Created!",
        language === "vi"
          ? `Lịch website đã khóa cho ${villaName} (${newBookingData.checkIn} - ${newBookingData.checkOut})`
          : `Website calendar locked for ${villaName} (${newBookingData.checkIn} - ${newBookingData.checkOut})`
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Tạo đơn thất bại" : "Reservation Failed",
        err.message || (language === "vi" ? "Không thể tạo đơn đặt phòng." : "Failed to create reservation."),
        "danger"
      );
    }
  };

  const handleRequestResetSample = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetSample = async () => {
    try {
      setIsResetting(true);
      await bookingStore.resetSampleDataAsync();
      reloadInquiries();
      setIsResetConfirmOpen(false);
      showNotification(
        language === "vi"
          ? "Đã khôi phục dữ liệu mẫu ban đầu đồng bộ trên mọi thiết bị!"
          : "Reset to sample inquiries completed across all devices!"
      );
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Khôi phục thất bại" : "Reset Failed",
        err.message || (language === "vi" ? "Không thể đặt lại dữ liệu mẫu." : "Failed to reset sample data."),
        "danger"
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#111315] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#C2A476] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // KPIs
  const totalCount = inquiries.length;
  // Các đơn đang hoạt động (chưa đến ngày trả phòng và chưa trả phòng, không tính đã huỷ)
  const activeCount = inquiries.filter((i) => {
    if (i.status === "cancelled" || i.isCheckedOut) return false;
    const stay = getStayStatus(i.checkIn, i.checkOut);
    return stay === "upcoming" || stay === "in_house";
  }).length;

  // Các đơn đã đến hạn trả phòng hoặc đã hết ngày (tự động chuyển sang mục Trả Phòng & Dọn Dẹp)
  const checkoutCount = inquiries.filter((i) => {
    if (i.status === "cancelled") return false;
    if (i.isCheckedOut) return true;
    const stay = getStayStatus(i.checkIn, i.checkOut);
    return stay === "expired" || stay === "checkout_today";
  }).length;

  const checkoutTodayCount = inquiries.filter((i) => {
    if (i.status === "cancelled") return false;
    return isCheckoutToday(i.checkOut) || i.isCheckedOut;
  }).length;

  const pendingCount = inquiries.filter((i) => i.status === "pending" && getStayStatus(i.checkIn, i.checkOut) !== "expired" && !i.isCheckedOut).length;
  const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
  const confirmedCount = inquiries.filter((i) => i.status === "confirmed").length;
  const maintenanceCount = siteConfig.villas.filter((v) => bookingStore.isVillaUnderMaintenance(v.id)).length;
  const hkSummary = bookingStore.getHousekeepingSummary();
  const paySummary = bookingStore.getPaymentSummary();

  // Filtered List for All Bookings Tab
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.villaName.toLowerCase().includes(searchQuery.toLowerCase());

    const stay = getStayStatus(inq.checkIn, inq.checkOut);
    const isCheckout = stay === "expired" || stay === "checkout_today" || Boolean(inq.isCheckedOut);

    let matchesStatus = true;
    if (statusFilter === "all" || statusFilter === "active") {
      // MẶC ĐỊNH: Chỉ hiển thị các đơn đang hoạt động (chưa đến ngày trả phòng và chưa trả phòng)
      // Khi hết ngày hoặc đến ngày trả phòng, đơn tự động chuyển sang tab "Trả Phòng & Dọn Dẹp"
      matchesStatus = !isCheckout && inq.status !== "cancelled";
    } else if (statusFilter === "history_all") {
      // Xem toàn bộ lịch sử (kể cả đã trả phòng)
      matchesStatus = true;
    } else if (statusFilter === "checkout_today") {
      matchesStatus = isCheckoutToday(inq.checkOut) || Boolean(inq.isCheckedOut);
    } else if (statusFilter === "expired") {
      matchesStatus = stay === "expired" || Boolean(inq.isCheckedOut);
    } else if (statusFilter === "in_house") {
      matchesStatus = stay === "in_house" && !inq.isCheckedOut;
    } else {
      matchesStatus = inq.status === statusFilter;
    }

    const matchesVilla =
      villaFilter === "all" ? true : inq.villaId === villaFilter;

    let matchesPayment = true;
    if (paymentFilter !== "all") {
      const pStatus = inq.paymentStatus || "unpaid";
      matchesPayment = pStatus === paymentFilter;
    }

    return matchesSearch && matchesStatus && matchesVilla && matchesPayment;
  });

  // Filtered List for Turnover & Housekeeping Tab (completed stays, checkout today, or checked out)
  const turnoverFilteredInquiries = inquiries.filter((inq) => {
    if (inq.status === "cancelled") return false;
    const stay = getStayStatus(inq.checkIn, inq.checkOut);
    const isTargetStay = stay === "expired" || stay === "checkout_today" || Boolean(inq.isCheckedOut);
    if (!isTargetStay) return false;

    const matchesSearch =
      turnoverSearchQuery === "" ||
      inq.guestName.toLowerCase().includes(turnoverSearchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(turnoverSearchQuery.toLowerCase()) ||
      inq.villaName.toLowerCase().includes(turnoverSearchQuery.toLowerCase()) ||
      inq.phone.includes(turnoverSearchQuery);

    const matchesVilla =
      villaFilter === "all" ? true : inq.villaId === villaFilter;

    if (!matchesSearch || !matchesVilla) return false;

    const cStatus = inq.cleaningStatus || "needs_cleaning";
    if (turnoverFilter === "needs_cleaning") return cStatus === "needs_cleaning";
    if (turnoverFilter === "in_cleaning") return cStatus === "in_cleaning";
    if (turnoverFilter === "cleaned") return cStatus === "cleaned";
    if (turnoverFilter === "today") return stay === "checkout_today" || Boolean(inq.isCheckedOut);
    return true;
  });
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111315] text-white flex flex-col items-center justify-center p-6 relative">
        {/* Top-Right Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher size="sm" />
        </div>

        <div className="w-full max-w-md bg-[#181B1E] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("admin.return_home", "Return to Public Website")}</span>
          </Link>

          <div className="w-14 h-14 rounded-2xl bg-[#C2A476]/10 border border-[#C2A476]/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-[#C2A476]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-white tracking-tight mb-2">
            {t("admin.login_title", "Host Administration")}
          </h1>
          <p className="text-xs text-neutral-400 text-center font-normal mb-8">
            {t("admin.login_desc", "Enter your secret passcode to access booking logs and customer inquiries.")}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                {t("admin.passcode_label", "Admin Passcode")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={t("admin.passcode_placeholder", "Enter passcode...")}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full bg-[#111315] border border-white/15 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#C2A476] transition-colors"
                  required
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-4" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#C2A476] hover:bg-[#aa8c5b] text-white py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-lg mt-2 cursor-pointer"
            >
              {t("admin.unlock_btn", "Unlock Dashboard")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F8F6F2] text-neutral-900 pb-20">
      {/* Toast Notification for Real-Time Booking Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-[#14171A] text-white p-4 rounded-2xl shadow-2xl border border-[#C2A476]/50 flex items-start gap-3.5 animate-bounce-short">
          <div className="w-9 h-9 rounded-xl bg-[#C2A476]/20 border border-[#C2A476]/40 flex items-center justify-center flex-shrink-0 text-[#C2A476] mt-0.5">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-white leading-tight">
              {toastMessage.title}
            </h4>
            {toastMessage.subtitle && (
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                {toastMessage.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-[#14171A]/95 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all hover:scale-105 active:scale-95"
              title={t("admin.return_home", "Return to Public Website")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {siteConfig.name}
                </h1>
                <span className="bg-[#C2A476]/20 text-[#C2A476] border border-[#C2A476]/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
                  {t("admin.portal", "Admin Portal")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {t("admin.live_sync", "Two-Way Live Sync Active (Edit dates, instant calendar update)")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Dual Flag Language Switcher */}
            <LanguageSwitcher size="sm" />

            {/* Cloud Database / Device Sync Status Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSyncModalTab(isCloudStorage ? "guide" : "guide");
                setIsSyncModalOpen(true);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                isCloudStorage
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80 shadow-xs"
                  : "bg-amber-950/70 text-amber-300 border-amber-500/50 hover:bg-amber-900/80 shadow-xs"
              }`}
              title="Click to manage multi-device synchronization and cloud database"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isCloudStorage ? t("admin.cloud_synced", "Cloud Synced 🟢") : t("admin.device_sync_btn", "Đồng bộ Đa Thiết bị ⚡")}</span>
              <span className="sm:hidden">{isCloudStorage ? "Cloud 🟢" : "Đồng bộ ⚡"}</span>
            </motion.button>

            {/* Primary Action Button: Block Dates / Add Reservation */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs bg-gradient-to-r from-[#C2A476] to-[#ad8f5c] hover:brightness-110 text-white px-3.5 py-1.5 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-md cursor-pointer border border-[#E8D8BA]/30"
            >
              <Plus className="w-4 h-4" />
              <span>{t("admin.block_dates_btn", "Block Dates / New Booking")}</span>
            </motion.button>

            {/* Sample Demo Data Reset */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRequestResetSample}
              className="text-xs text-neutral-400 hover:text-white p-2 rounded-xl border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </motion.button>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="text-xs bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-neutral-200 px-3.5 py-1.5 rounded-xl transition-all font-medium cursor-pointer border border-white/5 hover:border-rose-400/30"
            >
              {t("admin.logout", "Log Out")}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* KPI Metric Cards (6 cards - Modern Sans Geometry) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5 mb-6">
          {/* 1. Total Inquiries */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("all");
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "all_bookings" && statusFilter === "all"
                ? "bg-white border-[#C2A476] ring-2 ring-[#C2A476]/30 shadow-md"
                : "bg-white/90 border-[#EAE5DC] hover:border-[#C2A476]/60 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                {t("admin.kpi_total", "Total Inquiries")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[#8A6B3D] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                {totalCount}
              </p>
            </div>
            <p className="text-xs text-neutral-500 font-medium truncate">
              {language === "vi" ? "Tất cả yêu cầu gửi về" : "All submissions"}
            </p>
          </motion.div>

          {/* 2. Pending Action */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("pending");
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "all_bookings" && statusFilter === "pending"
                ? "bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                : "bg-white/90 border-[#EAE5DC] hover:border-amber-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {t("admin.kpi_pending", "Pending Action")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600">
                {pendingCount}
              </p>
            </div>
            <p className="text-xs text-amber-700 font-medium truncate">
              {pendingCount > 0
                ? language === "vi" ? "Cần phản hồi khách" : "Requires reply"
                : language === "vi" ? "Đã xử lý hết" : "All caught up"}
            </p>
          </motion.div>

          {/* 3. Contacted */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("contacted");
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "all_bookings" && statusFilter === "contacted"
                ? "bg-blue-50/50 border-blue-400 ring-2 ring-blue-400/30 shadow-md"
                : "bg-white/90 border-[#EAE5DC] hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                {t("admin.kpi_contacted", "Contacted")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600">
                {contactedCount}
              </p>
            </div>
            <p className="text-xs text-blue-700 font-medium truncate">
              {language === "vi" ? "Đang trao đổi trực tiếp" : "In communication"}
            </p>
          </motion.div>

          {/* 4. Confirmed */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("confirmed");
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "all_bookings" && statusFilter === "confirmed"
                ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-400/30 shadow-md"
                : "bg-white/90 border-[#EAE5DC] hover:border-emerald-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {t("admin.kpi_confirmed", "Confirmed")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600">
                {confirmedCount}
              </p>
            </div>
            <p className="text-xs text-emerald-700 font-medium truncate">
              {language === "vi" ? "Đã chốt & giữ lịch" : "Dates secured"}
            </p>
          </motion.div>

          {/* 5. Housekeeping & Turnover */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => {
              setAdminViewTab("turnover");
              setTurnoverFilter("needs_cleaning");
            }}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "turnover"
                ? "bg-indigo-50/40 border-indigo-400 ring-2 ring-indigo-400/30 shadow-md"
                : hkSummary.needsCleaning > 0
                ? "bg-[#FFF9F9] border-rose-300 hover:border-rose-400 hover:shadow-sm"
                : "bg-white/90 border-[#EAE5DC] hover:border-indigo-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                hkSummary.needsCleaning > 0 ? "text-rose-700" : "text-neutral-600"
              }`}>
                {language === "vi" ? "Cần Dọn Dẹp" : "Housekeeping"}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                hkSummary.needsCleaning > 0
                  ? "bg-rose-100 border-rose-300 text-rose-700"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600"
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-black tracking-tight ${
                hkSummary.needsCleaning > 0 ? "text-rose-600" : "text-indigo-600"
              }`}>
                {hkSummary.needsCleaning}
              </p>
              <span className="text-xs text-neutral-500 font-medium">
                / {hkSummary.total} {language === "vi" ? "phòng" : "stays"}
              </span>
            </div>
            <p className={`text-xs font-medium truncate ${
              hkSummary.needsCleaning > 0 ? "text-rose-600 font-semibold" : "text-neutral-500"
            }`}>
              {hkSummary.needsCleaning > 0
                ? language === "vi" ? "Cần điều phối buồng phòng" : "Needs cleaning action"
                : language === "vi" ? "Đã dọn sạch tất cả" : "All rooms cleaned"}
            </p>
          </motion.div>

          {/* 6. Under Maintenance */}
          <motion.div
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setAdminViewTab("maintenance")}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[130px] group cursor-pointer ${
              adminViewTab === "maintenance"
                ? "bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                : maintenanceCount > 0
                ? "bg-[#FFFBF5] border-amber-300 hover:border-amber-400 hover:shadow-sm"
                : "bg-white/90 border-[#EAE5DC] hover:border-[#C2A476] hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                maintenanceCount > 0 ? "text-amber-800" : "text-neutral-600"
              }`}>
                {t("admin.kpi_maintenance", "Maintenance")}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                maintenanceCount > 0
                  ? "bg-amber-100 border-amber-300 text-amber-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-400"
              }`}>
                <Wrench className={`w-4 h-4 ${maintenanceCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
            <div className="my-1 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-black tracking-tight ${
                maintenanceCount > 0 ? "text-amber-700" : "text-neutral-900"
              }`}>
                {maintenanceCount}
              </p>
              <span className="text-xs text-neutral-500 font-medium">/ 4 Villas</span>
            </div>
            <p className={`text-xs font-medium truncate ${
              maintenanceCount > 0 ? "text-amber-700" : "text-neutral-500"
            }`}>
              {maintenanceCount > 0
                ? language === "vi" ? `${maintenanceCount} villa tạm khoá lịch` : `${maintenanceCount} villa locked`
                : language === "vi" ? "Cả 4 villa sẵn sàng nhận khách" : "All 4 villas operational"}
            </p>
          </motion.div>
        </div>

        {/* Navigation Tab Switcher (Modern Fluid Segmented Bar with Sliding Highlight) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE5DC] shadow-xs">
          <button
            type="button"
            onClick={() => setAdminViewTab("all_bookings")}
            className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              adminViewTab === "all_bookings"
                ? "text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            {adminViewTab === "all_bookings" && (
              <motion.div
                layoutId="activeAdminTabIndicator"
                className="absolute inset-0 bg-[#14171A] rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${adminViewTab === "all_bookings" ? "text-[#C2A476]" : "text-neutral-400"}`} />
              <span>{language === "vi" ? "📋 Quản Lý Đơn Đặt Phòng" : "📋 Active Bookings"}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                adminViewTab === "all_bookings" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
              }`} title={language === "vi" ? `${activeCount} đơn đang hoạt động (chưa trả phòng)` : `${activeCount} active stays`}>
                {activeCount}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("turnover")}
            className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              adminViewTab === "turnover"
                ? "text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            {adminViewTab === "turnover" && (
              <motion.div
                layoutId="activeAdminTabIndicator"
                className="absolute inset-0 bg-[#14171A] rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${adminViewTab === "turnover" ? "text-indigo-400" : "text-neutral-400"}`} />
              <span>{language === "vi" ? "🧹 Trả Phòng & Dọn Dẹp" : "🧹 Turnover & Housekeeping"}</span>
              {checkoutCount > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  hkSummary.needsCleaning > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-indigo-500 text-white"
                }`} title={language === "vi" ? `${checkoutCount} đơn đã đến hạn trả phòng hoặc hoàn tất` : `${checkoutCount} checked out stays`}>
                  {checkoutCount}
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  adminViewTab === "turnover" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
                }`}>
                  0
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("pricing")}
            className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              adminViewTab === "pricing"
                ? "text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            {adminViewTab === "pricing" && (
              <motion.div
                layoutId="activeAdminTabIndicator"
                className="absolute inset-0 bg-[#14171A] rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Tag className={`w-4 h-4 ${adminViewTab === "pricing" ? "text-emerald-400" : "text-neutral-400"}`} />
              <span>{language === "vi" ? "💵 Đơn Giá Villa & Tỷ Giá USD" : "💵 Villa Pricing & USD Rates"}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                adminViewTab === "pricing" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}>
                4 Villas
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("maintenance")}
            className={`relative px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
              adminViewTab === "maintenance"
                ? "text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            {adminViewTab === "maintenance" && (
              <motion.div
                layoutId="activeAdminTabIndicator"
                className="absolute inset-0 bg-[#14171A] rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Wrench className={`w-4 h-4 ${adminViewTab === "maintenance" ? "text-amber-400" : "text-neutral-400"}`} />
              <span>{language === "vi" ? "🛠️ Quản Lý Bảo Trì Villa" : "🛠️ Villa Maintenance"}</span>
              {maintenanceCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                  {maintenanceCount}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* PANEL: DEDICATED TURNOVER & HOUSEKEEPING MANAGEMENT */}
        {adminViewTab === "turnover" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 mb-8"
          >
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                        {language === "vi"
                          ? "Quản Lý Trả Phòng & Điều Phối Dọn Dẹp Buồng Phòng"
                          : "Checkout & Housekeeping Coordination"}
                      </h2>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-300 uppercase tracking-wider hidden sm:inline">
                        {language === "vi" ? "Buồng Phòng Live" : "Turnover Live"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-normal mt-0.5">
                      {language === "vi"
                        ? "Hệ thống tự động lọc các đơn trả phòng hôm nay hoặc đã hoàn tất lưu trú. Nhân viên buồng phòng dễ dàng cập nhật tiến độ dọn dẹp, kiểm tra cơ sở vật chất và bàn giao phòng sẵn sàng đón khách mới."
                        : "Automatically tracks completed stays and today's checkouts. Coordinate housekeeping teams, log room notes, and mark villas ready for next check-in."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      reloadInquiries();
                      playLuxuryChime();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE5DC] text-neutral-700 text-xs font-semibold transition-all border border-[#EAE5DC] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === "vi" ? "Làm mới dữ liệu" : "Refresh"}</span>
                  </button>
                </div>
              </div>

              {/* 4 Turnover Sub-KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {/* 1. Needs Cleaning */}
                <div
                  onClick={() => setTurnoverFilter("needs_cleaning")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    turnoverFilter === "needs_cleaning"
                      ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/30 shadow-xs"
                      : "bg-[#FFFBFB] border-rose-200/70 hover:border-rose-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      {language === "vi" ? "🔴 Cần Dọn Dẹp" : "🔴 Needs Cleaning"}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  </div>
                  <div className="my-1.5">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-700">
                      {hkSummary.needsCleaning}
                    </p>
                  </div>
                  <p className="text-[11px] text-rose-600/90 font-medium">
                    {language === "vi" ? "Phòng chờ nhân viên dọn" : "Awaiting housekeeping"}
                  </p>
                </div>

                {/* 2. In Cleaning */}
                <div
                  onClick={() => setTurnoverFilter("in_cleaning")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    turnoverFilter === "in_cleaning"
                      ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 shadow-xs"
                      : "bg-[#FFFDFB] border-amber-200/70 hover:border-amber-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {language === "vi" ? "🟡 Đang Dọn Dẹp" : "🟡 In Progress"}
                    </span>
                    <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                  </div>
                  <div className="my-1.5">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">
                      {hkSummary.inCleaning}
                    </p>
                  </div>
                  <p className="text-[11px] text-amber-600/90 font-medium">
                    {language === "vi" ? "Nhân viên đang xử lý" : "Currently cleaning"}
                  </p>
                </div>

                {/* 3. Cleaned & Ready */}
                <div
                  onClick={() => setTurnoverFilter("cleaned")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    turnoverFilter === "cleaned"
                      ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs"
                      : "bg-[#FBFFFD] border-emerald-200/70 hover:border-emerald-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {language === "vi" ? "✨ Đã Dọn Xong" : "✨ Clean & Ready"}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="my-1.5">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700">
                      {hkSummary.cleaned}
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-600/90 font-medium">
                    {language === "vi" ? "Sẵn sàng đón khách mới" : "Ready for next check-in"}
                  </p>
                </div>

                {/* 4. Checkout Today */}
                <div
                  onClick={() => setTurnoverFilter("today")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    turnoverFilter === "today"
                      ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30 shadow-xs"
                      : "bg-[#FBFBFF] border-indigo-200/70 hover:border-indigo-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      {language === "vi" ? "⏰ Trả Hôm Nay" : "⏰ Checkout Today"}
                    </span>
                    <Calendar className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="my-1.5">
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-700">
                      {inquiries.filter((i) => isCheckoutToday(i.checkOut) && i.status !== "cancelled").length}
                    </p>
                  </div>
                  <p className="text-[11px] text-indigo-600/90 font-medium">
                    {language === "vi" ? "Cần chuẩn bị nhận phòng" : "Departing today"}
                  </p>
                </div>
              </div>

              {/* Turnover Filters & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] mb-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-2">
                    {language === "vi" ? "Bộ lọc:" : "Filter:"}
                  </span>
                  {[
                    { id: "all", labelVi: "Tất Cả", labelEn: "All Stays", count: inquiries.filter((i) => (isCheckoutExpired(i.checkOut) || isCheckoutToday(i.checkOut)) && i.status !== "cancelled").length },
                    { id: "needs_cleaning", labelVi: "🔴 Cần Dọn", labelEn: "🔴 Needs Cleaning", count: hkSummary.needsCleaning },
                    { id: "in_cleaning", labelVi: "🟡 Đang Dọn", labelEn: "🟡 In Progress", count: hkSummary.inCleaning },
                    { id: "cleaned", labelVi: "🟢 Đã Sạch", labelEn: "🟢 Cleaned", count: hkSummary.cleaned },
                    { id: "today", labelVi: "⏰ Trả Hôm Nay", labelEn: "⏰ Today", count: inquiries.filter((i) => isCheckoutToday(i.checkOut) && i.status !== "cancelled").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTurnoverFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        turnoverFilter === tab.id
                          ? "bg-[#14171A] text-white shadow-xs"
                          : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{language === "vi" ? tab.labelVi : tab.labelEn}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200/60 font-mono text-neutral-800">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={language === "vi" ? "Tìm khách, villa, mã đơn..." : "Search guest, villa, ID..."}
                      value={turnoverSearchQuery}
                      onChange={(e) => setTurnoverSearchQuery(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#C2A476]"
                    />
                  </div>
                </div>
              </div>

              {/* Turnover Cards List */}
              {turnoverFilteredInquiries.length === 0 ? (
                <div className="bg-[#FAF8F5] rounded-3xl p-10 sm:p-14 text-center border border-dashed border-[#EAE5DC]">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-neutral-900">
                    {language === "vi" ? "Không có đơn nào cần xử lý dọn phòng" : "No Pending Turnover Tasks"}
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                    {language === "vi"
                      ? "Tất cả các biệt thự đã hoàn tất lưu trú đều đã được dọn sạch và kiểm tra, hoặc không có đơn nào trùng khớp với bộ lọc hiện tại."
                      : "All completed stays have been cleaned and inspected, or no inquiries match your current filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {turnoverFilteredInquiries.map((inq) => {
                    const isToday = isCheckoutToday(inq.checkOut);
                    const cleaningStatus = inq.cleaningStatus || "needs_cleaning";
                    const nights = calculateStayNights(inq.checkIn, inq.checkOut);
                    const vMatch = siteConfig.villas.find((v) => v.id === inq.villaId);
                    const villaNightly = villaPrices[inq.villaId] ?? vMatch?.priceVnd ?? 18000000;
                    const stayTotalVnd = calculateStayTotal(inq.checkIn, inq.checkOut, villaNightly);

                    return (
                      <motion.div
                        key={inq.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                          cleaningStatus === "needs_cleaning"
                            ? "bg-[#FFFBFB] border-rose-200 hover:border-rose-300"
                            : cleaningStatus === "in_cleaning"
                            ? "bg-[#FFFDFB] border-amber-200 hover:border-amber-300"
                            : "bg-[#FBFFFD] border-emerald-200 hover:border-emerald-300"
                        }`}
                      >
                        <div>
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-100">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm sm:text-base text-neutral-900 tracking-tight">
                                  {inq.villaName}
                                </span>
                                {isToday ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider animate-pulse">
                                    {language === "vi" ? "⏰ Trả Phòng Hôm Nay" : "⏰ Checkout Today"}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase tracking-wider">
                                    {language === "vi" ? "⌛ Đã Hết Hạn Ở" : "⌛ Stay Completed"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                #{inq.id} • {inq.guestName}
                              </p>
                            </div>

                            {/* Cleaning Badge */}
                            <div>
                              {cleaningStatus === "needs_cleaning" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                  <span>{language === "vi" ? "🔴 CẦN DỌN" : "🔴 NEEDS CLEANING"}</span>
                                </span>
                              )}
                              {cleaningStatus === "in_cleaning" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                  <span>{language === "vi" ? "🟡 ĐANG DỌN" : "🟡 IN CLEANING"}</span>
                                </span>
                              )}
                              {cleaningStatus === "cleaned" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{language === "vi" ? "✨ ĐÃ SẠCH SẼ" : "✨ CLEAN & READY"}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Middle Details Grid */}
                          <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-neutral-100">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                {language === "vi" ? "Thời Gian Lưu Trú:" : "Stay Period:"}
                              </span>
                              <p className="font-semibold text-neutral-800 mt-0.5">
                                {formatLuxuryDate(inq.checkIn)} → {formatLuxuryDate(inq.checkOut)}
                              </p>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                ({nights} {language === "vi" ? "đêm" : "nights"})
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                                {language === "vi" ? "Khách & Thanh Toán:" : "Guest & Payment:"}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="font-semibold text-neutral-800 hover:text-[#C2A476] transition-colors"
                                >
                                  {inq.phone}
                                </a>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[11px] font-mono font-bold text-neutral-900">
                                  {formatPriceVnd(stayTotalVnd)}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    inq.paymentStatus === "paid"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : inq.paymentStatus === "deposit"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {inq.paymentStatus === "paid"
                                    ? (language === "vi" ? "Đã thu" : "Paid")
                                    : inq.paymentStatus === "deposit"
                                    ? (language === "vi" ? "Đã cọc" : "Deposit")
                                    : (language === "vi" ? "Chưa thu" : "Unpaid")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Housekeeping Note Box */}
                          <div className="py-2.5">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                                {language === "vi" ? "📝 Ghi Chú Buồng Phòng & Vật Dụng:" : "📝 Housekeeping Notes:"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingTurnoverNoteId === inq.id) {
                                    setEditingTurnoverNoteId(null);
                                  } else {
                                    setEditingTurnoverNoteId(inq.id);
                                    setTurnoverNoteInput(inq.cleaningNotes || "");
                                  }
                                }}
                                className="text-[10px] font-semibold text-[#8A6B3D] hover:underline cursor-pointer"
                              >
                                {editingTurnoverNoteId === inq.id
                                  ? (language === "vi" ? "Đóng" : "Cancel")
                                  : (language === "vi" ? "Chỉnh sửa" : "Edit note")}
                              </button>
                            </div>

                            {editingTurnoverNoteId === inq.id ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={2}
                                  value={turnoverNoteInput}
                                  onChange={(e) => setTurnoverNoteInput(e.target.value)}
                                  placeholder={
                                    language === "vi"
                                      ? "Ví dụ: Đã thay ga giường tầng 2, bổ sung 4 khăn tắm, minibar đầy đủ..."
                                      : "e.g., Master bed remade, replenished 4 towels, minibar inspected..."
                                  }
                                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:border-[#C2A476]"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTurnoverStatus(inq.id, cleaningStatus, turnoverNoteInput)}
                                  className="px-3 py-1 rounded-lg bg-[#14171A] hover:bg-[#C2A476] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                                >
                                  {language === "vi" ? "Lưu Ghi Chú" : "Save Note"}
                                </button>
                              </div>
                            ) : inq.cleaningNotes ? (
                              <p className="text-xs text-neutral-700 bg-white/70 p-2.5 rounded-xl border border-neutral-200/60 leading-relaxed italic">
                                &ldquo;{inq.cleaningNotes}&rdquo;
                              </p>
                            ) : (
                              <p className="text-[11px] text-neutral-400 italic">
                                {language === "vi" ? "Chưa có ghi chú đặc biệt cho phòng này." : "No specific housekeeping notes added."}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom 1-Click Status Controls */}
                        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 mt-2">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            {language === "vi" ? "Đổi Trạng Thái 1-Chạm:" : "1-Click Status:"}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleUpdateTurnoverStatus(inq.id, "needs_cleaning", inq.cleaningNotes)}
                              disabled={isUpdatingTurnover || cleaningStatus === "needs_cleaning"}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                cleaningStatus === "needs_cleaning"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                              }`}
                            >
                              🔴 {language === "vi" ? "Cần Dọn" : "Needs Cleaning"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateTurnoverStatus(inq.id, "in_cleaning", inq.cleaningNotes)}
                              disabled={isUpdatingTurnover || cleaningStatus === "in_cleaning"}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                cleaningStatus === "in_cleaning"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
                              }`}
                            >
                              🟡 {language === "vi" ? "Đang Dọn" : "In Progress"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateTurnoverStatus(inq.id, "cleaned", inq.cleaningNotes)}
                              disabled={isUpdatingTurnover || cleaningStatus === "cleaned"}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                cleaningStatus === "cleaned"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
                              }`}
                            >
                              ✨ {language === "vi" ? "Đã Dọn Xong" : "Cleaned & Ready"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingInquiry(inq)}
                              className="px-2 py-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer text-xs"
                              title={language === "vi" ? "Xem chi tiết đơn" : "View full booking"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PANEL 2: VILLA PRICING & DIRECT USD CONVERSION MANAGEMENT */}
        {adminViewTab === "pricing" && (
          <div className="space-y-6 mb-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-neutral-900">
                        {language === "vi" ? "Quản Lý Đơn Giá Villa & Tỷ Giá Quy Đổi USD" : "Villa Nightly Rates & Real-Time USD Currency Conversion"}
                      </h2>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider hidden sm:inline">
                        {language === "vi" ? "Đồng Bộ Trực Tiếp" : "Live Sync"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-normal mt-0.5">
                      {language === "vi"
                        ? "Điều chỉnh đơn giá mỗi đêm (VND) cho từng căn biệt thự và tỷ giá USD. Website công khai và modal đặt phòng sẽ tự động quy đổi và hiển thị giá mới tức thì trên mọi thiết bị."
                        : "Configure nightly rates (VND) per villa and USD exchange rate. The public website and booking modal recalculate and mirror rates instantly across all devices."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAllPricesAndUsd}
                    disabled={isSavingPrices}
                    className="px-4 py-2.5 rounded-xl bg-[#14171A] hover:bg-[#C2A476] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {priceSaveFeedback ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">{language === "vi" ? "Đã Lưu & Đồng Bộ!" : "Saved & Synced!"}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#C2A476]" />
                        <span>{language === "vi" ? "Lưu Toàn Bộ Bảng Giá" : "Save All Rates & USD"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Setting Box: USD Exchange Rate */}
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                      {language === "vi" ? "Tỷ Giá Ngoại Tệ (USD / VND)" : "Foreign Exchange Rate (USD / VND)"}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-neutral-900 mt-0.5">
                      1 USD = {formatPriceVnd(usdRate).replace(" ₫", "")} VND
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                      {language === "vi"
                        ? "Tỷ giá này dùng để quy đổi trực tiếp đơn giá và tạm tính tổng tiền ra USD trên trang chủ cho khách quốc tế."
                        : "Used for real-time conversion from VND to USD on public villa cards and the booking modal."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-3 py-2 shadow-2xs">
                      <span className="text-xs font-bold text-neutral-500">1 USD =</span>
                      <input
                        type="number"
                        min="1000"
                        step="100"
                        value={usdRate}
                        onChange={(e) => setUsdRate(Math.max(1, Number(e.target.value)))}
                        className="w-24 text-sm font-mono font-bold text-neutral-900 focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-neutral-500">VND</span>
                    </div>

                    {/* Preset Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[25400, 25500, 25800, 26000].map((ratePreset) => (
                        <button
                          key={ratePreset}
                          type="button"
                          onClick={() => setUsdRate(ratePreset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                            usdRate === ratePreset
                              ? "bg-emerald-600 text-white"
                              : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {ratePreset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Villas Nightly Price Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {siteConfig.villas.map((villa) => {
                  const currentPrice = villaPrices[villa.id] ?? villa.priceVnd ?? 18000000;
                  const convertedUsd = formatPriceUsd(currentPrice, usdRate);

                  return (
                    <div
                      key={villa.id}
                      className="bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] p-4 sm:p-5 hover:border-[#C2A476] transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Info */}
                        <div className="flex items-center gap-3.5 mb-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 bg-neutral-100 shadow-sm">
                            <Image
                              src={villa.image}
                              alt={villa.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {villa.code}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-neutral-900 truncate">
                              {language === "vi" ? (villa.nameVi || villa.name) : villa.name}
                            </h3>
                            <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                              {language === "vi" ? (villa.locationVi || villa.location) : villa.location} • {villa.bedrooms} PN • {villa.maxGuests} {language === "vi" ? "khách tối đa" : "max guests"}
                            </p>
                            <span className="text-[10px] text-neutral-400 block truncate">
                              {language === "vi" ? (villa.poolTypeVi || villa.poolType) : villa.poolType}
                            </span>
                          </div>
                        </div>

                        {/* Price Input Form */}
                        <div className="bg-white rounded-xl p-3.5 border border-neutral-200 mb-3 space-y-2.5">
                          <label className="block text-[11px] uppercase font-bold tracking-wider text-neutral-600">
                            {language === "vi" ? "Đơn Giá Thuê 1 Đêm (VND)" : "Nightly Rate (VND)"}
                          </label>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="1000000"
                                step="500000"
                                value={currentPrice}
                                onChange={(e) =>
                                  setVillaPrices((prev) => ({
                                    ...prev,
                                    [villa.id]: Math.max(0, Number(e.target.value)),
                                  }))
                                }
                                className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:border-[#C2A476]"
                              />
                            </div>
                            <span className="text-xs font-semibold text-neutral-500">VNĐ/đêm</span>
                          </div>

                          {/* Quick Increment/Decrement Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setVillaPrices((prev) => ({
                                  ...prev,
                                  [villa.id]: Math.max(0, currentPrice - 1000000),
                                }))
                              }
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 cursor-pointer"
                            >
                              - 1.000.000
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setVillaPrices((prev) => ({
                                  ...prev,
                                  [villa.id]: Math.max(0, currentPrice - 500000),
                                }))
                              }
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 cursor-pointer"
                            >
                              - 500.000
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setVillaPrices((prev) => ({
                                  ...prev,
                                  [villa.id]: currentPrice + 500000,
                                }))
                              }
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 cursor-pointer"
                            >
                              + 500.000
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setVillaPrices((prev) => ({
                                  ...prev,
                                  [villa.id]: currentPrice + 1000000,
                                }))
                              }
                              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 cursor-pointer"
                            >
                              + 1.000.000
                            </button>
                          </div>
                        </div>

                        {/* Live Conversion Preview */}
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                              {language === "vi" ? "Hiển Thị Website Công Khai:" : "Public Live Display:"}
                            </span>
                            <span className="text-sm font-extrabold text-emerald-950 tracking-tight">
                              {formatPriceVnd(currentPrice)}/đêm
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs">
                              <span>≈</span>
                              <span className="font-mono">${convertedUsd}</span>
                              <span className="text-[10px] font-normal text-emerald-700">USD/đêm</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Single Villa Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveVillaPrice(villa.id, currentPrice)}
                        className="w-full bg-[#14171A] hover:bg-[#C2A476] text-white py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mt-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{language === "vi" ? `Lưu Giá ${villa.code}` : `Save ${villa.code} Rate`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: DEDICATED VILLA MAINTENANCE PANEL */}
        {adminViewTab === "maintenance" && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 shadow-sm">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-neutral-900">
                      {language === "vi" ? "Kiểm Soát Vận Hành & Bảo Trì Villa" : "Villa Maintenance & Operational Status Control"}
                    </h2>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider hidden sm:inline">
                      {language === "vi" ? "Chuyển Trực Tiếp" : "Live Toggle"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    {language === "vi"
                      ? "Chọn bất kỳ biệt thự nào để chuyển sang chế độ bảo trì. Villa bị khoá sẽ tự động dừng nhận đơn đặt phòng và khoá lịch trên trang web."
                      : "Select any villa to place under maintenance. Locked villas immediately block online inquiries and calendar dates across the public website."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  maintenanceCount > 0
                    ? "bg-amber-50 text-amber-800 border-amber-300"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300"
                }`}>
                  {language === "vi" ? `${4 - maintenanceCount}/4 Villa Sẵn Sàng` : `${4 - maintenanceCount} of 4 Villas Active`}
                </span>
              </div>
            </div>

            {/* 4 Villa Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {siteConfig.villas.map((villa) => {
                const info = maintenanceMap[villa.id];
                const isConfigured = Boolean(info?.isMaintenance);
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

                let status: "active" | "ongoing" | "scheduled" | "expired" | "indefinite" = "active";
                if (isConfigured) {
                  if (!info.startDate || !info.endDate) {
                    status = "indefinite";
                  } else if (todayStr > info.endDate) {
                    status = "expired";
                  } else if (todayStr < info.startDate) {
                    status = "scheduled";
                  } else {
                    status = "ongoing";
                  }
                }

                const isCurrentlyLocked = status === "ongoing" || status === "indefinite";

                return (
                  <div
                    key={villa.id}
                    className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${
                      status === "ongoing"
                        ? "border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/25"
                        : status === "scheduled"
                        ? "border-sky-300 bg-sky-50/40 shadow-sm hover:border-sky-400"
                        : status === "indefinite"
                        ? "border-rose-300 bg-rose-50/30 shadow-md ring-2 ring-rose-400/20"
                        : status === "expired"
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-neutral-200 bg-[#FAF8F5]/60 hover:border-[#C2A476] hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Villa Thumbnail & Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 flex-shrink-0 bg-neutral-100 shadow-sm">
                          <Image
                            src={villa.image}
                            alt={villa.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {villa.code}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                            {language === "vi" ? (villa.nameVi || villa.name) : villa.name}
                          </h3>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {language === "vi" ? (villa.locationVi || villa.location) : villa.location} • {villa.bedrooms} PN
                          </p>
                        </div>
                      </div>

                      {/* Operational Status Pill */}
                      <div className="mb-2.5">
                        {status === "ongoing" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span>{language === "vi" ? "Đang Bảo Trì Hôm Nay" : "Under Maintenance Today"}</span>
                          </div>
                        )}

                        {status === "scheduled" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span>{language === "vi" ? "Lịch Bảo Trì Sắp Tới" : "Upcoming Maintenance"}</span>
                          </div>
                        )}

                        {status === "indefinite" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold">
                            <Wrench className="w-3.5 h-3.5 text-rose-600" />
                            <span>{language === "vi" ? "Bảo Trì Vô Thời Hạn" : "Locked (Indefinite)"}</span>
                          </div>
                        )}

                        {status === "expired" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === "vi" ? "Đã Hết Đợt (Tự Động Mở)" : "Maintenance Completed"}</span>
                          </div>
                        )}

                        {status === "active" && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{language === "vi" ? "Đang Hoạt Động" : "Operational & Active"}</span>
                          </div>
                        )}
                      </div>

                      {/* Scheduled Date Window Box */}
                      {isConfigured && info?.startDate && info?.endDate && (
                        <div className={`p-2.5 rounded-xl border text-[11px] mb-2.5 ${
                          status === "ongoing"
                            ? "bg-amber-100/70 border-amber-300 text-amber-950 font-medium"
                            : status === "scheduled"
                            ? "bg-sky-100/70 border-sky-200 text-sky-950 font-medium"
                            : "bg-neutral-100 border-neutral-200 text-neutral-600"
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold mb-0.5">
                            <Calendar className="w-3.5 h-3.5 opacity-80" />
                            <span>{formatLuxuryDate(info.startDate)} → {formatLuxuryDate(info.endDate)}</span>
                          </div>
                          <p className="text-[10px] opacity-80 font-normal">
                            {status === "ongoing"
                              ? (language === "vi" ? "Hệ thống đang khóa lịch đón khách trên web." : "Public dates are locked in this window.")
                              : status === "scheduled"
                              ? (language === "vi" ? "Hôm nay vẫn mở đón khách; chỉ khóa các ngày này." : "Active today; only reserved maintenance dates are locked.")
                              : (language === "vi" ? "Đã qua ngày bảo trì; villa tự động mở lại." : "Window passed; villa automatically reopened.")}
                          </p>
                        </div>
                      )}

                      {/* Reason / Note Box */}
                      {isConfigured && (
                        <div className="bg-white/90 border border-neutral-200 rounded-xl p-2.5 mb-3 text-[11px] text-neutral-800 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                            {language === "vi" ? "Thông Báo Khách:" : "Public Notice:"}
                          </span>
                          <p className="line-clamp-2 italic font-light text-neutral-700">
                            &ldquo;{info?.reason || (language === "vi" ? "Biệt thự đang bảo trì nâng cấp định kỳ." : "Scheduled luxury maintenance & seasonal care.")}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-col gap-1.5 mt-2">
                      {isCurrentlyLocked ? (
                        <button
                          type="button"
                          onClick={() => handleSaveMaintenance(villa.id, false)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === "vi" ? "Mở Lại Hoạt Động Ngay" : "Restore to Active"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openMaintenanceModal(villa)}
                          className="w-full bg-[#14171A] hover:bg-amber-600 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-md"
                        >
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === "vi" ? "Chọn Ngày & Khóa Bảo Trì" : "Set Maintenance Dates"}</span>
                        </button>
                      )}

                      {isConfigured && (
                        <button
                          type="button"
                          onClick={() => openMaintenanceModal(villa)}
                          className="text-[11px] text-neutral-600 hover:text-amber-700 font-medium underline text-center cursor-pointer py-0.5 transition-colors"
                        >
                          {language === "vi" ? "Chỉnh sửa ngày & lý do bảo trì" : "Edit dates & notice"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANEL 4: ALL RESERVATIONS (DEFAULT VIEW) */}
        {adminViewTab === "all_bookings" && (
          <div className="space-y-5 animate-fade-in">
            {/* Automatic Checkout Notification Banner */}
            {checkoutCount > 0 && statusFilter === "all" && (
              <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      {language === "vi"
                        ? `Có ${checkoutCount} đơn đã đến ngày trả phòng hoặc hết hạn lưu trú`
                        : `${checkoutCount} reservations have reached check-out`}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-normal">
                      {language === "vi"
                        ? "Các đơn này đã được tự động chuyển sang mục Trả Phòng & Dọn Dẹp để bộ phận buồng phòng kiểm tra và dọn dẹp."
                        : "These stays are automatically moved to the Turnover tab for housekeeping and inspection."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminViewTab("turnover")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14171A] hover:bg-[#C2A476] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs hover:shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>{language === "vi" ? "Xem Mục Trả Phòng ➔" : "Go to Turnover ➔"}</span>
                </button>
              </div>
            )}

            {/* Unified Command & Filter Toolbar */}
            <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#EAE5DC] shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search input with clear button */}
              <div className="relative flex-1 max-w-full lg:max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={t("admin.search_placeholder", "Search guest, ID, villa, phone...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-200 hover:border-neutral-300 focus:border-[#C2A476] rounded-xl pl-10 pr-9 py-2 text-xs transition-colors focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter pills & Reset button */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#C2A476] cursor-pointer transition-colors"
                  >
                    <option value="all">📋 {language === "vi" ? "Đơn Đang Hoạt Động (Chưa Trả Phòng)" : "Active Reservations"}</option>
                    <option value="history_all">📁 {language === "vi" ? "Toàn Bộ Lịch Sử (Kể Cả Đã Trả)" : "All History (Incl. Checked Out)"}</option>
                    <option value="pending">⏳ {t("admin.status_pending", "Pending")}</option>
                    <option value="contacted">📞 {t("admin.status_contacted", "Contacted")}</option>
                    <option value="confirmed">✅ {t("admin.status_confirmed", "Confirmed")}</option>
                    <option value="in_house">🏡 {language === "vi" ? "Đang lưu trú" : "Currently In-House"}</option>
                    <option value="checkout_today">⏰ {language === "vi" ? "Trả phòng hôm nay" : "Checkout Today"}</option>
                    <option value="expired">🏁 {language === "vi" ? "Đã trả phòng / Hết hạn" : "Stay Ended"}</option>
                    <option value="cancelled">❌ {t("admin.status_cancelled", "Cancelled")}</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>

                {/* Villa Filter */}
                <div className="relative">
                  <select
                    value={villaFilter}
                    onChange={(e) => setVillaFilter(e.target.value)}
                    className="appearance-none bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#C2A476] cursor-pointer transition-colors"
                  >
                    <option value="all">🏛️ {t("admin.all_villas_option", "All 4 Villas")}</option>
                    {siteConfig.villas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} ({v.district})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>

                {/* Payment Filter */}
                <div className="relative">
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="appearance-none bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#C2A476] cursor-pointer transition-colors"
                  >
                    <option value="all">💳 {language === "vi" ? "Tất Cả Khoản Thu" : "All Payments"}</option>
                    <option value="unpaid">🔴 {language === "vi" ? "Chưa thu" : "Unpaid"} ({paySummary.unpaidCount})</option>
                    <option value="deposit">🟡 {language === "vi" ? "Đã đặt cọc" : "Deposit"} ({paySummary.depositCount})</option>
                    <option value="paid">🟢 {language === "vi" ? "Đã thu đủ" : "Paid"} ({paySummary.paidCount})</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
                </div>

                {/* Reset Filters button if active */}
                {(statusFilter !== "all" || villaFilter !== "all" || paymentFilter !== "all" || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setVillaFilter("all");
                      setPaymentFilter("all");
                      setSearchQuery("");
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Xoá tất cả bộ lọc"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{language === "vi" ? "Xoá lọc" : "Reset"}</span>
                  </button>
                )}
              </div>

              {/* Revenue quick stat pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs self-start lg:self-auto shrink-0">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wide">{language === "vi" ? "Doanh thu:" : "Rev:"}</span>
                <span className="font-extrabold text-neutral-900 font-mono">{formatPriceVnd(paySummary.totalRevenueVnd)}</span>
                <span className="text-xs text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md font-bold font-mono border border-emerald-200">
                  ✓ {formatPriceVnd(paySummary.paidRevenueVnd)}
                </span>
                {paySummary.unpaidRevenueVnd > 0 && (
                  <span className="text-xs text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md font-bold font-mono border border-rose-200">
                    ! {formatPriceVnd(paySummary.unpaidRevenueVnd)}
                  </span>
                )}
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <p className="text-neutral-500 text-sm mb-4">
                  {inquiries.length === 0
                    ? "No reservations logged yet."
                    : "No reservation inquiries match your current filters."}
                </p>
                {inquiries.length === 0 && (
                  <button
                    type="button"
                    onClick={handleRequestResetSample}
                    className="inline-flex items-center gap-2 bg-[#14171A] hover:bg-[#C2A476] text-white py-2.5 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load Sample Inquiries</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredInquiries.map((inq) => {
                    const isNewlyArrived = inq.id === newlyArrivedId;
                    const whatsappLink = `https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(inq.guestName)},%20thank%20you%20for%20inquiring%20about%20${encodeURIComponent(inq.villaName)}%20(Ref:%20${inq.id}).`;
                    const stayNights = calculateStayNights(inq.checkIn, inq.checkOut);
                    const nightlyPrice = bookingStore.getVillaPrice(inq.villaId);
                    const totalPrice = inq.totalPriceVnd ?? (stayNights * nightlyPrice);
                    const currentPaymentStatus: PaymentStatus = inq.paymentStatus || "unpaid";
                    const convertedStayUsd = formatPriceUsd(totalPrice, usdRate);

                    return (
                      <motion.div
                        key={inq.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 relative ${
                          isNewlyArrived
                            ? "border-[#C2A476] ring-4 ring-[#C2A476]/30 bg-amber-50/20"
                            : "border-[#EAE5DC] hover:border-[#C2A476]/50"
                        }`}
                      >
                        {/* Flashing Tag if just arrived via real-time sync */}
                        {isNewlyArrived && (
                          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2A476] text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            <span>Just Received (Real-Time Live)</span>
                          </div>
                        )}

                        {/* Overlapping Conflict Alert Banner */}
                        {(() => {
                          const conflicts = bookingStore.findConflictsForInquiry(inq);
                          if (conflicts.length === 0) return null;
                          return (
                            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-2xs">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-rose-900 text-xs sm:text-sm">
                                    Trùng Lịch Lưu Trú Cần Xử Lý!
                                  </p>
                                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                                    Đơn này trùng lịch với #{conflicts.map((c) => `${c.id} (${c.guestName}: ${c.checkIn} → ${c.checkOut})`).join(", ")}. Vui lòng đổi ngày hoặc huỷ đơn trùng.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingInquiry({ ...inq })}
                                  className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                                >
                                  Đổi Ngày
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusChange(inq.id, "cancelled")}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                                >
                                  Huỷ Đơn
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Card Header: Guest info on left, Status and Actions on right */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE1]">
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="font-mono text-xs font-black text-[#8A6B3D] bg-[#FAF8F5] border border-[#EAE5DC] px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                              #{inq.id}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-neutral-900">
                                  {inq.guestName}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#8A6B3D] border border-[#EAE5DC]">
                                  🏛️ {inq.villaName}
                                </span>
                                {(() => {
                                  const stay = getStayStatus(inq.checkIn, inq.checkOut);
                                  if (stay === "checkout_today") {
                                    return (
                                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 animate-pulse">
                                        {language === "vi" ? "⏰ Trả phòng hôm nay" : "⏰ Checkout Today"}
                                      </span>
                                    );
                                  }
                                  if (stay === "expired") {
                                    return (
                                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full border border-neutral-200">
                                        {language === "vi" ? "🏁 Đã trả phòng" : "Checked Out"}
                                      </span>
                                    );
                                  }
                                  if (stay === "in_house") {
                                    return (
                                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        {language === "vi" ? "🏡 Đang lưu trú" : "In-House"}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                            {/* Status Selector Dropdown */}
                            <select
                              value={inq.status}
                              onChange={(e) => handleQuickStatusChange(inq.id, e.target.value as InquiryStatus)}
                              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-colors shadow-2xs ${
                                inq.status === "pending"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : inq.status === "contacted"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : inq.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-neutral-100 text-neutral-500 border-neutral-200"
                              }`}
                            >
                              <option value="pending">● {t("admin.status_pending", "Pending")}</option>
                              <option value="contacted">● {t("admin.status_contacted", "Contacted")}</option>
                              <option value="confirmed">● {t("admin.status_confirmed", "Confirmed")}</option>
                              <option value="cancelled">● {language === "vi" ? "Đã Huỷ (Nhả Lịch)" : "Cancelled (Release Dates)"}</option>
                            </select>

                            {/* Edit Button */}
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => setEditingInquiry({ ...inq })}
                              className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#f3ede1] text-[#8A6B3D] border border-[#E8E0D2] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
                              title="Chỉnh sửa thông tin đơn & ngày lưu trú"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#C2A476]" />
                              <span>{t("admin.edit_dates", "Edit")}</span>
                            </motion.button>

                            {/* WhatsApp Button */}
                            <motion.a
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
                              title="Chat WhatsApp trực tiếp với khách"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </motion.a>

                            {/* Quick Turnover Action Button */}
                            {(() => {
                              const stay = getStayStatus(inq.checkIn, inq.checkOut);
                              const isCheckout = stay === "expired" || stay === "checkout_today" || Boolean(inq.isCheckedOut);
                              if (isCheckout) {
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => {
                                      setAdminViewTab("turnover");
                                      setTurnoverSearchQuery(inq.id);
                                    }}
                                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                                    title={language === "vi" ? "Xem đơn này tại mục Trả Phòng & Dọn Dẹp" : "View in turnover tab"}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>{language === "vi" ? "Mục Trả Phòng ➔" : "Turnover ➔"}</span>
                                  </motion.button>
                                );
                              }
                              if (stay === "in_house") {
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleCheckOutGuest(inq.id, inq.guestName)}
                                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                                    title={language === "vi" ? "Hoàn tất trả phòng và chuyển đơn qua mục Trả Phòng & Dọn Dẹp" : "Check out guest now"}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>{language === "vi" ? "Trả Phòng" : "Check Out"}</span>
                                  </motion.button>
                                );
                              }
                              return null;
                            })()}

                            {/* Delete Button */}
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => handleRequestDelete(inq)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Xoá đơn và giải phóng ngày trên lịch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Booking Details Grid (Clean 4-column modern card) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 text-xs">
                          <div className="bg-[#FAF8F5]/80 p-3 rounded-xl border border-[#F0ECE1]">
                            <span className="text-neutral-500 block text-xs uppercase font-bold tracking-wider">
                              📅 {t("admin.stay_dates", "Stay Dates")}
                            </span>
                            <p className="font-bold text-neutral-800 mt-1 truncate">
                              {inq.checkIn} → {inq.checkOut}
                            </p>
                            <span className="text-xs text-neutral-500 font-medium">
                              ({stayNights} {language === "vi" ? "đêm lưu trú" : "nights"})
                            </span>
                          </div>

                          <div className="bg-[#FAF8F5]/80 p-3 rounded-xl border border-[#F0ECE1]">
                            <span className="text-neutral-500 block text-xs uppercase font-bold tracking-wider">
                              👥 {t("admin.guest_count", "Guest Count")}
                            </span>
                            <p className="font-bold text-neutral-800 mt-1">
                              {inq.adults} {language === "vi" ? "Người lớn" : "Adults"}
                              {inq.children > 0 ? `, ${inq.children} ${language === "vi" ? "Trẻ em" : "Kids"}` : ""}
                            </p>
                          </div>

                          <div className="bg-[#FAF8F5]/80 p-3 rounded-xl border border-[#F0ECE1]">
                            <span className="text-neutral-500 block text-xs uppercase font-bold tracking-wider">
                              📞 {language === "vi" ? "Điện thoại / Hotline" : "Phone / Contact"}
                            </span>
                            <a
                              href={`tel:${inq.phone}`}
                              className="font-bold text-neutral-800 hover:text-[#C2A476] mt-1 block truncate transition-colors"
                            >
                              {inq.phone}
                            </a>
                          </div>

                          <div className="bg-[#FAF8F5]/80 p-3 rounded-xl border border-[#F0ECE1]">
                            <span className="text-neutral-500 block text-xs uppercase font-bold tracking-wider">
                              ✉️ {language === "vi" ? "Email khách hàng" : "Guest Email"}
                            </span>
                            <a
                              href={`mailto:${inq.email}`}
                              className="font-bold text-neutral-800 hover:text-[#C2A476] mt-1 block truncate transition-colors"
                            >
                              {inq.email}
                            </a>
                          </div>
                        </div>

                        {/* FINANCIAL & PAYMENT STATUS ROW */}
                        <div className="mt-2 pt-3 border-t border-[#F0ECE1] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC]">
                          {/* Total Price & Nights Breakdown */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8A6B3D] shrink-0 shadow-2xs">
                              <CreditCard className="w-4 h-4 text-[#C2A476]" />
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight font-mono">
                                  {formatPriceVnd(totalPrice)}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-mono shadow-2xs">
                                  <span>≈</span>
                                  <span>${convertedStayUsd}</span>
                                  <span className="text-xs font-normal text-emerald-700">USD</span>
                                </span>
                                <span className="text-xs text-neutral-600 font-medium hidden sm:inline">
                                  • {stayNights} đêm × {formatPriceVnd(nightlyPrice)}/đêm
                                </span>
                              </div>
                              {inq.paidAmountVnd !== undefined && currentPaymentStatus === "deposit" && (
                                <p className="text-xs text-amber-700 font-bold mt-0.5">
                                  {language === "vi" ? "Đã cọc:" : "Deposit:"} {formatPriceVnd(inq.paidAmountVnd)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Payment Status & Quick 1-Click Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pt-2 md:pt-0 border-t md:border-t-0 border-[#F0ECE1]">
                            <span className="text-xs font-bold text-neutral-600 whitespace-nowrap">
                              {language === "vi" ? "Thu Tiền:" : "Payment:"}
                            </span>

                            <div className="inline-flex items-center p-1 bg-white rounded-xl border border-neutral-200 shadow-2xs gap-1">
                              {/* Chưa thu (Unpaid) */}
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => handleUpdatePaymentStatus(inq.id, "unpaid")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  currentPaymentStatus === "unpaid"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                                }`}
                                title="Đánh dấu Chưa thu tiền"
                              >
                                <span className={`w-2 h-2 rounded-full ${currentPaymentStatus === "unpaid" ? "bg-white" : "bg-rose-500"}`} />
                                <span>{language === "vi" ? "Chưa thu" : "Unpaid"}</span>
                              </motion.button>

                              {/* Đã cọc (Deposit) */}
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => handleUpdatePaymentStatus(inq.id, "deposit")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  currentPaymentStatus === "deposit"
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                                }`}
                                title="Đánh dấu Đã cọc tiền phòng"
                              >
                                <span className={`w-2 h-2 rounded-full ${currentPaymentStatus === "deposit" ? "bg-white" : "bg-amber-500"}`} />
                                <span>{language === "vi" ? "Đã cọc" : "Deposit"}</span>
                              </motion.button>

                              {/* Đã thu (Paid) */}
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => handleUpdatePaymentStatus(inq.id, "paid")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  currentPaymentStatus === "paid"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                                }`}
                                title="Đánh dấu Đã thu đủ tiền phòng"
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 ${currentPaymentStatus === "paid" ? "text-white" : "text-emerald-600"}`} />
                                <span>{language === "vi" ? "Đã thu" : "Paid"}</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {inq.specialRequests && (
                          <div className="mt-2.5 p-2.5 bg-[#FAF8F5] rounded-xl text-xs text-neutral-700 border border-neutral-100">
                            <span className="font-bold text-neutral-900 block mb-0.5">
                              {t("admin.special_notes", "Guest Special Notes / Reason:")}
                            </span>
                            <p className="italic text-neutral-600">&ldquo;{inq.specialRequests}&rdquo;</p>
                          </div>
                        )}

                        <div className="mt-2 text-[10px] text-neutral-400 text-right">
                          {t("admin.created_at", "Received on")}: {new Date(inq.createdAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Sleek Collapsible Cloud Synchronization Status Banner (Moved to bottom of page for a cleaner workspace) */}
        <div className="mt-10 pt-6 border-t border-neutral-200/80">
          {isCloudStorage ? (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">🟢 Cloud Database ({storageType})</span>
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                    Live Sync 2 Chiều
                  </span>
                  <span className="text-emerald-700 hidden md:inline text-xs">
                    • Mọi thiết bị (iPhone, Android, PC) đều cập nhật tức thì.
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenExport}
                className="px-3 py-1 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3 h-3" />
                <span>Sao lưu Dữ liệu</span>
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-950 shadow-2xs transition-all">
              {isSyncBannerCollapsed ? (
                /* Compact 1-line view (Clean & Uncluttered) */
                <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-200/70 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-amber-900">
                      ⚡ Chế độ Cục bộ (Offline)
                    </span>
                    <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      Lưu an toàn trên máy này
                    </span>
                    <span className="text-xs text-amber-800/80 hidden lg:inline">
                      • Mọi đơn và lịch đặt phòng đều được lưu an toàn trên trình duyệt hiện tại.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSyncBannerCollapsed(false)}
                      className="px-3 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>Chi tiết & Kết nối Cloud</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Expanded view with guide and device switch buttons */
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-200/70">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold flex items-center gap-2">
                          <span>⚡ Đang chạy chế độ Cục bộ (Chưa bật Vercel KV trên đám mây)</span>
                          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                            Chưa đồng bộ xuyên thiết bị
                          </span>
                        </p>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          Dữ liệu hiện được lưu trên máy tính này. Nếu bạn muốn quản lý trên cả iPhone, Android và Laptop cùng lúc, hãy liên kết <strong>Vercel KV (miễn phí 100%)</strong> để dữ liệu tự động đồng bộ Live.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSyncBannerCollapsed(true)}
                      className="p-1.5 rounded-lg text-amber-800 hover:bg-amber-200/60 transition-colors cursor-pointer text-xs flex items-center gap-1 shrink-0 font-medium"
                      title="Thu gọn thông báo"
                    >
                      <span>Thu gọn</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSyncModalTab("guide");
                        setIsSyncModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Hướng dẫn Bật Vercel KV (1 Click)</span>
                    </button>
                    <button
                      onClick={handleOpenExport}
                      className="px-3 py-1 rounded-xl border border-amber-400 bg-white text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Chuyển sang máy khác</span>
                    </button>
                    <button
                      onClick={handleOpenImport}
                      className="px-3 py-1 rounded-xl border border-amber-400 bg-white text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Nạp từ máy khác</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: EDIT RESERVATION & DATES */}
      {editingInquiry && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingInquiry(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 my-auto sm:my-8 max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 z-30 bg-[#14171A] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0 rounded-t-3xl shadow-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C2A476] font-semibold">
                  {language === "vi" ? "Chỉnh sửa đơn đặt phòng Host" : "Host Reservation Editor"}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === "vi" ? `Sửa đơn đặt phòng #${editingInquiry.id}` : `Edit Reservation #${editingInquiry.id}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingInquiry(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 pb-48">
              {/* Villa Selector */}
              <LuxuryVillaSelector
                label={language === "vi" ? "Biệt thự được chỉ định" : "Assigned Villa"}
                selectedVillaId={editingInquiry.villaId}
                onSelectVilla={(vId) =>
                  setEditingInquiry((prev) => (prev ? { ...prev, villaId: vId } : null))
                }
                language={language}
              />

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LuxuryDatePicker
                  label={language === "vi" ? "Ngày nhận phòng (Check-in)" : "Check-in Date"}
                  selectedDate={editingInquiry.checkIn}
                  onSelectDate={(val) =>
                    setEditingInquiry((prev) =>
                      prev
                        ? {
                            ...prev,
                            checkIn: val,
                            checkOut: val && (!prev.checkOut || prev.checkOut <= val) ? addDays(val, 2) : prev.checkOut,
                          }
                        : null
                    )
                  }
                  villaId={editingInquiry.villaId}
                  excludeInquiryId={editingInquiry.id}
                  placeholder={language === "vi" ? "Chọn ngày nhận phòng" : "Select Check-in Date"}
                />
                <LuxuryDatePicker
                  label={language === "vi" ? "Ngày trả phòng (Check-out)" : "Check-out Date"}
                  selectedDate={editingInquiry.checkOut}
                  onSelectDate={(val) =>
                    setEditingInquiry((prev) => (prev ? { ...prev, checkOut: val } : null))
                  }
                  villaId={editingInquiry.villaId}
                  isCheckOut={true}
                  checkInDate={editingInquiry.checkIn}
                  minDate={editingInquiry.checkIn ? addDays(editingInquiry.checkIn, 1) : undefined}
                  excludeInquiryId={editingInquiry.id}
                  placeholder={language === "vi" ? "Chọn ngày trả phòng" : "Select Check-out Date"}
                />
              </div>

              {/* Conflict Alert inside Edit Modal */}
              {(() => {
                const conflict =
                  editingInquiry.checkIn && editingInquiry.checkOut && editingInquiry.status !== "cancelled"
                    ? bookingStore.hasDateConflict(
                        editingInquiry.checkIn,
                        editingInquiry.checkOut,
                        editingInquiry.villaId,
                        editingInquiry.id
                      )
                    : undefined;

                if (!conflict) return null;
                return (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">
                        {language === "vi" ? "Phát hiện xung đột lịch phòng!" : "Overlapping Date Conflict Detected!"}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                        {language === "vi"
                          ? `Khoảng ngày này trùng với đơn #${conflict.id} (${conflict.guestName}: ${conflict.checkIn} → ${conflict.checkOut}). Vui lòng chọn ngày không bị trùng.`
                          : `These dates overlap with reservation #${conflict.id} (${conflict.guestName}: ${conflict.checkIn} → ${conflict.checkOut}). Please select non-overlapping dates.`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Trạng thái đặt phòng" : "Reservation Status"}
                </label>
                <select
                  value={editingInquiry.status}
                  onChange={(e) =>
                    setEditingInquiry({
                      ...editingInquiry,
                      status: e.target.value as InquiryStatus,
                    })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                >
                  <option value="pending">{language === "vi" ? "Chờ xử lý (Pending)" : "Pending"}</option>
                  <option value="contacted">{language === "vi" ? "Đã liên hệ (Contacted)" : "Contacted"}</option>
                  <option value="confirmed">{language === "vi" ? "Đã xác nhận (Khóa ngày)" : "Confirmed (Dates Locked)"}</option>
                  <option value="cancelled">{language === "vi" ? "Đã hủy (Mở lại ngày)" : "Cancelled (Dates Released)"}</option>
                </select>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Tên khách / Ghi chú" : "Guest Name / Label"}
                  </label>
                  <input
                    type="text"
                    value={editingInquiry.guestName}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, guestName: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Số điện thoại / Zalo" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="text"
                    value={editingInquiry.phone}
                    onChange={(e) =>
                      setEditingInquiry({ ...editingInquiry, phone: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Địa chỉ Email" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={editingInquiry.email}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, email: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                />
              </div>

              {/* Guests Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Người lớn" : "Adults"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={editingInquiry.adults}
                    onChange={(e) =>
                      setEditingInquiry({
                        ...editingInquiry,
                        adults: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Trẻ em" : "Children"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingInquiry.children}
                    onChange={(e) =>
                      setEditingInquiry({
                        ...editingInquiry,
                        children: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Ghi chú nội bộ / Yêu cầu đặc biệt" : "Host Notes / Special Requests"}
                </label>
                <textarea
                  rows={2}
                  value={editingInquiry.specialRequests || ""}
                  onChange={(e) =>
                    setEditingInquiry({
                      ...editingInquiry,
                      specialRequests: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 resize-none"
                />
              </div>

              {/* Payment & Financial Section */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>{language === "vi" ? "Thông Tin Thanh Toán & Tiền Phòng" : "Stay Price & Payment Details"}</span>
                  </span>
                  {/* Button to auto-calculate price */}
                  <button
                    type="button"
                    onClick={() => {
                      const nights = calculateStayNights(editingInquiry.checkIn, editingInquiry.checkOut);
                      const nightly = bookingStore.getVillaPrice(editingInquiry.villaId);
                      setEditingInquiry({
                        ...editingInquiry,
                        totalPriceVnd: nights * nightly,
                      });
                    }}
                    className="text-[11px] text-[#8A6B3D] hover:underline font-semibold cursor-pointer"
                  >
                    {language === "vi" ? "⚡ Tính tự động theo ngày" : "⚡ Recalculate from dates"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Total Stay Price (VND) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {language === "vi" ? "Tổng tiền phòng (VNĐ)" : "Total Stay Price (VND)"}
                    </label>
                    <input
                      type="number"
                      step="500000"
                      min="0"
                      value={editingInquiry.totalPriceVnd ?? calculateStayTotal(editingInquiry.checkIn, editingInquiry.checkOut, editingInquiry.villaId)}
                      onChange={(e) =>
                        setEditingInquiry({
                          ...editingInquiry,
                          totalPriceVnd: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      ≈ ${formatPriceUsd(editingInquiry.totalPriceVnd ?? calculateStayTotal(editingInquiry.checkIn, editingInquiry.checkOut, editingInquiry.villaId), usdRate)} USD
                    </span>
                  </div>

                  {/* Payment Status Dropdown */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {language === "vi" ? "Trạng thái thanh toán" : "Payment Status"}
                    </label>
                    <select
                      value={editingInquiry.paymentStatus || "unpaid"}
                      onChange={(e) => {
                        const newStatus = e.target.value as PaymentStatus;
                        const total = editingInquiry.totalPriceVnd ?? calculateStayTotal(editingInquiry.checkIn, editingInquiry.checkOut, editingInquiry.villaId);
                        setEditingInquiry({
                          ...editingInquiry,
                          paymentStatus: newStatus,
                          paidAmountVnd: newStatus === "paid" ? total : newStatus === "unpaid" ? 0 : editingInquiry.paidAmountVnd,
                        });
                      }}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    >
                      <option value="unpaid">🔴 {language === "vi" ? "Chưa thu tiền" : "Unpaid"}</option>
                      <option value="deposit">🟡 {language === "vi" ? "Đã đặt cọc" : "Deposit Paid"}</option>
                      <option value="paid">🟢 {language === "vi" ? "Đã thu tiền đủ" : "Fully Paid"}</option>
                    </select>
                  </div>
                </div>

                {/* Paid Amount and Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {language === "vi" ? "Số tiền đã thu (VNĐ)" : "Amount Collected (VND)"}
                    </label>
                    <input
                      type="number"
                      step="500000"
                      min="0"
                      placeholder="0"
                      value={editingInquiry.paidAmountVnd ?? ""}
                      onChange={(e) =>
                        setEditingInquiry({
                          ...editingInquiry,
                          paidAmountVnd: Number(e.target.value),
                        })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                      {language === "vi" ? "Ghi chú thanh toán" : "Payment Notes / Reference"}
                    </label>
                    <input
                      type="text"
                      placeholder={language === "vi" ? "Ví dụ: Đã CK Vietcombank..." : "e.g. Bank wire transfer received..."}
                      value={editingInquiry.paymentNotes || ""}
                      onChange={(e) =>
                        setEditingInquiry({
                          ...editingInquiry,
                          paymentNotes: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  {language === "vi" ? "Hủy bỏ" : "Cancel"}
                </button>
                {(() => {
                  const hasConflict = Boolean(
                    editingInquiry.checkIn &&
                    editingInquiry.checkOut &&
                    editingInquiry.status !== "cancelled" &&
                    bookingStore.hasDateConflict(
                      editingInquiry.checkIn,
                      editingInquiry.checkOut,
                      editingInquiry.villaId,
                      editingInquiry.id
                    )
                  );

                  return (
                    <button
                      type="submit"
                      disabled={!editingInquiry.checkIn || !editingInquiry.checkOut || hasConflict}
                      className="w-1/2 py-2.5 rounded-xl bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {hasConflict
                          ? (language === "vi" ? "Trùng ngày — Không thể lưu" : "Dates Conflict — Cannot Save")
                          : (language === "vi" ? "Lưu thay đổi" : "Save Changes")}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL NEW BOOKING / BLOCK DATES */}
      {isAddModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 my-auto sm:my-8 max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 z-30 bg-[#14171A] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0 rounded-t-3xl shadow-sm">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C2A476] font-semibold">
                  {language === "vi" ? "Quản lý lịch phòng Host" : "Host Calendar Management"}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {language === "vi" ? "Khóa ngày hoặc Thêm đơn đặt phòng offline" : "Block Dates or Add Offline Reservation"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="p-6 space-y-4 pb-48">
              <LuxuryVillaSelector
                label={language === "vi" ? "Chọn Biệt thự cần khóa / đặt phòng" : "Select Villa to Block / Reserve"}
                selectedVillaId={newBookingData.villaId}
                onSelectVilla={(vId) =>
                  setNewBookingData((prev) => ({ ...prev, villaId: vId }))
                }
                language={language}
              />

              {/* Luxury Dates Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LuxuryDatePicker
                  label={language === "vi" ? "Ngày nhận phòng (Check-in)" : "Check-in Date"}
                  selectedDate={newBookingData.checkIn}
                  onSelectDate={(val) =>
                    setNewBookingData((prev) => ({
                      ...prev,
                      checkIn: val,
                      checkOut: val && (!prev.checkOut || prev.checkOut <= val) ? addDays(val, 2) : prev.checkOut,
                    }))
                  }
                  villaId={newBookingData.villaId}
                  placeholder={language === "vi" ? "Chọn ngày nhận phòng" : "Select Check-in Date"}
                />
                <LuxuryDatePicker
                  label={language === "vi" ? "Ngày trả phòng (Check-out)" : "Check-out Date"}
                  selectedDate={newBookingData.checkOut}
                  onSelectDate={(val) =>
                    setNewBookingData((prev) => ({ ...prev, checkOut: val }))
                  }
                  villaId={newBookingData.villaId}
                  isCheckOut={true}
                  checkInDate={newBookingData.checkIn}
                  minDate={newBookingData.checkIn ? addDays(newBookingData.checkIn, 1) : undefined}
                  placeholder={language === "vi" ? "Chọn ngày trả phòng" : "Select Check-out Date"}
                />
              </div>

              {/* Conflict Alert inside Add Modal */}
              {(() => {
                const conflict =
                  newBookingData.checkIn && newBookingData.checkOut && newBookingData.status !== "cancelled"
                    ? bookingStore.hasDateConflict(
                        newBookingData.checkIn,
                        newBookingData.checkOut,
                        newBookingData.villaId
                      )
                    : undefined;

                if (!conflict) return null;
                return (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">
                        {language === "vi" ? "Nghiêm cấm đặt trùng ngày!" : "Overlapping Booking Prohibited!"}
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                        {language === "vi"
                          ? `Villa này đã có lịch từ ${conflict.checkIn} đến ${conflict.checkOut} bởi khách ${conflict.guestName} (#${conflict.id}). Không thể khóa trùng ngày.`
                          : `This villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} by ${conflict.guestName} (#{conflict.id}). Overlapping reservations cannot be saved.`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Guest Name / Reason */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Tên khách hoặc Lý do khóa ngày" : "Guest Name or Reason for Block"}
                </label>
                <input
                  type="text"
                  placeholder={language === "vi" ? "Ví dụ: Khách VIP Anh Nam / Giữ phòng nội bộ" : "e.g. VIP Guest Mr. Thomas / Private Maintenance"}
                  value={newBookingData.guestName}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, guestName: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Số điện thoại / Zalo" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="text"
                    value={newBookingData.phone}
                    onChange={(e) =>
                      setNewBookingData({ ...newBookingData, phone: e.target.value })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    {language === "vi" ? "Trạng thái" : "Status"}
                  </label>
                  <select
                    value={newBookingData.status}
                    onChange={(e) =>
                      setNewBookingData({
                        ...newBookingData,
                        status: e.target.value as InquiryStatus,
                      })
                    }
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="confirmed">{language === "vi" ? "Đã xác nhận (Khóa ngày)" : "Confirmed (Locks Dates)"}</option>
                    <option value="pending">{language === "vi" ? "Chờ xử lý (Pending)" : "Pending"}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Ghi chú thêm" : "Notes"}
                </label>
                <textarea
                  rows={2}
                  value={newBookingData.specialRequests}
                  onChange={(e) =>
                    setNewBookingData({
                      ...newBookingData,
                      specialRequests: e.target.value,
                    })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 resize-none"
                />
              </div>

              {/* Payment Status & Calculation Preview */}
              {newBookingData.checkIn && newBookingData.checkOut && newBookingData.checkIn < newBookingData.checkOut && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C2A476]" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                        {language === "vi" ? "Dự toán tiền phòng:" : "Estimated Total:"}
                      </span>
                      <span className="font-extrabold text-neutral-900 text-sm tracking-tight">
                        {formatPriceVnd(calculateStayTotal(newBookingData.checkIn, newBookingData.checkOut, newBookingData.villaId))}
                      </span>
                      <span className="text-[10px] text-emerald-700 ml-1.5 font-semibold">
                        (≈ ${formatPriceUsd(calculateStayTotal(newBookingData.checkIn, newBookingData.checkOut, newBookingData.villaId), usdRate)} USD)
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-0.5">
                      {language === "vi" ? "Thu tiền:" : "Payment:"}
                    </label>
                    <select
                      value={newBookingData.paymentStatus || "unpaid"}
                      onChange={(e) =>
                        setNewBookingData({
                          ...newBookingData,
                          paymentStatus: e.target.value as PaymentStatus,
                        })
                      }
                      className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-900"
                    >
                      <option value="unpaid">🔴 {language === "vi" ? "Chưa thu" : "Unpaid"}</option>
                      <option value="deposit">🟡 {language === "vi" ? "Đã cọc" : "Deposit"}</option>
                      <option value="paid">🟢 {language === "vi" ? "Đã thu" : "Paid"}</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  {language === "vi" ? "Hủy bỏ" : "Cancel"}
                </button>
                {(() => {
                  const hasConflict = Boolean(
                    newBookingData.checkIn &&
                    newBookingData.checkOut &&
                    newBookingData.status !== "cancelled" &&
                    bookingStore.hasDateConflict(
                      newBookingData.checkIn,
                      newBookingData.checkOut,
                      newBookingData.villaId
                    )
                  );

                  return (
                    <button
                      type="submit"
                      disabled={!newBookingData.checkIn || !newBookingData.checkOut || hasConflict}
                      className="w-1/2 py-2.5 rounded-xl bg-[#C2A476] hover:bg-[#a88a59] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {hasConflict
                          ? (language === "vi" ? "Trùng ngày — Không thể khóa" : "Dates Conflict — Cannot Lock")
                          : (language === "vi" ? "Khóa ngày trên lịch" : "Lock Dates on Calendar")}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Settings / Custom Reason Dialog Modal */}
      {maintenanceDialogVilla && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setMaintenanceDialogVilla(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE5DC] text-neutral-900 my-auto sm:my-8 max-h-[92vh] overflow-y-auto flex flex-col pb-44">
            {/* Modal Header */}
            <div className="sticky top-0 z-30 bg-white -mt-6 -mx-6 sm:-mt-7 sm:-mx-7 p-6 sm:p-7 pb-3.5 border-b border-neutral-100 mb-4 rounded-t-3xl flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 leading-tight tracking-tight">
                    {language === "vi" ? "Cài Đặt Lịch Bảo Trì Biệt Thự" : "Villa Maintenance Schedule"}
                  </h3>
                  <span className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                    {language === "vi" ? "Khóa lịch & Kiểm soát vận hành" : "Date Locking & Operational Control"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceDialogVilla(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Villa Card */}
            <div className="mb-4">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-neutral-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 flex-shrink-0 shadow-sm bg-neutral-100">
                  <Image
                    src={maintenanceDialogVilla.image}
                    alt={maintenanceDialogVilla.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                    {maintenanceDialogVilla.code}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                      {language === "vi" ? (maintenanceDialogVilla.nameVi || maintenanceDialogVilla.name) : maintenanceDialogVilla.name}
                    </h4>
                    <span className="text-[10px] font-bold text-[#8A6B3D] bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#EAE2D5] flex-shrink-0">
                      {maintenanceDialogVilla.bedrooms} {language === "vi" ? "Phòng Ngủ" : "Bedrooms"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                    {language === "vi" ? (maintenanceDialogVilla.locationVi || maintenanceDialogVilla.location) : maintenanceDialogVilla.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Bookings for this Villa Banner (Live Synced with Store) */}
            {(() => {
              const villaBookings = bookingStore.getVillaActiveBookings(maintenanceDialogVilla.id);
              if (villaBookings.length === 0) {
                return (
                  <div className="mb-4 p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      {language === "vi"
                        ? "Biệt thự này hiện chưa có đơn đặt phòng nào — Toàn bộ lịch trống."
                        : "This villa currently has no bookings — Entire calendar is open."}
                    </span>
                  </div>
                );
              }
              return (
                <div className="mb-4 p-3 rounded-2xl bg-violet-50/90 border border-violet-200 text-xs text-violet-950">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-violet-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-violet-600" />
                      <span>
                        {language === "vi"
                          ? `Lịch khách đã đặt của ${maintenanceDialogVilla.nameVi || maintenanceDialogVilla.name} (${villaBookings.length} đơn):`
                          : `Existing Guest Reservations (${villaBookings.length}):`}
                      </span>
                    </span>
                    <span className="text-[10px] text-violet-700 font-semibold bg-violet-100/80 px-2 py-0.5 rounded-full">
                      {language === "vi" ? "Đồng bộ trên lịch bên dưới" : "Synced below"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                    {villaBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white/95 border border-violet-200 rounded-xl p-2 flex items-center justify-between text-[11px] shadow-2xs"
                      >
                        <div className="min-w-0 pr-1.5">
                          <p className="font-bold text-neutral-900 truncate">👤 {b.guestName}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">#{b.id} • {b.adults} {language === "vi" ? "khách" : "guests"}</p>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-violet-800 bg-violet-50 px-2 py-1 rounded-lg border border-violet-200 shrink-0">
                          {b.checkIn} → {b.checkOut}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 1. Date Selection Section */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                {language === "vi" ? "1. Thời Gian Khóa Bảo Trì:" : "1. Maintenance Lock Window:"}
              </label>

              {/* Toggle Mode: Date Range vs Indefinite */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setMaintenanceIsIndefinite(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    !maintenanceIsIndefinite
                      ? "bg-white text-neutral-900 shadow-xs border border-neutral-200/80"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === "vi" ? "Chọn khoảng ngày" : "Specific Date Range"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMaintenanceIsIndefinite(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    maintenanceIsIndefinite
                      ? "bg-white text-rose-700 shadow-xs border border-neutral-200/80"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === "vi" ? "Khóa vô thời hạn" : "Lock Indefinitely"}</span>
                </button>
              </div>

              {!maintenanceIsIndefinite ? (
                <div className="space-y-3">
                  {/* Luxury Date Pickers in maintenanceAdminMode (synced with villa bookings, no red strikes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                    <LuxuryDatePicker
                      label={language === "vi" ? "Từ ngày (Bắt đầu):" : "Start Date:"}
                      selectedDate={maintenanceStartDate}
                      onSelectDate={(val) => {
                        setMaintenanceStartDate(val);
                        if (maintenanceEndDate && val && val > maintenanceEndDate) {
                          setMaintenanceEndDate(addDays(val, 1));
                        }
                      }}
                      villaId={maintenanceDialogVilla.id}
                      minDate={getTodayStr()}
                      placeholder={language === "vi" ? "Chọn ngày bắt đầu" : "Select start date"}
                      maintenanceAdminMode={true}
                      language={language}
                    />
                    <LuxuryDatePicker
                      label={language === "vi" ? "Đến ngày (Kết thúc):" : "End Date:"}
                      selectedDate={maintenanceEndDate}
                      onSelectDate={(val) => setMaintenanceEndDate(val)}
                      villaId={maintenanceDialogVilla.id}
                      isCheckOut={true}
                      checkInDate={maintenanceStartDate}
                      minDate={maintenanceStartDate || getTodayStr()}
                      placeholder={language === "vi" ? "Chọn ngày kết thúc" : "Select end date"}
                      maintenanceAdminMode={true}
                      language={language}
                    />
                  </div>

                  {/* Quick preset buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">
                      {language === "vi" ? "Chọn nhanh:" : "Quick add:"}
                    </span>
                    {[
                      { label: language === "vi" ? "+3 Ngày" : "+3 Days", days: 3 },
                      { label: language === "vi" ? "+7 Ngày (1 tuần)" : "+7 Days", days: 7 },
                      { label: language === "vi" ? "+14 Ngày (2 tuần)" : "+14 Days", days: 14 },
                      { label: language === "vi" ? "+30 Ngày (1 tháng)" : "+30 Days", days: 30 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => {
                          const base = maintenanceStartDate || (() => {
                            const d = new Date();
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                          })();
                          if (!maintenanceStartDate) setMaintenanceStartDate(base);
                          setMaintenanceEndDate(addDays(base, preset.days));
                        }}
                        className="px-2 py-1 bg-neutral-100 hover:bg-amber-100 hover:text-amber-900 border border-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 cursor-pointer transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Overlap Warning with existing guest bookings */}
                  {(() => {
                    if (!maintenanceStartDate || !maintenanceEndDate || maintenanceStartDate > maintenanceEndDate) {
                      return null;
                    }
                    const overlaps = bookingStore.getOverlappingBookings(
                      maintenanceDialogVilla.id,
                      maintenanceStartDate,
                      maintenanceEndDate
                    );
                    if (overlaps.length === 0) return null;

                    return (
                      <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs animate-fade-in shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>
                            {language === "vi"
                              ? `⚠️ Chú ý: Khoảng ngày bảo trì này trùng với ${overlaps.length} đơn đặt phòng của khách!`
                              : `⚠️ Warning: Maintenance window overlaps with ${overlaps.length} guest reservation(s)!`}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {overlaps.map((b) => (
                            <div
                              key={b.id}
                              className="text-[11px] bg-white rounded-xl p-2 border border-amber-200 text-neutral-800 flex items-center justify-between"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-neutral-900">👤 {b.guestName}</span>
                                <span className="text-neutral-500 font-mono text-[10px] ml-1.5">(#{b.id})</span>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                                {b.checkIn} → {b.checkOut}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-800 mt-2 leading-relaxed">
                          {language === "vi"
                            ? "* Quản trị viên vẫn có thể khóa lịch nếu đây là sửa chữa đột xuất, nhưng vui lòng liên hệ khách để dời phòng hoặc hỗ trợ trước."
                            : "* You may proceed if this is an emergency repair, but please arrange alternative accommodation for the guest first."}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Date preview message */}
                  {maintenanceStartDate && maintenanceEndDate && (
                    <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      maintenanceStartDate <= maintenanceEndDate
                        ? "bg-amber-50/80 border-amber-300 text-amber-900"
                        : "bg-rose-50 border-rose-300 text-rose-800"
                    }`}>
                      <Calendar className="w-4 h-4 flex-shrink-0 text-amber-600" />
                      <div className="text-[11px] leading-snug">
                        {maintenanceStartDate <= maintenanceEndDate ? (
                          <span>
                            {language === "vi"
                              ? `Sẽ khóa lịch từ ngày ${formatLuxuryDate(maintenanceStartDate)} đến ngày ${formatLuxuryDate(maintenanceEndDate)}. Khách xem trang web sẽ không thể chọn những ngày này.`
                              : `Dates from ${formatLuxuryDate(maintenanceStartDate)} to ${formatLuxuryDate(maintenanceEndDate)} will be strictly locked on the public calendar.`}
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-700">
                            {language === "vi" ? "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu." : "End date must be on or after start date."}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    {language === "vi"
                      ? "Biệt thự này sẽ bị khóa toàn bộ mọi ngày và dừng nhận đặt phòng cho đến khi quản trị viên mở lại thủ công."
                      : "This villa will be locked continuously for all dates until manually reopened by an admin."}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Public Notice & Reason */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-800">
                  {language === "vi" ? "2. Lý Do & Thông Báo Công Khai:" : "2. Public Reason & Guest Notice:"}
                </label>
                <span className="text-[10px] text-neutral-400">
                  {language === "vi" ? "Hiển thị cho khách xem" : "Shown to guests"}
                </span>
              </div>

              {/* Quick Reason Suggestion Chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  language === "vi" ? "Thay nước & khử khuẩn hồ bơi vô cực" : "Infinity pool resurfacing & care",
                  language === "vi" ? "Bảo trì & sơn sửa nội thất định kỳ" : "Scheduled furniture refurbishment",
                  language === "vi" ? "Chăm sóc cảnh quan & vườn nhiệt đới" : "Tropical garden & landscape care",
                  language === "vi" ? "Kiểm tra kỹ thuật & an toàn điện nước" : "Routine technical safety inspection",
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMaintenanceNoteInput(tag)}
                    className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-[#C2A476] hover:text-white border border-[#EAE5DC] rounded-md text-[10px] font-medium text-neutral-600 cursor-pointer transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={maintenanceNoteInput}
                onChange={(e) => setMaintenanceNoteInput(e.target.value)}
                placeholder={
                  language === "vi"
                    ? "Ví dụ: Đang thay nước hồ bơi & nâng cấp nội thất sang trọng. Sẽ mở lại đón khách sớm."
                    : "e.g. Scheduled pool resurfacing & luxury interior upgrade. Reopening soon."
                }
                className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#C2A476] resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMaintenanceDialogVilla(null)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                {language === "vi" ? "Đóng" : "Close"}
              </button>

              <div className="flex items-center gap-2">
                {Boolean(maintenanceMap[maintenanceDialogVilla.id]?.isMaintenance) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveMaintenance(maintenanceDialogVilla.id, false);
                      setMaintenanceDialogVilla(null);
                    }}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === "vi" ? "Mở Lại Hoạt Động" : "Restore to Active"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSaveMaintenance(
                      maintenanceDialogVilla.id,
                      true,
                      maintenanceNoteInput,
                      maintenanceStartDate,
                      maintenanceEndDate,
                      maintenanceIsIndefinite
                    );
                    setMaintenanceDialogVilla(null);
                  }}
                  disabled={!maintenanceIsIndefinite && (!maintenanceStartDate || !maintenanceEndDate || maintenanceStartDate > maintenanceEndDate)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>
                    {Boolean(maintenanceMap[maintenanceDialogVilla.id]?.isMaintenance)
                      ? (language === "vi" ? "Lưu Cập Nhật Lịch Bảo Trì" : "Save Maintenance Schedule")
                      : (language === "vi" ? "Kích Hoạt & Khóa Lịch" : "Activate & Lock Dates")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Inquiry Luxury Confirmation Modal */}
      <LuxuryConfirmDialog
        isOpen={Boolean(inquiryToDelete)}
        variant="danger"
        badgeText={language === "vi" ? "Hành động vĩnh viễn" : "Permanent Action"}
        title={language === "vi" ? "Xóa đơn đặt phòng" : "Delete Reservation Inquiry"}
        message={
          language === "vi"
            ? "Bạn có chắc chắn muốn xóa vĩnh viễn đơn đặt phòng này không? Các ngày đã chọn sẽ ngay lập tức được mở khóa cho khách đặt trên mọi thiết bị."
            : "Are you sure you want to permanently delete this reservation inquiry? The reserved dates will be immediately released and made available for public booking across all devices."
        }
        details={
          inquiryToDelete
            ? [
                { label: language === "vi" ? "Mã đơn" : "Inquiry ID", value: `#${inquiryToDelete.id}` },
                { label: language === "vi" ? "Tên khách" : "Guest Name", value: inquiryToDelete.guestName },
                { label: language === "vi" ? "Biệt thự" : "Villa", value: inquiryToDelete.villaName },
                {
                  label: language === "vi" ? "Thời gian lưu trú" : "Stay Period",
                  value: `${formatLuxuryDate(inquiryToDelete.checkIn)} → ${formatLuxuryDate(inquiryToDelete.checkOut)}`,
                },
                { label: language === "vi" ? "Trạng thái" : "Status", value: inquiryToDelete.status.toUpperCase() },
              ]
            : undefined
        }
        confirmText={language === "vi" ? "Xóa & Mở lại ngày" : "Delete & Release Dates"}
        cancelText={language === "vi" ? "Hủy bỏ" : "Cancel"}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setInquiryToDelete(null)}
      />

      {/* Reset Sample Inquiries Confirmation Modal */}
      <LuxuryConfirmDialog
        isOpen={isResetConfirmOpen}
        variant="warning"
        badgeText={language === "vi" ? "Khôi phục hệ thống" : "Database Reset"}
        title={language === "vi" ? "Khôi phục dữ liệu mẫu ban đầu" : "Reset to Sample Inquiries"}
        message={
          language === "vi"
            ? "Bạn có chắc chắn muốn khôi phục lại các đơn đặt phòng mẫu ban đầu? Thao tác này sẽ ghi đè các đơn hiện tại và đặt lại lịch mẫu đồng bộ trên tất cả thiết bị."
            : "Are you sure you want to restore the initial sample reservations? This will overwrite recent inquiries and reset the demo schedule across all devices."
        }
        confirmText={language === "vi" ? "Khôi phục dữ liệu mẫu" : "Reset Database"}
        cancelText={language === "vi" ? "Hủy bỏ" : "Cancel"}
        isLoading={isResetting}
        onConfirm={handleConfirmResetSample}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Luxury Notice / Alert Modal */}
      {adminNotice && (
        <LuxuryConfirmDialog
          isOpen={adminNotice.isOpen}
          variant={adminNotice.variant}
          badgeText={adminNotice.badgeText}
          title={adminNotice.title}
          message={adminNotice.message}
          details={adminNotice.details}
          confirmText={language === "vi" ? "Đã hiểu" : "Understood"}
          cancelText={null}
          isAlertOnly={true}
          onConfirm={() => setAdminNotice(null)}
          onCancel={() => setAdminNotice(null)}
        />
      )}

      {/* Multi-Device Cloud Synchronization & Transfer Modal */}
      {isSyncModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsSyncModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAE5DC] overflow-hidden my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold accent line */}
            <div className="h-1.5 w-full bg-[#C2A476]" />

            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5 border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#C2A476]/15 text-[#C2A476] border border-[#C2A476]/30 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] text-[#93784F] inline-block mb-1">
                      {language === "vi" ? "Kiến trúc Đa Thiết Bị" : "Multi-Device Architecture"}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight tracking-tight">
                      {language === "vi" ? "Đồng bộ Đa Thiết bị & Cloud Database" : "Multi-Device Cloud Synchronization"}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Indicator Pill */}
              <div
                className={`p-3 rounded-2xl border mb-5 flex items-center justify-between text-xs ${
                  isCloudStorage
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isCloudStorage ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className="font-semibold">
                    {isCloudStorage
                      ? (language === "vi"
                          ? `Trạng thái: 🟢 Đã kết nối Cloud Database (${storageType})`
                          : `Status: 🟢 Connected to Cloud Database (${storageType})`)
                      : (language === "vi"
                          ? "Trạng thái: ⚡ Chế độ Cục bộ (Chưa kết nối Vercel KV)"
                          : "Status: ⚡ Local Standalone Mode (Vercel KV Not Connected)")}
                  </span>
                </div>
                <span className="text-[11px] font-mono opacity-80">
                  {isCloudStorage
                    ? (language === "vi" ? "Trực tiếp Thời gian thực" : "Live Real-Time")
                    : (language === "vi" ? "Cục bộ Đơn máy" : "Local Standalone")}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSyncModalTab("guide")}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                    syncModalTab === "guide"
                      ? "bg-[#14171A] text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {language === "vi" ? "1. Bật Vercel KV (Tự động 100%)" : "1. Enable Vercel KV (100% Auto)"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenExport();
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                    syncModalTab === "export"
                      ? "bg-[#14171A] text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {language === "vi" ? "2. Xuất mã sang máy khác" : "2. Export Code to Other Devices"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSyncModalTab("import");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                    syncModalTab === "import"
                      ? "bg-[#14171A] text-white shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {language === "vi" ? "3. Nạp mã từ máy khác" : "3. Import Code from Other Device"}
                </button>
              </div>

              {/* Tab 1: Vercel KV Setup Guide */}
              {syncModalTab === "guide" && (
                <div className="space-y-4 text-xs leading-relaxed text-neutral-600">
                  <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4">
                    <h4 className="font-bold text-neutral-900 text-sm mb-1.5">
                      {language === "vi"
                        ? "💡 Tại sao khi dùng nhiều thiết bị trên Vercel cần bật Vercel KV?"
                        : "💡 Why is Vercel KV required for multi-device sync on Vercel?"}
                    </h4>
                    <p className="text-neutral-600 leading-relaxed text-[12px]">
                      {language === "vi" ? (
                        <>
                          Vercel chạy trên mô hình <strong>Serverless</strong> (máy chủ không lưu file cố định). Khi bạn đặt phòng trên điện thoại và mở máy tính khác, mỗi máy kết nối đến một phiên bản máy chủ đám mây độc lập. Để dữ liệu được lưu vĩnh viễn và đồng bộ ngay lập tức, bạn chỉ cần liên kết <strong>Vercel KV</strong> (hoàn toàn miễn phí).
                        </>
                      ) : (
                        <>
                          Vercel operates on a <strong>Serverless</strong> architecture (ephemeral cloud instances that do not persist local files). When booking on mobile and viewing on another computer, each connects to an isolated cloud instance. Linking <strong>Vercel KV</strong> (completely free) ensures reservations persist permanently and sync in real time across all devices.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="border border-neutral-200 rounded-2xl p-4 space-y-3">
                    <h5 className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-[#C2A476]">
                      {language === "vi"
                        ? "3 Bước Kích Hoạt Miễn Phí (Chỉ Mất 30 Giây):"
                        : "3 Free Activation Steps (Takes Only 30 Seconds):"}
                    </h5>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#14171A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {language === "vi" ? "Mở Dashboard dự án trên Vercel" : "Open Project Dashboard on Vercel"}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {language === "vi" ? (
                            <>
                              Truy cập <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[#C2A476] underline font-medium">vercel.com/dashboard</a>, chọn dự án website của bạn và bấm vào tab <strong>Storage</strong> ở menu trên cùng.
                            </>
                          ) : (
                            <>
                              Visit <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[#C2A476] underline font-medium">vercel.com/dashboard</a>, select your website project, and click the <strong>Storage</strong> tab in the top navigation.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#14171A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {language === "vi" ? (
                            <>Bấm &quot;Create Database&quot; &rarr; Chọn &quot;KV&quot;</>
                          ) : (
                            <>Click &quot;Create Database&quot; &rarr; Select &quot;KV&quot;</>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {language === "vi" ? (
                            <>
                              Bấm <strong>Create Database</strong>, chọn <strong>KV</strong> (hoặc Upstash Redis), chọn vùng Singapore/Hong Kong rồi bấm <strong>Create</strong>. Vercel sẽ tự động cấp mã kết nối vào dự án!
                            </>
                          ) : (
                            <>
                              Click <strong>Create Database</strong>, choose <strong>KV</strong> (or Upstash Redis), select Singapore/Hong Kong region, and click <strong>Create</strong>. Vercel will automatically connect the environment variables!
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#14171A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {language === "vi" ? (
                            <>Bấm &quot;Redeploy&quot; lại dự án</>
                          ) : (
                            <>Click &quot;Redeploy&quot; the Project</>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {language === "vi" ? (
                            <>
                              Vào tab <strong>Deployments</strong> trên Vercel, chọn bản deploy mới nhất bấm <strong>Redeploy</strong>. Ngay sau khi xong, ô trạng thái sẽ chuyển sang màu xanh 🟢 và toàn bộ thiết bị (iPhone, Android, Laptop) sẽ thấy đơn của nhau tức thì!
                            </>
                          ) : (
                            <>
                              Navigate to <strong>Deployments</strong> on Vercel, select the latest build, and click <strong>Redeploy</strong>. Once finished, this indicator turns green 🟢 and all devices (iPhone, Android, Laptop) will sync reservations instantaneously!
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Export Sync Token */}
              {syncModalTab === "export" && (
                <div className="space-y-4">
                  <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4">
                    <h4 className="font-bold text-neutral-900 text-xs sm:text-sm mb-1">
                      {language === "vi" ? "Mã Đồng Bộ Toàn Bộ Đơn Đặt Phòng" : "Complete Reservation Sync Token"}
                    </h4>
                    <p className="text-neutral-500 text-[11px] leading-relaxed mb-3">
                      {language === "vi"
                        ? "Sao chép mã này để gửi sang thiết bị khác (Laptop, iPad, điện thoại khác). Thiết bị nhận chỉ cần dán mã vào mục \"Nạp mã\" là sẽ có ngay 100% lịch phòng từ máy này."
                        : "Copy this token to send to another device (Laptop, iPad, mobile). The recipient device only needs to paste it into \"Import Code\" to immediately mirror 100% of the schedule."}
                    </p>

                    <textarea
                      readOnly
                      rows={5}
                      value={exportedToken || bookingStore.generateSyncToken()}
                      className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-[11px] font-mono text-neutral-800 select-all focus:outline-none focus:border-[#C2A476] resize-none"
                    />

                    <div className="flex items-center justify-between mt-3 pt-2">
                      <span className="text-[11px] text-neutral-500">
                        {language === "vi" ? (
                          <>Bao gồm: <strong>{inquiries.length} đơn đặt phòng</strong> & lịch bảo trì</>
                        ) : (
                          <>Includes: <strong>{inquiries.length} reservations</strong> & maintenance status</>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={handleCopyExportToken}
                        className="px-4 py-2.5 rounded-xl bg-[#14171A] hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        {copyTokenFeedback ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">{language === "vi" ? "Đã sao chép!" : "Copied!"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#C2A476]" />
                            <span>{language === "vi" ? "Sao chép mã" : "Copy Token"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Import Sync Token */}
              {syncModalTab === "import" && (
                <div className="space-y-4">
                  <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4">
                    <h4 className="font-bold text-neutral-900 text-xs sm:text-sm mb-1">
                      {language === "vi" ? "Nạp Mã Đồng Bộ Từ Thiết Bị Khác" : "Import Sync Token from Another Device"}
                    </h4>
                    <p className="text-neutral-500 text-[11px] leading-relaxed mb-3">
                      {language === "vi"
                        ? "Dán mã đồng bộ mà bạn vừa sao chép từ thiết bị trước vào đây. Toàn bộ đơn đặt phòng sẽ được hợp nhất ngay lập tức vào thiết bị này."
                        : "Paste the sync token copied from your previous device here. All reservations will be merged immediately into this device."}
                    </p>

                    <textarea
                      rows={5}
                      placeholder={language === "vi" ? "Dán mã đồng bộ bắt đầu bằng eyJ... vào đây..." : "Paste sync token starting with eyJ... here..."}
                      value={syncTokenInput}
                      onChange={(e) => setSyncTokenInput(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl p-3 text-[11px] font-mono text-neutral-800 focus:outline-none focus:border-[#C2A476] resize-none"
                    />

                    <div className="flex items-center justify-end gap-2.5 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsSyncModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-medium cursor-pointer"
                      >
                        {language === "vi" ? "Đóng" : "Close"}
                      </button>
                      <button
                        type="button"
                        disabled={isImporting || !syncTokenInput.trim()}
                        onClick={handleExecuteImport}
                        className="px-5 py-2.5 rounded-xl bg-[#C2A476] hover:bg-[#aa8c5b] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                      >
                        {isImporting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{language === "vi" ? "Đang nạp dữ liệu..." : "Importing Data..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{language === "vi" ? "Nạp & Cập Nhật Lịch Ngay" : "Import & Update Schedule Now"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
