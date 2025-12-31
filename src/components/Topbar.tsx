// src/components/Topbar.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";
import { useSidebar } from "./DashboardClientLayout";

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const { toggle } = useSidebar();
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
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div
        className="
          flex items-center justify-between gap-3
          px-4 py-3
          sm:px-4 md:px-6
        "
      >
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Hamburger (Mobile) */}
          <button
            type="button"
            onClick={toggle}
            className="md:hidden relative z-50 -ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Brand badge hidden on mobile */}
          <span className="hidden lg:inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-600">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
