"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
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
import { useSidebar } from "./DashboardClientLayout";

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
  const { isOpen, close } = useSidebar();

  // Close drawer when route changes (mobile UX)
  useEffect(() => {
    close();
  }, [path, close]);

  return (
    <>
      {/* Sidebar Content */}
      <div
        className="flex h-full w-full flex-col bg-white border-r border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 shrink-0">
          <div className="pl-2 md:pl-0">
            <div className="text-xl font-bold text-emerald-600">{SITE_NAME}</div>
            <div className="mt-1 text-xs text-gray-500 md:hidden">Navigation</div>
          </div>

          <button
            type="button"
            onClick={close}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {items.map((item) => {
            const isActive = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-emerald-600" : "text-slate-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 px-3 py-4 shrink-0">
          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <Link
              href={SIGNIN_PATH}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
