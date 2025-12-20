// src/app/api/patients/[id]/documents/[docId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: return the stored PDF
export async function GET(_req: Request, ctx: any) {
  const params = await ctx.params;

  try {
    const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;

    const doc = await db.patientDocument.findUnique({
      where: { id: docId },
      select: {
        id: true,
        fileData: true,
        fileName: true,
        contentType: true, // if you have it (optional)
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.fileData) {
      return NextResponse.json({ error: "No file stored" }, { status: 404 });
    }

    const buffer = Buffer.from(doc.fileData, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": doc.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${doc.fileName || "document.pdf"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

// DELETE: remove the document from DB (Mongo/Prisma)
export async function DELETE(_req: Request, ctx: any) {
  const params = await ctx.params;

  try {
    const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;

    const existing = await db.patientDocument.findUnique({
      where: { id: docId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    await db.patientDocument.delete({ where: { id: docId } });

    return NextResponse.json({ ok: true, deletedId: docId }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
