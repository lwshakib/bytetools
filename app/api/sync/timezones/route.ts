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

    const timezones = await prisma.userTimezone.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(timezones);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await req.json();

    // For simplicity, we replace the user's timezones with the new list
    await prisma.$transaction([
        prisma.userTimezone.deleteMany({ where: { userId: session.user.id } }),
        prisma.userTimezone.createMany({
            data: items.map((it: any) => ({
                userId: session.user.id,
                city: it.city,
                country: it.country || "",
                timezone: it.timezone
            }))
        })
    ]);

    return NextResponse.json({ success: true });
}
