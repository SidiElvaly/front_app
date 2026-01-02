"use client";

import React, { useEffect, useState, use } from "react";
import Topbar from "@/components/Topbar";
import { Pill, User, Calendar, Clock, Plus, ChevronRight } from "lucide-react";
import Skeleton from "@/components/Skeleton";
import Link from "next/link";

type Plan = {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  prescribedBy?: {
    name?: string;
    email?: string;
  };
};

function MedicationSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className="h-20 bg-slate-50 border-b border-slate-100 px-6 flex items-center">
        <Skeleton className="h-10 w-48 rounded-lg bg-slate-200" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-slate-50" />
        ))}
      </div>
    </div>
  );
}

export default function MedicationPlans({
  params,
}: {
  params: Promise<{ id: string }>; // Fixed for Next.js 15
}) {
  const { id } = use(params); // Unwrap params
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/medication-plans/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="w-full bg-slate-50/30 min-h-screen">
      <Topbar title="Medication plans" />

      <section className="px-3 pb-10 pt-4 sm:px-4 lg:px-6">
        {loading ? (
          <MedicationSkeleton />
        ) : (
          <div className="card overflow-hidden border border-slate-100 shadow-card bg-white rounded-2xl">
            
            {/* Header - Matching Vitals/Edit Pages */}
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-cyan-50 to-white px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Pill className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Active Prescriptions</h2>
                  <p className="text-xs text-slate-500">Current and historical medication history.</p>
                </div>
              </div>

              <Link
                href={`/dashboard/patients/${id}/medication/new`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Medication
              </Link>
            </div>

            {/* Mobile View */}
            <div className="md:hidden px-3 py-4 space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-900">{p.drugName}</span>
                    <StatusBadge isActive={p.isActive} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">{p.dosage}</span>
                    <span>•</span>
                    <span>{p.frequency.replaceAll("_", " ")}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      {p.prescribedBy?.name ?? "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto px-6 pb-6 pt-2">
              <table className="w-full border-separate border-spacing-y-3 text-sm">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 text-left">Medication</th>
                    <th className="px-4 py-3 text-left">Dosage</th>
                    <th className="px-4 py-3 text-left">Frequency</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left text-right">Prescriber</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} className="group transition-all hover:translate-x-0.5">
                      <td className="rounded-l-xl bg-slate-50/50 px-4 py-4 font-bold text-slate-900 group-hover:bg-slate-50">
                        {p.drugName}
                      </td>
                      <td className="bg-slate-50/50 px-4 py-4 text-slate-600 group-hover:bg-slate-50">
                        {p.dosage}
                      </td>
                      <td className="bg-slate-50/50 px-4 py-4 group-hover:bg-slate-50 text-xs">
                        <span className="capitalize">{p.frequency.toLowerCase().replaceAll("_", " ")}</span>
                      </td>
                      <td className="bg-slate-50/50 px-4 py-4 group-hover:bg-slate-50">
                        <StatusBadge isActive={p.isActive} />
                      </td>
                      <td className="bg-slate-50/50 px-4 py-4 group-hover:bg-slate-50 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                           {new Date(p.startDate).toLocaleDateString()}
                           {p.endDate && <span>→ {new Date(p.endDate).toLocaleDateString()}</span>}
                        </div>
                      </td>
                      <td className="rounded-r-xl bg-slate-50/50 px-4 py-4 text-right group-hover:bg-slate-50">
                        <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-700">
                          {p.prescribedBy?.name ?? "—"}
                          <User className="h-3.5 w-3.5 text-slate-300" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {plans.length === 0 && (
                <div className="py-20 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-3">
                    <Pill className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No medication plans found for this patient.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
      isActive 
        ? "bg-emerald-100 text-emerald-700" 
        : "bg-slate-100 text-slate-500"
    }`}>
      {isActive ? "Active" : "Completed"}
    </span>
  );
}