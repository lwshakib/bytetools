/**
 * Better-Auth server-side configuration.
 * Handles database integration via Prisma and configures authentication providers.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  // Use Prisma as the database adapter to persist user accounts, sessions, and social connections.
  database: prismaAdapter(prisma, {
    provider: "postgresql", // Matches the Prisma provider type in schema.prisma.
  }),
  // Enable standard email and password authentication.
  emailAndPassword: {
    enabled: true,
  },
  // Configure OAuth providers (e.g., Google).
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  // Allow multiple social accounts to be linked to the same user profile.
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
