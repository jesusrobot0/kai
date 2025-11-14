import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class TimeEntryService {
  static async getTimeEntriesByTaskId(taskId: string) {
    return db.timeEntry.findMany({
      where: { taskId },
      orderBy: { startTime: "desc" },
    });
  }

  static async getActiveTimeEntry(userId: string) {
    return db.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        task: true,
      },
    });
  }

  static async createTimeEntry(data: Prisma.TimeEntryCreateInput) {
    return db.timeEntry.create({
      data,
      include: {
        task: true,
      },
    });
  }

  static async stopTimeEntry(id: string) {
    const endTime = new Date();
    const timeEntry = await db.timeEntry.findUnique({ where: { id } });

    if (!timeEntry) throw new Error("Time entry not found");
    if (timeEntry.endTime) throw new Error("Time entry already stopped");

    const duration = Math.floor(
      (endTime.getTime() - timeEntry.startTime.getTime()) / 1000
    );

    return db.timeEntry.update({
      where: { id },
      data: {
        endTime,
        duration,
      },
    });
  }

  static async deleteTimeEntry(id: string) {
    return db.timeEntry.delete({ where: { id } });
  }

  static async getTotalTimeForTask(taskId: string): Promise<number> {
    const entries = await db.timeEntry.findMany({
      where: { taskId },
    });

    return entries.reduce((total, entry) => {
      if (entry.duration) {
        return total + entry.duration;
      }
      if (entry.endTime) {
        const duration = Math.floor(
          (entry.endTime.getTime() - entry.startTime.getTime()) / 1000
        );
        return total + duration;
      }
      return total;
    }, 0);
  }
}
