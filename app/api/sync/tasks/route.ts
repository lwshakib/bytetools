/**
 * API route for synchronizing user tasks (Daily Planner & Pomodoro).
 * Handles fetching all tasks and performing a destructive full sync (replace all) operation.
 */
import { auth } from '@/lib/auth'; // Core session utility
import prisma from '@/lib/prisma'; // Global DB connection
import { NextResponse } from 'next/server'; // JSON response builder
import { headers } from 'next/headers'; // Dynamic header extraction
import { z } from 'zod'; // Schema validation engine

// Zod schema for individual task items
const TaskItemSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Task text cannot be empty')
    .max(1000, 'Task text exceeds maximum length of 1000 characters'),
  completed: z.boolean(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as yyyy-MM-dd'),
  category: z.enum(['daily', 'dump']),
  routineId: z.string().nullable().optional(),
});

// Zod schema for task array payload limit validation
const TaskSyncSchema = z
  .array(TaskItemSchema)
  .max(500, 'Cannot sync more than 500 tasks at once');

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

/**
 * POST Handler
 * Synchronizes tasks by systematically replacing the entire set of user tasks after validating payload schema.
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

  // Parse out payload body safely
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  // Validate request body against Zod schema
  const validationResult = TaskSyncSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: validationResult.error.issues,
      },
      { status: 400 }
    );
  }

  const items = validationResult.data;

  // Database Execution Block
  // Perform a destructive sync: wipe existing tasks mapping and insert the current state matching the client perfectly.
  // We use transactions here to prevent data loss in the event Prisma fails halfway through.
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { userId: session.user.id } }), // Purge Phase
    prisma.task.createMany({
      // Seed Phase
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
