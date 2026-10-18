import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Strict ISO date regex (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// Phone number regex (8 to 15 digits, optional leading +)
const PHONE_REGEX = /^\+?[0-9\s.-]{8,18}$/;

export async function GET(request: NextRequest) {
  try {
    const data = await serverStore.getData();
    const isAdmin = verifyAdminSession(request);

    // If authenticated admin: return full data with customer phone/email
    // If public guest: sanitize inquiries to prevent customer data leak (Item 14)
    const sanitizedInquiries = isAdmin
      ? data.inquiries
      : data.inquiries.map((b: any) => ({
          id: b.id,
          villaId: b.villaId,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          isCheckedIn: b.isCheckedIn,
          isCheckedOut: b.isCheckedOut,
          // Hide sensitive customer info from public network requests
          guestName: "Khách Đặt",
        }));

    return NextResponse.json(
      {
        inquiries: sanitizedInquiries,
        maintenance: data.maintenance,
        prices: data.prices || {},
        usdRate: data.usdRate || 25400,
        version: data.version,
        isCloudStorage: serverStore.isCloudStorage(),
        storageType: serverStore.getStorageType(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Không thể lấy thông tin lịch đặt phòng." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate Limiting: Max 10 bookings per 10 minutes per IP (Item 9)
    const rateLimitResult = checkRateLimit(`booking_post:${ip}`, 10, 10 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng chờ ít phút trước khi thử lại." },
        { status: 429 }
      );
    }

    // Check payload size
    const rawBody = await request.text();
    if (rawBody.length > 50 * 1024) {
      return NextResponse.json(
        { error: "Dung lượng dữ liệu gửi lên vượt quá giới hạn cho phép (50KB)." },
        { status: 413 }
      );
    }

    const body = JSON.parse(rawBody);

    // Validate required fields (Item 10)
    const { villaId, checkIn, checkOut, guestName, phone, email, guests } = body;

    if (!villaId || !checkIn || !checkOut || !guestName) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (Biệt thự, Ngày nhận phòng, Ngày trả phòng, Tên khách hàng)." },
        { status: 400 }
      );
    }

    // Validate string lengths to prevent buffer / injection issues
    if (typeof guestName !== "string" || guestName.trim().length < 2 || guestName.length > 100) {
      return NextResponse.json(
        { error: "Tên khách hàng không hợp lệ (độ dài từ 2 đến 100 ký tự)." },
        { status: 400 }
      );
    }

    // Validate date format
    const cleanCheckIn = String(checkIn).slice(0, 10);
    const cleanCheckOut = String(checkOut).slice(0, 10);

    if (!DATE_REGEX.test(cleanCheckIn) || !DATE_REGEX.test(cleanCheckOut)) {
      return NextResponse.json(
        { error: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const inTime = new Date(cleanCheckIn).getTime();
    const outTime = new Date(cleanCheckOut).getTime();
    if (isNaN(inTime) || isNaN(outTime) || outTime <= inTime) {
      return NextResponse.json(
        { error: "Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm." },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone && (typeof phone !== "string" || !PHONE_REGEX.test(phone.trim()))) {
      return NextResponse.json(
        { error: "Số điện thoại liên hệ không hợp lệ." },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return NextResponse.json(
        { error: "Địa chỉ email không đúng định dạng." },
        { status: 400 }
      );
    }

    // Validate villaId against known valid villas (Checklist #10)
    const validVillaIds = ['b1-villa-4pn', 'b2-villa-4pn', 'b3-villa-2pn', 'b4-villa-4pn', 'B1', 'B2', 'B3', 'B4', 'b1', 'b2', 'b3', 'b4'];
    const cleanVillaId = String(villaId).trim();
    if (!validVillaIds.includes(cleanVillaId)) {
      return NextResponse.json(
        { error: "Mã biệt thự không hợp lệ." },
        { status: 400 }
      );
    }

    // Sanitize special requests & guest count
    const cleanSpecialRequests = typeof body.specialRequests === 'string'
      ? body.specialRequests.trim().replace(/[<>]/g, '').slice(0, 500)
      : '';
    const cleanGuests = Math.min(Math.max(1, Number(guests) || 2), 30);

    // Sanitize guest input object
    const cleanBooking = {
      ...body,
      guestName: guestName.trim().replace(/[<>]/g, ""),
      phone: phone ? String(phone).trim() : "",
      email: email ? String(email).trim().toLowerCase() : "",
      checkIn: cleanCheckIn,
      checkOut: cleanCheckOut,
      villaId: cleanVillaId,
      guests: cleanGuests,
      specialRequests: cleanSpecialRequests,
    };

    const created = await serverStore.addInquiry(cleanBooking);
    const updatedData = await serverStore.getData();
    const isAdmin = verifyAdminSession(request);

    // Prevent customer PII data leak on public POST responses (Checklist #14)
    const sanitizedInquiries = isAdmin
      ? updatedData.inquiries
      : updatedData.inquiries.map((b: any) => ({
          id: b.id,
          villaId: b.villaId,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status,
          guestName: "Khách Đặt",
        }));

    return NextResponse.json(
      {
        inquiry: created,
        allInquiries: sanitizedInquiries,
        maintenance: updatedData.maintenance,
        version: updatedData.version,
        isCloudStorage: serverStore.isCloudStorage(),
        storageType: serverStore.getStorageType(),
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Không thể tạo đơn đặt phòng do lỗi hệ thống hoặc trùng lịch." },
      { status: 409 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authorization
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Bạn cần đăng nhập trang quản trị để sửa đơn." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const updated = await serverStore.updateInquiry(id, fields);
    const updatedData = await serverStore.getData();

    return NextResponse.json(
      {
        inquiry: updated,
        allInquiries: updatedData.inquiries,
        version: updatedData.version,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("PUT /api/bookings error:", err);
    return NextResponse.json(
      { error: "Không thể cập nhật đơn đặt phòng." },
      { status: 409 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authorization
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Bạn cần đăng nhập trang quản trị để xóa đơn." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    await serverStore.deleteInquiry(id);
    const updatedData = await serverStore.getData();

    return NextResponse.json(
      {
        success: true,
        deletedIds: updatedData.deletedIds,
        allInquiries: updatedData.inquiries,
        version: updatedData.version,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DELETE /api/bookings error:", err);
    return NextResponse.json(
      { error: "Không thể xóa đơn đặt phòng." },
      { status: 500 }
    );
  }
}
