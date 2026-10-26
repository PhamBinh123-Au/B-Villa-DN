"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { HelpCircle, ChevronDown, Clock, Waves, Utensils, Compass, ShieldCheck, Terminal, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  icon: React.ReactNode;
  questionVi: string;
  questionEn: string;
  answerVi: string;
  answerEn: string;
}

const FAQS: FaqItem[] = [
  {
    icon: <Clock className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Giờ nhận phòng (Check-in) và trả phòng (Check-out) tại B Villa Da Nang quy định như thế nào?",
    questionEn: "What are the check-in and check-out times at B Villa Da Nang?",
    answerVi:
      "Thời gian nhận phòng tiêu chuẩn bắt đầu từ 14:00 và thời gian trả phòng trước 12:00 trưa hôm sau. Chúng tôi hỗ trợ nhận phòng tự động 24/7 thông qua hệ thống khóa số bảo mật hoặc có quản gia đón tiếp trực tiếp tại biệt thự. Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng trễ xin vui lòng liên hệ trước với quản gia qua Hotline / Zalo: 0854 252 821 để được sắp xếp chu đáo tùy theo tình trạng phòng trống thực tế.",
    answerEn:
      "Standard check-in begins at 14:00 (2:00 PM) and check-out is before 12:00 (12:00 PM). We support seamless 24/7 self check-in via smart electronic keypads as well as personal greeting by our concierge. Early check-in or late check-out can be arranged upon request depending on availability.",
  },
  {
    icon: <Waves className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Hồ bơi tại các biệt thự là hồ bơi riêng biệt lập 100% hay dùng chung?",
    questionEn: "Are the swimming pools completely private or shared?",
    answerVi:
      "Tất cả 4 biệt thự trong bộ sưu tập B Villa Da Nang (B1, B2, B3, B4) đều sở hữu hồ bơi riêng biệt lập 100%, nằm trọn vẹn trong khuôn viên tường rào khép kín của từng căn. Hồ bơi được vận hành hệ thống lọc nước tuần hoàn hiện đại, khử khuẩn an toàn hàng ngày và đảm bảo sự riêng tư tuyệt đối cho gia đình bạn thỏa sức bơi lội, thư giãn và chụp ảnh kỷ niệm mà không bị bất kỳ ai quấy rầy.",
    answerEn:
      "All 4 residences in our collection (B1, B2, B3, B4) feature 100% private swimming pools located exclusively within your gated property. Pools operate on continuous modern filtration systems with daily hygiene checks to ensure pristine water quality and complete discretion.",
  },
  {
    icon: <Utensils className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Biệt thự có sẵn gian bếp nấu ăn đầy đủ và bếp nướng than BBQ sân vườn không?",
    questionEn: "Are kitchens fully equipped and is a garden BBQ grill provided?",
    answerVi:
      "Mỗi biệt thự đều có gian bếp rộng rãi được trang bị đầy đủ tủ lạnh lớn hai cánh, bếp từ cao cấp, lò vi sóng, ấm đun nước siêu tốc, nồi cơm điện và trọn bộ bát đĩa, ly cốc, dụng cụ nấu ăn hiện đại. Ngoài ra, chúng tôi luôn chuẩn bị sẵn bếp nướng than BBQ ngoài trời sân vườn phục vụ các bữa tiệc nướng ấm cúng cùng người thân. Đội ngũ quản gia sẵn sàng hỗ trợ chuẩn bị than, vỉ nướng, gia vị cơ bản hoặc kết nối nguồn hải sản tươi sống từ chợ cá địa phương theo giá gốc.",
    answerEn:
      "Every residence provides a gourmet kitchen equipped with large refrigerator, induction stovetop, microwave, kettle, rice cooker, and complete cookware and dinnerware. Outdoor charcoal barbecue grills are ready for your alfresco feasts. Our concierge can also arrange charcoal and fresh local seafood upon request.",
  },
  {
    icon: <Compass className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Vị trí của B Villa Da Nang cách bãi biển và các danh thắng nổi tiếng bao xa?",
    questionEn: "How close are the villas to the beaches and major Da Nang attractions?",
    answerVi:
      "Các biệt thự tọa lạc tại các vị trí đắc địa ven biển: Villa B1 và B4 tại đường Thành Vinh 3 (Bán đảo Sơn Trà), chỉ cách bãi biển Sơn Trà vài bước chân, cách Chùa Linh Ứng 5 phút và cách trung tâm thành phố 10 phút. Villa B2 và B3 tọa lạc tại đường Nước Mặn 3 (Ngũ Hành Sơn), nằm ven dòng sông thanh bình, cách bãi biển Mỹ Khê chỉ 5 phút lái xe, cách danh thắng Ngũ Hành Sơn 3 phút và cách Phố cổ Hội An 20 phút di chuyển.",
    answerEn:
      "Our properties enjoy prime coastal enclaves: B1 & B4 in Son Tra Peninsula are steps from the beach and 5 minutes from Linh Ung Pagoda. B2 & B3 in Ngu Hanh Son are located on a peaceful riverside just 5 minutes from My Khe Beach, 3 minutes from Marble Mountains, and 20 minutes from Hoi An Ancient Town.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Quy định về số lượng khách tối đa và chính sách trẻ em được áp dụng thế nào?",
    questionEn: "What is the maximum guest occupancy and extra guest policy?",
    answerVi:
      "Biệt thự 4 phòng ngủ (B1, B2, B4) tiêu chuẩn dành cho 8 người lớn và tối đa 10 khách (bao gồm 2 trẻ em). Biệt thự 2 phòng ngủ (B3) tiêu chuẩn dành cho 4 người lớn và tối đa 6 khách (bao gồm 2 trẻ em). Trẻ em dưới 6 tuổi được miễn phí hoàn toàn khi ngủ chung giường với gia đình. Khách phát sinh thêm xin vui lòng thông báo trước khi nhận phòng để quản gia chuẩn bị nệm phụ cao cấp (extra bed), khăn tắm và đồ dùng tiện nghi đầy đủ.",
    answerEn:
      "Our 4-bedroom villas (B1, B2, B4) comfortably accommodate 8 adults and up to 10 guests total (including children). The 2-bedroom villa (B3) accommodates 4 adults and up to 6 guests total. Children under 6 stay complimentary when sharing existing beds with parents. Extra guests can be accommodated with rollaway bedding upon advance notice.",
  },
  {
    icon: <Sparkles className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Dịch vụ dọn dẹp buồng phòng và hỗ trợ quản gia tại chỗ hoạt động ra sao?",
    questionEn: "How does housekeeping and on-site concierge assistance work?",
    answerVi:
      "Giá thuê biệt thự nguyên căn đã bao gồm dịch vụ dọn phòng hàng ngày (housekeeping) tinh tươm, thay mới khăn tắm cao cấp, bổ sung nước suối tinh khiết và tiện nghi phòng tắm chuẩn resort. Đội ngũ quản gia túc trực hỗ trợ 24/7 qua điện thoại và có mặt nhanh chóng để hỗ trợ mọi phát sinh về kỹ thuật, hướng dẫn đường đi, đặt xe đưa đón sân bay quốc tế Đà Nẵng và thuê xe máy tự lái.",
    answerEn:
      "Daily professional housekeeping is included in the nightly rental rate, featuring fresh towels, complimentary bottled water, and luxury spa bath amenities. Our dedicated concierge team remains on call 24/7 to assist with airport transportation, motorbike rentals, grocery delivery, and restaurant reservations.",
  },
  {
    icon: <MapPin className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Quy trình thanh toán đặt cọc và chính sách hủy phòng linh hoạt ra sao?",
    questionEn: "What are the deposit payment procedures and cancellation policies?",
    answerVi:
      "Để đảm bảo giữ biệt thự cho kỳ nghỉ của quý khách, chúng tôi áp dụng chính sách đặt cọc 50% tổng giá trị tiền phòng qua hình thức chuyển khoản ngân hàng hoặc quét mã QR VietQR bảo mật. Phần còn lại được thanh toán khi quý khách nhận phòng tại biệt thự. Chúng tôi hỗ trợ dời lịch miễn phí khi quý khách thông báo trước ít nhất 7 ngày so với ngày nhận phòng tiêu chuẩn.",
    answerEn:
      "To confirm your reservation, a standard 50% deposit is required via bank transfer or secure VietQR. The remaining balance is payable upon check-in. Free date rescheduling is accommodated when requested at least 7 days prior to your scheduled arrival.",
  },
  {
    icon: <Terminal className="w-5 h-5 text-[#C2A476]" />,
    questionVi: "Các trợ lý AI và nhà phát triển phần mềm có thể kết nối với B Villa Da Nang bằng cách nào?",
    questionEn: "How can AI agents and developers programmatically integrate with B Villa Da Nang?",
    answerVi:
      "B Villa Da Nang hỗ trợ tiêu chuẩn Model Context Protocol (MCP) tại endpoint /.well-known/mcp, cho phép các mô hình AI như Claude, ChatGPT và LangChain gọi trực tiếp các công cụ kiểm tra phòng trống (check_availability), tính giá (calculate_price) và lấy thông tin villa (list_villas). Ngoài ra, chúng tôi cung cấp đặc tả OpenAPI 3.1 tại /openapi.json, file hướng dẫn llms.txt và cơ chế thương lượng nội dung Markdown (Accept: text/markdown) trên toàn bộ trang web.",
    answerEn:
      "We support the Model Context Protocol (MCP) at /.well-known/mcp, enabling Claude, ChatGPT, and automated agents to call live tools for villa discovery, availability, and pricing. We also provide OpenAPI 3.1 specifications at /openapi.json, standardized llms.txt guidance, and full Markdown content negotiation (Accept: text/markdown) across the platform.",
  },
];

