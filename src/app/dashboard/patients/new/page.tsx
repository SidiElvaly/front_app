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

const NewPatientSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.preprocess(
      emptyToUndefined,
      z.string().email("Invalid email").optional()
    ),
    phone: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(6, "Phone too short")
        .max(20, "Phone too long")
        .optional()
    ),
    idnum: z.preprocess(emptyToUndefined, z.string().max(50).optional()),
    lastVisit: z.preprocess(emptyToUndefined, z.string().optional()), // YYYY-MM-DD
    gender: z.enum(["male", "female", "other"]).optional(),
    dob: z.preprocess(emptyToUndefined, z.string().optional()), // YYYY-MM-DD
    address: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
    // If you really want patient risk status, keep it. If not, remove it here and in API body.
    status: z.preprocess(emptyToUndefined, z.enum(["LOW", "MEDIUM", "HIGH"]).optional()),
    notes: z.preprocess(emptyToUndefined, z.string().max(4000).optional()),
  })
  .strict();

type FieldErrors = Partial<Record<keyof z.infer<typeof NewPatientSchema>, string>>;

function isValidDateString(s?: string) {
  if (!s) return true;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
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

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // simple client-side check
    if (file.size > 2 * 1024 * 1024) {
      setFormError("Avatar must be <= 2MB");
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
    return {
      name: fullName,
      email,
      phone,
      idnum: enrollNumber,
      lastVisit,
      gender: gender || undefined,
      dob,
      address,
      status: status || undefined,
      notes,
    };
  }, [fullName, email, phone, enrollNumber, lastVisit, gender, dob, address, status, notes]);

  function applyZodErrors(flat: any) {
    const fieldErrors: FieldErrors = {};
    const fe = flat?.fieldErrors ?? {};
    // Map schema keys to UI fields
    if (fe.name?.[0]) fieldErrors.name = fe.name[0];
    if (fe.email?.[0]) fieldErrors.email = fe.email[0];
    if (fe.phone?.[0]) fieldErrors.phone = fe.phone[0];
    if (fe.idnum?.[0]) fieldErrors.idnum = fe.idnum[0];
    if (fe.lastVisit?.[0]) fieldErrors.lastVisit = fe.lastVisit[0];
    if (fe.gender?.[0]) fieldErrors.gender = fe.gender[0];
    if (fe.dob?.[0]) fieldErrors.dob = fe.dob[0];
    if (fe.address?.[0]) fieldErrors.address = fe.address[0];
    if (fe.status?.[0]) fieldErrors.status = fe.status[0];
    if (fe.notes?.[0]) fieldErrors.notes = fe.notes[0];
    setErrors(fieldErrors);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    // Extra date safety
    if (!isValidDateString(dob)) {
      setErrors((prev) => ({ ...prev, dob: "Invalid date of birth" }));
      return;
    }
    if (!isValidDateString(lastVisit)) {
      setErrors((prev) => ({ ...prev, lastVisit: "Invalid last visit date" }));
      return;
    }

    // Validate with Zod
    const parsed = NewPatientSchema.safeParse(payload);
    if (!parsed.success) {
      applyZodErrors(parsed.error.flatten());
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
        setFormError(json?.error || "Failed to create patient");
        setSaving(false);
        return;
      }

      router.push("/dashboard/patients");
    } catch (err) {
      console.error(err);
      setFormError("Network error");
      setSaving(false);
    }
  };

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

          {/* Form-level error */}
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
                      type="text"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.name
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      placeholder="e.g. Karthi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
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
                      type="email"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.email
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      type="tel"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.phone
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      placeholder="e.g. 7524547760"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                      type="text"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.idnum
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      placeholder="ID / MRN"
                      value={enrollNumber}
                      onChange={(e) => setEnrollNumber(e.target.value)}
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
                    className={[
                      "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                      errors.gender
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                    ].join(" ")}
                    value={gender}
                    onChange={(e) => setGender(e.target.value as typeof gender)}
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
                      type="date"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.dob
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
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
                      type="date"
                      className={[
                        "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                        errors.lastVisit
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                      ].join(" ")}
                      value={lastVisit}
                      onChange={(e) => setLastVisit(e.target.value)}
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
                    type="text"
                    className={[
                      "w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                      errors.address
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                    ].join(" ")}
                    placeholder="City, Country"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-rose-600">{errors.address}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select
                  className={[
                    "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-1",
                    errors.status
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                  ].join(" ")}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
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
                    className={[
                      "min-h-[120px] w-full rounded-xl border bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:ring-1",
                      errors.notes
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                    ].join(" ")}
                    placeholder="Symptoms, allergies, important details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                    className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm hover:bg-slate-50 sm:h-28 sm:w-28"
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
