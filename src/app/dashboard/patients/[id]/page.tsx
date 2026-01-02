"use client";

import React, { useEffect, useState, use as usePromise } from "react";
import Topbar from "@/components/Topbar";
import StatusPill from "@/components/StatusPill";
import { AdmissionsPanel, DocumentsPanel, type PatientDoc, type Admission } from "@/components/PatientPanels";
import Link from "next/link";
import { 
  Activity, 
  Pill, 
  ClipboardCheck, 
  History, 
  PlusCircle, 
  ChevronRight,
  Stethoscope,
  User,
  Calendar,
  MapPin,
  AlertCircle
} from "lucide-react";

/* ----------------- Types ----------------- */
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

/* ----------------- Sub-Components ----------------- */

function QuickActionCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  href, 
  variant = "blue" 
}: { 
  title: string; 
  subtitle: string; 
  icon: any; 
  href: string; 
  variant?: "blue" | "emerald" | "amber" 
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <Link href={href} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${colors[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/* ---------------------------- Helpers ---------------------------- */
function formatISODate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString();
}

function buildPatientMeta(p: Patient) {
  return {
    dob: p.dob ?? "Not set",
    registrationDate: p.registrationDate ?? p.lastVisit ?? "-",
    address: p.address ?? "No address provided",
    allergies: p.allergies ?? "None reported",
    chronicDiseases: p.chronicDiseases ?? "None reported",
    bloodType: p.bloodType ?? "Unknown",
    pastIllnesses: p.pastIllnesses ?? "None reported",
  };
}

/* ---------------------------- Main Page ---------------------------- */
export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [docs, setDocs] = useState<PatientDoc[]>([]);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        setLoading(true);
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
        setError("Failed to load patient data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (!mounted || loading) {
    return (
      <main className="w-full bg-slate-50/30 min-h-screen">
        <Topbar title="Patient details" />
        <PatientProfileSkeleton />
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="w-full bg-slate-50/30 min-h-screen">
        <Topbar title="Patient details" />
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-900">{error || "Patient not found"}</h2>
          <Link href="/dashboard/patients" className="mt-4 text-sm font-semibold text-emerald-600 hover:underline">
            Back to patient list
          </Link>
        </div>
      </main>
    );
  }

  const meta = buildPatientMeta(patient);

  return (
    <main className="w-full bg-slate-50/30 min-h-screen">
      <Topbar title="Patient details" />

      <section className="px-3 pb-12 pt-4 sm:px-4 lg:px-6">
        
        {/* 1. TOP CARDS GRID */}
        <div className="grid gap-4 lg:grid-cols-3">
          
          {/* Avatar & Main Info */}
          <div className="card flex flex-col items-center px-5 py-6 text-center sm:px-6 sm:py-8">
            <div className="relative mb-4 h-24 w-24 sm:h-28 sm:w-28">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-600 shadow-inner">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <p className="text-sm text-slate-500 mb-6">{patient.email || "No email address"}</p>

            <Link
              href={`/dashboard/patients/${patient.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm"
            >
              Edit Profile
            </Link>
          </div>

          {/* Personal Details */}
          <div className="card flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-8">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
               <User className="h-3 w-3" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">DOB</span>
                <span className="font-semibold text-slate-800">{formatISODate(meta.dob)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Status</span>
                <StatusPill value={patient.status} />
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Address</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-300" /> {meta.address}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Snapshot */}
          <div className="card flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-8">
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
               <Activity className="h-3 w-3" /> Medical Snapshot
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Allergies</span>
                <span className="font-bold text-rose-600">{meta.allergies}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Chronic</span>
                <span className="font-bold text-amber-600">{meta.chronicDiseases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Type</span>
                <span className="font-bold text-slate-800">{meta.bloodType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CLINICAL ACTIONS SECTION */}
        <div className="mt-10 mb-5 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-400" />
                Clinical Management
            </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard 
                title="Add Vitals" 
                subtitle="Record BP, Temp, Heart Rate" 
                icon={Activity} 
                href={`/dashboard/patients/${id}/vitals/new`} 
                variant="amber"
            />
            <QuickActionCard 
                title="Vitals History" 
                subtitle="Review past measurements" 
                icon={History} 
                href={`/dashboard/patients/${id}/vitals`} 
            />
            <QuickActionCard 
                title="Nurse Checklist" 
                subtitle="Today's pending doses" 
                icon={ClipboardCheck} 
                href={`/dashboard/patients/${id}/medication/checklist`} 
                variant="emerald"
            />
          <QuickActionCard 
            title="Medication Plans" 
            subtitle="View active prescriptions" 
            icon={Pill} 
            href={`/dashboard/patients/${id}/medication`} 
          />

          <QuickActionCard 
            title="New Prescription" 
            subtitle="Create a dosing schedule" 
            icon={PlusCircle} 
            href={`/dashboard/patients/${id}/medication/new`} 
          />
        </div>

        {/* 3. ADMISSIONS & DOCUMENTS */}
        <div className="mt-10 space-y-10">
            <AdmissionsPanel admissions={admissions} patientId={patient.id} />
            <DocumentsPanel docs={docs} setDocs={setDocs} patientId={patient.id} />
        </div>

      </section>
    </main>
  );
}

/* ----------------- SKELETON LOADER ----------------- */

function PatientProfileSkeleton() {
  return (
    <section className="px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex flex-col items-center px-5 py-6 text-center sm:px-6 sm:py-8">
          <div className="mb-4 h-24 w-24 rounded-full bg-slate-100 animate-pulse sm:h-28 sm:w-28" />
          <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
          <div className="mt-3 h-3 w-48 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="card px-5 py-5 sm:px-6 sm:py-6 space-y-4">
            <div className="h-4 w-28 bg-slate-100 animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-50 animate-pulse rounded-xl" />
                <div className="h-10 bg-slate-50 animate-pulse rounded-xl" />
            </div>
        </div>
        <div className="card px-5 py-5 sm:px-6 sm:py-6 space-y-4">
            <div className="h-4 w-28 bg-slate-100 animate-pulse rounded" />
            <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
      </div>
    </section>
  );
}