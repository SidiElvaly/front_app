// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashLayout({ children }: { children: ReactNode }) {
  // Block unauthenticated access to anything under /dashboard/*
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin"); // keep this path consistent with authOptions.pages.signIn
  }

  return (
    <div className="min-h-dvh flex">
      <Sidebar />
      <div className="flex-1 md:ml-0">{children}</div>
    </div>
  );
}

