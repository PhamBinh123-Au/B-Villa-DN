import { NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await serverStore.resetSample();
    const data = await serverStore.getData();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset sample" },
      { status: 500 }
    );
  }
}
