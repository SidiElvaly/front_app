export type SemanticHit = { id: string; score: number; text: string };

export async function semanticSearch(query: string): Promise<SemanticHit[]> {
  const res = await fetch("/api/semantic-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.results ?? [];
}
