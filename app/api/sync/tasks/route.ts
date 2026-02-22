/**
 * API route for synchronizing user tasks (Daily Planner & Pomodoro).
 * Handles fetching all tasks and performing a full sync (replace all) operation.
 */
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
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
 * Synchronizes tasks by replacing the entire set of user tasks.
 * Uses a transaction to ensure atomic deletion and recreation.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = (await req.json()) as TaskInput[];

  // Perform a destructive sync: wipe existing tasks and insert the current state from the client.
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId: session.user.id } }),
    prisma.task.createMany({
      data: items.map((it) => ({
        userId: session.user.id,
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
