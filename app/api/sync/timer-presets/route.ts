/**
 * API route for synchronizing custom timer presets.
 * Handles fetching all presets and performing a destructive full sync (replace all) operation.
 */
import { auth } from '@/lib/auth'; // Core better-auth backend validation client
import prisma from '@/lib/prisma'; // Global Prisma ORM instance
import { NextResponse } from 'next/server'; // Next.js uniform response builder
import { headers } from 'next/headers'; // Next.js API for dynamically parsing request headers

/**
 * GET Handler
 * Retrieves all saved timer presets explicitly tied to the authenticated user.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const presets = await prisma.timerPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    presets.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
    }))
  );
}

/**
 * POST Handler
 * Synchronizes timer presets by replacing the entire set of user presets systematically.
 * Uses a $transaction block to ensure atomic deletion and recreation, avoiding dropped states.
 */
export async function POST(req: Request) {
  // Extract and parse session state synchronously from the incoming request's cookie headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await req.json();

  // Database Execution Block
  // Perform a destructive sync: wipe existing presets mapped to the user and insert the new array.
  await prisma.$transaction([
    prisma.timerPreset.deleteMany({ where: { userId: session.user.id } }), // Purge Phase
    prisma.timerPreset.createMany({ // Seed Phase
      data: items.map((it: { name: string; duration: number }) => ({
        userId: session.user.id, // Re-attach newly synced rows back to User primary ID securely
        name: it.name,
        duration: it.duration,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
