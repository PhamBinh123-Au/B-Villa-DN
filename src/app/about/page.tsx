import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { ArrowLeft, Sparkles, ShieldCheck, Waves, Compass, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Về Chúng Tôi • Kiến Trúc & Triết Lý Nghỉ Dưỡng | B Villa Da Nang",
  description:
    "Tìm hiểu về B Villa Da Nang - Bộ sưu tập biệt thự hồ bơi riêng tư đẳng cấp tại Sơn Trà và Ngũ Hành Sơn, Đà Nẵng. Khám phá triết lý kiến trúc tối giản hiện đại và dịch vụ quản gia tận tâm.",
  alternates: {
    canonical: "https://b-villa-dn.vercel.app/about",
  },
  openGraph: {
    title: "Về Chúng Tôi | B Villa Da Nang",
    description: "Bộ sưu tập biệt thự hồ bơi riêng tư đẳng cấp tại Sơn Trà & Ngũ Hành Sơn, Đà Nẵng.",
    url: "https://b-villa-dn.vercel.app/about",
  },
};

export default function AboutPage() {
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
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#14171A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C2A476] transition-colors"
          >
            Liên Hệ Đặt Phòng
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2A476]/10 text-[#8A6B3D] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>Về Chúng Tôi • About Us</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
          B Villa Da Nang • Không Gian Nghỉ Dưỡng Biệt Lập Bên Bờ Biển Đà Nẵng
        </h1>

        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal mb-10 border-l-4 border-[#C2A476] pl-5">
          B Villa Da Nang là thương hiệu nghỉ dưỡng cao cấp tư nhân, được sáng lập với khát vọng kiến tạo những không gian tĩnh tại tuyệt đối dành cho các gia đình, nhóm bạn thân và các đoàn khách công tác muốn tìm kiếm sự riêng tư hoàn hảo giữa lòng thành phố biển đáng sống nhất Việt Nam.
        </p>

        {/* Section 1 */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-4 tracking-tight">
            1. Triết Lý Kiến Trúc: Tối Giản, Ánh Sáng &amp; Sự Bình Yên
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
            Khác biệt hoàn toàn với mô hình khách sạn nhiều tầng với sảnh chung đông đúc, B Villa Da Nang lựa chọn kiến trúc biệt thự thấp tầng với hồ bơi riêng tư tách biệt. Toàn bộ thiết kế lấy cảm hứng từ phong cách kiến trúc ven biển đương đại kết hợp cùng vật liệu tự nhiên như gỗ sồi ấm áp, đá tự nhiên và mảng xanh nhiệt đới.
          </p>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Hệ thống cửa kính chạm trần rộng mở cho phép ánh sáng tự nhiên tràn ngập khắp phòng khách, phòng bếp và khu vực nghỉ ngơi. Hồ bơi riêng và sân vườn nhiệt đới tạo nên một ốc đảo biệt lập, nơi quý khách có thể hòa mình vào làn nước mát lành hay tổ chức tiệc BBQ gia đình mà không bị quấy rầy.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-4 tracking-tight">
            2. Vị Trí Chiến Lược Tại Đà Nẵng
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
            Bộ sưu tập 4 biệt thự của chúng tôi tọa lạc tại 2 vị trí phong thủy đắc địa bậc nhất Đà Nẵng:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs">
              <Compass className="w-5 h-5 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Bán Đảo Sơn Trà (Villa B1 &amp; B4)</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Tọa lạc tại Thành Vinh 3, Thọ Quang, cách bãi biển Sơn Trà chỉ vài bước chân. Không khí trong lành ven biển, gần Chùa Linh Ứng và rừng nguyên sinh Sơn Trà.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#EAE5DC] shadow-xs">
              <Waves className="w-5 h-5 text-[#C2A476] mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Ven Sông Ngũ Hành Sơn (Villa B2 &amp; B3)</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Tọa lạc tại Nước Mặn 3, Khuê Mỹ, nằm nép mình bên dòng sông êm đềm, thuận tiện di chuyển tới danh thắng Ngũ Hành Sơn, bãi biển Mỹ Khê và phố cổ Hội An.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-4 tracking-tight">
            3. Tiêu Chuẩn Phục Vụ &amp; Dịch Vụ Quản Gia Trực Tiếp
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
            Chúng tôi hiểu rằng một kỳ nghỉ trọn vẹn đòi hỏi sự chăm sóc chu đáo đến từng chi tiết nhỏ. Đội ngũ quản gia tận tâm của B Villa Da Nang luôn sẵn sàng hỗ trợ quý khách:
          </p>
          <ul className="space-y-3 text-sm text-neutral-700 list-disc list-inside mb-4">
            <li><strong>Nhận phòng linh hoạt:</strong> Hỗ trợ nhận phòng tự động qua khóa thông minh bảo mật hoặc đón tiếp trực tiếp tại biệt thự.</li>
            <li><strong>Tiêu chuẩn vệ sinh 5 sao:</strong> Thay mới toàn bộ khăn tắm, ga trải giường cao cấp và khử khuẩn hồ bơi định kỳ trước mỗi lượt khách.</li>
            <li><strong>Dịch vụ hỗ trợ tại chỗ:</strong> Sắp xếp than nướng BBQ, dụng cụ làm tiệc, hỗ trợ đặt đầu bếp riêng hoặc mua sắm thực phẩm tươi ngon tại chợ địa phương.</li>
            <li><strong>Hỗ trợ lữ hành:</strong> Đưa đón sân bay quốc tế Đà Nẵng, thuê xe máy/ô tô tự lái và tư vấn lịch trình khám phá Đà Nẵng - Hội An - Bà Nà Hills.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
            Thông Tin Pháp Lý &amp; Cam Kết Chất Lượng
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            B Villa Da Nang hoạt động theo đúng quy định pháp luật Việt Nam về cơ sở lưu trú du lịch. Chúng tôi cam kết bảo vệ thông tin cá nhân của quý khách hàng, cung cấp hợp đồng/xác nhận đặt phòng minh bạch và hóa đơn hợp lệ khi có yêu cầu.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cơ Sở Lưu Trú Đạt Chuẩn
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              Hỗ Trợ Khách Hàng 24/7
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE5DC] bg-white py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} B Villa Da Nang. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#C2A476]">Trang Chủ</Link>
            <Link href="/contact" className="hover:text-[#C2A476]">Liên Hệ</Link>
            <Link href="/privacy" className="hover:text-[#C2A476]">Chính Sách Bảo Mật</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
