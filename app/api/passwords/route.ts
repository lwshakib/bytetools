import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passwords = await prisma.savedPassword.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    // Decrypt passwords for the UI
    const decryptedPasswords = passwords.map(p => {
        try {
            return {
                ...p,
                value: decrypt(p.hashedValue)
            };
        } catch (e) {
            return {
                ...p,
                value: '[REDACTED HASH]'
            };
        }
    });

    return NextResponse.json(decryptedPasswords);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, value } = await req.json();

    if (!value) {
        return NextResponse.json({ error: "Password value is required" }, { status: 400 });
    }

    // Encrypting for retrieval as requested (secure two-way storage)
    const encryptedValue = encrypt(value);

    const savedPassword = await prisma.savedPassword.create({
        data: {
            userId: session.user.id,
            name: name || "Saved Password",
            hashedValue: encryptedValue
        }
    });

    return NextResponse.json({
        ...savedPassword,
        value
    });
}

export async function DELETE(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.savedPassword.delete({
        where: { 
            id,
            userId: session.user.id 
        }
    });

    return NextResponse.json({ success: true });
}
