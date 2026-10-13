import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

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
      { error: err.message || "Failed to fetch maintenance status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      { error: err.message || "Failed to update maintenance" },
      { status: 500 }
    );
  }
}
