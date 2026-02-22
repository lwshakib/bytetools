/**
 * API route for synchronizing user-selected timezones in the World Clock tool.
 * Handles fetching all active timezones and performing a full sync (replace all) operation.
 */
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Retrieves all saved timezones for the authenticated user.
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
 * Synchronizes timezones by replacing the user's entire list with the current client-side state.
 * Uses a transaction to ensure atomic deletion and recreation.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = (await req.json()) as TimezoneInput[];

  // Perform a destructive sync: wipe existing selections and insert the new list.
  await prisma.$transaction([
    prisma.userTimezone.deleteMany({ where: { userId: session.user.id } }),
    prisma.userTimezone.createMany({
      data: items.map((it) => ({
        userId: session.user.id,
        city: it.city,
        country: it.country || '',
        timezone: it.timezone,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
