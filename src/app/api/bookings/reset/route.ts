import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền đặt lại cơ sở dữ liệu chỉ dành cho Quản Trị Viên." },
        { status: 401 }
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
