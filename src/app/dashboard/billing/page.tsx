"use client";

import { useEffect, useState, useMemo } from "react";
import Topbar from "@/components/Topbar";
import { CalendarDays, DollarSign, CreditCard } from "lucide-react";
/* ---------- Skeleton ---------- */
function BillingSkeleton() {
  return (
    <section className="px-3 pb-8 sm:px-4 lg:px-6">
      <div className="mt-1 mb-6 space-y-2">
        <div className="h-4 w-72 max-w-full rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Paid */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="mt-4 h-7 w-40 rounded bg-slate-100 animate-pulse" />
          <div className="mt-3 h-3 w-52 rounded bg-slate-100 animate-pulse" />
        </div>

        {/* Latest Invoice */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="mt-4 h-7 w-40 rounded bg-slate-100 animate-pulse" />
          <div className="mt-3 h-3 w-28 rounded bg-slate-100 animate-pulse" />
        </div>

        {/* Payment Method */}
        <div className="card p-0 overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="px-4 pt-4 pb-2 sm:px-6">
            <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
          </div>

          <div className="px-4 pb-4 sm:px-6">
            <div className="h-40 w-full rounded-xl bg-slate-100 animate-pulse" />
            <div className="mt-3 h-3 w-56 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Header + controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-44 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="h-10 w-full sm:w-44 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-10 w-full sm:w-64 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>

      {/* List/table container */}
      <div className="card p-0 overflow-hidden">
        {/* Mobile cards skeleton */}
        <div className="divide-y divide-gray-100 lg:hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-60 max-w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                  <div className="h-7 w-24 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="px-6 py-4 text-left font-semibold">Invoice</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Due Date</th>
                <th className="px-6 py-4 text-left font-semibold">Amount</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-56 rounded bg-slate-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-7 w-24 rounded-full bg-slate-100 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
/* ---------- Types ---------- */
type Invoice = {
  id: string;
  amount: number;
  status: "PENDING" | "PAID";
  dueDate: string | null;
  createdAt: string;
};

/* ---------- Status Badge ---------- */
function StatusBadge({ value }: { value: Invoice["status"] }) {
  const map = {
    PAID: {
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "✓",
      label: "Paid",
    },
    PENDING: {
      class: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "⏱",
      label: "Pending",
    },
  } as const;

  const config = map[value];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${config.class}`}
    >
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  );
}

/* ---------- Page ---------- */
export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Invoice["status"]>("ALL");

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch("/api/invoices", { cache: "no-store" });
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const totalPaid = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const latest = invoices[0] ?? null;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch = s === "" || inv.id.toLowerCase().includes(s);
      const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

 if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Billing" />
        <BillingSkeleton />
      </main>
    );
  }

  return (
    <main className="w-full">
      <Topbar title="Billing" />

      <section className="px-3 pb-8 sm:px-4 lg:px-6">
        <p className="mt-1 mb-6 text-sm text-gray-600">
          Review your billing history and account details.
        </p>

        {/* Summary Cards: 1 col mobile, 2 col sm, 3 col lg */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Paid */}
          <div className="card p-4 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Paid</span>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-gray-900">
              ${totalPaid.toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Total amount successfully paid.
            </p>
          </div>

          {/* Latest Invoice */}
          <div className="card p-4 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Latest Invoice</span>
              <div className="p-2 bg-sky-100 rounded-lg">
                <CalendarDays className="h-4 w-4 text-sky-600" />
              </div>
            </div>

            <div className="mt-3 text-2xl font-bold text-gray-900">
              {latest ? `$${latest.amount.toLocaleString()}` : "-"}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {latest
                ? new Date(latest.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "--"}
            </p>
          </div>

          {/* Payment Method */}
          <div className="card p-0 overflow-hidden hover:shadow-md transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
            <div className="px-4 pt-4 pb-2 sm:px-6 text-sm font-medium text-gray-600">
              Payment Method
            </div>
            <div className="px-4 pb-4 sm:px-6">
              <div className="h-auto w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    SanaMed Billing
                  </div>
                  <span className="text-sm font-bold">VISA</span>
                </div>

                <div className="mt-5 text-lg font-bold tracking-widest break-words">
                  •••• •••• •••• 4242
                </div>

                <div className="mt-5 flex flex-col gap-2 text-xs sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <span className="text-white/80">Card holder</span>
                    <div className="font-semibold truncate">Sidi El Valy</div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-white/80">Expires</span>
                    <div className="font-semibold">08 / 27</div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-gray-500">
                * Demo card UI only (no real payment processing).
              </p>
            </div>
          </div>
        </div>

        {/* Header + Controls: stack on mobile */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filtered.length} invoice{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | Invoice["status"])
              }
              className="input text-sm cursor-pointer w-full sm:w-44"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full sm:w-64 text-sm"
              placeholder="Search invoice ID…"
            />
          </div>
        </div>

        {/* Mobile-first list + Desktop table */}
        <div className="card p-0 overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* Mobile cards */}
          <div className="divide-y divide-gray-100 lg:hidden">
            {filtered.map((inv) => (
              <div key={inv.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 break-all">
                      {inv.id}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Date:{" "}
                      {new Date(inv.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Due:{" "}
                      {inv.dueDate
                        ? new Date(inv.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                      ${inv.amount.toLocaleString()}
                    </div>
                    <StatusBadge value={inv.status} />
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                No invoices found.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold">Invoice</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-gray-900">{inv.id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(inv.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {inv.dueDate
                        ? new Date(inv.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={inv.status} />
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
