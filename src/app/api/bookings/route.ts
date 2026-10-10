import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await serverStore.getData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.villaId || !body.checkIn || !body.checkOut || !body.guestName) {
      return NextResponse.json(
        { error: "Missing required booking details (villaId, checkIn, checkOut, guestName)" },
        { status: 400 }
      );
    }

    const created = await serverStore.addInquiry(body);
    const updatedData = await serverStore.getData();

    return NextResponse.json(
      {
        inquiry: created,
        allInquiries: updatedData.inquiries,
        maintenance: updatedData.maintenance,
        version: updatedData.version,
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
      { error: err.message || "Failed to create booking" },
      { status: 409 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
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
      { error: err.message || "Failed to update booking" },
      { status: 409 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
      { error: err.message || "Failed to delete booking" },
      { status: 500 }
    );
  }
}
