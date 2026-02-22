/**
 * API route for persisting and managing saved QR codes.
 * Allows users to store their custom-generated QR codes with specific styling for later retrieval.
 */
import { auth } from '@/lib/auth'; // Core auth utility to perform server-side session authentication
import prisma from '@/lib/prisma'; // Database ORM instance
import { NextResponse } from 'next/server'; // Next.js specific API router response helper
import { headers } from 'next/headers'; // Method to dynamically inspect the active request's headers

/**
 * GET Handler
 * Retrieves all saved QR codes exclusively connected to the authenticated user.
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const qrCodes = await prisma.savedQrCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(qrCodes);
}

/**
 * POST Handler
 * Saves a new QR code configuration and string payload to the database.
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
  const { name, content, fgColor, level } = await req.json();

  if (!content) {
    // Break early if client bypassed standard form logic submitting blank content
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  // Safely commit new entity, assigning it an owner ID and parsing default UI aesthetic fallbacks
  const savedQr = await prisma.savedQrCode.create({
    data: {
      userId: session.user.id,
      name: name || 'My QR Code',
      content,
      fgColor: fgColor || '#ffffff', // Default to white foreground if not provided
      level: level || 'H', // Default to High error correction
    },
  });

  return NextResponse.json(savedQr);
}

/**
 * DELETE Handler
 * Deletes a saved QR code configuration.
 */
export async function DELETE(req: Request) {
  // Validate request securely against Better-Auth using the incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Retrieve the target ID mapped on the request body
  const { id } = await req.json();

  // Run native Prisma query ensuring the item matches BOTH the passed ID and the active session User ID
  // Validating userId on this end is critical to prevent IDOR attacks.
  await prisma.savedQrCode.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
