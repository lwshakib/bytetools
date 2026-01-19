-- CreateTable
CREATE TABLE "saved_qr_code" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fgColor" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_qr_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_qr_code_userId_idx" ON "saved_qr_code"("userId");

-- AddForeignKey
ALTER TABLE "saved_qr_code" ADD CONSTRAINT "saved_qr_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
