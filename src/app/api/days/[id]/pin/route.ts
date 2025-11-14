import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pinDaySchema } from "@/validators";

// PATCH /api/days/[id]/pin - Pin/unpin a day
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { pinned } = pinDaySchema.parse(body);

    const day = await db.day.update({
      where: { id },
      data: {
        pinned,
        pinnedAt: pinned ? new Date() : null,
        // Set pinnedOrder to current timestamp for initial ordering
        pinnedOrder: pinned ? Date.now() : null,
      },
    });

    return NextResponse.json({ success: true, data: day });
  } catch (error) {
    console.error("Error pinning/unpinning day:", error);
    return NextResponse.json(
      { success: false, error: "Failed to pin/unpin day" },
      { status: 400 }
    );
  }
}