export const FaqSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section id="faq" className="py-24 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C2A476]/10 text-[#8A6B3D] text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <HelpCircle className="w-3.5 h-3.5 text-[#C2A476]" />
          <span>{language === "vi" ? "Cẩm Nang & Giải Đáp" : "Essential Guide & FAQs"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
          {language === "vi"
            ? "Câu Hỏi Thường Gặp & Cẩm Nang Nghỉ Dưỡng"
            : "Frequently Asked Questions & Sanctuary Guide"}
        </h2>
        <div className="w-16 h-1 bg-[#C2A476] rounded-full mx-auto mb-5" />
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
          {language === "vi"
            ? "Mọi thông tin cần thiết về dịch vụ nhận phòng, hồ bơi riêng biệt lập, tiệc nướng BBQ và chính sách lưu trú tại B Villa Da Nang."
            : "Everything you need to know about our private swimming pools, check-in logistics, barbecue setups, and bespoke concierge hospitality."}
        </p>
      </div>

      {/* Accessible native details/summary accordion - 100% crawlable & functional without JavaScript */}
      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <details
            key={index}
            open={index < 2}
            className="group rounded-2xl bg-white border border-[#EAE5DC] overflow-hidden transition-all duration-300 hover:border-[#C2A476] shadow-2xs"
          >
            <summary className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-hidden list-none">
              <div className="flex items-start gap-3.5">
                <span className="shrink-0 mt-0.5">{faq.icon}</span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                  {language === "vi" ? faq.questionVi : faq.questionEn}
                </h3>
              </div>
              <div className="w-7 h-7 rounded-full bg-neutral-100 group-open:bg-[#C2A476] group-open:text-white group-open:rotate-180 text-neutral-500 flex items-center justify-center shrink-0 transition-transform duration-300">
                <ChevronDown className="w-4 h-4" />
              </div>
            </summary>
            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#F2EEE9] text-sm text-neutral-600 leading-relaxed pl-12">
              <p>{language === "vi" ? faq.answerVi : faq.answerEn}</p>
            </div>
          </details>
        ))}
      </div>

      {/* Da Nang Regional Architecture & Hospitality Guide (Semantic Raw Content) */}
      <div className="mt-14 p-8 rounded-3xl bg-white border border-[#EAE5DC] shadow-xs">
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 tracking-tight">
          {language === "vi"
            ? "Cẩm Nang Trải Nghiệm Biệt Thự Nghỉ Dưỡng Tại Đà Nẵng"
            : "Da Nang Villa Living & Architectural Heritage Guide"}
        </h3>
        <p className="text-sm text-neutral-700 leading-relaxed mb-4">
          {language === "vi"
            ? "Đà Nẵng được vinh danh là một trong những thành phố biển đáng sống và hấp dẫn nhất châu Á, sở hữu đường bờ biển dài cát trắng mịn, bán đảo Sơn Trà hoang sơ hùng vĩ và dòng sông Hàn thơ mộng. Khi lựa chọn nghỉ dưỡng tại B Villa Da Nang, quý khách không chỉ trải nghiệm một chốn nghỉ ngơi sang trọng mà còn được tận hưởng trọn vẹn nhịp sống biển thư thái và lòng hiếu khách chân thành của người dân xứ Quảng."
            : "Da Nang is celebrated as one of Asia's most livable coastal cities, boasting pristine white-sand shorelines, the majestic Son Tra Peninsula nature reserve, and the poetic Han River. Staying at B Villa Da Nang grants you an architectural sanctuary combined with the authentic warmth and culinary richness of Central Vietnam."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Bán Đảo Sơn Trà</h4>
            <p>Khí hậu mát mẻ quanh năm, rừng nguyên sinh đa dạng sinh học và các bãi biển yên bình ít sóng.</p>
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Ngũ Hành Sơn Ven Sông</h4>
            <p>Vùng đất của 5 ngọn núi đá cẩm thạch tâm linh, gần biển Mỹ Khê và trục đường di sản tới Hội An.</p>
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">Dịch Vụ Đặc Quyền</h4>
            <p>Quản gia 24/7, xe đưa đón sân bay, nướng BBQ sân vườn riêng và hồ bơi tuần hoàn nước sạch.</p>
          </div>
        </div>
      </div>

      {/* Quick Agent & Contact Links Bar */}
      <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#FAF6EE] border border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#C2A476] font-bold block mb-1">
            {language === "vi" ? "Cần Thêm Thông Tin?" : "Need Personalized Guidance?"}
          </span>
          <p className="text-sm font-semibold text-neutral-900">
            {language === "vi"
              ? "Liên hệ trực tiếp quản gia qua Hotline / Zalo: 0854 252 821 hoặc tra cứu tài liệu nhà phát triển."
              : "Contact our dedicated concierge at +84 854 252 821 or explore developer specifications."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-full bg-[#14171A] hover:bg-[#C2A476] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            {language === "vi" ? "Liên Hệ Ngay" : "Contact Host"}
          </Link>
          <Link
            href="/docs"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 border border-[#EAE5DC] text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
          >
            {language === "vi" ? "Tài Liệu API" : "API Docs"}
          </Link>
        </div>
      </div>
    </section>
  );
};
