import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền xuất dữ liệu đồng bộ chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    const data = await serverStore.getData();
    const isCloud = serverStore.isCloudStorage();

    const exportPayload = {
      inquiries: data.inquiries,
      maintenance: data.maintenance,
      deletedIds: data.deletedIds,
      version: data.version,
      timestamp: Date.now(),
      appName: "Danang Sanctuary Luxury Villas",
    };

    const syncToken = Buffer.from(JSON.stringify(exportPayload)).toString("base64");

    return NextResponse.json(
      {
        syncToken,
        data: exportPayload,
        isCloudStorage: isCloud,
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
    console.error("GET /api/bookings/sync error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi xuất dữ liệu đồng bộ." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền nhập dữ liệu đồng bộ chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    const body = await request.json();
    let importData: any = null;

    if (body.syncToken && typeof body.syncToken === "string") {
      try {
        const decoded = Buffer.from(body.syncToken.trim(), "base64").toString("utf-8");
        importData = JSON.parse(decoded);
      } catch {
        return NextResponse.json(
          { error: "Mã token đồng bộ không đúng định dạng." },
          { status: 400 }
        );
      }
    } else if (body.inquiries && Array.isArray(body.inquiries)) {
      importData = body;
    } else {
      return NextResponse.json(
        { error: "Thiếu dữ liệu đồng bộ hoặc syncToken." },
        { status: 400 }
      );
    }

    const replaceAll = Boolean(body.replaceAll);
    const updated = await serverStore.importData(importData, replaceAll);

    return NextResponse.json(
      {
        success: true,
        importedCount: updated.inquiries.length,
        inquiries: updated.inquiries,
        maintenance: updated.maintenance,
        version: updated.version,
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
    console.error("POST /api/bookings/sync error:", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi nhập dữ liệu đồng bộ." },
      { status: 500 }
    );
  }
}
