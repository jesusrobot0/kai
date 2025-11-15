import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pinDaySchema } from "@/validators";
import { DEMO_USER_ID } from "@/lib/constants";

// PATCH /api/days/[id]/pin - Pin/unpin a day
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { pinned } = pinDaySchema.parse(body);

    // TODO: Get userId from auth session
    const userId = DEMO_USER_ID;

    const day = await db.day.update({
      where: { id },
      data: {
        pinned,
        pinnedAt: pinned ? new Date() : null,
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
