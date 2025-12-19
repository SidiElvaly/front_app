import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const base = process.env.EXTRACT_API_URL; // server-side env
    if (!base) {
      return NextResponse.json(
        { error: "Missing EXTRACT_API_URL" },
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const upstream = await fetch(`${base}/extract-file`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}
