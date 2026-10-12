"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import {
  bookingStore,
  RealtimeSyncPayload,
  getInquirySignature,
  formatPriceVnd,
  formatPriceUsd,
  getStayStatus,
  isCheckoutExpired,
  isCheckoutToday,
} from "@/lib/bookingStore";
import { BookingInquiry, InquiryStatus, Villa, VillaMaintenanceInfo, CleaningStatus } from "@/types";
import {
  LuxuryDatePicker,
  addDays,
  formatLuxuryDate,
} from "@/components/LuxuryDatePicker";
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
  });

  // Maintenance State & Dialog
  const [maintenanceMap, setMaintenanceMap] = useState<Record<string, VillaMaintenanceInfo>>(() => bookingStore.getMaintenanceMap());
  const [maintenanceDialogVilla, setMaintenanceDialogVilla] = useState<Villa | null>(null);
  const [maintenanceNoteInput, setMaintenanceNoteInput] = useState("");

  // Admin Active View Tab
  const [adminViewTab, setAdminViewTab] = useState<"all_bookings" | "housekeeping" | "pricing" | "maintenance">("all_bookings");

  // Villa Pricing & USD Rate States
  const [villaPrices, setVillaPrices] = useState<Record<string, number>>(() => bookingStore.getAllVillaPrices());
  const [usdRate, setUsdRate] = useState<number>(() => bookingStore.getUsdRate());
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [priceSaveFeedback, setPriceSaveFeedback] = useState(false);

  // Housekeeping Turnover States
  const [housekeepingSubFilter, setHousekeepingSubFilter] = useState<"all" | "needs_cleaning" | "in_cleaning" | "cleaned" | "today">("all");
  const [editingCleaningNotesId, setEditingCleaningNotesId] = useState<string | null>(null);
  const [cleaningNotesInput, setCleaningNotesInput] = useState("");
  const [isUpdatingCleaning, setIsUpdatingCleaning] = useState(false);

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

  // Housekeeping status update handler
  const handleUpdateCleaningStatus = async (inquiryId: string, status: CleaningStatus, notes?: string) => {
    try {
      setIsUpdatingCleaning(true);
      await bookingStore.updateCleaningStatus(inquiryId, status, notes);
      reloadInquiries();
      playLuxuryChime();
      const statusLabel =
        status === "cleaned"
          ? (language === "vi" ? "✨ Đã dọn dẹp sạch sẽ & sẵn sàng đón khách mới" : "✨ Marked as Cleaned & Inspected")
          : status === "in_cleaning"
          ? (language === "vi" ? "🟡 Đang tiến hành dọn dẹp buồng phòng" : "🟡 In Cleaning Progress")
          : (language === "vi" ? "🔴 Đã chuyển về Cần dọn dẹp" : "🔴 Marked as Needs Cleaning");
      showNotification(
        language === "vi" ? "Cập nhật buồng phòng thành công!" : "Housekeeping Updated!",
        `${inquiryId}: ${statusLabel}`
      );
      if (editingCleaningNotesId === inquiryId) {
        setEditingCleaningNotesId(null);
      }
    } catch (err: any) {
      showAdminNotice(
        language === "vi" ? "Lỗi cập nhật buồng phòng" : "Cleaning Update Failed",
        err.message || "Could not update housekeeping status."
      );
    } finally {
      setIsUpdatingCleaning(false);
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

  // Toggle or update villa maintenance status
  const handleToggleMaintenance = (villaId: string, customReason?: string) => {
    const currentMaint = Boolean(maintenanceMap[villaId]?.isMaintenance);
    const newStatus = !currentMaint;
    const vMatch = siteConfig.villas.find((v) => v.id === villaId);
    const vName = vMatch ? vMatch.name : villaId;

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
  const pendingCount = inquiries.filter((i) => i.status === "pending").length;
  const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
  const confirmedCount = inquiries.filter((i) => i.status === "confirmed").length;
  const maintenanceCount = siteConfig.villas.filter((v) => Boolean(maintenanceMap[v.id]?.isMaintenance)).length;
  const hkSummary = bookingStore.getHousekeepingSummary();

  // Filtered List for All Bookings Tab
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.villaName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "expired_needs_cleaning") {
      const stay = getStayStatus(inq.checkIn, inq.checkOut);
      matchesStatus = (stay === "expired" || stay === "checkout_today") && (inq.cleaningStatus === "needs_cleaning" || !inq.cleaningStatus);
    } else if (statusFilter === "checkout_today") {
      matchesStatus = isCheckoutToday(inq.checkOut);
    } else if (statusFilter === "cleaned") {
      matchesStatus = inq.cleaningStatus === "cleaned";
    } else if (statusFilter === "in_cleaning") {
      matchesStatus = inq.cleaningStatus === "in_cleaning";
    } else if (statusFilter === "in_house") {
      matchesStatus = getStayStatus(inq.checkIn, inq.checkOut) === "in_house";
    } else {
      matchesStatus = inq.status === statusFilter;
    }

    const matchesVilla =
      villaFilter === "all" ? true : inq.villaId === villaFilter;

    return matchesSearch && matchesStatus && matchesVilla;
  });

  // Dedicated Inquiries list for Housekeeping Turnover tab (completed or checkout today)
  const housekeepingInquiries = inquiries.filter((inq) => {
    if (inq.status === "cancelled") return false;
    const stay = getStayStatus(inq.checkIn, inq.checkOut);
    const isTargetStay = stay === "expired" || stay === "checkout_today";
    if (!isTargetStay) return false;

    const matchesSearch =
      searchQuery === "" ||
      inq.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.villaName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVilla =
      villaFilter === "all" ? true : inq.villaId === villaFilter;

    if (!matchesSearch || !matchesVilla) return false;

    const cStatus = inq.cleaningStatus || "needs_cleaning";
    if (housekeepingSubFilter === "needs_cleaning") return cStatus === "needs_cleaning";
    if (housekeepingSubFilter === "in_cleaning") return cStatus === "in_cleaning";
    if (housekeepingSubFilter === "cleaned") return cStatus === "cleaned";
    if (housekeepingSubFilter === "today") return stay === "checkout_today";
    return true;
  });

  // Login Screen
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

          <h1 className="font-serif text-2xl sm:text-3xl font-light text-center text-white mb-2">
            {t("admin.login_title", "Host Administration")}
          </h1>
          <p className="text-xs text-neutral-400 text-center font-light mb-8">
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

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-neutral-500">
              {language === "vi" ? "Mã mặc định cấu hình:" : "Default passcode configured:"}{" "}
              <span className="font-mono text-neutral-400">{siteConfig.admin.passcode}</span>
            </p>
          </div>
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
      <header className="bg-[#14171A] text-white border-b border-white/10 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title={t("admin.return_home", "Return to Public Website")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                  {siteConfig.name}
                </h1>
                <span className="bg-[#C2A476]/20 text-[#C2A476] border border-[#C2A476]/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
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

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Quick Dual Flag Language Switcher */}
            <LanguageSwitcher size="sm" />

            {/* Cloud Database / Device Sync Status Button */}
            <button
              onClick={() => {
                setSyncModalTab(isCloudStorage ? "guide" : "guide");
                setIsSyncModalOpen(true);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                isCloudStorage
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80 shadow-sm"
                  : "bg-amber-950/70 text-amber-300 border-amber-500/50 hover:bg-amber-900/80 shadow-sm"
              }`}
              title="Click to manage multi-device synchronization and cloud database"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isCloudStorage ? t("admin.cloud_synced", "Cloud Synced 🟢") : t("admin.device_sync_btn", "Đồng bộ Đa Thiết bị ⚡")}</span>
            </button>

            {/* Button to Block Dates / Add Reservation */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs bg-[#C2A476] hover:bg-[#aa8c5b] text-white px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("admin.block_dates_btn", "Block Dates / New Booking")}</span>
            </button>

            <button
              onClick={handleRequestResetSample}
              className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("admin.reset_demo_btn", "Reset Demo")}</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs bg-white/10 hover:bg-white/20 text-neutral-200 px-4 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            >
              {t("admin.logout", "Log Out")}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Cloud Synchronization Status Banner */}
        {isCloudStorage ? (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold flex items-center gap-2">
                  <span>🟢 Đã kết nối Cloud Database ({storageType})</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                    Tất cả thiết bị kết nối Live
                  </span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Mọi đơn đặt phòng trên điện thoại, máy tính, iPad đều được đồng bộ thời gian thực và lưu vĩnh viễn trên đám mây.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenExport}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-[11px] font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sao lưu Dữ liệu</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 animate-fade-in shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold flex items-center gap-2">
                  <span>⚡ Đang chạy chế độ Cục bộ (Chưa bật Vercel KV trên đám mây)</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Thiết bị khác chưa thấy
                  </span>
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Khi dùng nhiều thiết bị (iPhone, Android, Laptop), hãy liên kết <strong>Vercel KV</strong> (miễn phí 100%) để mọi thiết bị thấy đơn của nhau tức thì.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSyncModalTab("guide");
                  setIsSyncModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-700 text-white text-[11px] font-semibold hover:bg-amber-800 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Hướng dẫn Bật Vercel KV (1 Click)</span>
              </button>
              <button
                onClick={handleOpenExport}
                className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white text-amber-900 text-[11px] font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Chuyển sang máy khác</span>
              </button>
              <button
                onClick={handleOpenImport}
                className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white text-amber-900 text-[11px] font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nạp từ máy khác</span>
              </button>
            </div>
          </div>
        )}

        {/* KPI Metric Cards (6 cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 mb-6">
          {/* 1. Total Inquiries */}
          <div
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("all");
            }}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group cursor-pointer hover:border-[#C2A476]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {t("admin.kpi_total", "Total Inquiries")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[#8A6B3D] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
                {totalCount}
              </p>
            </div>
            <p className="text-[10px] text-neutral-400 font-light truncate">
              {language === "vi" ? "Tất cả yêu cầu gửi về" : "All submissions"}
            </p>
          </div>

          {/* 2. Pending Action */}
          <div
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("pending");
            }}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group hover:border-amber-300 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                {t("admin.kpi_pending", "Pending Action")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
            <p className="text-[10px] text-amber-600/80 font-medium truncate">
              {pendingCount > 0
                ? language === "vi" ? "Cần phản hồi khách" : "Requires reply"
                : language === "vi" ? "Đã xử lý hết" : "All caught up"}
            </p>
          </div>

          {/* 3. Contacted */}
          <div
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("contacted");
            }}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group hover:border-blue-300 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                {t("admin.kpi_contacted", "Contacted")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-blue-600">
                {contactedCount}
              </p>
            </div>
            <p className="text-[10px] text-blue-600/80 font-medium truncate">
              {language === "vi" ? "Đang trao đổi trực tiếp" : "In communication"}
            </p>
          </div>

          {/* 4. Confirmed */}
          <div
            onClick={() => {
              setAdminViewTab("all_bookings");
              setStatusFilter("confirmed");
            }}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group hover:border-emerald-300 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {t("admin.kpi_confirmed", "Confirmed")}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-1.5">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600">
                {confirmedCount}
              </p>
            </div>
            <p className="text-[10px] text-emerald-600/80 font-medium truncate">
              {language === "vi" ? "Đã chốt & giữ lịch" : "Dates secured"}
            </p>
          </div>

          {/* 5. Housekeeping & Turnover KPI Card */}
          <div
            onClick={() => setAdminViewTab("housekeeping")}
            className={`p-4 sm:p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group cursor-pointer ${
              hkSummary.needsCleaningCount > 0
                ? "bg-rose-50/60 border-rose-300 ring-2 ring-rose-400/20 hover:border-rose-400"
                : "bg-white border-[#EAE5DC] hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                hkSummary.needsCleaningCount > 0 ? "text-rose-700" : "text-emerald-700"
              }`}>
                {language === "vi" ? "Dọn Dẹp Buồng Phòng" : "Housekeeping"}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                hkSummary.needsCleaningCount > 0
                  ? "bg-rose-100 border-rose-300 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-600"
              }`}>
                <Sparkles className={`w-4 h-4 ${hkSummary.needsCleaningCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-serif font-bold ${
                hkSummary.needsCleaningCount > 0 ? "text-rose-600" : "text-emerald-600"
              }`}>
                {hkSummary.needsCleaningCount}
              </p>
              <span className="text-[11px] text-neutral-500 font-medium">
                {language === "vi" ? "cần dọn" : "to clean"}
              </span>
            </div>
            <p className={`text-[10px] font-medium truncate ${
              hkSummary.needsCleaningCount > 0 ? "text-rose-700" : "text-emerald-700"
            }`}>
              {hkSummary.needsCleaningCount > 0
                ? (language === "vi" ? `🔴 ${hkSummary.needsCleaningCount} phòng chờ dọn dẹp` : `🔴 ${hkSummary.needsCleaningCount} turnover pending`)
                : (language === "vi" ? `✨ ${hkSummary.cleanedCount} phòng đã hoàn tất` : `✨ ${hkSummary.cleanedCount} cleaned & ready`)}
            </p>
          </div>

          {/* 6. Under Maintenance */}
          <div
            onClick={() => setAdminViewTab("maintenance")}
            className={`p-4 sm:p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[135px] group cursor-pointer ${
              maintenanceCount > 0
                ? "bg-[#FFFBF5] border-amber-300 ring-2 ring-amber-400/20 hover:border-amber-400"
                : "bg-white border-[#EAE5DC] hover:border-[#C2A476]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                maintenanceCount > 0 ? "text-amber-800" : "text-neutral-500"
              }`}>
                {t("admin.kpi_maintenance", "Maintenance")}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                maintenanceCount > 0
                  ? "bg-amber-100 border-amber-300 text-amber-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-400"
              }`}>
                <Wrench className={`w-4 h-4 ${maintenanceCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <p className={`text-2xl sm:text-3xl font-serif font-bold ${
                maintenanceCount > 0 ? "text-amber-700" : "text-neutral-900"
              }`}>
                {maintenanceCount}
              </p>
              <span className="text-[11px] text-neutral-400 font-medium">/ 4 Villas</span>
            </div>
            <p className={`text-[10px] font-medium truncate ${
              maintenanceCount > 0 ? "text-amber-700" : "text-neutral-400"
            }`}>
              {maintenanceCount > 0
                ? language === "vi" ? `${maintenanceCount} villa tạm khoá lịch` : `${maintenanceCount} villa locked`
                : language === "vi" ? "Cả 4 villa sẵn sàng nhận khách" : "All 4 villas operational"}
            </p>
          </div>
        </div>

        {/* Navigation Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 p-2 rounded-2xl bg-white border border-[#EAE5DC] shadow-xs">
          <button
            type="button"
            onClick={() => setAdminViewTab("all_bookings")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              adminViewTab === "all_bookings"
                ? "bg-[#14171A] text-white shadow-md ring-2 ring-[#C2A476]/30"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C2A476]" />
            <span>{language === "vi" ? "📋 Tất Cả Đơn Đặt Phòng" : "📋 All Reservations"}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("housekeeping")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              adminViewTab === "housekeeping"
                ? "bg-[#14171A] text-white shadow-md ring-2 ring-rose-400/30"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{language === "vi" ? "🧹 Quản Lý Dọn Dẹp & Trả Phòng" : "🧹 Housekeeping & Turnover"}</span>
            {hkSummary.needsCleaningCount > 0 ? (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono animate-pulse">
                {hkSummary.needsCleaningCount} {language === "vi" ? "cần dọn" : "to clean"}
              </span>
            ) : (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                {hkSummary.cleanedCount} {language === "vi" ? "sạch" : "ready"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("pricing")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              adminViewTab === "pricing"
                ? "bg-[#14171A] text-white shadow-md ring-2 ring-emerald-400/30"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>{language === "vi" ? "💵 Đơn Giá Villa & Tỷ Giá USD" : "💵 Villa Pricing & USD Rates"}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-mono border border-emerald-200">
              4 Villas
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminViewTab("maintenance")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              adminViewTab === "maintenance"
                ? "bg-[#14171A] text-white shadow-md ring-2 ring-amber-400/30"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-[#FAF8F5]"
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{language === "vi" ? "🛠️ Quản Lý Bảo Trì Villa" : "🛠️ Villa Maintenance"}</span>
            {maintenanceCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {maintenanceCount}
              </span>
            )}
          </button>
        </div>

        {/* PANEL 1: HOUSEKEEPING & TURNOVER MANAGEMENT */}
        {adminViewTab === "housekeeping" && (
          <div className="space-y-6 mb-8 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                        {language === "vi" ? "Quản Lý Đơn Đã Hết Hạn & Dọn Dẹp Buồng Phòng" : "Housekeeping Turnover & Departure Management"}
                      </h2>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 uppercase tracking-wider hidden sm:inline">
                        {hkSummary.needsCleaningCount} {language === "vi" ? "Cần Dọn Ngay" : "Pending Turnover"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">
                      {language === "vi"
                        ? "Theo dõi các lượt khách đã trả phòng hoặc trả phòng hôm nay để sắp xếp vệ sinh, thay ga gối, khử khuẩn và nghiệm thu bàn giao sẵn sàng đón khách mới."
                        : "Track departures and completed stays to schedule turnovers, linen changes, and inspections before subsequent arrivals."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-neutral-50 text-neutral-700 border-neutral-200">
                    {language === "vi" ? `Tổng: ${hkSummary.expiredCount + hkSummary.todayCount} đơn trả phòng` : `Total: ${hkSummary.expiredCount + hkSummary.todayCount} turnover stays`}
                  </span>
                </div>
              </div>

              {/* Housekeeping Sub-Filter Pills & Search */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHousekeepingSubFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      housekeepingSubFilter === "all"
                        ? "bg-[#14171A] text-white shadow-sm"
                        : "bg-[#FAF8F5] text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                    }`}
                  >
                    {language === "vi" ? "Tất cả lượt trả phòng" : "All Departures"} ({hkSummary.expiredCount + hkSummary.todayCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setHousekeepingSubFilter("needs_cleaning")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      housekeepingSubFilter === "needs_cleaning"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{language === "vi" ? "🔴 Cần dọn ngay" : "🔴 Needs Cleaning"}</span>
                    <span className="font-bold">({hkSummary.needsCleaningCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHousekeepingSubFilter("in_cleaning")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      housekeepingSubFilter === "in_cleaning"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{language === "vi" ? "🟡 Đang dọn dẹp" : "🟡 In Cleaning"}</span>
                    <span className="font-bold">({hkSummary.inCleaningCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHousekeepingSubFilter("cleaned")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      housekeepingSubFilter === "cleaned"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{language === "vi" ? "🟢 Đã dọn xong" : "🟢 Cleaned & Ready"}</span>
                    <span className="font-bold">({hkSummary.cleanedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHousekeepingSubFilter("today")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      housekeepingSubFilter === "today"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                    }`}
                  >
                    <span>⏰ {language === "vi" ? "Trả phòng hôm nay" : "Checkout Today"}</span>
                    <span className="font-bold">({hkSummary.todayCount})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={villaFilter}
                    onChange={(e) => setVillaFilter(e.target.value)}
                    className="bg-[#FAF8F5] border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-800 focus:outline-none"
                  >
                    <option value="all">{t("admin.all_villas_option", "All 4 Villas")}</option>
                    {siteConfig.villas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.code} ({v.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Housekeeping Inquiries Cards */}
              {housekeepingInquiries.length === 0 ? (
                <div className="bg-[#FAF8F5] rounded-2xl p-8 text-center border border-neutral-200">
                  <p className="text-neutral-500 text-xs">
                    {language === "vi"
                      ? "Không có đơn lưu trú nào hết hạn hoặc trả phòng cần dọn dẹp trong tiêu chí này."
                      : "No departure stays matching this turnover filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {housekeepingInquiries.map((inq) => {
                    const stay = getStayStatus(inq.checkIn, inq.checkOut);
                    const cStatus = inq.cleaningStatus || "needs_cleaning";
                    const isNotesEditing = editingCleaningNotesId === inq.id;
                    const vMatch = siteConfig.villas.find((v) => v.id === inq.villaId);

                    return (
                      <div
                        key={inq.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                          cStatus === "needs_cleaning"
                            ? "bg-rose-50/30 border-rose-200 hover:border-rose-300"
                            : cStatus === "in_cleaning"
                            ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                            : "bg-emerald-50/30 border-emerald-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-neutral-800 bg-white border border-neutral-200 px-2.5 py-1 rounded-md">
                              {inq.id}
                            </span>
                            <div>
                              <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                                {inq.villaName}
                              </h3>
                              <p className="text-xs text-neutral-500">
                                {language === "vi" ? "Khách lưu trú:" : "Guest:"}{" "}
                                <span className="font-semibold text-neutral-800">{inq.guestName}</span>
                                {inq.phone && ` • ${inq.phone}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Stay Duration Tag */}
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              stay === "checkout_today"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-neutral-100 text-neutral-800 border-neutral-300"
                            }`}>
                              {stay === "checkout_today"
                                ? (language === "vi" ? "⏰ Trả phòng hôm nay" : "⏰ Checkout Today")
                                : (language === "vi" ? "🔴 Đã trả phòng" : "🔴 Checked Out")}
                            </span>

                            {/* Cleaning Status Pill */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${
                              cStatus === "needs_cleaning"
                                ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                : cStatus === "in_cleaning"
                                ? "bg-amber-500 text-white border-amber-600"
                                : "bg-emerald-600 text-white border-emerald-700"
                            }`}>
                              {cStatus === "needs_cleaning"
                                ? (language === "vi" ? "🔴 Cần Dọn Dẹp" : "🔴 Needs Cleaning")
                                : cStatus === "in_cleaning"
                                ? (language === "vi" ? "🟡 Đang Dọn Dẹp" : "🟡 In Cleaning")
                                : (language === "vi" ? "🟢 Đã Dọn Xong ✨" : "🟢 Cleaned & Ready ✨")}
                            </span>
                          </div>
                        </div>

                        {/* Stay Dates and Notes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-white/80 border border-neutral-200/70">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                              {language === "vi" ? "Khoảng Ngày Lưu Trú" : "Stay Timeframe"}
                            </span>
                            <span className="font-semibold text-neutral-800 mt-0.5 block">
                              {inq.checkIn} → {inq.checkOut}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/80 border border-neutral-200/70">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                              {language === "vi" ? "Thông Số Biệt Thự" : "Villa Specs"}
                            </span>
                            <span className="font-semibold text-neutral-800 mt-0.5 block">
                              {vMatch?.bedrooms || 4} PN • {vMatch?.maxGuests || 8} khách • {vMatch?.poolType || "Private Pool"}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/80 border border-neutral-200/70">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                              {language === "vi" ? "Thời Điểm Nghiệm Thu" : "Housekeeping Timestamp"}
                            </span>
                            <span className="font-medium text-neutral-700 mt-0.5 block">
                              {inq.cleanedAt && cStatus === "cleaned"
                                ? `✨ ${new Date(inq.cleanedAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}`
                                : (language === "vi" ? "Chưa nghiệm thu" : "Pending completion")}
                            </span>
                          </div>
                        </div>

                        {/* Housekeeping Notes Box */}
                        <div className="p-3 rounded-xl bg-white border border-neutral-200 mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-[#C2A476]" />
                              <span>{language === "vi" ? "Ghi Chú Buồng Phòng & Vệ Sinh:" : "Housekeeping & Linen Turnover Notes:"}</span>
                            </span>
                            {!isNotesEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCleaningNotesId(inq.id);
                                  setCleaningNotesInput(inq.cleaningNotes || "");
                                }}
                                className="text-[11px] text-[#8A6B3D] hover:underline font-semibold cursor-pointer"
                              >
                                {inq.cleaningNotes ? (language === "vi" ? "Sửa ghi chú" : "Edit Notes") : (language === "vi" ? "+ Thêm ghi chú" : "+ Add Notes")}
                              </button>
                            )}
                          </div>

                          {isNotesEditing ? (
                            <div className="space-y-2 animate-fade-in">
                              <textarea
                                rows={2}
                                value={cleaningNotesInput}
                                onChange={(e) => setCleaningNotesInput(e.target.value)}
                                placeholder={language === "vi" ? "Ví dụ: Đã thay 4 bộ ga giường, lau ban công, khử khuẩn hồ bơi, bổ sung đồ tiêu hao minibar..." : "e.g. Linens replaced, terrace cleaned, pool filtered, minibar restocked..."}
                                className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#C2A476] resize-none"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCleaningNotesId(null)}
                                  className="px-3 py-1 rounded-lg border border-neutral-300 text-[11px] text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                                >
                                  {language === "vi" ? "Hủy" : "Cancel"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCleaningStatus(inq.id, cStatus, cleaningNotesInput)}
                                  className="px-3 py-1 rounded-lg bg-[#14171A] hover:bg-[#C2A476] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>{language === "vi" ? "Lưu Ghi Chú" : "Save Notes"}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-600 italic">
                              {inq.cleaningNotes || (language === "vi" ? "Chưa có ghi chú đặc biệt cho buồng phòng." : "No specific housekeeping notes added.")}
                            </p>
                          )}
                        </div>

                        {/* Quick One-Click Action Status Buttons */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-200/50">
                          <span className="text-[11px] text-neutral-400">
                            {language === "vi" ? "Chuyển nhanh trạng thái buồng phòng:" : "Transition turnover status:"}
                          </span>

                          <div className="flex items-center gap-2 flex-wrap">
                            {cStatus !== "in_cleaning" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateCleaningStatus(inq.id, "in_cleaning")}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <span>🟡 {language === "vi" ? "Bắt Đầu Dọn Dẹp" : "Start Cleaning"}</span>
                              </button>
                            )}

                            {cStatus !== "cleaned" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateCleaningStatus(inq.id, "cleaned")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <span>🟢 {language === "vi" ? "Nghiệm Thu • Đã Dọn Xong" : "Mark Cleaned & Ready"}</span>
                              </button>
                            )}

                            {cStatus !== "needs_cleaning" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateCleaningStatus(inq.id, "needs_cleaning")}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <span>🔴 {language === "vi" ? "Cần Dọn Lại" : "Mark Needs Cleaning"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
                      <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                        {language === "vi" ? "Quản Lý Đơn Giá Villa & Tỷ Giá Quy Đổi USD" : "Villa Nightly Rates & Real-Time USD Currency Conversion"}
                      </h2>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider hidden sm:inline">
                        {language === "vi" ? "Đồng Bộ Trực Tiếp" : "Live Sync"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-light mt-0.5">
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
                    <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 mt-0.5">
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
                            <h3 className="font-serif text-sm sm:text-base font-bold text-neutral-900 truncate">
                              {villa.name}
                            </h3>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {villa.district} • {villa.bedrooms} PN • {villa.maxGuests} khách tối đa
                            </p>
                            <span className="text-[10px] text-neutral-400 block truncate">
                              {villa.poolType}
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
                            <span className="font-serif text-sm font-bold text-emerald-950">
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
                    <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
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
                const isMaint = Boolean(maintenanceMap[villa.id]?.isMaintenance);
                const info = maintenanceMap[villa.id];

                return (
                  <div
                    key={villa.id}
                    className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between ${
                      isMaint
                        ? "border-amber-400 bg-amber-50/40 shadow-md ring-2 ring-amber-400/25"
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
                            {villa.name}
                          </h3>
                          <p className="text-[11px] text-neutral-500 truncate">
                            {villa.district} • {villa.bedrooms} PN
                          </p>
                        </div>
                      </div>

                      {/* Operational Status Pill */}
                      <div className="mb-3">
                        {isMaint ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span>{language === "vi" ? "Đang Bảo Trì (Khoá Lịch)" : "Under Maintenance (Locked)"}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{language === "vi" ? "Đang Hoạt Động" : "Operational & Active"}</span>
                          </div>
                        )}
                      </div>

                      {/* Reason / Note Box */}
                      {isMaint && (
                        <div className="bg-white/90 border border-amber-200 rounded-xl p-2.5 mb-3 text-[11px] text-amber-900 shadow-xs">
                          <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                            {language === "vi" ? "Thông Báo Khách:" : "Public Notice:"}
                          </span>
                          <p className="line-clamp-2 italic font-light">
                            &ldquo;{info?.reason || (language === "vi" ? "Biệt thự đang bảo trì nâng cấp định kỳ." : "Scheduled luxury maintenance & seasonal care.")}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2 mt-2">
                      {isMaint ? (
                        <button
                          type="button"
                          onClick={() => handleToggleMaintenance(villa.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === "vi" ? "Mở Lại Hoạt Động" : "Restore to Active"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setMaintenanceDialogVilla(villa);
                            setMaintenanceNoteInput(
                              info?.reason || (language === "vi" ? "Nâng cấp bảo trì định kỳ. Tạm dừng nhận đặt phòng." : "Scheduled seasonal maintenance & deep renovation. Reopening soon.")
                            );
                          }}
                          className="w-full bg-[#14171A] hover:bg-amber-600 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-md"
                        >
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === "vi" ? "Kích Hoạt Bảo Trì" : "Set Under Maintenance"}</span>
                        </button>
                      )}

                      {isMaint && (
                        <button
                          type="button"
                          onClick={() => {
                            setMaintenanceDialogVilla(villa);
                            setMaintenanceNoteInput(
                              info?.reason || (language === "vi" ? "Nâng cấp bảo trì định kỳ. Tạm dừng nhận đặt phòng." : "Scheduled seasonal maintenance & deep renovation. Reopening soon.")
                            );
                          }}
                          className="text-[11px] text-neutral-500 hover:text-neutral-900 underline text-center cursor-pointer py-0.5"
                        >
                          {language === "vi" ? "Sửa thông báo bảo trì" : "Edit maintenance notice"}
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
          <div className="space-y-6 animate-fade-in">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t("admin.search_placeholder", "Search guest, ID, villa, phone...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#C2A476]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t("admin.filter_status", "Status")}:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:outline-none"
              >
                <option value="all">{t("admin.all_statuses", "All Statuses")}</option>
                <option value="pending">⏳ {t("admin.status_pending", "Pending")}</option>
                <option value="contacted">📞 {t("admin.status_contacted", "Contacted")}</option>
                <option value="confirmed">✅ {t("admin.status_confirmed", "Confirmed")}</option>
                <option value="cancelled">❌ {t("admin.status_cancelled", "Cancelled")}</option>
                <option value="expired_needs_cleaning">
                  🧹 {language === "vi" ? "Hết hạn • Cần dọn dẹp" : "Stay Ended • Needs Cleaning"} ({hkSummary.needsCleaningCount})
                </option>
                <option value="checkout_today">
                  ⏰ {language === "vi" ? "Trả phòng hôm nay" : "Checkout Today"} ({hkSummary.todayCount})
                </option>
                <option value="in_cleaning">
                  🟡 {language === "vi" ? "Đang dọn dẹp" : "In Cleaning"} ({hkSummary.inCleaningCount})
                </option>
                <option value="cleaned">
                  ✨ {language === "vi" ? "Đã dọn dẹp xong" : "Cleaned & Inspected"} ({hkSummary.cleanedCount})
                </option>
                <option value="in_house">
                  🏡 {language === "vi" ? "Đang lưu trú" : "Currently In-House"}
                </option>
              </select>
            </div>

            {/* Villa Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span>{t("admin.filter_villa", "Villa")}:</span>
              <select
                value={villaFilter}
                onChange={(e) => setVillaFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:outline-none"
              >
                <option value="all">{t("admin.all_villas_option", "All 4 Villas")}</option>
                {siteConfig.villas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} ({v.district})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inquiries Table / Cards */}
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
            {filteredInquiries.map((inq) => {
              const isNewlyArrived = inq.id === newlyArrivedId;
              const whatsappLink = `https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(inq.guestName)},%20thank%20you%20for%20inquiring%20about%20${encodeURIComponent(inq.villaName)}%20(Ref:%20${inq.id}).`;

              return (
                <div
                  key={inq.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-500 relative ${
                    isNewlyArrived
                      ? "border-[#C2A476] ring-4 ring-[#C2A476]/30 bg-amber-50/20"
                      : "border-neutral-200 hover:shadow-md"
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
                      <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-rose-900 text-xs sm:text-sm">
                              Overlapping Date Conflict Detected!
                            </p>
                            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                              This booking overlaps with #{conflicts.map((c) => `${c.id} (${c.guestName}: ${c.checkIn} → ${c.checkOut})`).join(", ")}. Please adjust dates or cancel one reservation to release calendar dates.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingInquiry({ ...inq })}
                            className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-colors"
                          >
                            Adjust Dates
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(inq.id, "cancelled")}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-colors"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Stay Expiration & Housekeeping Turnover Banner */}
                  {(() => {
                    const stay = getStayStatus(inq.checkIn, inq.checkOut);
                    const isExpiredOrToday = stay === "expired" || stay === "checkout_today";
                    if (!isExpiredOrToday || inq.status === "cancelled") return null;

                    const cStatus = inq.cleaningStatus || "needs_cleaning";

                    return (
                      <div className={`mb-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in ${
                        cStatus === "needs_cleaning"
                          ? "bg-rose-50 border-rose-300 text-rose-900"
                          : cStatus === "in_cleaning"
                          ? "bg-amber-50 border-amber-300 text-amber-900"
                          : "bg-emerald-50 border-emerald-300 text-emerald-900"
                      }`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold ${
                            cStatus === "needs_cleaning"
                              ? "bg-rose-600"
                              : cStatus === "in_cleaning"
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs">
                                {stay === "checkout_today"
                                  ? (language === "vi" ? "⏰ Hôm Nay Trả Phòng" : "⏰ Checkout Today")
                                  : (language === "vi" ? "🔴 Đã Hết Hạn Lưu Trú" : "🔴 Stay Concluded")}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                cStatus === "needs_cleaning"
                                  ? "bg-rose-200 text-rose-900 border border-rose-300"
                                  : cStatus === "in_cleaning"
                                  ? "bg-amber-200 text-amber-900 border border-amber-300"
                                  : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                              }`}>
                                {cStatus === "needs_cleaning"
                                  ? (language === "vi" ? "Chưa Dọn Dẹp" : "Needs Cleaning")
                                  : cStatus === "in_cleaning"
                                  ? (language === "vi" ? "Đang Dọn Dẹp" : "In Cleaning")
                                  : (language === "vi" ? "Đã Dọn Xong ✨" : "Cleaned ✨")}
                              </span>
                            </div>
                            <p className="text-[11px] mt-0.5 leading-snug opacity-90">
                              {inq.cleaningNotes || (language === "vi" ? "Cần kiểm tra phòng, thay ga giường và vệ sinh trước khi đón khách tiếp theo." : "Inspect room, replace linens and sanitize before next arrival.")}
                            </p>
                            {inq.cleanedAt && cStatus === "cleaned" && (
                              <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                                ✨ {language === "vi" ? "Dọn xong lúc:" : "Cleaned at:"} {new Date(inq.cleanedAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Status Switcher */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                          {cStatus !== "in_cleaning" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCleaningStatus(inq.id, "in_cleaning")}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              {language === "vi" ? "🟡 Bắt đầu dọn" : "🟡 Start Cleaning"}
                            </button>
                          )}
                          {cStatus !== "cleaned" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCleaningStatus(inq.id, "cleaned")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              {language === "vi" ? "🟢 Đã dọn xong" : "🟢 Mark Cleaned"}
                            </button>
                          )}
                          {cStatus !== "needs_cleaning" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCleaningStatus(inq.id, "needs_cleaning")}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
                            >
                              {language === "vi" ? "🔴 Đặt lại cần dọn" : "🔴 Reset Needs Cleaning"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-md">
                        {inq.id}
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-neutral-900">
                          {inq.guestName}
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium">
                          Villa: <span className="text-[#C2A476] font-semibold">{inq.villaName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Status Selector */}
                      <select
                        value={inq.status}
                        onChange={(e) => handleQuickStatusChange(inq.id, e.target.value as InquiryStatus)}
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer ${
                          inq.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : inq.status === "contacted"
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : inq.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-neutral-100 text-neutral-500 border-neutral-200"
                        }`}
                      >
                        <option value="pending">● {t("admin.status_pending", "Pending")}</option>
                        <option value="contacted">● {t("admin.status_contacted", "Contacted")}</option>
                        <option value="confirmed">● {t("admin.status_confirmed", "Confirmed")}</option>
                        <option value="cancelled">● {language === "vi" ? "Đã Huỷ (Nhả Lịch)" : "Cancelled (Release Dates)"}</option>
                      </select>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingInquiry({ ...inq })}
                        className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#f3ede1] text-[#8A6B3D] border border-[#E8E0D2] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        title="Edit Dates & Reservation Info"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C2A476]" />
                        <span>{t("admin.edit_dates", "Edit")}</span>
                      </button>

                      {/* Direct WhatsApp Contact */}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1fb355] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                        title="Chat with Guest on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => handleRequestDelete(inq)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Inquiry & Release Dates"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        {t("admin.stay_dates", "Stay Dates")}
                      </span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {inq.checkIn} → {inq.checkOut}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        {t("admin.guest_count", "Guest Count")}
                      </span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {inq.adults} {language === "vi" ? "Người lớn" : "Adults"} {inq.children > 0 ? `, ${inq.children} ${language === "vi" ? "Trẻ em" : "Children"}` : ""}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        {language === "vi" ? "Điện Thoại / WhatsApp" : "Guest Phone / WhatsApp"}
                      </span>
                      <a
                        href={`tel:${inq.phone}`}
                        className="font-medium text-neutral-800 hover:text-[#C2A476] mt-0.5 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#C2A476]" />
                        <span>{inq.phone}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        {language === "vi" ? "Email Khách" : "Guest Email"}
                      </span>
                      <a
                        href={`mailto:${inq.email}`}
                        className="font-medium text-neutral-800 hover:text-[#C2A476] mt-0.5 flex items-center gap-1 truncate"
                      >
                        <Mail className="w-3 h-3 text-[#C2A476]" />
                        <span className="truncate">{inq.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {inq.specialRequests && (
                    <div className="mt-3 p-3 bg-[#FAF8F5] rounded-xl text-xs text-neutral-700 border border-neutral-100">
                      <span className="font-semibold text-neutral-900 block mb-0.5">
                        {t("admin.special_notes", "Guest Special Notes / Reason:")}
                      </span>
                      <p className="italic">{inq.specialRequests}</p>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-neutral-400 text-right">
                    {t("admin.created_at", "Received on")}: {new Date(inq.createdAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
  </main>

      {/* MODAL 1: EDIT RESERVATION & DATES */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="bg-[#14171A] text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C2A476] font-semibold">
                  {language === "vi" ? "Chỉnh sửa đơn đặt phòng Host" : "Host Reservation Editor"}
                </span>
                <h3 className="font-serif text-lg font-medium text-white">
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

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {/* Villa Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Biệt thự được chỉ định" : "Assigned Villa"}
                </label>
                <select
                  value={editingInquiry.villaId}
                  onChange={(e) =>
                    setEditingInquiry({ ...editingInquiry, villaId: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                >
                  {siteConfig.villas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.district})
                    </option>
                  ))}
                </select>
              </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
            <div className="bg-[#14171A] text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C2A476] font-semibold">
                  {language === "vi" ? "Quản lý lịch phòng Host" : "Host Calendar Management"}
                </span>
                <h3 className="font-serif text-lg font-medium text-white">
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

            <form onSubmit={handleCreateManualBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  {language === "vi" ? "Chọn Biệt thự cần khóa / đặt phòng" : "Select Villa to Block / Reserve"}
                </label>
                <select
                  value={newBookingData.villaId}
                  onChange={(e) =>
                    setNewBookingData({ ...newBookingData, villaId: e.target.value })
                  }
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                >
                  {siteConfig.villas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.district})
                    </option>
                  ))}
                </select>
              </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EAE5DC] text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-neutral-900 leading-tight">
                    {language === "vi" ? "Cài đặt bảo trì Biệt thự" : "Villa Maintenance Settings"}
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                    {language === "vi" ? "Điều khiển vận hành" : "Operational Control"}
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

            <div className="mb-4">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {language === "vi" ? "Biệt thự áp dụng:" : "Target Sanctuary:"}
              </label>
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-neutral-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-neutral-200 flex-shrink-0 shadow-sm">
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
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                    {maintenanceDialogVilla.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    {maintenanceDialogVilla.district} • {maintenanceDialogVilla.bedrooms} {language === "vi" ? "PN En-suite" : "En-suite BR"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                {language === "vi"
                  ? "Thông báo & Lý do bảo trì (Hiển thị công khai cho khách xem):"
                  : "Maintenance Notice & Reason (Shown to public guests):"}
              </label>
              <textarea
                rows={3}
                value={maintenanceNoteInput}
                onChange={(e) => setMaintenanceNoteInput(e.target.value)}
                placeholder={
                  language === "vi"
                    ? "Ví dụ: Đang thay nước hồ bơi & nâng cấp nội thất sang trọng. Sẽ mở lại đón khách sớm."
                    : "e.g. Scheduled pool resurfacing & luxury interior upgrade. Reopening soon."
                }
                className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#C2A476] resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                {language === "vi"
                  ? "Khi kích hoạt, biệt thự này sẽ tạm dừng nhận đặt phòng online. Lịch sẽ bị khóa và lý do này sẽ hiển thị cho khách xem."
                  : "When activated, this villa cannot be booked online. The calendar dates will be locked and this notice will be displayed to guests."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMaintenanceDialogVilla(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                {language === "vi" ? "Hủy bỏ" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleMaintenance(maintenanceDialogVilla.id, maintenanceNoteInput);
                  setMaintenanceDialogVilla(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {Boolean(maintenanceMap[maintenanceDialogVilla.id]?.isMaintenance)
                    ? (language === "vi" ? "Cập nhật thông báo" : "Update Notice")
                    : (language === "vi" ? "Kích hoạt bảo trì & Khóa phòng" : "Activate Maintenance & Lock")}
                </span>
              </button>
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
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-neutral-900 leading-tight">
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
