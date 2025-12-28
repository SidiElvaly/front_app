import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

/* ---------------- GET: single admission ---------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; admissionId: string }> }
) {
  const { id: patientId, admissionId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admission = await db.admission.findFirst({
      where: { id: admissionId, patientId },
      select: {
        id: true,
        patientId: true,
        visitDate: true,
        reason: true,
        currentDiagnosis: true,
        medicalHistory: true,
        createdAt: true,
        createdByEmail: true,
      },
    });

    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    return NextResponse.json({ admission });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load admission" }, { status: 500 });
  }
}

/* ---------------- PATCH: edit admission ---------------- */

const emptyToUndefined = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
};

const PatchSchema = z
  .object({
    visitDate: z.preprocess(emptyToUndefined, z.string().optional()),
    reason: z.preprocess(emptyToUndefined, z.string().min(2).optional()),
    currentDiagnosis: z.preprocess(emptyToUndefined, z.string().min(2).optional()),
    medicalHistory: z.preprocess(emptyToUndefined, z.string().optional()),
    notes: z.preprocess(emptyToUndefined, z.string().optional()),
    updatePatient: z.boolean().optional().default(true),
  })
  .strict();

function safeDate(input?: string) {
  if (!input) return undefined;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function joinNotes(existing: string | null | undefined, lines: Array<string | null | undefined>) {
  const base = existing?.trim() ? existing.trim() : null;
  const block = lines.filter(Boolean).join("\n").trim();
  return [base, block].filter(Boolean).join("\n");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; admissionId: string }> }
) {
  const { id: patientId, admissionId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const visitDateParsed = safeDate(data.visitDate);
  if (data.visitDate && visitDateParsed === null) {
    return NextResponse.json({ error: "Invalid visitDate" }, { status: 400 });
  }

  try {
    const existingAdmission = await db.admission.findFirst({
      where: { id: admissionId, patientId },
      select: { id: true },
    });

    if (!existingAdmission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    const updatedAdmission = await db.admission.update({
      where: { id: admissionId },
      data: {
        ...(visitDateParsed ? { visitDate: visitDateParsed } : {}),
        ...(data.reason ? { reason: data.reason } : {}),
        ...(data.currentDiagnosis ? { currentDiagnosis: data.currentDiagnosis } : {}),
        ...(typeof data.medicalHistory === "string"
          ? { medicalHistory: data.medicalHistory || null }
          : {}),
        createdByEmail: session.user?.email ?? null,
      },
    });

    // optional patient update
    if (data.updatePatient !== false) {
      const patient = await db.patient.findUnique({
        where: { id: patientId },
        select: { id: true, notes: true },
      });
      if (patient) {
        const stamp = new Date().toISOString().slice(0, 10);
        const appended = joinNotes(patient.notes, [
          `--- Admission updated (${stamp}) ---`,
          data.reason ? `Reason: ${data.reason}` : null,
          data.currentDiagnosis ? `Diagnosis: ${data.currentDiagnosis}` : null,
          typeof data.medicalHistory === "string" && data.medicalHistory.trim()
            ? `History: ${data.medicalHistory}`
            : null,
          data.notes?.trim() ? `Notes: ${data.notes}` : null,
        ]);

        await db.patient.update({
          where: { id: patientId },
          data: {
            ...(visitDateParsed ? { lastVisit: visitDateParsed } : {}),
            ...(appended ? { notes: appended } : {}),
          },
        });
      }
    }

    return NextResponse.json({ admission: updatedAdmission });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update admission" }, { status: 500 });
  }
}

/* ---------------- DELETE: keep as-is ---------------- */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; admissionId: string }> }
) {
  const { id: patientId, admissionId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const exists = await db.admission.findFirst({
      where: { id: admissionId, patientId },
      select: { id: true },
    });

    if (!exists) return NextResponse.json({ error: "Admission not found" }, { status: 404 });

    await db.admission.delete({ where: { id: admissionId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete admission" }, { status: 500 });
  }
}
