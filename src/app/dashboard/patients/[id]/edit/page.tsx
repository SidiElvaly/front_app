// src/app/dashboard/patients/[id]/page.tsx
"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { Calendar, Camera, FileText, IdCard, Mail, MapPin, Phone, User2, UserPlus, X } from "lucide-react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import FormSkeleton from "@/components/FormSkeleton";
import { z } from "zod";
import { toast } from "sonner";
import { handleClientError } from "@/lib/client-error";
import { decodeId } from "@/lib/obfuscation";

type Gender = "male" | "female" | "";
type Status = "LOW" | "MEDIUM" | "HIGH" | "";

/* ---------------- Helpers ---------------- */
function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isISODateString(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// Hard restriction: phone can only be digits with optional leading +
function sanitizePhone(raw: string) {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return "+" + cleaned.slice(1).replace(/\+/g, "");
  return cleaned.replace(/\+/g, "");
}

function normalizePhone(raw: string) {
  return sanitizePhone(raw).trim();
}

// Hard restriction: idnum can only be letters/numbers/_/-
function sanitizeIdnum(raw: string) {
  return raw.replace(/[^A-Za-z0-9_-]/g, "");
}

function toFieldErrors(zerr: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of zerr.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

type Payload = {
  name: string;
  email: string;
  phone: string;
  idnum: string;
  gender: Gender;
  dob: string;
  lastVisit: string;
  address: string;
  status: Status;
  notes: string;
};

type FieldErrors = Partial<Record<keyof Payload | "form", string>>;

function firstErrorField(errors: FieldErrors) {
  const order: Array<keyof Payload> = ["name", "email", "phone", "idnum", "gender", "dob", "lastVisit", "address", "status", "notes"];
  return order.find((k) => !!errors[k]);
}

/* ---------------- Client Zod schema ----------------
   - keep UI values as strings
   - allow "" for optional fields on client
   - enforce format + constraints
*/
const EditPatientSchema = z
  .object({
    name: z.string().trim().min(2, "Full name is required (min 2 characters).").max(80, "Max 80 characters."),

    email: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || z.string().email().safeParse(v).success, {
        message: "Enter a valid email address (example: name@domain.com).",
      }),

    phone: z
      .string()
      .trim()
      .optional()
      .default("")
      .transform((v) => (v ? normalizePhone(v) : ""))
      .refine((v) => v === "" || /^\+?\d{7,15}$/.test(v), {
        message: "Phone must be 7–15 digits (you can start with +).",
      }),

    idnum: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || /^[A-Za-z0-9_-]{3,30}$/.test(v), {
        message: "Enroll number must be 3–30 chars (letters/numbers/_/-).",
      }),

    gender: z.enum(["male", "female", ""]).optional().default(""),

    dob: z
      .string()
      .optional()
      .default("")
      .refine((v) => v === "" || isISODateString(v), { message: "Invalid date format." })
      .refine((v) => v === "" || v <= todayISO(), { message: "Date of birth cannot be in the future." }),

    lastVisit: z
      .string()
      .optional()
      .default("")
      .refine((v) => v === "" || isISODateString(v), { message: "Invalid date format." })
      .refine((v) => v === "" || v <= todayISO(), { message: "Last visit cannot be in the future." }),

    address: z.string().trim().max(120, "Max 120 characters.").optional().default(""),

    status: z.enum(["LOW", "MEDIUM", "HIGH", ""]).optional().default(""),

    notes: z.string().max(1000, "Notes max 1000 characters.").optional().default(""),
  })
  .refine(
    (data) => {
      if (!data.dob || !data.lastVisit) return true;
      return data.lastVisit >= data.dob;
    },
    { message: "Last visit cannot be before date of birth.", path: ["lastVisit"] }
  );

/* ---------------- Small UI bits ---------------- */
function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-slate-400">{children}</p>;
}
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] font-medium text-rose-600">{msg}</p>;
}

