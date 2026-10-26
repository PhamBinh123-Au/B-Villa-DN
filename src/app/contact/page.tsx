import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Sparkles, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "Liên Hệ & Đặt Biệt Thự • Concierge 24/7 | B Villa Da Nang",
  description:
    "Liên hệ ban quản lý và quản gia trực tiếp B Villa Da Nang. Hotline / Zalo: 0854 252 821, WhatsApp: +84854252821. Địa chỉ chi tiết các biệt thự tại Sơn Trà và Ngũ Hành Sơn, Đà Nẵng.",
  alternates: {
    canonical: "https://b-villa-dn.vercel.app/contact",
  },
  openGraph: {
    title: "Liên Hệ & Đặt Biệt Thự | B Villa Da Nang",
    description: "Hotline / Zalo: 0854 252 821, WhatsApp: +84854252821. Quản gia hỗ trợ 24/7.",
    url: "https://b-villa-dn.vercel.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#14171A]">
      {/* Top Header */}
      <header className="border-b border-[#EAE5DC] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-neutral-600 hover:text-[#C2A476] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/images/logo.png" alt="B Villa Logo" fill className="object-contain" sizes="32px" />
            </div>
            <span className="font-extrabold tracking-widest uppercase text-sm">{siteConfig.name}</span>
          </Link>
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9]/g, "")}`}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#C2A476] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#a88a59] transition-colors"
          >
            Gọi Hotline
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2A476]/10 text-[#8A6B3D] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>Liên Hệ &amp; Tư Vấn Trực Tiếp • Concierge Support</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
          Liên Hệ Ban Quản Trị &amp; Quản Gia B Villa Da Nang
        </h1>

        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal mb-10 border-l-4 border-[#C2A476] pl-5">
          Quý khách có nhu cầu đặt phòng, tư vấn tổ chức tiệc sinh nhật / BBQ, đặt xe đưa đón sân bay, hoặc các yêu cầu đặc biệt khác xin vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng và quản gia 24/7 của chúng tôi.
        </p>

        {/* Quick Contact Cards Grid */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            1. Các Kênh Tiếp Nhận Thông Tin Chính Thức
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone & Zalo */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <Phone className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Hotline &amp; Zalo Trực Tiếp</h3>
              <p className="text-xs text-neutral-500 mb-3">Tư vấn báo giá, kiểm tra lịch trống và hỗ trợ khẩn cấp 24/7</p>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9]/g, "")}`}
                className="text-base font-extrabold text-[#C2A476] hover:underline block mb-2"
              >
                {siteConfig.contact.phone}
              </a>
              <a
                href={siteConfig.social.zalo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0068FF] hover:underline"
              >
                <span>Nhắn tin Zalo trực tiếp</span>
                <span>→</span>
              </a>
            </div>

            {/* WhatsApp Direct */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#25D366] transition-all">
              <MessageCircle className="w-6 h-6 text-[#25D366] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">WhatsApp Cho Khách Quốc Tế</h3>
              <p className="text-xs text-neutral-500 mb-3">Direct assistance in English and Vietnamese for global travelers</p>
              <a
                href={siteConfig.contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="text-base font-extrabold text-[#25D366] hover:underline block mb-2"
              >
                +84 854 252 821
              </a>
              <a
                href={siteConfig.contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline"
              >
                <span>Chat via WhatsApp</span>
                <span>→</span>
              </a>
            </div>

            {/* Email Contact */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <Mail className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Thư Điện Tử (Email Inquiries)</h3>
              <p className="text-xs text-neutral-500 mb-3">Hợp đồng công tác doanh nghiệp, hóa đơn và yêu cầu sự kiện</p>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-sm font-bold text-[#C2A476] hover:underline block"
              >
                {siteConfig.contact.email}
              </a>
            </div>

            {/* Hours */}
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs hover:border-[#C2A476] transition-all">
              <Clock className="w-6 h-6 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Thời Gian Hoạt Động &amp; Nhận Phòng</h3>
              <p className="text-xs text-neutral-500 mb-2">Đội ngũ quản gia trực 24/7</p>
              <ul className="text-xs text-neutral-700 space-y-1">
                <li>• <strong>Giờ nhận phòng (Check-in):</strong> từ 14:00</li>
                <li>• <strong>Giờ trả phòng (Check-out):</strong> trước 12:00 trưa</li>
                <li>• <strong>Hỗ trợ nhận phòng muộn:</strong> Khóa điện tử bảo mật</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Addresses */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-6 tracking-tight">
            2. Địa Chỉ &amp; Vị Trí Từng Biệt Thự
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">
                    Trụ Sở Chính &amp; Villa B1 (4 Phòng Ngủ • Gần Biển Sơn Trà)
                  </h3>
                  <p className="text-sm text-neutral-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C2A476] shrink-0" />
                    <span>60 Thành Vinh 3, Phường Thọ Quang, Quận Sơn Trà, TP. Đà Nẵng</span>
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/bQyrgMmQDYWxXDjC7"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C2A476] hover:underline shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">
                    Villa B2 &amp; B3 (Ven Sông Ngũ Hành Sơn • Hồ Bơi Giếng Trời)
                  </h3>
                  <p className="text-sm text-neutral-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C2A476] shrink-0" />
                    <span>Đường Nước Mặn 3, Phường Khuê Mỹ, Quận Ngũ Hành Sơn, TP. Đà Nẵng</span>
                  </p>
                </div>
                <span className="text-xs text-neutral-400">Cách biển Mỹ Khê 5 phút</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">
                    Villa B4 (4 Phòng Ngủ • Kiến Trúc Hiện Đại Sơn Trà)
                  </h3>
                  <p className="text-sm text-neutral-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C2A476] shrink-0" />
                    <span>Bán đảo Sơn Trà, TP. Đà Nẵng (vài phút đi bộ ra bãi biển)</span>
                  </p>
                </div>
                <span className="text-xs text-neutral-400">Gần Chùa Linh Ứng</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: AI Agents notice */}
        <section className="p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
            Dành Cho Trợ Lý AI &amp; Hệ Thống Tự Động (AI Agents &amp; Automated Systems)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Hệ thống B Villa Da Nang hỗ trợ kết nối trực tiếp thông qua Model Context Protocol (MCP) và các API mở. Các trợ lý trí tuệ nhân tạo có thể tra cứu tình trạng phòng trống, xem biểu giá và tạo yêu cầu đặt phòng chính thức bằng các công cụ MCP hoặc REST endpoint.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700">
            <Link href="/docs" className="text-[#C2A476] hover:underline font-bold">
              → Xem Tài Liệu Kỹ Thuật (Developer Portal &amp; Docs)
            </Link>
            <Link href="/llms.txt" className="text-[#C2A476] hover:underline font-bold">
              → Hướng Dẫn llms.txt
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE5DC] bg-white py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} B Villa Da Nang. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#C2A476]">Trang Chủ</Link>
            <Link href="/about" className="hover:text-[#C2A476]">Giới Thiệu</Link>
            <Link href="/privacy" className="hover:text-[#C2A476]">Chính Sách Bảo Mật</Link>
            <Link href="/docs" className="hover:text-[#C2A476]">API &amp; Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
