import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
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
      { error: err.message || "Failed to export bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let importData: any = null;

    if (body.syncToken && typeof body.syncToken === "string") {
      try {
        const decoded = Buffer.from(body.syncToken.trim(), "base64").toString("utf-8");
        importData = JSON.parse(decoded);
      } catch {
        return NextResponse.json(
          { error: "Invalid sync token format. Please ensure you copied the complete token." },
          { status: 400 }
        );
      }
    } else if (body.inquiries && Array.isArray(body.inquiries)) {
      importData = body;
    } else {
      return NextResponse.json(
        { error: "Missing syncToken or inquiries data" },
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
      { error: err.message || "Failed to import bookings" },
      { status: 500 }
    );
  }
}
