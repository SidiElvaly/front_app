// src/app/dashboard/patients/new/page.tsx
"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
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

/* ---------------- Validation ---------------- */

const emptyToUndefined = (v: unknown) => {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : t;
};

const isDateString = (s?: string) => {
  if (!s) return true;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
};

const NewPatientSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters."),

    email: z.preprocess(
      emptyToUndefined,
      z.string().email("Email is invalid (example: name@example.com).").optional()
    ),

    phone: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(6, "Phone is too short (min 6).")
        .max(20, "Phone is too long (max 20).")
        .optional()
    ),

    idnum: z.preprocess(emptyToUndefined, z.string().max(50, "Enroll number is too long.").optional()),

    lastVisit: z
      .preprocess(emptyToUndefined, z.string().optional())
      .refine((v) => isDateString(v), "Last visit date is invalid."),

    gender: z.enum(["male", "female", "other"]).optional(),

    dob: z
      .preprocess(emptyToUndefined, z.string().optional())
      .refine((v) => isDateString(v), "Date of birth is invalid."),

    address: z.preprocess(
      emptyToUndefined,
      z.string().max(200, "Address is too long (max 200).").optional()
    ),

    // Optional. If you want NO status at all: remove this from schema + UI + payload.
    status: z.preprocess(emptyToUndefined, z.enum(["LOW", "MEDIUM", "HIGH"]).optional()),

    notes: z.preprocess(
      emptyToUndefined,
      z.string().max(4000, "Notes is too long (max 4000).").optional()
    ),
  })
  .strict();

type Payload = z.infer<typeof NewPatientSchema>;
type FieldErrors = Partial<Record<keyof Payload, string>>;

function firstErrorField(errors: FieldErrors) {
  const order: (keyof Payload)[] = [
    "name",
    "email",
    "phone",
    "idnum",
    "gender",
    "dob",
    "lastVisit",
    "address",
    "status",
    "notes",
  ];
  return order.find((k) => !!errors[k]);
}

function mapFlattenToFieldErrors(flat: { fieldErrors: Record<string, string[] | undefined> }): FieldErrors {
  const out: FieldErrors = {};
  const fe = flat?.fieldErrors ?? {};
  (Object.keys(fe) as Array<keyof Payload | string>).forEach((k) => {
    const arr = fe[k as string];
    if (arr && arr[0]) (out as any)[k] = arr[0];
  });
  return out;
}

/* ---------------- Page ---------------- */

export default function NewPatientPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enrollNumber, setEnrollNumber] = useState("");
  const [lastVisit, setLastVisit] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"" | "LOW" | "MEDIUM" | "HIGH">("");
  const [notes, setNotes] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Refs for focusing on first invalid field
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
    lastVisit: lastVisitRef,
    gender: genderRef,
    dob: dobRef,
    address: addressRef,
    status: statusRef,
    notes: notesRef,
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Avatar must be 2MB or less.");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => router.push("/dashboard/patients");

  const payload = useMemo(() => {
    const p: Payload = {
      name: fullName,
      email,
      phone,
      idnum: enrollNumber,
      lastVisit,
      gender: (gender || undefined) as any,
      dob,
      address,
      status: (status || undefined) as any,
      notes,
    };
    return p;
  }, [fullName, email, phone, enrollNumber, lastVisit, gender, dob, address, status, notes]);

  function focusFirstError(errs: FieldErrors) {
    const first = firstErrorField(errs);
    if (!first) return;
    const r = refs[first]?.current;
    if (r && typeof r.focus === "function") r.focus();
    if (r && typeof r.scrollIntoView === "function") {
      r.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    // 1) Client validation
    const parsed = NewPatientSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors = mapFlattenToFieldErrors(parsed.error.flatten());
      setErrors(nextErrors);
      setFormError("Please fix the highlighted fields.");
      focusFirstError(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 2) Server validation (same UI)
        const serverFe = json?.details?.fieldErrors;
        if (serverFe) {
          const nextErrors = mapFlattenToFieldErrors({ fieldErrors: serverFe });
          setErrors(nextErrors);
          setFormError(json?.error || "Please fix the highlighted fields.");
          focusFirstError(nextErrors);
          setSaving(false);
          return;
        }

        setFormError(json?.error || "Failed to create patient.");
        setSaving(false);
        return;
      }

      router.push("/dashboard/patients");
    } catch (err) {
      console.error(err);
      setFormError("Network error. Please try again.");
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

  return (
    <main className="w-full">
      <Topbar title="New patient" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <UserPlus className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Create new patient
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Register a new patient and capture their basic clinical information.
                </p>
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

          {/* Global error */}
          {formError && (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {formError}
            </div>
          )}

          {/* Form body */}
          <form
            id="new-patient-form"
            onSubmit={handleSubmit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]"
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
                      className={inputClass("name")}
                      placeholder="e.g. Karthi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
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
                      className={inputClass("email")}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
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
                      className={inputClass("phone")}
                      placeholder="e.g. 7524547760"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone}</p>}
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
                      className={inputClass("idnum")}
                      placeholder="ID / MRN"
                      value={enrollNumber}
                      onChange={(e) => setEnrollNumber(e.target.value)}
                      aria-invalid={!!errors.idnum}
                    />
                  </div>
                  {errors.idnum && <p className="text-[11px] text-rose-600">{errors.idnum}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Gender</label>
                  <select
                    ref={genderRef}
                    className={selectClass("gender")}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as typeof gender)}
                    aria-invalid={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-[11px] text-rose-600">{errors.gender}</p>}
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
                      className={inputClass("dob")}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      aria-invalid={!!errors.dob}
                    />
                  </div>
                  {errors.dob && <p className="text-[11px] text-rose-600">{errors.dob}</p>}
                </div>

                {/* Last visit */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="text-xs font-medium text-slate-600">Last visit</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      ref={lastVisitRef}
                      type="date"
                      className={inputClass("lastVisit")}
                      value={lastVisit}
                      onChange={(e) => setLastVisit(e.target.value)}
                      aria-invalid={!!errors.lastVisit}
                    />
                  </div>
                  {errors.lastVisit && (
                    <p className="text-[11px] text-rose-600">{errors.lastVisit}</p>
                  )}
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
                    className={inputClass("address")}
                    placeholder="City, Country"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-invalid={!!errors.address}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-rose-600">{errors.address}</p>
                )}
              </div>

              {/* Status (optional). Remove block if you want none */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select
                  ref={statusRef}
                  className={selectClass("status")}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  aria-invalid={!!errors.status}
                >
                  <option value="">Select status</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                {errors.status && (
                  <p className="text-[11px] text-rose-600">{errors.status}</p>
                )}
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
                    className={textareaClass("notes")}
                    placeholder="Symptoms, allergies, important details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    aria-invalid={!!errors.notes}
                  />
                </div>
                {errors.notes && <p className="text-[11px] text-rose-600">{errors.notes}</p>}
              </div>

              {/* Mobile bar */}
              <div className="sticky bottom-3 z-10 flex gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur sm:hidden">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Right column: avatar */}
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
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="h-6 w-6" />
                    )}
                  </button>

                  <p className="mt-3 max-w-[240px] text-center text-xs text-slate-500">
                    Upload a profile photo to quickly recognize this patient.
                    JPG or PNG, up to 2 MB.
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
