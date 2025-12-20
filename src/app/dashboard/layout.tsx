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
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
