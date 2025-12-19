export async function extractAndIndexFile(file: File) {
  const base = process.env.NEXT_PUBLIC_EXTRACT_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_EXTRACT_API_URL");

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${base}/extract-file`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Extract API failed: ${err}`);
  }

  return res.json();
}
