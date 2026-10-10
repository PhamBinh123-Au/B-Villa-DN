"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { bookingStore, RealtimeSyncPayload, getInquirySignature } from "@/lib/bookingStore";
import { BookingInquiry, InquiryStatus, Villa, VillaMaintenanceInfo } from "@/types";
import {
  LuxuryDatePicker,
  addDays,
  formatLuxuryDate,
} from "@/components/LuxuryDatePicker";
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

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check initial mounting & session authentication
  useEffect(() => {
    setHasMounted(true);
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

  // Load inquiries and maintenance from reactive store
  const reloadInquiries = () => {
    const list = bookingStore.getInquiries();
    setInquiries(list);
    setMaintenanceMap(bookingStore.getMaintenanceMap());
    return list;
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
      newStatus ? `🛠️ ${vName} is now Under Maintenance` : `✅ ${vName} Restored to Active`,
      newStatus
        ? "Public inquiries and calendar dates are strictly locked in real-time."
        : "Public website can now receive new booking inquiries."
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
      setErrorMsg("Incorrect passcode. Please check siteConfig.ts or try again.");
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
      showNotification(`Reservation #${id} Cancelled`, "Dates have been released on public site calendar.");
    } else {
      showNotification(`Reservation #${id} marked as ${newStatus.toUpperCase()}`, "Calendar updated in real-time.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete inquiry #${id}? This will release the booked dates on the public website.`)) {
      await bookingStore.deleteInquiryAsync(id);
      reloadInquiries();
      showNotification(`Inquiry #${id} removed`, "Dates released on public website calendar.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInquiry) return;

    if (!editingInquiry.checkIn || !editingInquiry.checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    if (editingInquiry.checkIn >= editingInquiry.checkOut) {
      alert("Check-out date must be strictly after check-in date.");
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
      alert(
        `Overlapping Booking Prohibited!\n\nThese dates conflict with reservation #${conflict.id} (${conflict.guestName}: ${conflict.checkIn} to ${conflict.checkOut}).\n\nPlease select non-overlapping dates or cancel the conflicting reservation first.`
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
        `Reservation #${editingInquiry.id} Updated!`,
        "Public website calendar has been refreshed immediately across all devices."
      );
    } catch (err: any) {
      alert(err.message || "Failed to update reservation.");
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBookingData.checkIn || !newBookingData.checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    if (newBookingData.checkIn >= newBookingData.checkOut) {
      alert("Check-out date must be strictly after check-in date.");
      return;
    }

    // Check conflict
    const conflict = bookingStore.hasDateConflict(
      newBookingData.checkIn,
      newBookingData.checkOut,
      newBookingData.villaId
    );

    if (conflict && newBookingData.status !== "cancelled") {
      alert(
        `Overlapping Booking Prohibited!\n\nThis villa is already reserved from ${conflict.checkIn} to ${conflict.checkOut} by ${conflict.guestName} (#${conflict.id}).\n\nOverlapping bookings are strictly prohibited. Please choose non-overlapping dates.`
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
        "Dates Blocked / New Reservation Created!",
        `Website calendar locked for ${villaName} (${newBookingData.checkIn} - ${newBookingData.checkOut})`
      );
    } catch (err: any) {
      alert(err.message || "Failed to create reservation.");
    }
  };

  const handleResetSample = async () => {
    if (confirm("Reset booking inquiries to initial sample data?")) {
      await bookingStore.resetSampleDataAsync();
      reloadInquiries();
      showNotification("Reset to sample inquiries completed across all devices!");
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

  // Filtered List
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.villaName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : inq.status === statusFilter;

    const matchesVilla =
      villaFilter === "all" ? true : inq.villaId === villaFilter;

    return matchesSearch && matchesStatus && matchesVilla;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111315] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#181B1E] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>

          <div className="w-14 h-14 rounded-2xl bg-[#C2A476]/10 border border-[#C2A476]/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-7 h-7 text-[#C2A476]" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-light text-center text-white mb-2">
            Host Administration
          </h1>
          <p className="text-xs text-neutral-400 text-center font-light mb-8">
            Enter your secret passcode to access booking logs and customer inquiries.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter passcode..."
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
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[11px] text-neutral-500">
              Default passcode configured: <span className="font-mono text-neutral-400">{siteConfig.admin.passcode}</span>
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
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                  {siteConfig.name}
                </h1>
                <span className="bg-[#C2A476]/20 text-[#C2A476] border border-[#C2A476]/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Admin Portal
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Two-Way Live Sync Active (Edit dates, instant calendar update)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Button to Block Dates / Add Reservation */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs bg-[#C2A476] hover:bg-[#aa8c5b] text-white px-3.5 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Block Dates / New Booking</span>
            </button>

            <button
              onClick={handleResetSample}
              className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs bg-white/10 hover:bg-white/20 text-neutral-200 px-4 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Real-time notification banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse flex-shrink-0" />
            <span>
              <strong>Two-Way Live Sync Connected:</strong> When you edit dates or change status to Cancelled/Confirmed here, the public website calendar updates immediately in real-time.
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 font-bold hidden md:inline">
            LIVE TWO-WAY
          </span>
        </div>

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-8">
          {/* 1. Total Inquiries */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] group">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Total Inquiries
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-[#8A6B3D] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900">
                {totalCount}
              </p>
            </div>
            <p className="text-[11px] text-neutral-400 font-light truncate">
              All guest submissions
            </p>
          </div>

          {/* 2. Pending Action */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] group hover:border-amber-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Pending Action
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
            <p className="text-[11px] text-amber-600/80 font-medium truncate">
              {pendingCount > 0 ? "Requires concierge reply" : "All caught up"}
            </p>
          </div>

          {/* 3. Contacted */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] group hover:border-blue-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Contacted
              </span>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-blue-600">
                {contactedCount}
              </p>
            </div>
            <p className="text-[11px] text-blue-600/80 font-medium truncate">
              In direct communication
            </p>
          </div>

          {/* 4. Confirmed */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE5DC] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] group hover:border-emerald-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Confirmed
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-emerald-600">
                {confirmedCount}
              </p>
            </div>
            <p className="text-[11px] text-emerald-600/80 font-medium truncate">
              Booked & dates secured
            </p>
          </div>

          {/* 5. Under Maintenance */}
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[140px] group ${
            maintenanceCount > 0
              ? "bg-[#FFFBF5] border-amber-300 ring-2 ring-amber-400/20"
              : "bg-white border-[#EAE5DC]"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                maintenanceCount > 0 ? "text-amber-800" : "text-neutral-500"
              }`}>
                Maintenance
              </span>
              <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                maintenanceCount > 0
                  ? "bg-amber-100 border-amber-300 text-amber-700"
                  : "bg-neutral-50 border-neutral-200 text-neutral-400"
              }`}>
                <Wrench className={`w-4 h-4 ${maintenanceCount > 0 ? "animate-pulse" : ""}`} />
              </div>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <p className={`text-3xl sm:text-4xl font-serif font-bold ${
                maintenanceCount > 0 ? "text-amber-700" : "text-neutral-900"
              }`}>
                {maintenanceCount}
              </p>
              <span className="text-xs text-neutral-400 font-medium">/ 4 Villas</span>
            </div>
            <p className={`text-[11px] font-medium truncate ${
              maintenanceCount > 0 ? "text-amber-700" : "text-neutral-400"
            }`}>
              {maintenanceCount > 0 ? `${maintenanceCount} villa locked from booking` : "All 4 villas operational"}
            </p>
          </div>
        </div>

        {/* Dedicated Villa Maintenance & Availability Control Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 shadow-sm">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base sm:text-lg font-bold text-neutral-900">
                    Villa Maintenance & Operational Status Control
                  </h2>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider hidden sm:inline">
                    Live Toggle
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Select any villa to place under maintenance. Locked villas immediately block online inquiries and calendar dates across the public website.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                maintenanceCount > 0
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
              }`}>
                {4 - maintenanceCount} of 4 Villas Active
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
                          <span>Under Maintenance (Locked)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Operational & Active</span>
                        </div>
                      )}
                    </div>

                    {/* Reason / Note Box */}
                    {isMaint && (
                      <div className="bg-white/90 border border-amber-200 rounded-xl p-2.5 mb-3 text-[11px] text-amber-900 shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">
                          Public Notice:
                        </span>
                        <p className="line-clamp-2 italic font-light">
                          &ldquo;{info?.reason || "Scheduled luxury maintenance & seasonal care."}&rdquo;
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
                        <span>Restore to Active</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMaintenanceDialogVilla(villa);
                          setMaintenanceNoteInput(
                            info?.reason || "Scheduled seasonal maintenance & deep renovation. Reopening soon."
                          );
                        }}
                        className="w-full bg-[#14171A] hover:bg-amber-600 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:shadow-md"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Set Under Maintenance</span>
                      </button>
                    )}

                    {isMaint && (
                      <button
                        type="button"
                        onClick={() => {
                          setMaintenanceDialogVilla(villa);
                          setMaintenanceNoteInput(
                            info?.reason || "Scheduled seasonal maintenance & deep renovation. Reopening soon."
                          );
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 underline text-center cursor-pointer py-0.5"
                      >
                        Edit maintenance notice
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search guest, ID, villa, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#C2A476]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Villa Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span>Villa:</span>
              <select
                value={villaFilter}
                onChange={(e) => setVillaFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:outline-none"
              >
                <option value="all">All 4 Villas</option>
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
                onClick={handleResetSample}
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
                        <option value="pending">● Pending</option>
                        <option value="contacted">● Contacted</option>
                        <option value="confirmed">● Confirmed</option>
                        <option value="cancelled">● Cancelled (Release Dates)</option>
                      </select>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditingInquiry({ ...inq })}
                        className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#f3ede1] text-[#8A6B3D] border border-[#E8E0D2] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        title="Edit Dates & Reservation Info"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C2A476]" />
                        <span>Edit</span>
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
                        onClick={() => handleDelete(inq.id)}
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
                        Stay Dates
                      </span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {inq.checkIn} → {inq.checkOut}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Guest Count
                      </span>
                      <p className="font-semibold text-neutral-800 mt-0.5">
                        {inq.adults} Adults {inq.children > 0 ? `, ${inq.children} Children` : ""}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
                        Guest Phone / WhatsApp
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
                        Guest Email
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
                        Guest Special Notes / Reason:
                      </span>
                      <p className="italic">{inq.specialRequests}</p>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-neutral-400 text-right">
                    Received on: {new Date(inq.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
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
                  Host Reservation Editor
                </span>
                <h3 className="font-serif text-lg font-medium text-white">
                  Edit Reservation #{editingInquiry.id}
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
                  Assigned Villa
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
                  label="Check-in Date"
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
                  placeholder="Select Check-in Date"
                />
                <LuxuryDatePicker
                  label="Check-out Date"
                  selectedDate={editingInquiry.checkOut}
                  onSelectDate={(val) =>
                    setEditingInquiry((prev) => (prev ? { ...prev, checkOut: val } : null))
                  }
                  villaId={editingInquiry.villaId}
                  isCheckOut={true}
                  checkInDate={editingInquiry.checkIn}
                  minDate={editingInquiry.checkIn ? addDays(editingInquiry.checkIn, 1) : undefined}
                  excludeInquiryId={editingInquiry.id}
                  placeholder="Select Check-out Date"
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
                      <p className="font-bold text-rose-900">Overlapping Date Conflict Detected!</p>
                      <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                        These dates overlap with reservation #{conflict.id} ({conflict.guestName}: {conflict.checkIn} → {conflict.checkOut}). Please select non-overlapping dates.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  Reservation Status
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
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="confirmed">Confirmed (Dates Locked)</option>
                  <option value="cancelled">Cancelled (Dates Released)</option>
                </select>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                    Guest Name / Label
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
                    Phone / WhatsApp
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
                  Email Address
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
                    Adults
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
                    Children
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
                  Host Notes / Special Requests
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
                  Cancel
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
                      <span>{hasConflict ? "Dates Conflict — Cannot Save" : "Save Changes"}</span>
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
                  Host Calendar Management
                </span>
                <h3 className="font-serif text-lg font-medium text-white">
                  Block Dates or Add Offline Reservation
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
                  Select Villa to Block / Reserve
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
                  label="Check-in Date"
                  selectedDate={newBookingData.checkIn}
                  onSelectDate={(val) =>
                    setNewBookingData((prev) => ({
                      ...prev,
                      checkIn: val,
                      checkOut: val && (!prev.checkOut || prev.checkOut <= val) ? addDays(val, 2) : prev.checkOut,
                    }))
                  }
                  villaId={newBookingData.villaId}
                  placeholder="Select Check-in Date"
                />
                <LuxuryDatePicker
                  label="Check-out Date"
                  selectedDate={newBookingData.checkOut}
                  onSelectDate={(val) =>
                    setNewBookingData((prev) => ({ ...prev, checkOut: val }))
                  }
                  villaId={newBookingData.villaId}
                  isCheckOut={true}
                  checkInDate={newBookingData.checkIn}
                  minDate={newBookingData.checkIn ? addDays(newBookingData.checkIn, 1) : undefined}
                  placeholder="Select Check-out Date"
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
                      <p className="font-bold text-rose-900">Overlapping Booking Prohibited!</p>
                      <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                        This villa is already reserved from {conflict.checkIn} to {conflict.checkOut} by {conflict.guestName} (#{conflict.id}). Overlapping reservations cannot be saved.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Guest Name / Reason */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  Guest Name or Reason for Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP Guest Mr. Thomas / Private Maintenance"
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
                    Phone / WhatsApp
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
                    Status
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
                    <option value="confirmed">Confirmed (Locks Dates)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1.5">
                  Notes
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
                  Cancel
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
                      <span>{hasConflict ? "Dates Conflict — Cannot Lock" : "Lock Dates on Calendar"}</span>
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
                    Villa Maintenance Settings
                  </h3>
                  <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                    Operational Control
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
                Target Sanctuary:
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
                    {maintenanceDialogVilla.district} • {maintenanceDialogVilla.bedrooms} PN En-suite
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Maintenance Notice & Reason (Shown to public guests):
              </label>
              <textarea
                rows={3}
                value={maintenanceNoteInput}
                onChange={(e) => setMaintenanceNoteInput(e.target.value)}
                placeholder="e.g. Scheduled pool resurfacing & luxury interior upgrade. Reopening soon."
                className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#C2A476] resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                When activated, this villa cannot be booked online. The calendar dates will be locked and this notice will be displayed to guests.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setMaintenanceDialogVilla(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
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
                    ? "Update Notice"
                    : "Activate Maintenance & Lock"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
