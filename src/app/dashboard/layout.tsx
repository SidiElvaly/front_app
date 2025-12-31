// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClientLayout from "@/components/DashboardClientLayout";

export default async function DashLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
