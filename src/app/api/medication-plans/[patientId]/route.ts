import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  // 1. Update the type to Promise in Next.js 15
  { params }: { params: Promise<{ patientId: string }> } 
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Await the params to get the actual patientId
    const { patientId } = await params;

    // 3. Log this to your terminal to verify it's the correct ID
    console.log("Fetching plans for patientId:", patientId);

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is missing" }, { status: 400 });
    }

    const plans = await db.medicationPlan.findMany({
      where: { 
        patientId: patientId // Now this is correctly filtered
      },
      orderBy: { createdAt: "desc" },
      include: {
        prescribedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET Plans Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}