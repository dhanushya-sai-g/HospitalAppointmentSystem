-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'HOSPITAL_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hospitalId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
