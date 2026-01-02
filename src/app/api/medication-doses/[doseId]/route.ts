import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DoseStatus } from "@prisma/client";

export async function POST(
  req: Request,
  // Next.js 15 requirement: params must be a Promise
  { params }: { params: Promise<{ doseId: string }> } 
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // !!! CRITICAL FIX: You must await the params object !!!
  const resolvedParams = await params;
  const doseId = resolvedParams.doseId;

  // Debugging log (optional)
  console.log("Updating dose ID:", doseId);

  if (!doseId) {
    return NextResponse.json({ error: "Dose ID is missing" }, { status: 400 });
  }

  try {
    const { status } = await req.json();

    if (!Object.values(DoseStatus).includes(status as DoseStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nurse = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!nurse) {
      return NextResponse.json({ error: "Nurse not found" }, { status: 404 });
    }

    // Now doseId is guaranteed to be a string, not undefined
    const dose = await db.medicationDose.findUnique({
      where: { id: doseId },
    });

    if (!dose) {
      return NextResponse.json({ error: "Dose not found" }, { status: 404 });
    }

    if (dose.status !== "PENDING") {
      return NextResponse.json({ error: "Dose already processed" }, { status: 409 });
    }

    const updated = await db.medicationDose.update({
      where: { id: doseId },
      data: {
        status: status as DoseStatus,
        administeredAt: new Date(),
        administeredById: nurse.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Dose Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}