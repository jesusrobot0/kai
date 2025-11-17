/*
  Warnings:

  - You are about to alter the column `order` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "order" SET DATA TYPE INTEGER;
