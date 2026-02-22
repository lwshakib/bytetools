/**
 * API route for the Password Vault.
 * Provides secure endpoints to save, retrieve, and delete passwords.
 * All passwords are encrypted before being stored in the database.
 */
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';

/**
 * Retrieves all saved passwords for the authenticated user and decrypts them.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const passwords = await prisma.savedPassword.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Decrypt the stored encrypted strings back into plain text for the user.
  const decryptedPasswords = passwords.map((p) => {
    try {
      return {
        ...p,
        value: decrypt(p.hashedValue),
      };
    } catch {
      // If decryption fails, provide a redacted placeholder to avoid crashing the UI.
      return {
        ...p,
        value: '[REDACTED HASH]',
      };
    }
  });

  return NextResponse.json(decryptedPasswords);
}

/**
 * Encrypts and saves a new password to the user's vault.
 */
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, value } = await req.json();

  if (!value) {
    return NextResponse.json(
      { error: 'Password value is required' },
      { status: 400 }
    );
  }

  // Encrypt the password value before it ever hits the database.
  const encryptedValue = encrypt(value);

  const savedPassword = await prisma.savedPassword.create({
    data: {
      userId: session.user.id,
      name: name || 'Saved Password',
      hashedValue: encryptedValue,
    },
  });

  return NextResponse.json({
    ...savedPassword,
    value, // Return the original value for immediate UI update.
  });
}

/**
 * Removes a password entry from the vault.
 */
export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  await prisma.savedPassword.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
