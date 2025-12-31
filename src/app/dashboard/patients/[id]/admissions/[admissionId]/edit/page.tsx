"use client";

import { useEffect, useState, use as usePromise, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { CalendarDays, FileText, Stethoscope, ArrowLeft, Save } from "lucide-react";
import FormSkeleton from "@/components/FormSkeleton";

type Admission = {
  id: string;
  visitDate: string;
  reason: string;
  currentDiagnosis: string;
  medicalHistory?: string | null;
};

export default function EditAdmissionPage({
  params,
}: {
  params: Promise<{ id: string; admissionId: string }>;
}) {
  const { id: patientId, admissionId } = usePromise(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [visitDate, setVisitDate] = useState("");
  const [reason, setReason] = useState("");
  const [currentDiagnosis, setCurrentDiagnosis] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [notes, setNotes] = useState(""); // optional append to patient file

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(`/api/patients/${patientId}/admissions/${admissionId}`, {
          cache: "no-store",
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load admission");

        const a: Admission = json.admission;

        if (!alive) return;
        setVisitDate(a.visitDate ? new Date(a.visitDate).toISOString().slice(0, 10) : "");
        setReason(a.reason ?? "");
        setCurrentDiagnosis(a.currentDiagnosis ?? "");
        setMedicalHistory(a.medicalHistory ?? "");
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Failed to load admission");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [patientId, admissionId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/admissions/${admissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitDate, // YYYY-MM-DD
          reason,
          currentDiagnosis,
          medicalHistory: medicalHistory.trim() ? medicalHistory : "",
          notes: notes.trim() ? notes : "",
          updatePatient: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErr(json?.error || "Failed to update admission");
        setSaving(false);
        return;
      }

      router.push(`/dashboard/patients/${patientId}`);
    } catch {
      setErr("Network error");
      setSaving(false);
    }
  }

  // ...

  // ...

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Edit admission" />
        <FormSkeleton />
      </main>
    );
  }

  return (
    <main className="w-full">
      <Topbar title="Edit admission" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">Edit Admission</h2>
              <p className="mt-1 text-xs text-slate-500">Update admission details.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <button
                type="submit"
                form="edit-admission-form"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {err && (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {err}
            </div>
          )}

          <form
            id="edit-admission-form"
            onSubmit={submit}
            className="grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]"
          >
            <div className="space-y-6">
              <div className="space-y-1 max-w-sm">
                <label className="text-xs font-medium text-slate-600">Visit date *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Required. The date the patient visited.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Reason *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Required. Primary complaint or reason for visit.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Diagnosis *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={currentDiagnosis}
                    onChange={(e) => setCurrentDiagnosis(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Required. Diagnosis determined during visit.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Notes to append to patient file (optional)
                </label>
                <textarea
                  className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">Optional. Will be appended to the patient&apos;s main notes file.</p>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-sm font-semibold text-slate-900">Medical history</p>
              <p className="mt-1 text-xs text-slate-500">
                Past illnesses, allergies, treatments...
              </p>

              <textarea
                className="mt-4 min-h-[260px] w-full flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
