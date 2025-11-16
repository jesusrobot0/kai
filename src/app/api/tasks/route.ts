import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/services/task.service";
import { createTaskSchema } from "@/validators";
import { DEMO_USER_ID } from "@/lib/constants";

// GET /api/tasks - Get tasks by dayId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dayId = searchParams.get("dayId");

    if (!dayId) {
      return NextResponse.json(
        { success: false, error: "dayId query parameter is required" },
        { status: 400 }
      );
    }

    const tasks = await TaskService.getTasksByDayId(dayId);

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Get userId from auth session
    const userId = DEMO_USER_ID;

    const validatedData = createTaskSchema.parse({ ...body, userId });

    const task = await TaskService.createTask({
      title: validatedData.title,
      order: validatedData.order,
      user: { connect: { id: validatedData.userId } },
      day: { connect: { id: validatedData.dayId } },
      ...(validatedData.projectId && {
        project: { connect: { id: validatedData.projectId } },
      }),
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 400 }
    );
  }
}
