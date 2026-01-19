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

    const routines = await prisma.routine.findMany({
        where: { userId: session.user.id }
    });

    return NextResponse.json(routines);
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
        prisma.routine.deleteMany({ where: { userId: session.user.id } }),
        prisma.routine.createMany({
            data: items.map((it: any) => ({
                userId: session.user.id,
                text: it.text,
                frequency: it.frequency,
                selectedDays: it.selectedDays || [],
                selectedDate: it.selectedDate || null
            }))
        })
    ]);

    return NextResponse.json({ success: true });
}
