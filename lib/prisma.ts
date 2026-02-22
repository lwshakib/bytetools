/**
 * Prisma Client singleton initialization.
 * Configures the Prisma client with the appropriate database adapter and handles
 * global instance management to avoid exhausting database connections in development mode.
 */
import 'dotenv/config'; // Loads environment variables from a .env file into process.env
import { PrismaPg } from '@prisma/adapter-pg'; // Imports the PostgreSQL adapter designed for Serverless and Edge runtime compatibilities
import { PrismaClient } from '@/generated/prisma/client'; // Imports the generated Prisma client specific to this project's database schema

// Constructs the database connection string reading securely from environment variables.
const connectionString = `${process.env.DATABASE_URL}`;

// Instantiates the PostgreSQL adapter with the configured connection string.
// This is required when taking advantage of external driver-based database integration over native queries.
const adapter = new PrismaPg({ connectionString });

// Setup a global namespace object variable to hold the cached Prisma client.
// This acts to prevent "Too many connections" errors if the server performs frequent hot reloads (HMR) during development.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Uses the existing cached client if available (on hot reload), otherwise initializes a fresh PrismaClient attached to the initialized db adapter.
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// In non-production environments (like local development), it explicitly saves the newly spun up database client instance back to the global variables.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export the singleton Prisma instance to be used application-wide.
export default prisma;
