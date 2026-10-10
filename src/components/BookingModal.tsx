"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { Villa } from "@/types";
import { bookingStore } from "@/lib/bookingStore";
import {
  LuxuryDatePicker,
  formatLuxuryDate,
  addDays,
} from "./LuxuryDatePicker";
import {
  X,
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ChevronDown,
  Check,
  Home,
  AlertCircle,
  Clock,
  Wrench,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedVilla?: Villa | null;
  initialDates?: { checkIn?: string; checkOut?: string; guests?: number };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedVilla,
  initialDates,
}) => {
  const [villaId, setVillaId] = useState<string>("");
  const [isVillaSelectOpen, setIsVillaSelectOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  const modalSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preSelectedVilla) {
      setVillaId(preSelectedVilla.id);
    } else if (!villaId && siteConfig.villas.length > 0) {
      setVillaId(siteConfig.villas[0].id);
    }

    if (initialDates?.checkIn) setCheckIn(initialDates.checkIn);
    if (initialDates?.checkOut) setCheckOut(initialDates.checkOut);
    if (initialDates?.guests) setAdults(initialDates.guests);
  }, [preSelectedVilla, initialDates, isOpen]);

  // Click outside listener for modal villa selector
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalSelectRef.current && !modalSelectRef.current.contains(e.target as Node)) {
        setIsVillaSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const currentVilla = siteConfig.villas.find((v) => v.id === villaId) || siteConfig.villas[0];
  const isUnderMaintenance = currentVilla ? bookingStore.isVillaUnderMaintenance(currentVilla.id) : false;
  const maintenanceInfo = currentVilla ? bookingStore.getVillaMaintenanceInfo(currentVilla.id) : undefined;

  const conflict =
    checkIn && checkOut && currentVilla
      ? bookingStore.hasDateConflict(checkIn, checkOut, currentVilla.id)
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUnderMaintenance) {
      alert(
        `Reservation Prohibited: ${currentVilla.name} is currently undergoing scheduled maintenance. Reservations are temporarily closed for this property. Please choose another villa.`
      );
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn >= checkOut) {
      alert("Check-out date must be strictly after check-in date.");
      return;
    }

    if (conflict) {
      alert(
        `Overlapping Booking Error: ${currentVilla.name} is already reserved from ${conflict.checkIn} to ${conflict.checkOut}. Please choose other available dates.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const newInquiry = await bookingStore.addInquiryAsync({
        villaId: currentVilla.id,
        villaName: currentVilla.name,
        guestName,
        email,
        phone,
        checkIn,
        checkOut,
        adults: Number(adults),
        children: Number(children),
        specialRequests,
      });

      setSubmittedInquiryId(newInquiry.id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while saving your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedInquiryId(null);
    setGuestName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EAE5DC] overflow-visible my-auto sm:my-8">
        {/* Header Bar */}
        <div className="bg-[#14171A] text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-white/10 rounded-t-3xl">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C2A476] font-semibold">
              Direct Reservation Inquiry
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-light text-white">
              Reserve Your Sanctuary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8">
          {submittedInquiryId ? (
            /* Success Confirmation State */
            <div className="text-center py-8 px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border-2 border-[#C2A476] flex items-center justify-center mx-auto mb-6 text-[#C2A476]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-light mb-2">
                Inquiry Successfully Received
              </h4>
              <p className="text-sm text-neutral-600 max-w-md mx-auto mb-6">
                Thank you, <span className="font-semibold text-neutral-900">{guestName}</span>. Your reservation inquiry for <span className="font-semibold text-neutral-900">{currentVilla.name}</span> has been logged directly with our concierge team.
              </p>

              <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 max-w-md mx-auto mb-8 text-left">
                <div className="flex justify-between items-center text-xs text-neutral-500 pb-2 border-b border-neutral-200">
                  <span>Reference Number:</span>
                  <span className="font-mono font-bold text-[#C2A476]">{submittedInquiryId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-2">
                  <span>Villa Selected:</span>
                  <span className="font-medium text-neutral-900">{currentVilla.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-1">
                  <span>Dates:</span>
                  <span>{checkIn} to {checkOut}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-600 pt-1">
                  <span>Status:</span>
                  <span className="text-amber-600 font-medium uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded">
                    Sent to Host Dashboard
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`${siteConfig.contact.whatsapp}?text=Hello!%20I%20just%20submitted%20inquiry%20${submittedInquiryId}%20for%20${encodeURIComponent(currentVilla.name)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp Now</span>
                </a>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center bg-[#14171A] hover:bg-neutral-800 text-white py-3.5 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Custom Luxury Villa Selector */}
              <div ref={modalSelectRef} className="relative">
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2">
                  Select Villa Residence
                </label>

                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsVillaSelectOpen((prev) => !prev)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 hover:border-[#C2A476] rounded-2xl p-3 text-left flex items-center justify-between transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C2A476]/30 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 bg-neutral-100 shadow-sm">
                      <Image
                        src={currentVilla.image}
                        alt={currentVilla.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-0.5 left-0.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1 rounded">
                        {currentVilla.code}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                        {currentVilla.name}
                      </span>
                      <span className="block text-[11px] text-neutral-500 truncate mt-0.5">
                        {currentVilla.poolType} • {currentVilla.district}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-[#C2A476] transition-transform duration-300 flex-shrink-0 ml-2 ${
                      isVillaSelectOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {isVillaSelectOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#EAE5DC] p-2 z-50 text-neutral-900 max-h-[290px] overflow-y-auto space-y-1"
                    >
                      {siteConfig.villas.map((v) => {
                        const isSelected = v.id === currentVilla.id;
                        const isVMaint = bookingStore.isVillaUnderMaintenance(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              setVillaId(v.id);
                              setIsVillaSelectOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer ${
                              isSelected
                                ? "bg-[#FAF7F2] text-neutral-900 font-semibold ring-1 ring-[#C2A476]/40"
                                : "hover:bg-[#FAF8F5] text-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[#EAE5DC] flex-shrink-0 shadow-sm bg-neutral-100">
                                <Image
                                  src={v.image}
                                  alt={v.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-0.5 left-0.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1 rounded">
                                  {v.code}
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-[#A6834F] transition-colors">
                                    {v.name}
                                  </p>
                                  {isVMaint && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5 flex-shrink-0">
                                      <Wrench className="w-2.5 h-2.5" />
                                      <span>Maintenance</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-400 truncate">
                                  {v.district} • {v.bedrooms} PN • {v.poolType}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#C2A476]/15 flex items-center justify-center text-[#A6834F] flex-shrink-0 ml-2">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-neutral-500 mt-1.5 italic">
                  Max capacity: {currentVilla.maxGuests} guests • {currentVilla.bedrooms} En-suite Bedrooms
                </p>

                {/* Prominent Maintenance Alert Banner if Selected Villa is Under Maintenance */}
                {isUnderMaintenance && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-start gap-3 animate-fade-in shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-amber-950 text-sm">
                        Sanctuary Under Maintenance
                      </h5>
                      <p className="text-amber-800 text-xs mt-0.5 leading-relaxed font-light">
                        {maintenanceInfo?.reason || `${currentVilla.name} is currently undergoing scheduled maintenance & renovation.`} Inquiries and reservations are temporarily closed for this property. Please choose another villa.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Luxury Check-in & Check-out Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LuxuryDatePicker
                  label="Check-in Date"
                  selectedDate={checkIn}
                  onSelectDate={(val) => {
                    setCheckIn(val);
                    if (val && (!checkOut || checkOut <= val)) {
                      setCheckOut(addDays(val, 2));
                    }
                  }}
                  villaId={currentVilla.id}
                  placeholder="Select Check-in Date"
                />

                <LuxuryDatePicker
                  label="Check-out Date"
                  selectedDate={checkOut}
                  onSelectDate={(val) => setCheckOut(val)}
                  villaId={currentVilla.id}
                  isCheckOut={true}
                  checkInDate={checkIn}
                  minDate={checkIn ? addDays(checkIn, 1) : undefined}
                  placeholder="Select Check-out Date"
                />
              </div>

              {/* Stay Duration & Dates Confirmation Pill */}
              {checkIn && checkOut && checkOut > checkIn && !conflict && (
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between text-xs text-neutral-700 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span className="font-semibold text-neutral-900">
                      Stay Duration:
                    </span>
                    <span>
                      {Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))} Nights
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Dates Available
                  </span>
                </div>
              )}

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>Adults</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentVilla.maxGuests}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>Children</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={6}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David Harrison"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C2A476]" />
                    <span>Phone or WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +84 905 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C2A476]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476]"
                  required
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-700 mb-2">
                  Special Requests / Arrival Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Airport pickup, early check-in, BBQ arrangement, etc."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#C2A476] resize-none"
                />
              </div>

              {/* Conflict Warning if Dates Already Booked */}
              {conflict && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Villa Already Reserved On These Dates</p>
                    <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                      {currentVilla.name} is already booked from <span className="font-semibold">{conflict.checkIn}</span> to <span className="font-semibold">{conflict.checkOut}</span>. Please choose different dates or select another villa.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !!conflict || !checkIn || !checkOut || isUnderMaintenance}
                  className="w-full bg-[#14171A] hover:bg-[#C2A476] text-white py-4 px-6 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUnderMaintenance ? (
                    <>
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Unavailable — Villa Under Maintenance</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C2A476] group-hover:text-white" />
                      <span>
                        {conflict
                          ? "Dates Unavailable — Choose Other Dates"
                          : !checkIn || !checkOut
                          ? "Select Check-in & Check-out Dates"
                          : isSubmitting
                          ? "Submitting Inquiry..."
                          : "Submit Reservation Inquiry"}
                      </span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-neutral-400 mt-2">
                  No payment required now. Our team will verify availability and confirm within 1 hour.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
