"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-rose-50 text-rose-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------------- Skeleton ---------------- */

function DashboardSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 pb-10">
      {/* Breadcrumb + search */}
      <div className="mt-1 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-60 rounded bg-slate-100 animate-pulse" />
        <div className="h-9 w-full sm:w-80 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      {/* Reminder banner */}
      <div className="mb-5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-4 w-4 rounded bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-56 max-w-full rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 px-4 py-4"
          >
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

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* High-risk patients (left, 2 cols) */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4 lg:col-span-2">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-48 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="h-7 w-36 rounded-full bg-slate-100 animate-pulse" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 animate-pulse" />
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                      <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                    <div className="h-3 w-52 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>

                <div className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments (right col) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-52 rounded bg-slate-100 animate-pulse" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { status } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        setData({
          totalPatients: 0,
          newThisWeek: 0,
          appointmentsToday: 0,
          pendingBills: 0,
          highRiskPatients: [],
          upcomingAppointments: [],
        });
        setLoading(false);
      });
  }, [status]);

  // Keep this simple: topbar + skeleton (no blank page, no "Loading..." text)
  if (status !== "authenticated") {
    return (
      <main className="w-full">
        <Topbar title="Dashboard" />
        <DashboardSkeleton />
      </main>
    );
  }

  if (loading || !data) {
    return (
      <main className="w-full">
        <Topbar title="Dashboard" />
        <DashboardSkeleton />
      </main>
    );
  }

  const KPIS = [
    {
      label: "Total patients",
      value: data.totalPatients,
      icon: Users,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "New this week",
      value: data.newThisWeek,
      icon: CalendarDays,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "Appointments today",
      value: data.appointmentsToday,
      icon: FileText,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "Pending bills",
      value: data.pendingBills,
      icon: Receipt,
      tone: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <main className="w-full">
      <Topbar title="Dashboard" />

      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 pb-10">
        {/* Breadcrumb + search */}
        <div className="mt-1 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Clinic</span> &gt;{" "}
            <span className="text-gray-500">Patient overview</span>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              className="input w-full px-3 text-xs"
              placeholder="Search patients, files, appointments…"
            />
          </div>
        </div>



        {/* KPI Cards */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {KPIS.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className={`card flex items-center justify-between gap-4 px-4 py-4 shadow-sm border-0 ${tone}`}
            >
              <div className="min-w-0">
                <div className="text-xs text-gray-600/80">{label}</div>
                <div className="mt-1 text-2xl font-semibold truncate">
                  {numberFormatter.format(value)}
                </div>
              </div>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* High-risk patients */}
          <div className="card p-4 lg:col-span-2">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-800">
                  Priority patients &gt; Today&apos;s focus
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Highest risk patients based on status.
                </p>
              </div>

              <button className="badge inline-flex items-center gap-1 self-start sm:self-auto">
                View all patients <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {data.highRiskPatients.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={p.name} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {p.name}
                        </span>
                        <StatusPill value="HIGH" />
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        Last visit:{" "}
                        {p.lastVisit
                          ? new Date(p.lastVisit).toLocaleDateString()
                          : "No record"}
                      </div>
                    </div>
                  </div>

                  <button className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}

              {data.highRiskPatients.length === 0 && (
                <div className="text-xs text-gray-500 py-4 text-center">
                  No high-risk patients found.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-4">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Upcoming appointments
                </h2>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                {data.upcomingAppointments.map((a: any) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-gray-800 truncate">
                        {new Date(a.date).toLocaleDateString()}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500 truncate">
                        {a.room || "Room TBA"}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge tone="green">{a.type}</Badge>
                    </div>
                  </div>
                ))}

                {data.upcomingAppointments.length === 0 && (
                  <div className="text-xs text-gray-500 py-4 text-center">
                    No upcoming appointments.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
