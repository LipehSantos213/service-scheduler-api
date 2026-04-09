/*
  Warnings:

  - Changed the type of `inicio` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fim` on the `agendamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `horaInicio` on the `disponibilidades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `horaFim` on the `disponibilidades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "inicio",
ADD COLUMN     "inicio" TIME NOT NULL,
DROP COLUMN "fim",
ADD COLUMN     "fim" TIME NOT NULL;

-- AlterTable
ALTER TABLE "disponibilidades" DROP COLUMN "horaInicio",
ADD COLUMN     "horaInicio" TIME NOT NULL,
DROP COLUMN "horaFim",
ADD COLUMN     "horaFim" TIME NOT NULL;
