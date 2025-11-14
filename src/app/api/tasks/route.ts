import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/services/task.service";
import { createTaskSchema } from "@/validators";

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // TODO: Get userId from auth session
    const userId = "temp-user-id";

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
