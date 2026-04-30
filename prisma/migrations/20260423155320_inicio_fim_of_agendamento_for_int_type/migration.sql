/*
  Warnings:

  - Changed the type of `inicio` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fim` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "inicio",
ADD COLUMN     "inicio" INTEGER NOT NULL,
DROP COLUMN "fim",
ADD COLUMN     "fim" INTEGER NOT NULL;
