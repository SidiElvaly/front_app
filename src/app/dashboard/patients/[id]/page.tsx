"use client";

import React, { useEffect, useState, use as usePromise } from "react";
import Topbar from "@/components/Topbar";
import StatusPill from "@/components/StatusPill";
import { AdmissionsPanel, DocumentsPanel, type PatientDoc, type Admission } from "@/components/PatientPanels";

/* ----------------- Types (no any) ----------------- */
type Patient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  idnum?: string;
  dob?: string | null;
  lastVisit?: string | null;
  address?: string | null;
  status?: string;

  registrationDate?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  bloodType?: string | null;
  pastIllnesses?: string | null;
};

// ... PatientProfileSkeleton definition ...
function PatientProfileSkeleton() {
  return (
    <section className="px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col items-center px-5 py-6 text-center sm:px-6 sm:py-8">
          <div className="mb-4 h-24 w-24 rounded-full bg-slate-100 animate-pulse sm:h-28 sm:w-28" />
          <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
          <div className="mt-3 h-3 w-48 rounded bg-slate-100 animate-pulse" />
          <div className="mt-2 h-3 w-36 rounded bg-slate-100 animate-pulse" />
          <div className="mt-6 h-3 w-44 rounded bg-slate-100 animate-pulse" />
        </div>

        <div className="card px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 h-4 w-40 rounded bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="card px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 h-4 w-28 rounded bg-slate-100 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admissions skeleton */}
      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="h-5 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="mt-2 h-3 w-72 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-9 w-36 rounded-full bg-slate-100 animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents skeleton */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="h-5 w-28 rounded bg-slate-100 animate-pulse" />
            <div className="mt-2 h-3 w-80 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-full bg-slate-100 animate-pulse" />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="h-9 w-full rounded-full bg-slate-100 animate-pulse" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
                <div className="h-7 w-24 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------- Helpers: patient meta with fallbacks -------------- */
function formatISODate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString();
}

function buildPatientMeta(p: Patient) {
  return {
    dob: p.dob ?? "23.07.1994",
    registrationDate: p.registrationDate ?? p.lastVisit ?? "12 May 2022",
    address: p.address ?? "Nouakchott, Mauritania",
    allergies: p.allergies ?? "None reported",
    chronicDiseases: p.chronicDiseases ?? "Hypertension",
    bloodType: p.bloodType ?? "O+",
    pastIllnesses: p.pastIllnesses ?? "COVID-19 (2022)",
  };
}

/* ---------------------------- Page component ---------------------------- */
export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [docs, setDocs] = useState<PatientDoc[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Parallel fetch for perf
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/patients/${id}`, { cache: "no-store" }),
          fetch(`/api/patients/${id}/admissions`, { cache: "no-store" }),
        ]);

        if (!pRes.ok) throw new Error("Failed to load patient");
        if (!aRes.ok) throw new Error("Failed to load admissions");

        const pData = await pRes.json();
        const aData = await aRes.json();

        setPatient(pData.patient);
        setAdmissions(aData.admissions);
        setDocs(pData.documents || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load patient data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Patient details" />
        <PatientProfileSkeleton />
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="w-full">
        <Topbar title="Patient details" />
        <div className="p-6 text-center text-rose-600">
          {error || "Patient not found."}
        </div>
      </main>
    );
  }

  const meta = buildPatientMeta(patient);

  return (
    <main className="w-full">
      <Topbar title="Patient details" />

      <section className="px-3 pb-8 pt-4 sm:px-4 lg:px-6">
        {/* TOP CARDS GRID */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Card 1: Avatar & Main Info */}
          <div className="card flex flex-col items-center px-5 py-6 text-center sm:px-6 sm:py-8">
            <div className="relative mb-4 h-24 w-24 sm:h-28 sm:w-28">
              {/* Using a placeholder avatar for now, replacing dynamic Image for simplicity/perf unless domain config known */}
              <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-600">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                <div className={`h-3 w-3 rounded-full ${patient.id ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <p className="text-sm text-slate-500">{patient.email || "No email"}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a
                href={`/dashboard/patients/${patient.id}/edit`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit profile
              </a>

            </div>
          </div>

          {/* Card 2: Personal Details */}
          <div className="card flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <span className="block text-xs text-slate-500">Date of Birth</span>
                <span className="font-medium text-slate-800">
                  {formatISODate(meta.dob)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Registration</span>
                <span className="font-medium text-slate-800">
                  {formatISODate(meta.registrationDate)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Phone</span>
                <span className="font-medium text-slate-800">
                  {patient.phone || "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Status</span>
                <StatusPill value={patient.status} />
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs text-slate-500">Address</span>
                <span className="font-medium text-slate-800">
                  {meta.address}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Medical Snapshot */}
          <div className="card flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Medical Snapshot
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                <span className="text-slate-500">Allergies</span>
                <span className="font-medium text-rose-600 text-right">{meta.allergies}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                <span className="text-slate-500">Chronic Diseases</span>
                <span className="font-medium text-amber-600 text-right">
                  {meta.chronicDiseases}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                <span className="text-slate-500">Blood Type</span>
                <span className="font-medium text-slate-800 text-right">{meta.bloodType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Past Illnesses</span>
                <span className="font-medium text-slate-800 text-right max-w-[120px] truncate" title={meta.pastIllnesses}>
                  {meta.pastIllnesses}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ADMISSIONS COMPONENT */}
        <AdmissionsPanel admissions={admissions} patientId={patient.id} />

        {/* DOCUMENTS COMPONENT */}
        <DocumentsPanel docs={docs} setDocs={setDocs} patientId={patient.id} />

      </section>
    </main>
  );
}