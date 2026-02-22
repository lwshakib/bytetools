/**
 * API route for synchronizing user-selected timezones in the World Clock tool.
 * Handles fetching all active timezones and performing a destructive full sync (replace all) operation.
 */
import { auth } from '@/lib/auth'; // Extracted singleton auth core
import prisma from '@/lib/prisma'; // Node backend DB connector mapping
import { NextResponse } from 'next/server'; // Specialized route handler output
import { headers } from 'next/headers'; // Request header manipulation 

/**
 * GET Handler
 * Retrieves all saved timezones belonging to the authenticated user ID.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timezones = await prisma.userTimezone.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(timezones);
}

interface TimezoneInput {
  city: string;
  country?: string;
  timezone: string;
}

/**
 * POST Handler
 * Synchronizes timezones by replacing the user's entire tracking list with the explicitly provided client payload array.
 * Uses an integrated SQL transaction to guarantee an atomic operation sequence.
 */
export async function POST(req: Request) {
  // Validate active logged-in presence natively leveraging secure http cookie checks
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = (await req.json()) as TimezoneInput[];

  // Database Execution Block
  // Perform a destructive wipe explicitly pinned to the actor's logged context bounds, blocking cross-user bleeds
  await prisma.$transaction([
    prisma.userTimezone.deleteMany({ where: { userId: session.user.id } }), // Purge Phase
    prisma.userTimezone.createMany({ // Seed Phase
      data: items.map((it) => ({
        userId: session.user.id, // Explicit linking mapped
        city: it.city,
        country: it.country || '',
        timezone: it.timezone,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
