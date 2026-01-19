import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

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

    return NextResponse.json(passwords);
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

    // Bcrypt as requested
    const salt = await bcrypt.genSalt(10);
    const hashedValue = await bcrypt.hash(value, salt);

    const savedPassword = await prisma.savedPassword.create({
        data: {
            userId: session.user.id,
            name: name || "Saved Password",
            hashedValue
        }
    });

    return NextResponse.json(savedPassword);
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
