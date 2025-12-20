// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  User,
  LogOut,
  LogIn,
  X,
} from "lucide-react";
import { SITE_NAME } from "@/lib/site";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/dashboard/rtl", label: "RTL", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const SIGNIN_PATH = "/signin";

export default function Sidebar() {
  const path = usePathname();
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when route changes (mobile UX)
  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  // Prevent body scroll when drawer is open (mobile)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Allow ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={[
          "fixed inset-0 z-[9998] bg-black/50 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Sidebar / Drawer */}
      <aside
        className={[
          // flex on ALL breakpoints
          "fixed md:static top-0 left-0 z-[9999] h-dvh w-72 md:w-60",
          "flex flex-col gap-4 p-4",
          "bg-white border-r border-gray-100 shadow-lg md:shadow-none",
          "transform transition-transform duration-300 ease-in-out",
          // Drawer behavior on mobile
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Always visible on md+
          "md:translate-x-0",
        ].join(" ")}
      >
        {/* Close button for mobile */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Brand */}
        <div className="px-2 pt-[calc(env(safe-area-inset-top)+4px)] md:pt-0">
          <div className="text-xl font-bold text-brand">{SITE_NAME}</div>
          <div className="mt-1 text-xs text-gray-500 md:hidden">Navigation</div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const isDashboard = href === "/dashboard";
            const active = isDashboard
              ? path === "/dashboard"
              : path === href || path.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-emerald-50 text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                <Icon size={18} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <LogOut size={18} />
              <span className="truncate">Sign Out</span>
            </button>
          ) : (
            <Link
              href={SIGNIN_PATH}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <LogIn size={18} />
              <span className="truncate">Sign In</span>
            </Link>
          )}
        </nav>

        {/* Footer card */}
        <div className="mt-auto card p-4">
          <div className="text-sm font-medium mb-1">Need help?</div>
          <p className="text-xs text-gray-500 mb-3">Please check our docs</p>
          <a className="btn w-full" href="#">
            DOCUMENTATION
          </a>
        </div>
      </aside>

      {/* Mobile menu button (must be ABOVE Topbar) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed z-[10000] left-3 top-[calc(env(safe-area-inset-top)+12px)] p-2 rounded-lg bg-white shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </>
  );
}
