"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "vi" | "en";

export interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

export const dictionary: Translations = {
  // Brand & Location
  "brand.tagline": {
    vi: "Bộ Sưu Tập Biệt Thự Nghỉ Dưỡng Đẳng Cấp Tại Đà Nẵng",
    en: "Curated Coastal Sanctuaries in Da Nang",
  },
  "brand.location": {
    vi: "Đà Nẵng • Việt Nam",
    en: "Da Nang • Vietnam",
  },

  // Navbar
  "nav.villas": {
    vi: "Biệt Thự",
    en: "Villas",
  },
  "nav.experience": {
    vi: "Trải Nghiệm",
    en: "Experience",
  },
  "nav.amenities": {
    vi: "Tiện Ích",
    en: "Amenities",
  },
  "nav.contact": {
    vi: "Liên Hệ",
    en: "Contact",
  },
  "nav.admin": {
    vi: "Quản Trị",
    en: "Admin",
  },
  "nav.inquire": {
    vi: "Đặt Phòng Ngay",
    en: "Inquire Now",
  },
  "nav.book_mobile": {
    vi: "Đặt Phòng",
    en: "Book",
  },
  "nav.whatsapp_inquiry": {
    vi: "Nhắn Zalo / WhatsApp →",
    en: "WhatsApp Inquiry →",
  },

  // Hero Section
  "hero.subtitle": {
    vi: "THIÊN ĐƯỜNG NGHỈ DƯỠNG BIỂN THƯỢNG LƯU",
    en: "EXCLUSIVE COASTAL SANCTUARIES",
  },
  "hero.title_1": {
    vi: "Nghỉ Dưỡng Đẳng Cấp Bên Bờ Biển Đà Nẵng",
    en: "Sanctuary of Refined Coastal Living",
  },
  "hero.desc_1": {
    vi: "Khám phá 4 biệt thự hồ bơi riêng tư tuyệt mỹ tại Sơn Trà & Ngũ Hành Sơn với kiến trúc tối giản hiện đại và dịch vụ đặc quyền.",
    en: "Four masterfully crafted private pool residences in Son Tra & Ngu Hanh Son, designed for privacy, architectural serenity, and unforgettable gatherings.",
  },
  "hero.title_2": {
    vi: "Hồ Bơi Riêng Tư & Ánh Sáng Tự Nhiên Tuyệt Đẹp",
    en: "Private Pool Atriums & Tropical Sunlit Spaces",
  },
  "hero.desc_2": {
    vi: "Mỗi căn villa sở hữu hồ bơi biệt lập, sân vườn nhiệt đới xanh mát và không gian bếp ăn sang trọng dành riêng cho gia đình bạn.",
    en: "Unwind by sun-drenched private pools, architectural skylights, and spacious open kitchens tailored for bespoke gatherings.",
  },
  "hero.title_3": {
    vi: "Không Gian Sum Vầy Sang Trọng & Ấm Cúng",
    en: "Unforgettable Moments with Family & Friends",
  },
  "hero.desc_3": {
    vi: "Từ 2 đến 4 phòng ngủ sang trọng en-suite, tiện nghi chuẩn resort 5 sao, mang đến kỳ nghỉ dưỡng hoàn hảo nhất.",
    en: "From 2 to 4 king en-suite suites with resort-level amenities, creating an oasis of pure relaxation just moments from the ocean.",
  },

  // Search Bar
  "search.select_villa": {
    vi: "Chọn Biệt Thự",
    en: "Select Villa",
  },
  "search.all_villas": {
    vi: "Tất Cả Biệt Thự (4 Dinh Thự)",
    en: "All Villas (4 Residences)",
  },
  "search.check_in": {
    vi: "Nhận Phòng",
    en: "Check-In",
  },
  "search.check_out": {
    vi: "Trả Phòng",
    en: "Check-Out",
  },
  "search.guests": {
    vi: "Số Khách",
    en: "Guests",
  },
  "search.check_availability": {
    vi: "Kiểm Tra Lịch Trống",
    en: "Check Availability",
  },
  "search.night_min": {
    vi: "Đêm",
    en: "Night",
  },
  "search.select_dates": {
    vi: "Chọn ngày",
    en: "Select dates",
  },
  "search.guests_count": {
    vi: "Khách",
    en: "Guests",
  },

  // Villas Section
  "villas.section_subtitle": {
    vi: "BỘ SƯU TẬP BIỆT THỰ BIỂN",
    en: "THE PRIVATE RESIDENCES",
  },
  "villas.section_title": {
    vi: "Bộ Sưu Tập 4 Biệt Thự Nghỉ Dưỡng",
    en: "The Villa Collection",
  },
  "villas.section_desc": {
    vi: "Mỗi biệt thự là một kiệt tác kiến trúc riêng biệt với hồ bơi riêng tư, không gian phòng khách & bếp mở rộng rãi, nằm gần bờ biển Đà Nẵng.",
    en: "Each residence is an individual architectural masterpiece featuring an exclusive private pool, open-concept gourmet living, and proximity to Da Nang's pristine shores.",
  },
  "villas.bedrooms": {
    vi: "Phòng Ngủ",
    en: "Bedrooms",
  },
  "villas.bathrooms": {
    vi: "Phòng Tắm",
    en: "Bathrooms",
  },
  "villas.max_guests": {
    vi: "Khách Tối Đa",
    en: "Max Guests",
  },
  "villas.pool": {
    vi: "Hồ Bơi Riêng",
    en: "Private Pool",
  },
  "villas.view_gallery": {
    vi: "Xem Thư Viện Ảnh",
    en: "View Gallery",
  },
  "villas.inquire_btn": {
    vi: "Gửi Yêu Cầu Đặt Biệt Thự",
    en: "Inquire This Villa",
  },
  "villas.maintenance_badge": {
    vi: "Đang Bảo Trì",
    en: "Under Maintenance",
  },
  "villas.maintenance_notice": {
    vi: "Biệt thự đang trong giai đoạn nâng cấp định kỳ. Tạm dừng nhận đặt phòng.",
    en: "Property is currently undergoing scheduled care. Online bookings temporarily paused.",
  },

  // Experience & Amenities
  "exp.subtitle": {
    vi: "TRẢI NGHIỆM ĐẶC QUYỀN",
    en: "BESPOKE HOSPITALITY",
  },
  "exp.title": {
    vi: "Kỳ Nghỉ Dưỡng Hoàn Hảo Tại Đà Nẵng",
    en: "An Elevated Da Nang Experience",
  },
  "amenities.subtitle": {
    vi: "TIỆN ÍCH TIÊU CHUẨN 5 SAO",
    en: "SIGNATURE AMENITIES",
  },
  "amenities.title": {
    vi: "Tiện Nghi Đẳng Cấp Chuẩn Nghỉ Dưỡng",
    en: "Curated For Effortless Indulgence",
  },

  // Booking Modal
  "modal.title": {
    vi: "Gửi Yêu Cầu Đặt Phòng Trực Tiếp",
    en: "Direct Reservation Inquiry",
  },
  "modal.heading": {
    vi: "Đặt Biệt Thự Của Bạn",
    en: "Reserve Your Sanctuary",
  },
  "modal.guest_name": {
    vi: "Họ và Tên Quý Khách",
    en: "Full Guest Name",
  },
  "modal.email": {
    vi: "Địa Chỉ Email",
    en: "Email Address",
  },
  "modal.phone": {
    vi: "Số Điện Thoại / Zalo / WhatsApp",
    en: "Phone / WhatsApp",
  },
  "modal.select_villa_label": {
    vi: "Chọn Biệt Thự Nghỉ Dưỡng",
    en: "Select Villa Residence",
  },
  "modal.stay_dates": {
    vi: "Khoảng Thời Gian Lưu Trú",
    en: "Stay Period (Check-in & Check-out)",
  },
  "modal.special_requests": {
    vi: "Yêu Cầu Đặc Biệt / Giờ Nhận Phòng",
    en: "Special Requests / Arrival Notes",
  },
  "modal.submit_btn": {
    vi: "Xác Nhận Gửi Yêu Cầu Đặt Phòng",
    en: "Submit Reservation Inquiry",
  },
  "modal.submitting": {
    vi: "Đang Gửi Yêu Cầu...",
    en: "Submitting Inquiry...",
  },
  "modal.conflict_warning": {
    vi: "Biệt Thự Đã Được Đặt Trong Khoảng Thời Gian Này",
    en: "Villa Already Reserved On These Dates",
  },
  "modal.success_title": {
    vi: "Yêu Cầu Đã Được Tiếp Nhận Thành Công",
    en: "Inquiry Successfully Received",
  },
  "modal.success_desc": {
    vi: "Cảm ơn quý khách! Đội ngũ quản gia sẽ kiểm tra lịch trống và phản hồi xác nhận trong vòng 1 giờ qua điện thoại hoặc WhatsApp.",
    en: "Thank you! Our concierge team will review availability and confirm your reservation within 1 hour via phone or WhatsApp.",
  },
  "modal.close": {
    vi: "Hoàn Tất & Đóng",
    en: "Done & Close",
  },

  // Admin Login
  "admin.login_title": {
    vi: "Cổng Quản Trị Dành Cho Host",
    en: "Host Administration",
  },
  "admin.login_desc": {
    vi: "Nhập mã bảo mật để truy cập danh sách đặt phòng và quản lý lịch villa.",
    en: "Enter your secret passcode to access booking logs and customer inquiries.",
  },
  "admin.passcode_label": {
    vi: "Mã Quản Trị",
    en: "Admin Passcode",
  },
  "admin.passcode_placeholder": {
    vi: "Nhập mã bảo mật...",
    en: "Enter passcode...",
  },
  "admin.unlock_btn": {
    vi: "Mở Khoá Bảng Quản Trị",
    en: "Unlock Dashboard",
  },
  "admin.return_home": {
    vi: "Quay Lại Trang Chủ",
    en: "Return to Public Website",
  },

  // Admin Header & Navigation
  "admin.portal": {
    vi: "Cổng Quản Trị",
    en: "Admin Portal",
  },
  "admin.live_sync": {
    vi: "Đồng Bộ Trực Tiếp Hai Chiều Đang Bật",
    en: "Two-Way Live Sync Active",
  },
  "admin.cloud_synced": {
    vi: "Cloud Synced 🟢",
    en: "Cloud Synced 🟢",
  },
  "admin.device_sync_btn": {
    vi: "Đồng Bộ Đa Thiết Bị ⚡",
    en: "Device Sync Setup ⚡",
  },
  "admin.block_dates_btn": {
    vi: "Khoá Ngày / Tạo Đơn Mới",
    en: "Block Dates / New Booking",
  },
  "admin.reset_demo_btn": {
    vi: "Dữ Liệu Mẫu",
    en: "Reset Demo",
  },
  "admin.logout": {
    vi: "Đăng Xuất",
    en: "Log Out",
  },

  // Admin KPIs
  "admin.kpi_total": {
    vi: "Tổng Đơn Đặt Phòng",
    en: "Total Inquiries",
  },
  "admin.kpi_pending": {
    vi: "Chờ Xử Lý",
    en: "Pending Inquiries",
  },
  "admin.kpi_contacted": {
    vi: "Đã Liên Hệ",
    en: "Contacted Guests",
  },
  "admin.kpi_confirmed": {
    vi: "Đã Xác Nhận & Giữ Chỗ",
    en: "Confirmed Bookings",
  },
  "admin.kpi_maintenance": {
    vi: "Villa Đang Bảo Trì",
    en: "Villas Under Maintenance",
  },

  // Admin Filter Bar
  "admin.search_placeholder": {
    vi: "Tìm kiếm theo tên khách, mã đơn, số điện thoại, villa...",
    en: "Search guest name, inquiry ID, phone, email, villa...",
  },
  "admin.filter_status": {
    vi: "Trạng Thái",
    en: "Filter Status",
  },
  "admin.all_statuses": {
    vi: "Tất Cả Trạng Thái",
    en: "All Statuses",
  },
  "admin.status_pending": {
    vi: "Chờ Xử Lý",
    en: "Pending",
  },
  "admin.status_contacted": {
    vi: "Đã Liên Hệ",
    en: "Contacted",
  },
  "admin.status_confirmed": {
    vi: "Đã Xác Nhận",
    en: "Confirmed",
  },
  "admin.status_cancelled": {
    vi: "Đã Huỷ",
    en: "Cancelled",
  },
  "admin.filter_villa": {
    vi: "Lọc Theo Villa",
    en: "Filter Villa",
  },
  "admin.all_villas_option": {
    vi: "Tất Cả Villa (4 Căn)",
    en: "All Villas (4 Properties)",
  },

  // Admin Actions & Labels
  "admin.stay_dates": {
    vi: "Thời Gian Lưu Trú",
    en: "Stay Dates",
  },
  "admin.guest_count": {
    vi: "Số Lượng Khách",
    en: "Guest Count",
  },
  "admin.created_at": {
    vi: "Thời Điểm Gửi Đơn",
    en: "Submitted At",
  },
  "admin.special_notes": {
    vi: "Ghi Chú & Yêu Cầu",
    en: "Special Requests",
  },
  "admin.edit_dates": {
    vi: "Chỉnh Sửa",
    en: "Edit Dates",
  },
  "admin.delete_inquiry": {
    vi: "Xoá Đơn",
    en: "Delete",
  },
  "admin.call_guest": {
    vi: "Gọi Khách",
    en: "Call Guest",
  },
  "admin.whatsapp_guest": {
    vi: "WhatsApp",
    en: "WhatsApp",
  },

  // Admin Maintenance Banner
  "admin.maintenance_toggle_on": {
    vi: "Kích Hoạt Bảo Trì & Khoá Lịch",
    en: "Activate Maintenance & Lock",
  },
  "admin.maintenance_toggle_off": {
    vi: "Mở Lại Hoạt Động Bình Thường",
    en: "Restore Property to Active",
  },
  "admin.maintenance_edit_note": {
    vi: "Sửa Thông Báo",
    en: "Edit Notice",
  },

  // Confirm Dialogs
  "dialog.understood": {
    vi: "Đã Hiểu",
    en: "Understood",
  },
  "dialog.cancel": {
    vi: "Huỷ Bỏ",
    en: "Cancel",
  },
  "dialog.confirm": {
    vi: "Xác Nhận",
    en: "Confirm",
  },
  "dialog.delete_confirm": {
    vi: "Xoá & Nhả Lịch Trống",
    en: "Delete & Release Dates",
  },
  "dialog.delete_title": {
    vi: "Xác Nhận Xoá Đơn Đặt Phòng",
    en: "Delete Reservation Inquiry",
  },
  "dialog.delete_msg": {
    vi: "Bạn có chắc chắn muốn xoá vĩnh viễn đơn đặt phòng này? Ngày đã đặt sẽ được nhả trống ngay lập tức trên lịch website công khai.",
    en: "Are you sure you want to permanently delete this reservation inquiry? The reserved dates will be immediately released and opened for booking on the public website.",
  },

  // Footer
  "footer.rights": {
    vi: "Bảo lưu mọi quyền. Nghỉ dưỡng cao cấp tại Đà Nẵng.",
    en: "All rights reserved. Luxury Private Pool Sanctuaries.",
  },
  "footer.direct_concierge": {
    vi: "Quản Gia Trực Tiếp 24/7",
    en: "24/7 Dedicated Concierge",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

const STORAGE_LANG_KEY = "danang_villa_language_pref_v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
      if (saved === "vi" || saved === "en") {
        setLanguageState(saved);
      } else {
        // Detect browser language or default to Vietnamese
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("en")) {
          setLanguageState("en");
        } else {
          setLanguageState("vi");
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
      document.documentElement.lang = lang;
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = language === "vi" ? "en" : "vi";
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = dictionary[key];
    if (!entry) {
      return fallback || key;
    }
    return entry[language] || fallback || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