/* ---------------- Page ---------------- */
export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: rawId } = usePromise(params);
  const id = useMemo(() => decodeId(rawId) || "", [rawId]);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Refs for focusing first invalid field
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const idnumRef = useRef<HTMLInputElement | null>(null);
  const genderRef = useRef<HTMLSelectElement | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);
  const lastVisitRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const statusRef = useRef<HTMLSelectElement | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const refs: Record<keyof Payload, React.RefObject<any>> = {
    name: nameRef,
    email: emailRef,
    phone: phoneRef,
    idnum: idnumRef,
    gender: genderRef,
    dob: dobRef,
    lastVisit: lastVisitRef,
    address: addressRef,
    status: statusRef,
    notes: notesRef,
  };

  const maxDob = useMemo(() => todayISO(), []);
  const maxLastVisit = useMemo(() => todayISO(), []);

  const payload: Payload = useMemo(
    () => ({
      name: fullName,
      email,
      phone,
      idnum: enrollNumber,
      gender,
      dob,
      lastVisit,
      address,
      status,
      notes,
    }),
    [fullName, email, phone, enrollNumber, gender, dob, lastVisit, address, status, notes]
  );

  function focusFirstError(errs: FieldErrors) {
    const first = firstErrorField(errs);
    if (!first) return;
    const r = refs[first]?.current;
    if (r && typeof r.focus === "function") r.focus();
    if (r && typeof r.scrollIntoView === "function") r.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validateAll() {
    setErrors({});
    const parsed = EditPatientSchema.safeParse(payload);
    if (!parsed.success) {
      const next = toFieldErrors(parsed.error);
      setErrors(next as FieldErrors);
      setErrors((p) => ({ ...p, form: "Please fix the highlighted fields." }));
      focusFirstError(next as FieldErrors);
      return { ok: false as const, data: null };
    }
    return { ok: true as const, data: parsed.data };
  }

  // Validate single field on blur (show clear message)
  function validateField(field: keyof Payload) {
    const parsed = EditPatientSchema.safeParse(payload);
    if (parsed.success) {
      setErrors((p) => ({ ...p, [field]: undefined, form: undefined }));
      return;
    }
    const next = toFieldErrors(parsed.error);
    setErrors((p) => ({
      ...p,
      [field]: next[field] ?? undefined,
      form: undefined,
    }));
  }

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load patient");
        const data = await res.json();
        const patient = data.patient;

        setFullName(patient.name || "");
        setEmail(patient.email || "");
        setPhone(patient.phone || "");
        setEnrollNumber(patient.idnum || "");
        setLastVisit(patient.lastVisit ? String(patient.lastVisit).slice(0, 10) : "");
        setDob(patient.dob ? String(patient.dob).slice(0, 10) : "");
        setGender((patient.gender as Gender) || "");
        setAddress(patient.address || "");
        setStatus((patient.status as Status) || "");
        setNotes(patient.notes || "");
      } catch {
        setErrors({ form: "Failed to load patient." });
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic checks
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
    setErrors((p) => ({ ...p, form: undefined }));

    const v = validateAll();
    if (!v.ok) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v.data),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrors(toFieldErrors(json.errors));
        toast.error("Failed to update patient. Please check the form.");
        focusFirstError(json.errors);
        return;
      }

      toast.success("Patient updated successfully!");
      router.push(`/dashboard/patients/${id}`);
    } catch (e) {
      handleClientError(e, "Update failed", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (key: keyof Payload) =>
    [
      "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
      errors[key]
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    ].join(" ");

  const selectClass = (key: keyof Payload) =>
    [
      "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
      errors[key]
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    ].join(" ");

  const textareaClass = (key: keyof Payload) =>
    [
      "min-h-[120px] w-full rounded-xl border bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:ring-1",
      errors[key]
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    ].join(" ");

  // ...

  // ...

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Edit patient" />
        <FormSkeleton />
      </main>
    );
  }

  return (
    <main className="w-full">
      <Topbar title="Edit patient" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <UserPlus className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">Edit patient</h2>
                <p className="text-xs text-slate-500">Update clinical information for this patient.</p>
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
                form="edit-patient-form"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto sm:py-1.5"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* Global error */}
          {errors.form && (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {errors.form}
            </div>
          )}

          {/* Form */}
          <form
            id="edit-patient-form"
            onSubmit={handleSubmit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)] lg:gap-8"
            noValidate
          >
            {/* Left column */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Full name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <User2 className="h-4 w-4" />
                    </span>
                    <input
                      ref={nameRef}
                      type="text"
                      maxLength={80}
                      className={inputClass("name")}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                      }}
                      onBlur={() => validateField("name")}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  <FieldHint>Required. Full legal name (2–80 characters).</FieldHint>
                  <FieldError msg={errors.name} />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      ref={emailRef}
                      type="email"
                      inputMode="email"
                      placeholder="name@domain.com"
                      className={inputClass("email")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      onBlur={() => validateField("email")}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  <FieldHint>Optional. Enter a valid email address (e.g. name@example.com).</FieldHint>
                  <FieldError msg={errors.email} />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Phone</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      ref={phoneRef}
                      type="tel"
                      inputMode="numeric"
                      placeholder="+22212345678"
                      className={inputClass("phone")}
                      value={phone}
                      onChange={(e) => {
                        const v = sanitizePhone(e.target.value); // ✅ blocks letters immediately
                        setPhone(v);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      onBlur={() => {
                        setPhone((p) => (p ? normalizePhone(p) : ""));
                        validateField("phone");
                      }}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  <FieldHint>Optional. Digits and leading &apos;+&apos; only (e.g. +222...). 7-15 digits.</FieldHint>
                  <FieldError msg={errors.phone} />
                </div>

                {/* Enroll number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Enroll number</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <IdCard className="h-4 w-4" />
                    </span>
                    <input
                      ref={idnumRef}
                      type="text"
                      maxLength={30}
                      placeholder="MRN-00123"
                      className={inputClass("idnum")}
                      value={enrollNumber}
                      onChange={(e) => {
                        const v = sanitizeIdnum(e.target.value); // ✅ blocks invalid chars
                        setEnrollNumber(v);
                        if (errors.idnum) setErrors((p) => ({ ...p, idnum: undefined }));
                      }}
                      onBlur={() => validateField("idnum")}
                      aria-invalid={!!errors.idnum}
                    />
                  </div>
                  <FieldHint>Optional. Unique ID or file number (3-30 characters).</FieldHint>
                  <FieldError msg={errors.idnum} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Gender</label>
                  <select
                    ref={genderRef}
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

                  </select>
                  <FieldHint>Optional. Select gender.</FieldHint>
                  <FieldError msg={errors.gender} />
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Date of birth</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      ref={dobRef}
                      type="date"
                      max={maxDob}
                      className={inputClass("dob")}
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (errors.dob) setErrors((p) => ({ ...p, dob: undefined }));
                      }}
                      onBlur={() => validateField("dob")}
                      aria-invalid={!!errors.dob}
                    />
                  </div>
                  <FieldHint>Optional. Must be a date in the past.</FieldHint>
                  <FieldError msg={errors.dob} />
                </div>

                {/* Last visit */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Last visit</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      ref={lastVisitRef}
                      type="date"
                      max={maxLastVisit}
                      className={inputClass("lastVisit")}
                      value={lastVisit}
                      onChange={(e) => {
                        setLastVisit(e.target.value);
                        if (errors.lastVisit) setErrors((p) => ({ ...p, lastVisit: undefined }));
                      }}
                      onBlur={() => validateField("lastVisit")}
                      aria-invalid={!!errors.lastVisit}
                    />
                  </div>
                  <FieldHint>Optional. Date of most recent consultation.</FieldHint>
                  <FieldError msg={errors.lastVisit} />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Address</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    ref={addressRef}
                    type="text"
                    maxLength={120}
                    placeholder="Nouakchott, Mauritania"
                    className={inputClass("address")}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
                    }}
                    onBlur={() => validateField("address")}
                    aria-invalid={!!errors.address}
                  />
                </div>
                <FieldHint>Optional. Home address or city (max 120 chars).</FieldHint>
                <FieldError msg={errors.address} />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select
                  ref={statusRef}
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
                <FieldHint>Optional. Triage status for the dashboard.</FieldHint>
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
                    ref={notesRef}
                    maxLength={1000}
                    placeholder="Clinical notes, allergies, history…"
                    className={textareaClass("notes")}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errors.notes) setErrors((p) => ({ ...p, notes: undefined }));
                    }}
                    onBlur={() => validateField("notes")}
                    aria-invalid={!!errors.notes}
                  />
                </div>
                <FieldHint>Optional. Clinical or administrative notes (max 1000 chars).</FieldHint>
                <FieldError msg={errors.notes} />
              </div>
            </div>

            {/* Right column: avatar */}
            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
              <p className="mb-3 text-sm font-semibold text-slate-800">Avatar</p>

              <div className="flex flex-1 flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={saving}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:h-32 sm:w-32"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Preview" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </button>

                <p className="mt-3 max-w-[260px] text-center text-xs text-slate-500">
                  Optional. JPG/PNG up to 2MB.
                </p>

                <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
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
          </form>
        </div>
      </section>
    </main>
  );
}
