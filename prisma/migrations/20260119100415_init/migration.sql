-- CreateTable
CREATE TABLE "saved_password" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jwt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "secret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jwt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_password_userId_idx" ON "saved_password"("userId");

-- CreateIndex
CREATE INDEX "saved_jwt_userId_idx" ON "saved_jwt"("userId");

-- AddForeignKey
ALTER TABLE "saved_password" ADD CONSTRAINT "saved_password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jwt" ADD CONSTRAINT "saved_jwt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
