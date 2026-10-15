import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const maintenance = await serverStore.getMaintenanceMap();
    return NextResponse.json(maintenance, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/maintenance error:", err);
    return NextResponse.json(
      { error: "Không thể lấy thông tin bảo trì biệt thự." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền cập nhật trạng thái bảo trì chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { villaId, isMaintenance, reason, startDate, endDate } = body;

    if (!villaId) {
      return NextResponse.json({ error: "Missing villaId" }, { status: 400 });
    }

    const updatedInfo = await serverStore.setMaintenance(
      villaId,
      Boolean(isMaintenance),
      reason,
      startDate,
      endDate
    );
    const updatedMap = await serverStore.getMaintenanceMap();

    return NextResponse.json(
      {
        maintenance: updatedInfo,
        allMaintenance: updatedMap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("POST /api/maintenance error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi cập nhật trạng thái bảo trì." },
      { status: 500 }
    );
  }
}
