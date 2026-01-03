import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { decodeId } from "@/lib/obfuscation";

/* ---------------- Helpers ---------------- */
const emptyToUndefined = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
};

const AdmissionSchema = z.object({
  visitDate: z.preprocess(emptyToUndefined, z.string().min(1, "visitDate is required")), // ISO string from input date
  reason: z.preprocess(emptyToUndefined, z.string().min(2, "reason is required")),
  currentDiagnosis: z.preprocess(emptyToUndefined, z.string().min(2, "currentDiagnosis is required")),
  medicalHistory: z.preprocess(emptyToUndefined, z.string().optional()),

  notes: z.preprocess(emptyToUndefined, z.string().optional()), // optional extra notes to append to patient.notes
});

// GET: list admissions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const patientId = decodeId(rawId);
  if (!patientId) return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admissions = await db.admission.findMany({
      where: { patientId },
      orderBy: { visitDate: "desc" },
      select: {
        id: true,
        visitDate: true,
        reason: true,
        currentDiagnosis: true,
        medicalHistory: true,

        createdAt: true,
        createdByEmail: true,
      },
    });

    return NextResponse.json({ admissions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load admissions" }, { status: 500 });
  }
}

// POST: create admission + update patient immediately
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const patientId = decodeId(rawId);
  if (!patientId) return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AdmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Convert visitDate safely
  const visitDate = new Date(data.visitDate);
  if (Number.isNaN(visitDate.getTime())) {
    return NextResponse.json({ error: "Invalid visitDate" }, { status: 400 });
  }

  try {
    // 1) ensure patient exists
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      select: { id: true, notes: true, name: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // 2) create admission
    const created = await db.admission.create({
      data: {
        patientId,
        visitDate,
        reason: data.reason,
        currentDiagnosis: data.currentDiagnosis,
        medicalHistory: data.medicalHistory ?? null,

        createdByEmail: session.user?.email ?? null,
      },
    });

    // 3) update patient file immediately
    // - lastVisit = visitDate
    // - status = admission status
    // - append notes with a structured entry
    const stamp = new Date().toISOString().slice(0, 10);
    const appended = [
      patient.notes?.trim() ? patient.notes.trim() : null,
      `--- Admission (${stamp}) ---`,
      `Reason: ${data.reason}`,
      `Diagnosis: ${data.currentDiagnosis}`,
      data.medicalHistory ? `History: ${data.medicalHistory}` : null,
      data.notes ? `Notes: ${data.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await db.patient.update({
      where: { id: patientId },
      data: {
        lastVisit: visitDate,

        notes: appended,
      },
    });

    return NextResponse.json({ admission: created }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create admission" }, { status: 500 });
  }
}
