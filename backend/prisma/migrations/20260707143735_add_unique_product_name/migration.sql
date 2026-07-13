/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MANAGER';

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");
