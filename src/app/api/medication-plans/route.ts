import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addHours, isBefore, addDays } from "date-fns";
import { MedicationFrequency } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { patientId, drugName, dosage, frequency, startDate, endDate, notes } = body;

    if (!patientId || !drugName || !dosage || !frequency || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const doctor = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!doctor) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* -------------------- SAFE ENUM NORMALIZATION -------------------- */
    const FREQUENCY_MAP: Record<string, MedicationFrequency> = {
      DAILY: MedicationFrequency.DAILY,
      EVERY_8_HOURS: MedicationFrequency.EVERY_8_HOURS,
      EVERY_12_HOURS: MedicationFrequency.EVERY_12_HOURS,
      CUSTOM: MedicationFrequency.CUSTOM,

      // optional UI-friendly aliases
      daily: MedicationFrequency.DAILY,
      "8h": MedicationFrequency.EVERY_8_HOURS,
      "12h": MedicationFrequency.EVERY_12_HOURS,
    };

    const normalizedFrequency = FREQUENCY_MAP[frequency];

    if (!normalizedFrequency) {
      return NextResponse.json(
        { error: "Invalid medication frequency" },
        { status: 400 }
      );
    }

    /* -------------------- TRANSACTION -------------------- */
    const result = await db.$transaction(async (tx) => {
      const plan = await tx.medicationPlan.create({
        data: {
          patientId,
          prescribedById: doctor.id,
          drugName,
          dosage,
          frequency: normalizedFrequency,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          notes,
        },
      });

      const dosesData = generateDoses(plan);

      if (dosesData.length > 0) {
        await tx.medicationDose.createMany({
          data: dosesData,
        });
      }

      return plan;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Medication plan creation failed:", error);
    return NextResponse.json(
      { error: "Failed to save prescription" },
      { status: 500 }
    );
  }
}

/* -------------------- DOSE GENERATION -------------------- */
function generateDoses(plan: {
  id: string;
  frequency: MedicationFrequency;
  startDate: Date;
  endDate?: Date | null;
}) {
  const doses: any[] = [];

  let cursor = new Date(plan.startDate);
  const endLimit = plan.endDate
    ? new Date(plan.endDate)
    : addDays(cursor, 14);

  let intervalHours = 24;

  switch (plan.frequency) {
    case MedicationFrequency.EVERY_8_HOURS:
      intervalHours = 8;
      break;
    case MedicationFrequency.EVERY_12_HOURS:
      intervalHours = 12;
      break;
    case MedicationFrequency.CUSTOM:
      intervalHours = 6; // example: q6h
      break;
    case MedicationFrequency.DAILY:
    default:
      intervalHours = 24;
  }

  while (isBefore(cursor, endLimit) || cursor.getTime() === endLimit.getTime()) {
    if (doses.length >= 300) break;

    doses.push({
      medicationPlanId: plan.id,
      scheduledAt: new Date(cursor),
      status: "PENDING",
    });

    cursor = addHours(cursor, intervalHours);
  }

  return doses;
}
