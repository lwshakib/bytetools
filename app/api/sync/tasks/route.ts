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

    const tasks = await prisma.task.findMany({
        where: { userId: session.user.id }
    });

    return NextResponse.json(tasks);
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
        prisma.task.deleteMany({ where: { userId: session.user.id } }),
        prisma.task.createMany({
            data: items.map((it: any) => ({
                userId: session.user.id,
                text: it.text,
                completed: it.completed,
                date: it.date,
                category: it.category,
                routineId: it.routineId || null
            }))
        })
    ]);

    return NextResponse.json({ success: true });
}
