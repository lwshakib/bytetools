/**
 * API route for synchronizing user tasks (Daily Planner & Pomodoro).
 * Handles fetching all tasks and performing a destructive full sync (replace all) operation.
 */
import { auth } from '@/lib/auth'; // Core session utility
import prisma from '@/lib/prisma'; // Global DB connection
import { NextResponse } from 'next/server'; // JSON response builder
import { headers } from 'next/headers'; // Dynamic header extraction

/**
 * GET Handler
 * Retrieves all saved tasks for the authenticated user.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(tasks);
}

interface TaskInput {
  text: string;
  completed: boolean;
  date: string;
  category: 'daily' | 'dump';
  routineId?: string | null;
}

/**
 * POST Handler
 * Synchronizes tasks by systematically replacing the entire set of user tasks.
 * Uses a $transaction block to ensure atomic deletion and recreation, so if one fails, it rolls back natively.
 */
export async function POST(req: Request) {
  // Validate the request securely against session cache
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Verify Identity
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Force cast the JSON body into the structured array interface
  const items = (await req.json()) as TaskInput[];

  // Database Execution Block
  // Perform a destructive sync: wipe existing tasks mapping and insert the current state matching the client perfectly.
  // We use transactions here to prevent data loss in the event Prisma fails halfway through.
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId: session.user.id } }), // Purge Phase
    prisma.task.createMany({ // Seed Phase
      data: items.map((it) => ({
        userId: session.user.id, // Re-attach newly synced rows back to User
        text: it.text,
        completed: it.completed,
        date: it.date,
        category: it.category,
        routineId: it.routineId || null,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
