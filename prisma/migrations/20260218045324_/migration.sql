/*
  Warnings:

  - You are about to drop the column `variant` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "variant",
ADD COLUMN     "image" TEXT;
