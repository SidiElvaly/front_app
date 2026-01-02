import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { patientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vitals = await db.vitalSign.findMany({
    where: { patientId: params.patientId },
    orderBy: { recordedAt: "desc" },
    include: {
      recordedBy: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json(vitals);
}
