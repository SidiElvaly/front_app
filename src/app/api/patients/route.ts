import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

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

// Keep digits + optional leading +
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

/**
 * Convert "", null, undefined => undefined
 * + trim strings
 */
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    if (typeof v === "string") {
      const t = v.trim();
      return t === "" ? undefined : t;
    }
    return v;
  }, schema.optional());

/**
 * For <select> that sends "" when not chosen:
 * Convert "" => undefined BEFORE enum validation
 */
const emptyEnumToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    return v;
  }, schema.optional());

/* ---------------- Schema ----------------
   - Only "name" is required
   - Enums never receive "" (converted to undefined)
*/
const CreatePatientSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name is required (min 2 characters).")
      .max(80, "Max 80 characters."),

    email: emptyToUndefined(
      z.string().email("Enter a valid email address (example: name@domain.com).")
    ).optional(),

    phone: emptyToUndefined(z.string())
      .optional()
      .transform((v) => (v ? normalizePhone(v) : undefined))
      .refine((v) => v === undefined || /^\+?\d{7,15}$/.test(v), {
        message: "Phone must be 7–15 digits (you can start with +).",
      }),

    idnum: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^[A-Za-z0-9_-]{3,30}$/.test(v), {
        message: "Enroll number must be 3–30 chars (letters/numbers/_/-).",
      }),

    gender: emptyEnumToUndefined(z.enum(["male", "female", "other"])).optional(),

    dob: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), {
        message: "Invalid date format.",
      })
      .refine((v) => v === undefined || v <= todayISO(), {
        message: "Date of birth cannot be in the future.",
      }),

    lastVisit: emptyToUndefined(z.string())
      .optional()
      .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), {
        message: "Invalid date format.",
      })
      .refine((v) => v === undefined || v <= todayISO(), {
        message: "Last visit cannot be in the future.",
      }),

    address: emptyToUndefined(z.string().max(120, "Address max 120 characters.")).optional(),

    status: emptyEnumToUndefined(z.enum(["LOW", "MEDIUM", "HIGH"])).optional(),

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
export async function GET() {
  try {
    const patients = await db.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

/* ---------------- POST ---------------- */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreatePatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: zodFieldErrors(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;

    const created = await db.patient.create({
      data: {
        name: data.name,

        // optional strings => null in DB
        email: data.email ?? null,
        phone: data.phone ?? null,
        idnum: data.idnum ?? null,
        gender: data.gender ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,

        // dates
        dob: data.dob ? toISODateOrNull(data.dob) : null,
        lastVisit: data.lastVisit ? toISODateOrNull(data.lastVisit) : null,

        // enum default LOW is in Prisma; only set if provided
        ...(data.status ? { status: data.status } : {}),
      },
    });

    // Create Notification
    await db.notification.create({
      data: {
        type: "CREATE",
        message: `New patient created: ${created.name}`,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
