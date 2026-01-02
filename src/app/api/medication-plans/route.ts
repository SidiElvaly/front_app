import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addHours, isBefore, addDays } from "date-fns";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    patientId,
    drugName,
    dosage,
    frequency,
    startDate,
    endDate,
    notes,
  } = body;

  // Validation
  if (!patientId || !drugName || !dosage || !frequency || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const doctor = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!doctor) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const plan = await db.medicationPlan.create({
      data: {
        patientId,
        prescribedById: doctor.id,
        drugName,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes,
      },
    });

    // Generate doses based on the frequency
    const doses = generateDoses(plan);

    if (doses.length > 0) {
      await db.medicationDose.createMany({ data: doses });
    }

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Failed to create plan:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

/* ---------- Optimized Dose generation ---------- */

function generateDoses(plan: any) {
  const doses = [];
  const start = new Date(plan.startDate);
  
  // If no end date is provided, default to a 7-day schedule
  const end = plan.endDate ? new Date(plan.endDate) : addDays(start, 7);

  let intervalHours = 24;
  switch (plan.frequency) {
    case "EVERY_12_HOURS": intervalHours = 12; break;
    case "EVERY_8_HOURS":  intervalHours = 8; break;
    case "EVERY_6_HOURS":  intervalHours = 6; break; // Added this
    case "DAILY":          intervalHours = 24; break;
  }

  let cursor = start;

  // Safety: Limit to 100 doses to prevent infinite loops/memory issues
  while (isBefore(cursor, end) || cursor.getTime() === end.getTime()) {
    if (doses.length >= 100) break; 

    doses.push({
      medicationPlanId: plan.id,
      scheduledAt: new Date(cursor),
      status: "PENDING",
    });

    cursor = addHours(cursor, intervalHours);
  }

  return doses;
}