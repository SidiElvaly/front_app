// src/components/Topbar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Menu, ChevronLeft, X, Check, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useSidebar } from "./DashboardClientLayout";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { handleClientError } from "@/lib/client-error";

type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();

  function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  const { toggle } = useSidebar();
  const router = useRouter();
  const userName = session?.user?.name ?? "Guest";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.isRead).length || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "markAsRead" }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark read");
    }
  };

  const toggleNotifs = () => {
    if (!showNotifs && unreadCount > 0) {
      markAllRead();
    }
    setShowNotifs(!showNotifs);
  }

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
          sm:px-4 md:px-6
        "
      >
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Hamburger (Mobile) */}
          <button
            type="button"
            onClick={toggle}
            className="md:hidden relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all"
            title="Go Back"
          >
            <ChevronLeft size={20} />
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
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={toggleNotifs}
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition-all
                ${showNotifs ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-[5px] text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-slate-900/5 z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3 bg-slate-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
                  <button onClick={markAllRead} className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700">
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Bell className="h-8 w-8 text-slate-200 mb-2" />
                      <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-50">
                      {notifications.map((n) => {
                        let icon = <Info size={16} />;
                        let colorClass = "bg-blue-50 text-blue-600";
                        let title = "Update";

                        if (n.type === "SUCCESS") {
                          icon = <CheckCircle size={16} />;
                          colorClass = "bg-emerald-50 text-emerald-600";
                          title = "Successful";
                        } else if (n.type === "ERROR") {
                          icon = <AlertCircle size={16} />;
                          colorClass = "bg-rose-50 text-rose-600";
                          title = "Error";
                        } else if (n.type === "DELETE") {
                          icon = <AlertCircle size={16} />;
                          colorClass = "bg-rose-50 text-rose-600";
                          title = "Delete";
                        }

                        // Heuristic: If message contains "delete", maybe treat as Error style if user desired, 
                        // but usually delete success is success. 
                        // The user said "notification icon for delete update and create to be like this".

                        return (
                          <li key={n.id} className={`p-4 transition-colors border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                            <div className="flex gap-4">
                              <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-full ${colorClass}`}>
                                {icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                                  <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

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
