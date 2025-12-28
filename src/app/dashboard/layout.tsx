// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <div className="min-h-dvh md:flex">
      {/* Sticky sidebar (desktop) */}
      <aside className="md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0">
        {/* If sidebar is long, it scrolls internally */}
        <div className="md:h-dvh md:overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
