import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { verifyAdminSession } from "@/lib/serverAuth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

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
      { error: "Không thể lấy thông tin giá phòng." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Quyền cập nhật giá phòng chỉ dành cho Quản Trị Viên." },
        { status: 401 }
      );
    }

    // Rate limiting: Max 30 updates per 5 minutes per IP (Checklist #9)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`prices_update:${ip}`, 30, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Bạn đã cập nhật giá quá nhiều lần liên tiếp. Vui lòng thử lại sau ít phút." },
        { status: 429 }
      );
    }

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
      { error: "Lỗi hệ thống khi cập nhật giá phòng." },
      { status: 500 }
    );
  }
}
