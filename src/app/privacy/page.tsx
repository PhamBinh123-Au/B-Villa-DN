import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/siteConfig";
import { ArrowLeft, ShieldCheck, Lock, FileText, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật • Privacy Policy | B Villa Da Nang",
  description:
    "Chính sách bảo mật thông tin và quyền riêng tư của khách hàng tại B Villa Da Nang. Cam kết bảo mật dữ liệu đặt phòng, thanh toán và thông tin cá nhân theo quy định pháp luật.",
  alternates: {
    canonical: "https://b-villa-dn.vercel.app/privacy",
  },
  openGraph: {
    title: "Chính Sách Bảo Mật | B Villa Da Nang",
    description: "Cam kết bảo mật dữ liệu đặt phòng và quyền riêng tư khách hàng theo chuẩn quốc tế.",
    url: "https://b-villa-dn.vercel.app/privacy",
  },
};

export default function PrivacyPage() {
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
            Hỗ Trợ 24/7
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2A476]/10 text-[#8A6B3D] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>Cam Kết Quyền Riêng Tư • Privacy Policy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight mb-6">
          Chính Sách Bảo Mật Thông Tin Khách Hàng
        </h1>

        <p className="text-sm text-neutral-500 mb-8">
          Cập nhật lần cuối: Tháng 10 năm 2026 • Áp dụng cho mọi hoạt động đặt phòng và dịch vụ tại B Villa Da Nang
        </p>

        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal mb-10 border-l-4 border-[#C2A476] pl-5">
          Tại B Villa Da Nang, sự riêng tư và an toàn dữ liệu của quý khách là ưu tiên hàng đầu. Chúng tôi thiết lập chính sách bảo mật này nhằm công khai minh bạch cách thức thu thập, lưu trữ, sử dụng và bảo vệ thông tin cá nhân của quý khách khi truy cập website hoặc sử dụng dịch vụ nghỉ dưỡng của chúng tôi.
        </p>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            1. Các Thông Tin Được Thu Thập
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-3">
            Chúng tôi chỉ thu thập các thông tin thực sự cần thiết để thực hiện quy trình đặt biệt thự và cung cấp dịch vụ quản gia:
          </p>
          <ul className="space-y-2 text-sm text-neutral-700 list-disc list-inside">
            <li><strong>Thông tin liên hệ cơ bản:</strong> Họ tên, số điện thoại, địa chỉ email, quốc tịch của người đại diện đặt phòng.</li>
            <li><strong>Chi tiết kỳ nghỉ:</strong> Ngày nhận phòng (check-in), ngày trả phòng (check-out), biệt thự được chọn, số lượng người lớn và trẻ em đi cùng.</li>
            <li><strong>Yêu cầu đặc biệt:</strong> Yêu cầu sắp xếp tiệc BBQ, giờ đón sân bay, nôi trẻ em hoặc chế độ ăn uống riêng biệt.</li>
            <li><strong>Thông tin khai báo lưu trú:</strong> Hình ảnh Căn cước công dân hoặc Hộ chiếu (Passport) phục vụ công tác đăng ký tạm trú với cơ quan quản lý xuất nhập cảnh địa phương theo luật định Việt Nam.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            2. Mục Đích Sử Dụng Dữ Liệu
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-3">
            Thông tin của quý khách được sử dụng nghiêm ngặt cho các mục đích hợp pháp sau:
          </p>
          <ul className="space-y-2 text-sm text-neutral-700 list-disc list-inside">
            <li>Xác nhận đơn đặt phòng, gửi hướng dẫn nhận phòng tự động và liên hệ hỗ trợ trong suốt kỳ nghỉ.</li>
            <li>Cung cấp dịch vụ cá nhân hóa theo yêu cầu (tiệc nướng BBQ, đưa đón, thuê xe máy/ô tô).</li>
            <li>Thực hiện nghĩa vụ đăng ký lưu trú với Công an phường Thọ Quang hoặc Công an phường Khuê Mỹ theo quy định của Luật Cư trú Việt Nam.</li>
            <li>Đảm bảo an ninh, phòng chống gian lận và nâng cao chất lượng dịch vụ của B Villa Da Nang.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            3. Bảo Mật Thanh Toán &amp; Giao Dịch
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Mọi giao dịch thanh toán đặt cọc hoặc tiền phòng qua chuyển khoản ngân hàng, mã QR VietQR hoặc thẻ tín dụng đều được bảo mật. B Villa Da Nang không lưu trữ mã CVV/CVC hoặc mật khẩu tài khoản ngân hàng của khách hàng trên hệ thống máy chủ của chúng tôi.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            4. Cam Kết Không Tiết Lộ Dữ Liệu Cho Bên Thứ Ba
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Chúng tôi cam kết tuyệt đối <strong>KHÔNG</strong> bán, trao đổi, cho thuê hoặc chuyển nhượng thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị thương mại. Thông tin chỉ được cung cấp cho cơ quan nhà nước có thẩm quyền trong các trường hợp bắt buộc theo luật pháp Việt Nam.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
            5. Quyền Lợi Của Khách Hàng Đối Với Dữ Liệu Cá Nhân
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-3">
            Quý khách có toàn quyền yêu cầu:
          </p>
          <ul className="space-y-2 text-sm text-neutral-700 list-disc list-inside">
            <li>Kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân đã cung cấp.</li>
            <li>Yêu cầu xóa toàn bộ lịch sử thông tin liên hệ sau khi đã hoàn tất kỳ nghỉ và thanh toán xong.</li>
            <li>Gửi khiếu nại về bất kỳ hành vi sử dụng dữ liệu nào sai mục đích đã cam kết.</li>
          </ul>
        </section>

        {/* Contact info for privacy queries */}
        <section className="p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
            Liên Hệ Giải Quyết Thắc Mắc Về Quyền Riêng Tư
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Mọi yêu cầu liên quan đến chính sách bảo mật hoặc xóa dữ liệu cá nhân, quý khách vui lòng liên hệ trực tiếp với chúng tôi:
          </p>
          <div className="space-y-1.5 text-xs text-neutral-700 font-medium">
            <p>• <strong>Cơ sở quản lý:</strong> B Villa Da Nang</p>
            <p>• <strong>Địa chỉ tiếp nhận:</strong> 60 Thành Vinh 3, Phường Thọ Quang, Quận Sơn Trà, TP. Đà Nẵng</p>
            <p>• <strong>Email phụ trách bảo mật:</strong> kimthuy.dn22@gmail.com</p>
            <p>• <strong>Hotline hỗ trợ:</strong> +84 854 252 821</p>
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
            <Link href="/contact" className="hover:text-[#C2A476]">Liên Hệ</Link>
            <Link href="/docs" className="hover:text-[#C2A476]">API &amp; Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
