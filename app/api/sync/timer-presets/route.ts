/**
 * API route for synchronizing custom timer presets.
 * Handles fetching all presets and performing a full sync (replace all) operation.
 */
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Retrieves all saved timer presets for the authenticated user.
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
 * Synchronizes timer presets by replacing the entire set of user presets.
 * Uses a transaction to ensure atomic deletion and recreation.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await req.json();

  // Perform a destructive sync: wipe existing presets and insert the current state from the client.
  await prisma.$transaction([
    prisma.timerPreset.deleteMany({ where: { userId: session.user.id } }),
    prisma.timerPreset.createMany({
      data: items.map((it: any) => ({
        userId: session.user.id,
        name: it.name,
        duration: it.duration,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
