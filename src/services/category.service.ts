import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class CategoryService {
  static async getCategoriesByUserId(userId: string) {
    return db.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  static async getCategoryById(id: string) {
    return db.category.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            task: {
              include: {
                day: true,
              },
            },
          },
        },
      },
    });
  }

  static async createCategory(data: Prisma.CategoryCreateInput) {
    return db.category.create({ data });
  }

  static async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return db.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    return db.category.delete({ where: { id } });
  }
}
