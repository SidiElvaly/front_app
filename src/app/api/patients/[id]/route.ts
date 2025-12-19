import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, ctx: any) {
  const params = await ctx.params;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  try {
    // ✅ Fetch patient
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // ✅ Fetch documents for this patient
    const documents = await db.patientDocument.findMany({
      where: { patientId: id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      patient,
      documents,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);

    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: any) {
  const params = await ctx.params;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  try {
    const data = await req.json();

    const updated = await db.patient.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        idnum: data.idnum || "",
        lastVisit: data.lastVisit ? new Date(data.lastVisit) : null,
        dob: data.dob ? new Date(data.dob) : null,
        address: data.address || "",
        status: data.status || "",
        notes: data.notes || "",
        gender: data.gender || "",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: any) {
  const { params } = ctx;
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  try {
    await db.patient.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Patient deleted" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}

