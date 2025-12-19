import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, ctx: any) {
  const params = await ctx.params;
  try {
    const docId = Array.isArray(params.docId) ? params.docId[0] : params.docId;

    const doc = await db.patientDocument.findUnique({
      where: { id: docId },
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
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${doc.fileName}"`,
      },
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}
