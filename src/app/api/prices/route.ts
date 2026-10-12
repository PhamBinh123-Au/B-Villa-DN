import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await serverStore.getPrices();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("GET /api/prices error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch prices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices, villaId, priceVnd, usdRate } = body;

    let updatedPrices: Record<string, number> = {};
    if (prices && typeof prices === "object") {
      updatedPrices = prices;
    } else if (villaId && typeof priceVnd === "number") {
      updatedPrices = { [villaId]: priceVnd };
    }

    const result = await serverStore.setPrices(updatedPrices, typeof usdRate === "number" ? usdRate : undefined);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    console.error("POST /api/prices error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update prices" },
      { status: 500 }
    );
  }
}
