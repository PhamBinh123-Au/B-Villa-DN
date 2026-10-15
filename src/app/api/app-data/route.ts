import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const body = await request.json();
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
