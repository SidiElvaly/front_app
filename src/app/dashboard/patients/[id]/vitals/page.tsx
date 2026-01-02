"use client";

import React, { useEffect, useState, use } from "react";
import Topbar from "@/components/Topbar";
import {
  HeartPulse,
  Activity,
  Thermometer,
  Droplets,
  User,
  History,
  Calendar,
} from "lucide-react";
import Skeleton from "@/components/Skeleton";

type Vital = {
  id: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  recordedAt: string;
  recordedBy?: {
    name?: string;
    email?: string;
  };
};

function VitalsSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className="h-16 bg-slate-50 border-b border-slate-100" />
      <div className="px-4 py-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export default function VitalsHistory({
  params,
}: {
  params: Promise<{ id: string }>; // Fixed: params is now a Promise in Next.js 15
}) {
  const { id } = use(params); // Unwrapping the promise
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVitals() {
      try {
        const res = await fetch(`/api/vitals/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setVitals(data);
      } catch (err) {
        console.error("Failed to load vitals history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVitals();
  }, [id]);

  return (
    <main className="w-full min-h-screen bg-slate-50/30">
      <Topbar title="Vitals history" />

      <section className="px-3 sm:px-4 lg:px-6 pb-10 pt-4">
        {loading ? (
          <VitalsSkeleton />
        ) : (
          <div className="card overflow-hidden border border-slate-100 shadow-card bg-white rounded-2xl">
            
            {/* Header - Styled to match Edit Patient */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-4 sm:px-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <History className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Clinical History</h2>
                <p className="text-xs text-slate-500">Timeline of all recorded physiological signs.</p>
              </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-slate-50">
              {vitals.map((v) => (
                <div key={v.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span suppressHydrationWarning>
                        {new Date(v.recordedAt).toLocaleDateString()} — {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      <User className="h-3 w-3" />
                      {v.recordedBy?.name?.split(' ')[0] ?? "Staff"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ValueCard
                      label="BP"
                      value={v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : "—"}
                      icon={<HeartPulse className="h-3.5 w-3.5 text-rose-500" />}
                    />
                    <ValueCard
                      label="HR"
                      value={v.heartRate ? `${v.heartRate} bpm` : "—"}
                      icon={<Activity className="h-3.5 w-3.5 text-emerald-500" />}
                    />
                    <ValueCard
                      label="Temp"
                      value={v.temperature != null ? `${v.temperature}°C` : "—"}
                      icon={<Thermometer className="h-3.5 w-3.5 text-amber-500" />}
                    />
                    <ValueCard
                      label="SpO₂"
                      value={v.spo2 != null ? `${v.spo2}%` : "—"}
                      icon={<Droplets className="h-3.5 w-3.5 text-cyan-500" />}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Clean Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Blood Pressure</th>
                    <th className="px-6 py-4">Heart Rate</th>
                    <th className="px-6 py-4">Temperature</th>
                    <th className="px-6 py-4">Oxygen (SpO₂)</th>
                    <th className="px-6 py-4">Recorder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vitals.map((v) => (
                    <tr key={v.id} className="group hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700" suppressHydrationWarning>
                        {new Date(v.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                          <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                          {v.systolicBP}/{v.diastolicBP} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {v.heartRate} <span className="text-xs text-slate-400">bpm</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {v.temperature}°C
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${v.spo2 && v.spo2 < 95 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {v.spo2}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {v.recordedBy?.name?.charAt(0) ?? "S"}
                          </div>
                          <span className="text-xs text-slate-600">{v.recordedBy?.name ?? "Medical Staff"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {vitals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-50 p-4 mb-4">
                  <Activity className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-sm font-medium text-slate-400">No medical records found for this patient.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------- Sub-components ---------- */

function ValueCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/50">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}