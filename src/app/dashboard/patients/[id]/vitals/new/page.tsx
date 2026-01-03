"use client";

import React, { useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import {
  Activity,
  Thermometer,
  HeartPulse,
  Droplets,
  Bed,
  Save,
  X,
  Stethoscope,
  Info,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { decodeId } from "@/lib/obfuscation";

/* ---------------- Helpers ---------------- */
function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-slate-400">{children}</p>;
}

export default function NewVitals({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: rawId } = use(params);
  const id = React.useMemo(() => decodeId(rawId) || "", [rawId]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          systolicBP: Number(data.systolicBP),
          diastolicBP: Number(data.diastolicBP),
          heartRate: Number(data.heartRate),
          temperature: Number(data.temperature),
          spo2: Number(data.spo2),
          roomNumber: data.roomNumber,
          bedNumber: data.bedNumber,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Vitals recorded successfully");
      router.push(`/dashboard/patients/${id}`);
    } catch {
      toast.error("Failed to record vitals");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-300";

  return (
    <main className="w-full bg-slate-50/30 min-h-screen">
      <Topbar title="Record vitals" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        <div className="card overflow-hidden border border-slate-100 shadow-card bg-white rounded-2xl">

          {/* Header - Gradient style matching Edit Patient */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">Record Patient Vitals</h2>
                <p className="text-xs text-slate-500">Enter current physiological observations.</p>
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
                form="vitals-form"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto sm:py-1.5 transition-all"
              >
                {loading ? "Saving..." : "Save vitals"}
                {!loading && <Save className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form
            id="vitals-form"
            onSubmit={submit}
            className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)] lg:gap-8"
          >
            {/* Left Column: Primary Vitals */}
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">

                {/* Systolic BP */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Systolic BP (mmHg)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <HeartPulse className="h-4 w-4" />
                    </span>
                    <input name="systolicBP" type="number" placeholder="120" className={inputClass} required />
                  </div>
                  <FieldHint>The top number in a blood pressure reading.</FieldHint>
                </div>

                {/* Diastolic BP */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Diastolic BP (mmHg)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <HeartPulse className="h-4 w-4" />
                    </span>
                    <input name="diastolicBP" type="number" placeholder="80" className={inputClass} required />
                  </div>
                  <FieldHint>The bottom number in a blood pressure reading.</FieldHint>
                </div>

                {/* Heart Rate */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Heart Rate (BPM)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Activity className="h-4 w-4" />
                    </span>
                    <input name="heartRate" type="number" placeholder="72" className={inputClass} required />
                  </div>
                  <FieldHint>Number of heartbeats per minute.</FieldHint>
                </div>

                {/* SpO2 */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Oxygen Saturation (SpO₂ %)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Droplets className="h-4 w-4" />
                    </span>
                    <input name="spo2" type="number" placeholder="98" className={inputClass} required />
                  </div>
                  <FieldHint>Pulse oximetry level.</FieldHint>
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Temperature (°C)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                      <Thermometer className="h-4 w-4" />
                    </span>
                    <input name="temperature" type="number" step="0.1" placeholder="36.6" className={inputClass} required />
                  </div>
                  <FieldHint>Body core temperature.</FieldHint>
                </div>
              </div>

              {/* Location Group */}
              <div className="pt-4">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Room Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                        <Bed className="h-4 w-4" />
                      </span>
                      <input name="roomNumber" type="text" placeholder="A-12" className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Bed Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                        <Bed className="h-4 w-4" />
                      </span>
                      <input name="bedNumber" type="text" placeholder="03" className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Info/Summary box matching the Avatar box style */}
            <div className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Info className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold">Recording Tips</p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-500 leading-relaxed">Ensure the patient has been resting for at least 5 minutes before BP readings.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <p className="text-xs text-slate-500 leading-relaxed">Check that the pulse oximeter is properly placed for accurate SpO₂.</p>
                </li>
              </ul>
              {/* Updated Timestamp Section */}
              <div className="mt-auto pt-6">
                <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Entry Time</span>
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