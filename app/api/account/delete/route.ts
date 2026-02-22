import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API route for self-account deletion.
 * Securely deletes the authenticated user from the database.
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Directly delete the user from the database using Prisma.
    // Prisma will handle cascade deletion of sessions, accounts, timezones, tasks, etc.
    // as configured in the schema.prisma file (onDelete: Cascade).
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
