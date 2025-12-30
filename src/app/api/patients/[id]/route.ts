// src/app/api/patients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type Ctx = {
  params: Promise<{ id: string }>;
};

function toDateOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
  }

  try {
    // Patient
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Documents
    const documents = await db.patientDocument.findMany({
      where: { patientId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ patient, documents });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
  }

  let data: any;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // (optional but recommended) return 404 cleanly
    const exists = await db.patient.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const updated = await db.patient.update({
      where: { id },
      data: {
        name: typeof data.name === "string" ? data.name : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
        phone: typeof data.phone === "string" ? data.phone : undefined,
        idnum: typeof data.idnum === "string" ? data.idnum : undefined,
        lastVisit: toDateOrNull(data.lastVisit),
        dob: toDateOrNull(data.dob),
        address: typeof data.address === "string" ? data.address : undefined,
        // IMPORTANT: if your Prisma schema has an enum for status, don't store ""
        // Only set when provided, otherwise leave unchanged.
        status: data.status ? data.status : undefined,
        notes: typeof data.notes === "string" ? data.notes : undefined,
        gender: typeof data.gender === "string" ? data.gender : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!id) {
    return NextResponse.json({ error: "Patient id is required" }, { status: 400 });
  }

  try {
    // clean 404 instead of Prisma throwing
    const exists = await db.patient.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await db.patient.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: "Patient deleted" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
