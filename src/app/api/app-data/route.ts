import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: Max 60 GET requests per 5 minutes per IP (Checklist #9)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`app_data_get:${ip}`, 60, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Tần suất yêu cầu quá nhanh. Vui lòng thử lại sau." },
        { status: 429 }
      );
    }

    const data = await serverStore.getAppData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/app-data error:", err);
    return NextResponse.json(
      { error: "Không thể lấy dữ liệu cấu hình ứng dụng." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền cập nhật cấu hình hệ thống chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    // Rate limiting: Max 20 updates per 5 minutes per IP (Checklist #9)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`app_data_post:${ip}`, 20, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Bạn đã cập nhật cấu hình quá nhiều lần. Vui lòng thử lại sau 5 phút." },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu cấu hình không hợp lệ." },
        { status: 400 }
      );
    }

    const result = await serverStore.updateAppData(body);

    return NextResponse.json(
      {
        success: true,
        version: result.version,
        lastUpdated: result.lastUpdated,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("POST /api/app-data error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật dữ liệu cấu hình." },
      { status: 500 }
    );
  }
}
