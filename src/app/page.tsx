"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { VillasSection } from "@/components/VillasSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { AmenitiesSection } from "@/components/AmenitiesSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { Villa } from "@/types";
import { siteConfig } from "@/config/siteConfig";
import { LenisProvider } from "@/components/common/LenisProvider";

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [initialDates, setInitialDates] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  const handleOpenBooking = (villa?: Villa | null) => {
    setSelectedVilla(villa || null);
    setIsBookingOpen(true);
  };

  const handleHeroAvailability = (query: {
    villaId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }) => {
    if (query.villaId) {
      const found = siteConfig.villas.find((v) => v.id === query.villaId);
      setSelectedVilla(found || null);
    } else {
      setSelectedVilla(null);
    }
    setInitialDates({
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      guests: query.guests,
    });
    setIsBookingOpen(true);
  };

  return (
    <LenisProvider>
      <main className="min-h-screen bg-ivory text-charcoal selection:bg-[#C2A476] selection:text-white relative">
        {/* Navigation */}
        <Navbar onOpenBooking={() => handleOpenBooking(null)} />

        {/* Hero Section with Quick Availability */}
        <Hero onCheckAvailability={handleHeroAvailability} />

        {/* Villas Showcase Section (4 properties) */}
        <VillasSection onInquire={handleOpenBooking} />

        {/* Experience & Architectural Philosophy */}
        <ExperienceSection />

        {/* Signature Amenities (4 Curated Essentials) */}
        <AmenitiesSection />

        {/* Essential Guide & Frequently Asked Questions (Raw HTML & Sequential Headings) */}
        <FaqSection />

        {/* Footer */}
        <Footer />

        {/* Reservation Inquiry Modal */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          preSelectedVilla={selectedVilla}
          initialDates={initialDates}
        />
      </main>
    </LenisProvider>
  );
}
