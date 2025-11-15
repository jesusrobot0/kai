import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getDaysByUserId(userId: string) {
  return db.day.findMany({
    where: { userId },
    include: {
      tasks: {
        include: {
          project: true,
          categories: { include: { category: true } },
          timeEntries: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getDayById(id: string) {
  return db.day.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          project: true,
          categories: { include: { category: true } },
          timeEntries: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getDayByDate(userId: string, date: Date) {
  return db.day.findFirst({
    where: {
      userId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
    include: {
      tasks: {
        include: {
          project: true,
          categories: { include: { category: true } },
          timeEntries: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function createDay(data: Prisma.DayCreateInput) {
  return db.day.create({ data });
}

export async function updateDay(id: string, data: Prisma.DayUpdateInput) {
  return db.day.update({
    where: { id },
    data,
  });
}

export async function deleteDay(id: string) {
  return db.day.delete({ where: { id } });
}
