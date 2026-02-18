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

    const presets = await prisma.timerPreset.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(presets.map(p => ({
        id: p.id,
        name: p.name,
        duration: p.duration
    })));
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await req.json();

    await prisma.$transaction([
        prisma.timerPreset.deleteMany({ where: { userId: session.user.id } }),
        prisma.timerPreset.createMany({
            data: items.map((it: any) => ({
                userId: session.user.id,
                name: it.name,
                duration: it.duration
            }))
        })
    ]);

    return NextResponse.json({ success: true });
}
