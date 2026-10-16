import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";

import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền đặt lại cơ sở dữ liệu chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    // Rate limiting: Max 3 resets per 10 minutes per IP (Checklist #9)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`db_reset:${ip}`, 3, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Bạn đã thực hiện thao tác đặt lại quá nhiều lần. Vui lòng thử lại sau 10 phút." },
        { status: 429 }
      );
    }

    await serverStore.resetSample();
    const data = await serverStore.getData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("POST /api/bookings/reset error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi đặt lại dữ liệu." },
      { status: 500 }
    );
  }
}
