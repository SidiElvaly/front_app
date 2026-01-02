import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Next.js 15: must await params
    const { patientId } = await params;

    if (!patientId) {
      return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
    }

    const start = startOfDay(new Date());
    const end = endOfDay(new Date());

    const doses = await db.medicationDose.findMany({
      where: {
        medicationPlan: {
          patientId: patientId, // Matches the field in your Schema
        },
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        medicationPlan: {
          select: {
            drugName: true,
            dosage: true,
          },
        },
      },
    });

    return NextResponse.json(doses);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}