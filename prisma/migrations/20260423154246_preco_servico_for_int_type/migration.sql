/*
  Warnings:

  - You are about to alter the column `preco` on the `servicos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "preco" SET DATA TYPE INTEGER;
