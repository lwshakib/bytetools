-- AlterTable
ALTER TABLE "routine" ADD COLUMN     "selectedDate" INTEGER,
ADD COLUMN     "selectedDays" INTEGER[];

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "routineId" TEXT;
