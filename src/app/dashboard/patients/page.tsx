"use client";

import Topbar from "@/components/Topbar";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import {
  PencilLine,
  Trash2,
  Mail,
  Phone,
  IdCard,
  Plus,
  Search as SearchIcon,
  Upload,
  Download,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ChangeEvent } from "react";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import StatusPill from "@/components/StatusPill";
import IconButton from "@/components/IconButton";

import Skeleton from "@/components/Skeleton";

function PatientsSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="bg-brand px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full sm:w-80 rounded-xl bg-white/15" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-xl bg-white/20" />
            <Skeleton className="h-10 w-28 rounded-xl bg-white/10 border border-white/20" />
            <Skeleton className="h-10 w-28 rounded-xl bg-white/10 border border-white/20" />
          </div>
        </div>
      </div>

      <div className="md:hidden px-3 py-3">
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                  <div className="min-w-0">
                    <Skeleton className="h-3 w-40 rounded bg-slate-100" />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
                      <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-4 w-4 rounded bg-slate-100" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16 rounded bg-slate-100" />
                  <Skeleton className="h-3 w-20 rounded bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-56 rounded bg-slate-100" />
                  <Skeleton className="h-3 w-40 rounded bg-slate-100" />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto px-2 pb-4 pt-2 sm:px-4">
        <table className="min-w-[860px] w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-500">
              <th className="px-3 py-2 text-left">Patient</th>
              <th className="px-3 py-2 text-left">Phone</th>
              <th className="px-3 py-2 text-left">Enroll number</th>
              <th className="px-3 py-2 text-left">Last visit</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-center">Operations</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr
                key={i}
                className="rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-3 w-40 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-3 w-28 rounded bg-slate-100" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-3 w-20 rounded bg-slate-100" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                    <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------- Small UI helpers ----------------- */




function safeDate(d: any) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString();
}

type Patient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  idnum?: string;
  lastVisit?: string | null;
  status?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [deleteData, setDeleteData] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/patients", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        setPatients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load patients:", err);
        setPatients([]);
        setLoading(false);
      });
  }, []);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await fetch("/api/patients/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });

      const result = await res.json();
      alert(result.message || "Import complete!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Import failed");
    } finally {
      e.target.value = "";
    }
  };

  function handleDeleteClick(id: string, name: string) {
    setDeleteData({ id, name });
  }

  async function handleConfirmDelete() {
    if (!deleteData) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/patients/${deleteData.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete patient");

      setPatients((prev) => prev.filter((p) => p.id !== deleteData.id));
      setDeleteData(null);
      toast.success("Patient deleted successfully");
    } catch (error) {
      toast.error("Failed to delete patient");
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered =
    q.trim() === ""
      ? patients
      : patients.filter((p) =>
        (p.name ?? "").toLowerCase().includes(q.toLowerCase())
      );

  return (
    <main className="w-full">
      <Topbar title="Patients" />

      <section className="px-3 sm:px-4 lg:px-6 pb-8">
        {loading ? (
          <PatientsSkeleton />
        ) : (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-brand px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/70 outline-none focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
                    placeholder="Search patients..."
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/dashboard/patients/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm hover:bg-white/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Link>

                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                    onClick={handleImportClick}
                    type="button"
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleImportChange}
                  />

                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                    onClick={() => (window.location.href = "/api/patients/export")}
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ Mobile cards */}
            <div className="md:hidden px-3 py-3">
              <div className="grid gap-3">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="group relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/dashboard/patients/${p.id}`}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <Avatar name={p.name} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <StatusPill value={p.status || "LOW"} />
                            {p.idnum && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
                                ID: {p.idnum}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      <Link href={`/dashboard/patients/${p.id}`} className="mt-1">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                      <Link href={`/dashboard/patients/${p.id}`} className="block space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last visit</span>
                          <span className="font-medium text-slate-700">
                            {safeDate(p.lastVisit)}
                          </span>
                        </div>

                        {(p.email || p.phone) && (
                          <div className="space-y-1">
                            {p.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-gray-400 underline-offset-4 group-hover:underline" />
                                <span className="truncate">{p.email}</span>
                              </div>
                            )}
                            {p.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span className="truncate">{p.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Mobile actions */}
                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-50 mt-1">
                        <IconButton
                          title="Edit"
                          variant="primary"
                          onClick={() => router.push(`/dashboard/patients/${p.id}/edit`)}
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </IconButton>

                        <IconButton
                          title="Delete"
                          variant="danger"
                          onClick={() => handleDeleteClick(p.id, p.name)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    No patients found.
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Desktop table */}
            <div className="hidden md:block overflow-x-auto px-2 pb-4 pt-2 sm:px-4">
              <table className="min-w-[860px] w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-xs font-medium text-gray-500">
                    <th className="px-3 py-2 text-left">Patient</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Enroll number</th>
                    <th className="px-3 py-2 text-left">Last visit</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-center">Operations</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="rounded-xl bg-white shadow-[0_4px_12px_rgba(15,23,42,0.06)]"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} />
                          <div>
                            <Link
                              href={`/dashboard/patients/${p.id}`}
                              className="text-sm font-medium text-slate-900 hover:underline"
                            >
                              {p.name}
                            </Link>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {p.email ?? "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {p.phone ?? "—"}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-3.5 w-3.5 text-gray-400" />
                          {p.idnum ?? "—"}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {safeDate(p.lastVisit)}
                      </td>

                      <td className="px-3 py-3">
                        <StatusPill value={p.status || "LOW"} />
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/patients/${p.id}/edit`} title="Edit">
                            <IconButton title="Edit" variant="primary">
                              <PencilLine className="h-3.5 w-3.5" />
                            </IconButton>
                          </Link>

                          <IconButton
                            title="Delete"
                            variant="danger"
                            onClick={() => handleDeleteClick(p.id, p.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-10 text-center text-sm text-gray-500"
                      >
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <DeleteConfirmationModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteData?.name ?? "this patient"}? This action cannot be undone and will remove all associated data.`}
        isDeleting={isDeleting}
      />
    </main>
  );
}
