import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const notifications = await db.notification.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return NextResponse.json({ notifications });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // If request to mark as read
        if (body.action === "markAsRead") {
            await db.notification.updateMany({
                where: { isRead: false },
                data: { isRead: true },
            });
            return NextResponse.json({ ok: true });
        }

        // If request to create notification (internal use mostly, but useful for client-side events)
        if (body.message) {
            const { type = "INFO", message } = body;
            const notif = await db.notification.create({
                data: {
                    type,
                    message,
                },
            });
            return NextResponse.json({ notification: notif });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to process notification" }, { status: 500 });
    }
}
