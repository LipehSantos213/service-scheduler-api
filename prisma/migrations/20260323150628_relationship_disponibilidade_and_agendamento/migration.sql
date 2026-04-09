/*
  Warnings:

  - Added the required column `disponibilidadeId` to the `agendamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agendamentos" ADD COLUMN     "disponibilidadeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_disponibilidadeId_fkey" FOREIGN KEY ("disponibilidadeId") REFERENCES "disponibilidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
