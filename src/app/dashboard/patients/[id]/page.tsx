// src/app/dashboard/patients/[id]/page.tsx
"use client";

import React, { useEffect, useRef, useState, use as usePromise } from "react";
import Topbar from "@/components/Topbar";
import { FileText, Star, StarOff, UploadCloud, Search, Trash2 } from "lucide-react";

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

  registrationDate?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  bloodType?: string | null;
  pastIllnesses?: string | null;
};

type PatientDoc = {
  id: string;
  patientId: string;
  title: string;
  date: string | Date;
  isFavorite: boolean;
  fileName?: string;
};

type SearchHit = {
  id: string;
  score: number;
  text: string;
};

/* ----------------- Helpers: patient meta with fallbacks -------------- */
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

function formatDocDate(d: PatientDoc["date"]) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString();
}

/* -------------------------- Proxy APIs (same domain, no CORS) -------------------------- */
async function callExtractFileAPI(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/extract-file", {
    method: "POST",
    body: fd,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function callSemanticSearchAPI(query: string): Promise<SearchHit[]> {
  const res = await fetch("/api/semantic-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return (json.results ?? []) as SearchHit[];
}

/* -------------------------- Semantic result UI helpers -------------------------- */
function scoreToPercent(score: number) {
  const s = Math.max(0, Math.min(1, score));
  return Math.round(s * 100);
}

function extractMetaFromText(text: string) {
  const firstMention = text.match(/Premi[eè]re mention:\s*([0-9-]+)/i)?.[1] ?? null;
  const lastConsult = text.match(/Dernière consultation:\s*([0-9-]+)/i)?.[1] ?? null;
  const diagnosisDate = text.match(/date diagnostic:\s*([0-9-]+)/i)?.[1] ?? null;
  const status = text.match(/Statut:\s*([^.;\n]+)/i)?.[1]?.trim() ?? null;

  const title = text.split(":")[0]?.slice(0, 60)?.trim() || "Result";
  return { title, firstMention, lastConsult, diagnosisDate, status };
}

function ScoreBadge({ score }: { score: number }) {
  const pct = scoreToPercent(score);
  const level = pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Medium" : "Low";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      {level} • {pct}%
    </span>
  );
}

function ResultCard({ hit, isBest }: { hit: SearchHit; isBest?: boolean }) {
  const pct = scoreToPercent(hit.score);
  const meta = extractMetaFromText(hit.text);

  return (
    <article
      className={[
        "rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md",
        isBest ? "border-2 border-emerald-400 ring-2 ring-emerald-100" : "border border-slate-100",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isBest && (
              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                Best match
              </span>
            )}
            <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{meta.title}</p>
            <span className="text-[11px] text-slate-400">Hit: {hit.id}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {meta.status && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1">Status: {meta.status}</span>
            )}
            {meta.firstMention && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1">First: {meta.firstMention}</span>
            )}
            {(meta.lastConsult || meta.diagnosisDate) && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1">
                {meta.lastConsult ? `Last consult: ${meta.lastConsult}` : `Diagnosis: ${meta.diagnosisDate}`}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <ScoreBadge score={hit.score} />
        </div>
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={isBest ? "h-full rounded-full bg-emerald-600" : "h-full rounded-full bg-emerald-500"}
            style={{ width: `${pct}%` }}
            aria-label={`score ${pct}%`}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{isBest ? "Top relevance" : "Relevance"}</span>
          <span>{hit.score.toFixed(3)}</span>
        </div>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900">
          View extracted passage
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{hit.text}</p>
      </details>
    </article>
  );
}

/* -------------------------- Documents panel ------------------------- */
function DocumentsPanel({
  docs,
  setDocs,
  patientId,
}: {
  docs: PatientDoc[];
  setDocs: React.Dispatch<React.SetStateAction<PatientDoc[]>>;
  patientId: string;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "favorite" | "recent">("recent");

  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [semanticQ, setSemanticQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    setExtracting(false);

    try {
      // 1) Save in MongoDB via your Next route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);

      const res = await fetch(`/api/patients/${patientId}/documents`, {
        method: "POST",
        body: formData,
      });

      const saved = await res.json();
      if (!res.ok) throw new Error(saved?.error || "Upload failed");

      if (saved?.document) {
        setDocs((prev) => [saved.document as PatientDoc, ...prev]);
      }

      // 2) Extract + index
      setExtracting(true);
      await callExtractFileAPI(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload/index failed");
    } finally {
      setUploading(false);
      setExtracting(false);
      e.target.value = "";
    }
  };

  async function runSemanticSearch() {
    const q = semanticQ.trim();
    if (!q) {
      setSearchHits([]);
      return;
    }
    setSearchError(null);
    setSearching(true);
    try {
      const hits = await callSemanticSearchAPI(q);
      setSearchHits(hits);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setSearchHits([]);
    } finally {
      setSearching(false);
    }
  }

  async function deleteDoc(docId: string) {
    const ok = confirm("Delete this document?");
    if (!ok) return;

    setUploadError(null);
    setDeletingId(docId);

    try {
      const res = await fetch(`/api/patients/${patientId}/documents/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());
      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = docs
    .filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((d, idx) => {
      if (tab === "favorite") return d.isFavorite;
      if (tab === "recent") return idx < 4;
      return true;
    });

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
          <p className="text-xs text-slate-500">
            Upload and manage medical documents associated with this patient.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {(uploading || extracting) && (
            <span className="text-xs text-slate-500">
              {uploading ? "Uploading…" : "Indexing in Qdrant…"}
            </span>
          )}

          <button
            type="button"
            onClick={handleImportClick}
            disabled={uploading || extracting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:w-auto"
          >
            <UploadCloud className="h-4 w-4" />
            Import a doc
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {uploadError}
        </div>
      )}

      {/* Semantic Search */}
      <div className="mb-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Semantic search</div>
            <div className="text-xs text-slate-500"></div>
          </div>

          {/* responsive: stack on mobile */}
          <div className="flex w-full flex-col gap-2 sm:w-[520px] sm:flex-row">
            <input
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Ask something… (e.g. hypertension, allergies, MRI)"
              value={semanticQ}
              onChange={(e) => setSemanticQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runSemanticSearch();
                }
              }}
            />
            <button
              type="button"
              onClick={runSemanticSearch}
              disabled={searching}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              <Search className="h-4 w-4" />
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {searchError && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {searchError}
          </div>
        )}

        {searchHits.length > 0 && (
          <div className="mt-4 grid gap-3">
            {searchHits.slice(0, 10).map((h, idx) => (
              <ResultCard key={h.id} hit={h} isBest={idx === 0} />
            ))}
          </div>
        )}

        {searchHits.length === 0 && semanticQ.trim() !== "" && !searching && !searchError && (
          <div className="mt-3 text-sm text-slate-500">No semantic results.</div>
        )}
      </div>

      {/* Tabs + local title search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* tabs should scroll on mobile */}
        <div className="w-full overflow-x-auto">
          <div className="inline-flex min-w-max rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500">
            <button
              type="button"
              onClick={() => setTab("favorite")}
              className={
                "rounded-full px-3 py-1 transition " +
                (tab === "favorite"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "hover:text-slate-700")
              }
            >
              Favorite
            </button>
            <button
              type="button"
              onClick={() => setTab("recent")}
              className={
                "rounded-full px-3 py-1 transition " +
                (tab === "recent" ? "bg-white text-emerald-600 shadow-sm" : "hover:text-slate-700")
              }
            >
              Recently added
            </button>
            <button
              type="button"
              onClick={() => setTab("all")}
              className={
                "rounded-full px-3 py-1 transition " +
                (tab === "all" ? "bg-white text-emerald-600 shadow-sm" : "hover:text-slate-700")
              }
            >
              All docs
            </button>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="Filter by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Document cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((doc) => (
          <article
            key={doc.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <FileText className="h-4 w-4" />
              </span>
              <p className="text-xs leading-snug text-slate-700 line-clamp-4">{doc.title}</p>
            </div>

            <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>{formatDocDate(doc.date)}</span>

              {/* responsive actions: wrap */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open(`/api/patients/${patientId}/documents/${doc.id}`, "_blank")}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => deleteDoc(doc.id)}
                  disabled={deletingId === doc.id}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === doc.id ? "Deleting…" : "Delete"}
                </button>

                <button
                  type="button"
                  onClick={() => alert("TODO: toggle favorite")}
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100"
                  aria-label="Toggle favorite"
                >
                  {doc.isFavorite ? (
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <StarOff className="h-3.5 w-3.5 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No documents match your filters.
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------- Page component ---------------------------- */
export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [docs, setDocs] = useState<PatientDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        setPatient(json.patient as Patient);
        setDocs((json.documents ?? []) as PatientDoc[]);
      } catch (error) {
        console.error("Failed to load patient", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <main className="w-full">
        <Topbar title="Patient Profile" />
        <div className="px-4 py-6 text-sm text-gray-500">Loading...</div>
      </main>
    );
  }

  if (notFound || !patient) {
    return (
      <main className="w-full">
        <Topbar title="Patient Profile" />
        <div className="px-4 py-6 text-sm text-red-600">Patient not found.</div>
      </main>
    );
  }

  const initials =
    patient.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "P";

  const meta = buildPatientMeta(patient);

  return (
    <main className="w-full">
      <Topbar title="Patient Profile" />

      <section className="px-3 pb-8 pt-4 sm:px-4 lg:px-6">
        {/* Top cards: stack on mobile, 3 cols on lg */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Identity card */}
          <div className="card flex flex-col items-center px-5 py-6 text-center sm:px-6 sm:py-8">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-3xl font-semibold text-emerald-600 sm:h-28 sm:w-28">
              {initials}
            </div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{patient.name}</h2>

            <p className="mt-1 break-words text-xs text-slate-500">{patient.email ?? ""}</p>
            {patient.phone && <p className="mt-1 text-xs text-slate-500">{patient.phone}</p>}

            {patient.idnum && (
              <p className="mt-4 text-xs font-medium text-slate-400">
                Enroll number: {patient.idnum}
              </p>
            )}
          </div>

          {/* General information */}
          <div className="card px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">General Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-xs text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Date of birth</dt>
                <dd className="font-medium break-words">{meta.dob}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Registration date</dt>
                <dd className="font-medium break-words">{meta.registrationDate}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-400">Address</dt>
                <dd className="font-medium break-words">{meta.address}</dd>
              </div>
            </dl>
          </div>

          {/* Anamnesis */}
          <div className="card px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Anamnesis</h3>
            <dl className="grid grid-cols-1 gap-y-3 text-xs text-slate-600">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-400">Allergies</dt>
                <dd className="font-medium text-right break-words">{meta.allergies}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-400">Chronic diseases</dt>
                <dd className="font-medium text-right break-words">{meta.chronicDiseases}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-400">Blood type</dt>
                <dd className="font-medium text-right break-words">{meta.bloodType}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-400">Past illnesses</dt>
                <dd className="font-medium text-right break-words">{meta.pastIllnesses}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Documents section */}
        <DocumentsPanel docs={docs} setDocs={setDocs} patientId={id} />
      </section>
    </main>
  );
}
