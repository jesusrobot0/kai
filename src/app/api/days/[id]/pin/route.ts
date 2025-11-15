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

    let pinnedOrder: number | null = null;

    if (pinned) {
      // Find the highest pinnedOrder for this user's pinned days
      const maxPinnedDay = await db.day.findFirst({
        where: {
          userId,
          pinned: true,
        },
        orderBy: {
          pinnedOrder: "desc",
        },
        select: {
          pinnedOrder: true,
        },
      });

      // Assign next sequential number (0 if no pinned days exist)
      pinnedOrder = (maxPinnedDay?.pinnedOrder ?? -1) + 1;
    }

    const day = await db.day.update({
      where: { id },
      data: {
        pinned,
        pinnedAt: pinned ? new Date() : null,
        pinnedOrder,
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
