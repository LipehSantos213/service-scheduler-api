/*
  Warnings:

  - Made the column `telefone` on table `usuarios` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "telefone" SET NOT NULL;
