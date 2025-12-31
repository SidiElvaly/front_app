// src/app/dashboard/patients/[id]/admission/page.tsx
"use client";

import { useEffect, useState, use as usePromise, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { CalendarDays, FileText, Stethoscope, ArrowLeft, Save } from "lucide-react";

type PatientMini = { id: string; name: string };

export default function AdmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: patientId } = usePromise(params);
  const router = useRouter();

  const [patient, setPatient] = useState<PatientMini | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [currentDiagnosis, setCurrentDiagnosis] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load patient");
        const json = await res.json();
        setPatient({ id: json.patient.id, name: json.patient.name });
      } catch {
        setPatient(null);
      } finally {
        setLoadingPatient(false);
      }
    }
    loadPatient();
  }, [patientId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitDate,
          reason,
          currentDiagnosis,
          medicalHistory: medicalHistory.trim() ? medicalHistory : undefined,
          notes: extraNotes.trim() ? extraNotes : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErr(json?.error || "Failed to save admission");
        setSaving(false);
        return;
      }

      router.push(`/dashboard/patients/${patientId}`);
    } catch {
      setErr("Network error");
      setSaving(false);
    }
  }

  return (
    <main className="w-full">
      <Topbar title="Admission form" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">Reception / Admission</h2>

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
                form="admission-form"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save admission"}
              </button>
            </div>
          </div>

          {err && (
            <div className="mx-4 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {err}
            </div>
          )}

          <form
            id="admission-form"
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
                <label className="text-xs font-medium text-slate-600">Reason of visit *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Required. Primary complaint or reason for visit.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Current diagnosis *</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-300">
                    <Stethoscope className="h-4 w-4" />
                  </span>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={currentDiagnosis}
                    onChange={(e) => setCurrentDiagnosis(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Required. Diagnosis determined during visit.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Additional notes (optional)</label>
                <textarea
                  className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">Optional. Any other observations.</p>
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-sm font-semibold text-slate-900">Medical history</p>
              <p className="mt-1 text-xs text-slate-500">
                Past illnesses, chronic conditions, allergies, current treatments...
              </p>

              <textarea
                className="mt-4 min-h-[260px] w-full flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
