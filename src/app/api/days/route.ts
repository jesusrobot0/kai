import { NextRequest, NextResponse } from "next/server";
import { getDaysByUserId, createDay } from "@/services/day.service";
import { createDaySchema } from "@/validators";
import { DEMO_USER_ID } from "@/lib/constants";

// GET /api/days - Get all days for a user
export async function GET(req: NextRequest) {
  try {
    // TODO: Get userId from auth session
    const userId = DEMO_USER_ID;

    const days = await getDaysByUserId(userId);
    return NextResponse.json({ success: true, data: days });
  } catch (error) {
    console.error("Error fetching days:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch days" },
      { status: 500 }
    );
  }
}

// POST /api/days - Create a new day
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Get userId from auth session
    const userId = DEMO_USER_ID;

    const validatedData = createDaySchema.parse({ ...body, userId });

    const day = await createDay({
      date: validatedData.date,
      title: validatedData.title,
      user: { connect: { id: validatedData.userId } },
    });

    return NextResponse.json({ success: true, data: day }, { status: 201 });
  } catch (error) {
    console.error("Error creating day:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create day" },
      { status: 400 }
    );
  }
}
