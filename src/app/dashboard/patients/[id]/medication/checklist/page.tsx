"use client";

import React, { useEffect, useState, use } from "react";
import Topbar from "@/components/Topbar";
import {
  Pill,
  Check,
  X,
  Clock,
  AlertCircle,
  ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import { decodeId } from "@/lib/obfuscation";

type Dose = {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "GIVEN" | "MISSED";
  medicationPlan: {
    drugName: string;
    dosage: string;
  };
};

export default function NurseChecklist({
  params,
}: {
  params: Promise<{ id: string }>; // This matches your folder name [id]
}) {
  const { id: rawId } = use(params);
  const id = React.useMemo(() => decodeId(rawId) || "", [rawId]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  async function load() {
    setLoading(true);
    try {
      // This ID from the URL is passed to the API
      // Ensure your API folder is: /api/medication-doses/today/[patientId]/route.ts
      const r = await fetch(`/api/medication-doses/today/${id}`, { cache: "no-store" });
      const data = await r.json();
      setDoses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load schedule");
      setDoses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    load();
  }, [id]);

  async function mark(doseId: string, status: "GIVEN" | "MISSED") {
    const loadingToast = toast.loading("Updating status...");
    try {
      const res = await fetch(`/api/medication-doses/${doseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast.success(`Dose marked as ${status.toLowerCase()}`, { id: loadingToast });
      load();
    } catch {
      toast.error("Failed to update dose status", { id: loadingToast });
    }
  }

  if (!mounted) return null;

  return (
    <main className="w-full bg-slate-50/50 min-h-screen">
      <Topbar title="Nurse Checklist" />

      <section className="mx-auto max-w-4xl px-4 pb-12 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Patient Checklist</h1>
            <p className="text-sm text-slate-500">Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="hidden sm:block">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              {doses.filter(d => d.status === 'PENDING').length} Pending Doses
            </span>
          </div>
        </div>

        {loading ? (
          <MedicationSkeleton />
        ) : doses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {doses.map((d) => (
              <div
                key={d.id}
                className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${d.status === "PENDING" ? "border-slate-100 shadow-sm" : "border-slate-50 opacity-75"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${d.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                    d.status === "GIVEN" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                    <Pill className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">{d.medicationPlan.drugName}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="text-slate-900 font-bold">{d.medicationPlan.dosage}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(d.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {d.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => mark(d.id, "GIVEN")}
                        className="flex-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 sm:flex-none shadow-md shadow-emerald-100"
                      >
                        Confirm Given
                      </button>
                      <button
                        onClick={() => mark(d.id, "MISSED")}
                        className="flex-1 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 sm:flex-none"
                      >
                        Missed
                      </button>
                    </>
                  ) : (
                    <div className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${d.status === "GIVEN" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                      {d.status === "GIVEN" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {d.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// ... Keep your EmptyState and MedicationSkeleton functions from before ...
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center bg-white">
      <div className="mb-4 rounded-full bg-slate-50 p-4">
        <ClipboardCheck className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">All Caught Up</h3>
      <p className="text-sm text-slate-500">No medications scheduled for this patient right now.</p>
    </div>
  );
}

function MedicationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-white border border-slate-100" />
      ))}
    </div>
  );
}