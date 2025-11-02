/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Adiciona coluna com valor padrão temporário, depois remove o padrão
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'change_me_123456';

-- Remove o valor padrão para novos registros (registros existentes mantêm o valor)
ALTER TABLE "users" ALTER COLUMN "password" DROP DEFAULT;
