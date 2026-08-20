/**
 * API route for persisting and managing saved JWTs.
 * Securely stores tokens and secrets in the database associated with the logged-in user.
 */
import { auth } from '@/lib/auth'; // Core auth utility to perform server-side session authentication
import prisma from '@/lib/prisma'; // Database ORM instance
import { NextResponse } from 'next/server'; // Next.js specific API router response helper
import { headers } from 'next/headers'; // Method to dynamically inspect the active request's headers
import { encrypt, decrypt } from '@/lib/encryption'; // Symmetrical AES-256-GCM encryption/decryption utilities

/**
 * Retrieves all saved JWTs for the authenticated user and decrypts their token and secret fields.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jwts = await prisma.savedJwt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Decrypt tokens and secrets in-memory before returning them to the authenticated client
  const decryptedJwts = jwts.map((item) => {
    let token = item.token;
    let secret = item.secret;

    try {
      token = decrypt(item.token);
    } catch {
      token = '[REDACTED - CORRUPTED]';
    }

    if (item.secret) {
      try {
        secret = decrypt(item.secret);
      } catch {
        secret = '[REDACTED - CORRUPTED]';
      }
    }

    return {
      ...item,
      token,
      secret,
    };
  });

  return NextResponse.json(decryptedJwts);
}

/**
 * POST Handler
 * Validates, encrypts sensitive token/secret fields, and saves a new JWT record into the database.
 */
export async function POST(req: Request) {
  // Validate request securely against Better-Auth using the incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Strict check to ensure anonymous requests bounce
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse out the required fields embedded in the JSON body of the request
  const { name, token, secret } = await req.json();

  // Validate the fundamental requirement: token data is mandatory
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Encrypt the sensitive token string and secret key before writing to the database
  const encryptedToken = encrypt(token);
  const encryptedSecret = secret ? encrypt(secret) : null;

  // Create the record directly linking it back to the active user's session ID
  const savedJwt = await prisma.savedJwt.create({
    data: {
      userId: session.user.id,
      name: name || 'Saved JWT', // Provide a fallback name if one wasn't attached
      token: encryptedToken,
      secret: encryptedSecret,
    },
  });

  // Return the populated Database object to populate the frontend state
  return NextResponse.json(savedJwt);
}

/**
 * DELETE Handler
 * Deletes a previously saved JWT matching the ID and the user's ID.
 */
export async function DELETE(req: Request) {
  // Validate request securely against Better-Auth using the incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fail quickly if no active token is present
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Retrieve the target ID expected mapped on the request body
  const { id } = await req.json();

  // Issue the destructive delete query ensuring the item matches BOTH the passed ID and the active session User ID
  // Validating userId on this end is critical for preventing Insecure Direct Object Reference (IDOR) attacks.
  await prisma.savedJwt.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  // Simply return success since the frontend is likely actively deleting the element locally
  return NextResponse.json({ success: true });
}
