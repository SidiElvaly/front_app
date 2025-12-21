"use client";

import { useEffect, useState, useRef, FormEvent, use as usePromise } from "react";
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

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = usePromise(params);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enrollNumber, setEnrollNumber] = useState("");
  const [lastVisit, setLastVisit] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
        setLastVisit(patient.lastVisit ? patient.lastVisit.slice(0, 10) : "");
        setDob(patient.dob ? patient.dob.slice(0, 10) : "");
        setGender(patient.gender || "");
        setAddress(patient.address || "");
        setStatus(patient.status || "");
        setNotes(patient.notes || "");
      } catch {
        alert("Failed to load patient");
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
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => router.push("/dashboard/patients");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          idnum: enrollNumber,
          lastVisit,
          gender,
          dob,
          address,
          status,
          notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to update patient");
        return;
      }

      router.push("/dashboard/patients");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Edit patient" />
        <div className="px-4 py-6 text-sm text-gray-500">Loading...</div>
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
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                  Edit patient
                </h2>
                <p className="text-xs text-slate-500">
                  Update clinical information for this patient.
                </p>
              </div>
            </div>

            {/* Buttons: full-width on mobile, inline on sm+ */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 sm:w-auto sm:py-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                form="edit-patient-form"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 sm:w-auto sm:py-1.5"
              >
                Save changes
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            id="edit-patient-form"
            onSubmit={handleSubmit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)] lg:gap-8"
          >
            {/* Left column */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Full name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <User2 className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Phone
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enroll number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Enroll number
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <IdCard className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={enrollNumber}
                      onChange={(e) => setEnrollNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Gender
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Date of birth
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                </div>

                {/* Last visit */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Last visit
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      value={lastVisit}
                      onChange={(e) => setLastVisit(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Notes
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right column: avatar (responsive) */}
            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
              <p className="mb-3 text-sm font-semibold text-slate-800">Avatar</p>

              <div className="flex flex-1 flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm hover:bg-slate-50 sm:h-32 sm:w-32"
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

                <p className="mt-3 max-w-[260px] text-center text-xs text-slate-500">
                  Avatar upload coming soon.
                </p>

                {/* Buttons: full-width on mobile */}
                <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="w-full rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:bg-emerald-600 sm:w-auto sm:py-1.5"
                  >
                    Choose photo
                  </button>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 sm:w-auto sm:py-1.5"
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
          </form>
        </div>
      </section>
    </main>
  );
}
