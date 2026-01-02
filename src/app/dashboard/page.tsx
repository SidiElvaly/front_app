"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link"; 
import Topbar from "@/components/Topbar";
import Avatar from "@/components/Avatar";
import StatusPill from "@/components/StatusPill";
import {
  Users,
  CalendarDays,
  Receipt,
  FileText,
  ChevronRight,
  MoreHorizontal,
  Phone,
  Clock,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const map: Record<string, string> = {
    default: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
    red: "bg-rose-50 text-rose-600 border border-rose-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------------- Skeleton ---------------- */

function DashboardSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 pb-10">
      <div className="mt-1 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-60 rounded bg-slate-100 animate-pulse" />
        <div className="h-9 w-full sm:w-80 rounded-xl bg-slate-100 animate-pulse" />
      </div>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                <div className="mt-2 h-7 w-20 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 w-full rounded-2xl bg-slate-50 animate-pulse" />
    </section>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") redirect("/signin");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    setLoading(true);
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((json) => {
        setData({
          totalPatients: json.totalPatients ?? 0,
          newThisWeek: json.newThisWeek ?? 0,
          appointmentsToday: json.appointmentsToday ?? 0,
          pendingBills: json.pendingBills ?? 0,
          highRiskPatients: json.highRiskPatients ?? [],
          upcomingAppointments: json.upcomingAppointments ?? [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });
  }, [status]);

  if (status !== "authenticated" || loading || !data) {
    return (
      <main className="w-full">
        <Topbar title="Dashboard" />
        <DashboardSkeleton />
      </main>
    );
  }

  const KPIS = [
    { label: "Total patients", value: data.totalPatients, icon: Users, tone: "bg-emerald-100 text-emerald-700" },
    { label: "New this week", value: data.newThisWeek, icon: CalendarDays, tone: "bg-sky-100 text-sky-700" },
    { label: "Appointments today", value: data.appointmentsToday, icon: FileText, tone: "bg-violet-100 text-violet-700" },
    { label: "Pending bills", value: data.pendingBills, icon: Receipt, tone: "bg-amber-100 text-amber-700" },
  ];

  return (
    <main className="w-full bg-slate-50/30 min-h-screen">
      <Topbar title="Dashboard" />

      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 pb-10">
        <div className="mt-1 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Clinic</span> &gt;{" "}
            <span className="text-gray-500">Patient overview</span>
          </div>
          <div className="relative w-full sm:w-80">
            <input className="input w-full px-3 text-xs" placeholder="Search patients..." />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {KPIS.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`card flex items-center justify-between gap-4 px-4 py-4 shadow-sm border-0 ${tone}`}>
              <div className="min-w-0">
                <div className="text-xs text-gray-600/80">{label}</div>
                <div className="mt-1 text-2xl font-semibold truncate">{numberFormatter.format(value)}</div>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* IMPROVED PATIENTS TABLE */}
          <div className="card p-0 lg:col-span-2 overflow-hidden bg-white border border-gray-100">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Priority patients</h2>
                <p className="text-[11px] text-gray-500">Active high-risk monitoring</p>
              </div>
              <Link 
                href="/dashboard/patients" 
                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {data.highRiskPatients.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <Avatar name={p.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                       <span className="flex items-center gap-1"><Phone size={10}/> {p.phone || "No phone"}</span>
                       <span className="hidden sm:inline text-gray-300">|</span>
                       <span className="hidden sm:flex items-center gap-1"><Clock size={10}/> Last visit: {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "New"}</span>
                    </div>
                  </div>
                  
                  {/* Status at the far right */}
                  <div className="flex items-center gap-3">
                    <StatusPill value="HIGH" />
                    <button className="p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg text-gray-400">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {data.highRiskPatients.length === 0 && (
                <div className="text-xs text-gray-500 py-10 text-center italic">No high-risk patients found.</div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* IMPROVED APPOINTMENTS SECTION */}
            <div className="card p-0 bg-white border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h2 className="text-sm font-bold text-gray-800">Upcoming appointments</h2>
              </div>
              <div className="p-4 space-y-3">
                {data.upcomingAppointments.map((a: any) => (
                  <div key={a.id} className="group relative flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-50 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all cursor-default">
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-gray-800">
                        {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {a.room || "Room TBA"}
                      </div>
                    </div>
                    {/* Status at the far right */}
                    <Badge tone="green">{a.type}</Badge>
                  </div>
                ))}
                {data.upcomingAppointments.length === 0 && (
                  <div className="text-xs text-gray-500 py-4 text-center">No upcoming appointments.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}