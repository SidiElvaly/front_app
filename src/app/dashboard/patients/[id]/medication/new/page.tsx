"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import { 
  Pill, 
  Calendar, 
  Clock, 
  X, 
  Save, 
  Info, 
  ClipboardList,
  Stethoscope,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

/* ---------------- Helpers ---------------- */
function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-slate-400">{children}</p>;
}

export default function NewMedicationPlan({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/medication-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          drugName: data.drugName,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate || null,
          notes: data.notes || null,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Medication plan created");
      router.push(`/dashboard/patients/${id}`);
    } catch {
      toast.error("Failed to create medication plan");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-300";
  const selectClass = "w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer";

  return (
    <main className="w-full bg-slate-50/30 min-h-screen">
      <Topbar title="New medication plan" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card bg-white rounded-2xl">
          
          {/* Header - Gradient style matching Vitals Page */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <Pill className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">Create Prescription</h2>
                <p className="text-xs text-slate-500">Define medication schedule and instructions.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:w-auto sm:py-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                form="medication-form"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto sm:py-1.5 transition-all"
              >
                {loading ? "Saving..." : "Create plan"}
                {!loading && <Save className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form
            id="medication-form"
            onSubmit={submit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)] lg:gap-8"
          >
            {/* Left Column: Medication Details */}
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                
                {/* Drug Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Medication Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <input name="drugName" type="text" placeholder="e.g. Paracetamol" className={inputClass} required />
                  </div>
                  <FieldHint>The scientific or brand name of the drug.</FieldHint>
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Dosage</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <input name="dosage" type="text" placeholder="e.g. 500mg" className={inputClass} required />
                  </div>
                  <FieldHint>The amount to be taken per dose.</FieldHint>
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Frequency</label>
                  <div className="relative">
                    <select name="frequency" className={selectClass}>
                      <option value="DAILY">Once daily</option>
                      <option value="EVERY_12_HOURS">Every 12 hours</option>
                      <option value="EVERY_8_HOURS">Every 8 hours</option>
                      <option value="EVERY_6_HOURS">Every 6 hours</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Start Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input name="startDate" type="datetime-local" className={inputClass} required />
                  </div>
                </div>
              </div>

              {/* Secondary Details */}
              <div className="pt-4 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">End Date (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Clock className="h-4 w-4" />
                    </span>
                    <input name="endDate" type="datetime-local" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Additional Notes</label>
                <textarea 
                  name="notes" 
                  rows={4} 
                  placeholder="e.g. Take after meals, avoid alcohol..." 
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Right Column: Guidance/Summary Sidebar */}
            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Info className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold">Prescription Guidance</p>
              </div>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-500 leading-relaxed">Ensure the dosage is cross-checked with the patient's age and weight.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-500 leading-relaxed">Clearly state administration instructions (e.g., "with food") in the notes section.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-500 leading-relaxed">Double-check for potential drug-to-drug interactions before saving.</p>
                </li>
              </ul>

              {/* Timestamp Section */}
              <div className="mt-auto pt-6">
                <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Plan Created At</span>
                  </div>
                  <p suppressHydrationWarning className="text-xs font-medium text-slate-700">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}