/**
 * API route for the Password Vault.
 * Provides secure endpoints to save, retrieve, and delete passwords.
 * All passwords are encrypted using AES-GCM before being stored in the PostgreSQL database.
 */
import { auth } from '@/lib/auth'; // Session verifier
import prisma from '@/lib/prisma'; // Database handler
import { NextResponse } from 'next/server'; // Next.js JSON response formatter
import { headers } from 'next/headers'; // Function mapping HTTP headers from exact incoming request payloads
import { encrypt, decrypt } from '@/lib/encryption'; // Secure symmetrical string transformation logic

/**
 * GET Handler
 * Retrieves all saved passwords for the authenticated user and decrypts them.
 */
export async function GET() {
  // Validate backend session logic leveraging client-side active session headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all passwords strictly associated with this user, ordered chronologically.
  const passwords = await prisma.savedPassword.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Iterate over each record to perform decrypt action in-memory dynamically.
  // We NEVER decrypt these rows in batches directly on the DB itself since the database only tracks encrypted binaries.
  const decryptedPasswords = passwords.map((p) => {
    try {
      // Yield back the clean response with the standard value exposed correctly for the UI to consume safely
      return {
        ...p,
        value: decrypt(p.hashedValue),
      };
    } catch {
      // Defensive fallback. If decryption completely fails (e.g. Master secret change, corruption),
      // we gracefully return a redacted string rather than killing the whole page load.
      return {
        ...p,
        value: '[REDACTED HASH - CORRUPTED]',
      };
    }
  });

  return NextResponse.json(decryptedPasswords);
}

/**
 * POST Handler
 * Encrypts and saves a new password record to the user's vault database.
 */
export async function POST(req: Request) {
  // Validate incoming request context synchronously
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse payload contents
  const { name, value } = await req.json();

  if (!value) {
    // Break early if client bypassed standard form logic submitting blank items
    return NextResponse.json(
      { error: 'Password value is required' },
      { status: 400 }
    );
  }

  if (name && name.length > 100) {
    return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
  }

  // IMPORTANT: Symmetrically Encrypt the raw string password value
  // We explicitly run this node-side operation to completely blind the resulting PostgreSQL storage state.
  const encryptedValue = encrypt(value);

  // Safely commit new entity, assigning it an owner and parsing default fallbacks
  const savedPassword = await prisma.savedPassword.create({
    data: {
      userId: session.user.id,
      name: name || 'Saved Password', // Default label
      hashedValue: encryptedValue, // Only the base64 encrypted hash touches the database.
    },
  });

  // Return the saved record without exposing the plain-text password string in the API response.
  return NextResponse.json(savedPassword);
}

export async function DELETE(req: Request) {
  // Always lock behind session evaluation first
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Consume target ID mapping straight from body context
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  // Run native Prisma query ensuring two layers of validation occurs matching:
  // 1. Target ID matching targeted object.
  // 2. Ensuring the Owner UUID perfectly aligns with the active request UUID (Preventing arbitrary deletions)
  try {
    await prisma.savedPassword.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Password record not found' },
        { status: 404 }
      );
    }
    throw error;
  }

  return NextResponse.json({ success: true });
}
