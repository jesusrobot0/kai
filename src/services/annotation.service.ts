import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class AnnotationService {
  static async getAnnotationsByTaskId(taskId: string) {
    return db.annotation.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createAnnotation(data: Prisma.AnnotationCreateInput) {
    return db.annotation.create({ data });
  }

  static async updateAnnotation(id: string, data: Prisma.AnnotationUpdateInput) {
    return db.annotation.update({
      where: { id },
      data,
    });
  }

  static async deleteAnnotation(id: string) {
    return db.annotation.delete({ where: { id } });
  }
}
