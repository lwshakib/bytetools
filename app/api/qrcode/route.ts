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

    const qrCodes = await prisma.savedQrCode.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(qrCodes);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, content, fgColor, level } = await req.json();

    if (!content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const savedQr = await prisma.savedQrCode.create({
        data: {
            userId: session.user.id,
            name: name || "My QR Code",
            content,
            fgColor: fgColor || "#ffffff",
            level: level || "H"
        }
    });

    return NextResponse.json(savedQr);
}

export async function DELETE(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.savedQrCode.delete({
        where: { 
            id,
            userId: session.user.id 
        }
    });

    return NextResponse.json({ success: true });
}
