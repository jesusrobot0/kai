import { NextRequest, NextResponse } from "next/server";
import { updateDay, deleteDay } from "@/services/day.service";
import { updateDaySchema } from "@/validators";

// PATCH /api/days/[id] - Update a day
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = updateDaySchema.parse(body);

    const day = await updateDay(id, validatedData);

    return NextResponse.json({ success: true, data: day });
  } catch (error) {
    console.error("Error updating day:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update day" },
      { status: 400 }
    );
  }
}

// DELETE /api/days/[id] - Delete a day
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDay(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting day:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete day" },
      { status: 500 }
    );
  }
}
