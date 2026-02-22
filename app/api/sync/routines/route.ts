/**
 * API route for synchronizing user routines in the Daily Planner.
 * Handles fetching all routines and performing a destructive full sync (replace all) operation.
 */
import { auth } from '@/lib/auth'; // Core auth verification 
import prisma from '@/lib/prisma'; // Database object instance
import { NextResponse } from 'next/server'; // Required JSON response syntax
import { headers } from 'next/headers'; // Used to map the auth headers from the raw request

/**
 * GET Handler
 * Retrieves all saved routines associated exclusively with the authenticated user.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const routines = await prisma.routine.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(routines);
}

/**
 * POST Handler
 * Synchronizes routines by systematically replacing the entire set of user routines.
 * Uses a $transaction block to ensure atomic deletion and recreation, so if one fails, it rolls back natively.
 */
export async function POST(req: Request) {
  // Validate request securely against session cache
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await req.json();

  // Database Execution Block
  // Perform a destructive sync: wipe existing routines and insert the current state from the client perfectly.
  // We use transactions here to prevent data loss or corrupted intermediate states.
  await prisma.$transaction([
    prisma.routine.deleteMany({ where: { userId: session.user.id } }), // Purge Phase
    prisma.routine.createMany({ // Seed Phase
      data: items.map(
        (it: {
          text: string;
          frequency: string;
          selectedDays?: number[];
          selectedDate?: number | null;
        }) => ({
          userId: session.user.id, // Explicitly enforce correct data ownership mapping
          text: it.text,
          frequency: it.frequency,
          selectedDays: it.selectedDays || [],
          selectedDate: it.selectedDate || null,
        })
      ),
    }),
  ]);

  return NextResponse.json({ success: true });
}
