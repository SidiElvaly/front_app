// src/app/api/patients/[id]/documents/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, ctx: any) {
  const params = await ctx.params;
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Create document entry
    const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

    const newDoc = await db.patientDocument.create({
      data: {
        patientId: patientId,
        title: title || file.name,
        date: new Date(),
        isFavorite: false,
        fileData: buffer.toString("base64"), // ✅ Store PDF as base64
        fileName: file.name,
      },
    });

    return NextResponse.json({
      message: "✅ Document uploaded",
      document: newDoc,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
