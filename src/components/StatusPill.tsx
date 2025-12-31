import React from "react";

export default function StatusPill({ value }: { value?: string | null }) {
    const v = (value || "").toLowerCase();

    let label = "LOW";
    let cls = "bg-emerald-50 text-emerald-700 border-emerald-200";

    if (v === "high") {
        label = "HIGH";
        cls = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (v === "medium") {
        label = "MEDIUM";
        cls = "bg-amber-50 text-amber-700 border-amber-200";
    }

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${cls}`}
        >
            {label}
        </span>
    );
}
