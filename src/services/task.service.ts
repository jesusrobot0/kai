import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class TaskService {
  static async getTasksByDayId(dayId: string) {
    return db.task.findMany({
      where: { dayId },
      include: {
        project: true,
        categories: { include: { category: true } },
        timeEntries: true,
        annotations: true,
      },
      orderBy: { order: "asc" },
    });
  }

  static async getTaskById(id: string) {
    return db.task.findUnique({
      where: { id },
      include: {
        project: true,
        categories: { include: { category: true } },
        timeEntries: true,
        annotations: true,
      },
    });
  }

  static async createTask(data: Prisma.TaskCreateInput) {
    return db.task.create({
      data,
      include: {
        project: true,
        categories: { include: { category: true } },
      },
    });
  }

  static async updateTask(id: string, data: Prisma.TaskUpdateInput) {
    return db.task.update({
      where: { id },
      data,
      include: {
        project: true,
        categories: { include: { category: true } },
      },
    });
  }

  static async deleteTask(id: string) {
    return db.task.delete({ where: { id } });
  }

  static async toggleTaskComplete(id: string) {
    const task = await db.task.findUnique({ where: { id } });
    if (!task) throw new Error("Task not found");

    return db.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }

  static async addCategoryToTask(taskId: string, categoryId: string) {
    return db.taskCategory.create({
      data: { taskId, categoryId },
    });
  }

  static async removeCategoryFromTask(taskId: string, categoryId: string) {
    return db.taskCategory.delete({
      where: {
        taskId_categoryId: { taskId, categoryId },
      },
    });
  }
}
