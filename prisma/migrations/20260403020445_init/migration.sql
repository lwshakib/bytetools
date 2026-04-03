-- CreateTable
CREATE TABLE "timer_preset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timer_preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timer_preset_userId_idx" ON "timer_preset"("userId");

-- AddForeignKey
ALTER TABLE "timer_preset" ADD CONSTRAINT "timer_preset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
