-- AlterTable
ALTER TABLE "Ctf" ADD COLUMN     "more_info" TEXT;

ALTER TABLE "Ctf" RENAME COLUMN "date" TO "start_date";
