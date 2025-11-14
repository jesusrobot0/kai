import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class ProjectService {
  static async getProjectsByUserId(userId: string) {
    return db.project.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  static async getProjectById(id: string) {
    return db.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            day: true,
          },
        },
      },
    });
  }

  static async createProject(data: Prisma.ProjectCreateInput) {
    return db.project.create({ data });
  }

  static async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    return db.project.update({
      where: { id },
      data,
    });
  }

  static async deleteProject(id: string) {
    return db.project.delete({ where: { id } });
  }
}
