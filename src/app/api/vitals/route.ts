import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const {
    patientId,
    systolicBP,
    diastolicBP,
    heartRate,
    temperature,
    spo2,
    roomNumber,
    bedNumber,
  } = body;

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const vital = await db.vitalSign.create({
    data: {
      patientId,
      recordedById: user.id,
      systolicBP,
      diastolicBP,
      heartRate,
      temperature,
      spo2,
      roomNumber,
      bedNumber,
    },
  });

  return NextResponse.json(vital, { status: 201 });
}
