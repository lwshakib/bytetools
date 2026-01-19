import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwts = await prisma.savedJwt.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jwts);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, token, secret } = await req.json();

    if (!token) {
        return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const savedJwt = await prisma.savedJwt.create({
        data: {
            userId: session.user.id,
            name: name || "Saved JWT",
            token,
            secret
        }
    });

    return NextResponse.json(savedJwt);
}

export async function DELETE(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.savedJwt.delete({
        where: { 
            id,
            userId: session.user.id 
        }
    });

    return NextResponse.json({ success: true });
}
