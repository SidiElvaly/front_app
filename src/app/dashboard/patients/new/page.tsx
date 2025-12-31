"use client";

import React, { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Topbar from "@/components/Topbar";
import InputField from "@/components/forms/InputField";
import {
  Calendar,
  Camera,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  User2,
  UserPlus,
  X,
} from "lucide-react";
import { z } from "zod";

type Gender = "male" | "female" | "other" | "";
type Status = "LOW" | "MEDIUM" | "HIGH" | "";

/* ---------------- Helpers ---------------- */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy} -${mm} -${dd} `;
}
function isISODateString(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// Hard restriction: digits + optional leading +
function sanitizePhone(raw: string) {
  let v = raw.replace(/[^\d+]/g, "");
  if (v.includes("+")) v = (v.startsWith("+") ? "+" : "") + v.replace(/\+/g, "");
  return v;
}
function normalizePhone(raw: string) {
  return sanitizePhone(raw).trim();
}

// Hard restriction: letters/numbers/_/-
function sanitizeIdnum(raw: string) {
  return raw.replace(/[^A-Za-z0-9_-]/g, "");
}

// Name: allow letters + spaces + apostrophe + hyphen
function sanitizeName(raw: string) {
  const v = raw.replace(/[^A-Za-zÀ-ÿ' -]/g, "");
  return v.replace(/\s{2,}/g, " ");
}

// Address/Notes: remove control chars
function sanitizeText(raw: string) {
  return raw.replace(/[\u0000-\u001F\u007F]/g, "");
}

function toFieldErrors(zerr: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of zerr.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * IMPORTANT: all fields are strings in the form (never undefined).
 * Optional fields accept "".
 */
const NewPatientSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name is required (min 2 characters).")
      .max(80, "Max 80 characters."),

    email: z
      .string()
      .trim()
      .max(120, "Max 120 characters.")
      .refine((v) => v === "" || z.string().email().safeParse(v).success, {
        message: "Enter a valid email address (example: name@domain.com).",
      }),

    phone: z
      .string()
      .trim()
      .transform((v) => (v ? normalizePhone(v) : ""))
      .refine((v) => v === "" || /^\+?\d{7,15}$/.test(v), {
        message: "Phone must be 7–15 digits (you can start with +).",
      }),

    idnum: z
      .string()
      .trim()
      .max(30, "Max 30 characters.")
      .refine((v) => v === "" || /^[A-Za-z0-9_-]{3,30}$/.test(v), {
        message: "Enroll number must be 3–30 chars (letters/numbers/_/-).",
      }),

    gender: z.enum(["", "male", "female", "other"]),

    dob: z
      .string()
      .trim()
      .refine((v) => v === "" || isISODateString(v), { message: "Invalid date format." })
      .refine((v) => v === "" || v <= todayISO(), { message: "Date of birth cannot be in the future." }),

    lastVisit: z
      .string()
      .trim()
      .refine((v) => v === "" || isISODateString(v), { message: "Invalid date format." })
      .refine((v) => v === "" || v <= todayISO(), { message: "Last visit cannot be in the future." }),

    address: z.string().trim().max(120, "Max 120 characters."),

    status: z.enum(["", "LOW", "MEDIUM", "HIGH"]),

    notes: z.string().max(1000, "Notes max 1000 characters."),
  })
  .refine(
    (data) => {
      if (!data.dob || !data.lastVisit) return true;
      if (data.dob === "" || data.lastVisit === "") return true;
      return data.lastVisit >= data.dob;
    },
    { message: "Last visit cannot be before date of birth.", path: ["lastVisit"] }
  );

type Payload = z.infer<typeof NewPatientSchema>;
type FieldErrors = Partial<Record<keyof Payload | "form", string>>;

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-slate-400">{children}</p>;
}
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] font-medium text-rose-600">{msg}</p>;
}

/* ---------------- Page ---------------- */
export default function NewPatientPage() {
  const router = useRouter();

  // IMPORTANT: all are strings (no undefined)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enrollNumber, setEnrollNumber] = useState("");
  const [lastVisit, setLastVisit] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Status>("");
  const [notes, setNotes] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const maxDob = useMemo(() => todayISO(), []);
  const maxLastVisit = useMemo(() => todayISO(), []);

  // FORCE payload to never contain undefined
  const payload: Payload = useMemo(
    () => ({
      name: fullName ?? "",
      email: email ?? "",
      phone: phone ?? "",
      idnum: enrollNumber ?? "",
      lastVisit: lastVisit ?? "",
      gender: (gender ?? "") as Gender,
      dob: dob ?? "",
      address: address ?? "",
      status: (status ?? "") as Status,
      notes: notes ?? "",
    }),
    [fullName, email, phone, enrollNumber, lastVisit, gender, dob, address, status, notes]
  );

  function validateAll() {
    const parsed = NewPatientSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return { ok: false as const, data: null };
    }
    setErrors({});
    return { ok: true as const, data: parsed.data };
  }

  function validateField(field: keyof Payload) {
    const parsed = NewPatientSchema.safeParse(payload);
    if (parsed.success) {
      setErrors((p) => ({ ...p, [field]: undefined, form: undefined }));
      return;
    }
    const fe = toFieldErrors(parsed.error);
    setErrors((p) => ({ ...p, [field]: fe[String(field)] ?? undefined, form: undefined }));
  }

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, form: "Avatar must be an image file." }));
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, form: "Avatar must be 2MB or less." }));
      e.target.value = "";
      return;
    }

    setErrors((p) => ({ ...p, form: undefined }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => router.push("/dashboard/patients");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const v = validateAll();
    if (!v.ok) {
      setErrors((p) => ({ ...p, form: "Please fix the highlighted fields." }));
      return;
    }

    setSaving(true);
    try {
      // Send strings; server route converts "" => undefined/null
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v.data),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrors(toFieldErrors(json.errors));
        toast.error("Failed to create patient. Please check the form.");
        setSaving(false);
        return;
      }

      toast.success("Patient created successfully!");
      router.push(`/dashboard/patients/${json.id}`);
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred.");
      setSaving(false);
    }
  };



  const selectClass = (key: keyof Payload) =>
    [
      "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
      errors[key]
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    ].join(" ");

  const textareaClass = (key: keyof Payload) =>
    [
      "min-h-[120px] w-full rounded-xl border bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:ring-1",
      errors[key]
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    ].join(" ");

  return (
    <main className="w-full">
      <Topbar title="New patient" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <UserPlus className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Create new patient</h2>
                <p className="mt-0.5 text-xs text-slate-500">Register a new patient.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:w-auto sm:py-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                form="new-patient-form"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto sm:py-1.5"
              >
                {saving ? "Saving..." : "Save patient"}
              </button>
            </div>
          </div>

          {errors.form && (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {errors.form}
            </div>
          )}

          <form
            id="new-patient-form"
            onSubmit={handleSubmit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]"
            noValidate
          >
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                {/* Name */}
                <InputField
                  label="Full name *"
                  icon={<User2 className="h-4 w-4" />}
                  type="text"
                  maxLength={80}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(sanitizeName(e.target.value));
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  onBlur={() => validateField("name")}
                  error={errors.name}
                  hint="Required. Please enter the patient's full legal name (2-80 characters)."
                />

                {/* Email */}
                {/* Email */}
                <InputField
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onBlur={() => validateField("email")}
                  error={errors.email}
                  hint="Optional. Enter a valid email address (e.g. name@example.com)."
                />

                {/* Phone */}
                {/* Phone */}
                <InputField
                  label="Phone"
                  icon={<Phone className="h-4 w-4" />}
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={phone}
                  onChange={(e) => {
                    setPhone(sanitizePhone(e.target.value));
                    if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  onBlur={() => {
                    setPhone((p) => (p ? normalizePhone(p) : ""));
                    validateField("phone");
                  }}
                  error={errors.phone}
                  hint="Optional. Digits and leading '+' only (e.g. +22212345678). 7-15 digits."
                />

                {/* ID */}
                {/* ID */}
                <InputField
                  label="Enroll number"
                  icon={<IdCard className="h-4 w-4" />}
                  type="text"
                  maxLength={30}
                  value={enrollNumber}
                  onChange={(e) => {
                    setEnrollNumber(sanitizeIdnum(e.target.value));
                    if (errors.idnum) setErrors((p) => ({ ...p, idnum: undefined }));
                  }}
                  onBlur={() => validateField("idnum")}
                  error={errors.idnum}
                  hint="Optional. Unique ID or file number. 3-30 characters (letters, numbers, dashes)."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Gender</label>
                  <select
                    className={selectClass("gender")}
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value as Gender);
                      if (errors.gender) setErrors((p) => ({ ...p, gender: undefined }));
                    }}
                    onBlur={() => validateField("gender")}
                    aria-invalid={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <FieldHint>Optional. Select the patient&apos;s gender.</FieldHint>
                  <FieldError msg={errors.gender} />
                </div>

                {/* DOB */}
                {/* DOB */}
                <InputField
                  label="Date of birth"
                  icon={<Calendar className="h-4 w-4" />}
                  type="date"
                  max={maxDob}
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }));
                  }}
                  onBlur={() => validateField("dob")}
                  error={errors.dob}
                  hint="Optional. Must be a date in the past."
                />

                {/* Last visit */}
                {/* Last visit */}
                <InputField
                  className="sm:col-span-2 lg:col-span-1"
                  label="Last visit"
                  icon={<Calendar className="h-4 w-4" />}
                  type="date"
                  max={maxLastVisit}
                  value={lastVisit}
                  onChange={(e) => {
                    setLastVisit(e.target.value);
                    if (errors.lastVisit) setErrors((p) => ({ ...p, lastVisit: undefined }));
                  }}
                  onBlur={() => validateField("lastVisit")}
                  error={errors.lastVisit}
                  hint="Optional. Date of most recent consultation."
                />
              </div>

              {/* Address */}
              <InputField
                label="Address"
                icon={<MapPin className="h-4 w-4" />}
                type="text"
                maxLength={120}
                value={address}
                onChange={(e) => {
                  setAddress(sanitizeText(e.target.value));
                  if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
                }}
                onBlur={() => validateField("address")}
                error={errors.address}
                hint="Optional. Home address or city (max 120 chars)."
              />

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select
                  className={selectClass("status")}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as Status);
                    if (errors.status) setErrors((p) => ({ ...p, status: undefined }));
                  }}
                  onBlur={() => validateField("status")}
                  aria-invalid={!!errors.status}
                >
                  <option value="">Select status</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                <FieldHint>Optional. Triage status or priority.</FieldHint>
                <FieldError msg={errors.status} />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Notes</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <textarea
                    maxLength={1000}
                    className={textareaClass("notes")}
                    value={notes}
                    onChange={(e) => {
                      setNotes(sanitizeText(e.target.value));
                      if (errors.notes) setErrors((p) => ({ ...p, notes: undefined }));
                    }}
                    onBlur={() => validateField("notes")}
                    aria-invalid={!!errors.notes}
                  />
                </div>
                <FieldError msg={errors.notes} />
              </div>
            </div>

            {/* Avatar */}
            <div className="order-first lg:order-none">
              <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6 lg:sticky lg:top-24">
                <p className="mb-3 text-sm font-semibold text-slate-800">Avatar</p>

                <div className="flex flex-1 flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={saving}
                    className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:h-28 sm:w-28"
                  >
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Preview" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6" />
                    )}
                  </button>

                  <p className="mt-3 max-w-[240px] text-center text-xs text-slate-500">
                    Optional. Image only. Max 2MB.
                  </p>

                  <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={saving}
                      className="w-full rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto sm:py-1.5"
                    >
                      Choose photo
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={saving}
                        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:w-auto sm:py-1.5"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
