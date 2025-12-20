// src/components/Topbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Guest";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div
        className="
          flex items-center justify-between gap-3
          px-4 py-3
          pl-14 md:pl-6
          sm:px-4 md:px-6
        "
      >
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Brand badge hidden on very small screens */}
          <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-600">
            <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500" />
            SANAMED
          </span>

          {/* Title */}
          <div className="min-w-0">
            <div className="hidden sm:block text-[11px] text-slate-400">
              Dashboard <span className="mx-1">›</span> {title}
            </div>
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Bell size={16} />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-[5px] text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* User */}
          <Link
            href="/dashboard/profile"
            className="group inline-flex items-center gap-2 rounded-full bg-emerald-500 px-2 py-1.5 text-xs font-medium text-white shadow-md hover:bg-emerald-600 sm:px-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/30 text-[11px] font-semibold group-hover:bg-emerald-400/50">
              {initials}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm sm:inline">
              {userName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
