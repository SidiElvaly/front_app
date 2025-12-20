// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full w-60 flex-col gap-4 p-4
          bg-white border-r border-gray-100 shadow-lg md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          md:flex
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <div className="text-xl font-bold text-brand px-2 mt-8 md:mt-0">{SITE_NAME}</div>

        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const isDashboard = href === "/dashboard";
            // Only exact match for dashboard, prefix match for other sections
            const active = isDashboard
              ? path === "/dashboard"
              : path === href || path.startsWith(href + "/");

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => {
                signOut({ callbackUrl: SIGNIN_PATH });
                setIsOpen(false);
              }}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <Link
              href={SIGNIN_PATH}
              onClick={() => setIsOpen(false)}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
        </nav>

        <div className="mt-auto card p-4">
          <div className="text-sm font-medium mb-1">Need help?</div>
          <p className="text-xs text-gray-500 mb-3">Please check our docs</p>
          <a className="btn w-full" href="#">
            DOCUMENTATION
          </a>
        </div>
      </aside>

      {/* Mobile menu button - this will be rendered by the parent */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
