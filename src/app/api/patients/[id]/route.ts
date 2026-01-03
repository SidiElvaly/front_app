import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { decodeId } from "@/lib/obfuscation";

type Ctx = { params: Promise<{ id: string }> };

/* ---------------- Helpers ---------------- */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toISODateOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + "T00:00:00.000Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizePhone(raw: string) {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return "+" + cleaned.slice(1).replace(/\+/g, "");
  return cleaned.replace(/\+/g, "");
}

function zodFieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const t = v.trim();
      return t === "" ? undefined : t;
    }
    return v;
  }, schema.optional());

/* ---------------- Schema ----------------
   - For update, fields are optional EXCEPT name (your UI always sends it)
   - status is optional and must NEVER be ""
*/
const UpdatePatientSchema = z
  .object({
    name: z.string().trim().min(2, "Full name is required (min 2 characters).").max(80, "Max 80 characters."),

    email: emptyToUndefined(z.string().email("Enter a valid email address (example: name@domain.com).")).optional(),

    phone: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^[+\d\s().-]+$/.test(v), {
        message: "Phone can contain only digits and an optional leading +.",
      })
      .transform((v) => (v ? normalizePhone(v) : undefined))
      .refine((v) => v === undefined || /^\+?\d{7,15}$/.test(v), {
        message: "Phone must be 7–15 digits (you can start with +).",
      }),

    idnum: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^[A-Za-z0-9_-]{3,30}$/.test(v), {
        message: "Enroll number must be 3–30 chars (letters/numbers/_/-).",
      }),

    gender: emptyToUndefined(z.enum(["male", "female", "other"])).optional(),

    dob: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Invalid date format." })
      .refine((v) => v === undefined || v <= todayISO(), { message: "Date of birth cannot be in the future." }),

    lastVisit: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "Invalid date format." })
      .refine((v) => v === undefined || v <= todayISO(), { message: "Last visit cannot be in the future." }),

    address: emptyToUndefined(z.string().max(120, "Address max 120 characters.")).optional(),

    status: emptyToUndefined(z.enum(["LOW", "MEDIUM", "HIGH"])).optional(),

    notes: emptyToUndefined(z.string().max(1000, "Notes max 1000 characters.")).optional(),
  })
  .refine(
    (data) => {
      if (!data.dob || !data.lastVisit) return true;
      return data.lastVisit >= data.dob;
    },
    { message: "Last visit cannot be before date of birth.", path: ["lastVisit"] }
  );

/* ---------------- GET ---------------- */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id: rawId } = await ctx.params;
  const id = decodeId(rawId);
  if (!id) return NextResponse.json({ error: "Patient id is required" }, { status: 400 });

  try {
    const patient = await db.patient.findUnique({ where: { id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

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

/* ---------------- PUT ---------------- */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id: rawId } = await ctx.params;
  const id = decodeId(rawId);
  if (!id) return NextResponse.json({ error: "Patient id is required" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdatePatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: zodFieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const exists = await db.patient.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const data = parsed.data;

    const updated = await db.patient.update({
      where: { id },
      data: {
        name: data.name,

        // If field missing => null (clear)
        // If you want "missing keeps existing", change ?? null to ?? undefined
        email: data.email ?? null,
        phone: data.phone ?? null,
        idnum: data.idnum ?? null,
        gender: data.gender ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,

        dob: data.dob ? toISODateOrNull(data.dob) : null,
        lastVisit: data.lastVisit ? toISODateOrNull(data.lastVisit) : null,

        // IMPORTANT: enum cannot be ""
        // If not provided => keep existing (undefined)
        ...(data.status ? { status: data.status } : {}),
      },
    });

    await db.notification.create({
      data: {
        type: "INFO",
        message: `Patient updated: ${updated.name}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id: rawId } = await ctx.params;
  const id = decodeId(rawId);
  if (!id) return NextResponse.json({ error: "Patient id is required" }, { status: 400 });

  try {
    const exists = await db.patient.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    await db.patient.delete({ where: { id } });

    await db.notification.create({
      data: {
        type: "WARNING",
        message: "Patient record deleted",
      },
    });

    return NextResponse.json({ ok: true, message: "Patient deleted" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
