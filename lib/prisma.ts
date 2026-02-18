/**
 * Prisma Client singleton initialization.
 * Configures the Prisma client with the appropriate database adapter and handles
 * global instance management to avoid exhausting database connections in development.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Database connection string from environment variables.
const connectionString = `${process.env.DATABASE_URL}`;

// Use the PostgreSQL adapter for Prisma.
const adapter = new PrismaPg({ connectionString });

// Prevention of multiple Prisma instances in development due to Next.js Hot Module Replacement (HMR).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
