// src/app/page.tsx
export const dynamic = "force-dynamic"; // avoid build-time fetch

import LeaderboardTable, { type TeamRow } from "@/components/LeaderboardTable";
import EpaSrScatter from "@/components/EpaSrScatter";
import { headers } from "next/headers";

/** Build an absolute base URL at request time (works locally + Netlify) */
async function getBaseUrl(): Promise<string> {
  const h = await headers(); // headers() is async in your setup
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.DEPLOY_URL ?? // Netlify
    process.env.URL ?? // Netlify alt
    "localhost:3000";

  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}

async function getData(season: number): Promise<TeamRow[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/splits?season=${season}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load splits (${res.status})`);
  const json = (await res.json()) as { data: TeamRow[] };
  return json.data ?? [];
}

export default async function Home() {
  const season = 2024;

  // Guard so production doesn't hard-crash if the API fails
  let rows: TeamRow[] = [];
  try {
    rows = await getData(season);
  } catch {
    rows = [];
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Team Offense — {season}</h1>
      <p className="text-sm text-neutral-500">
        Sortable leaderboard and EPA vs Success% (SQLite → /api/splits).
      </p>

      <LeaderboardTable rows={rows} />
      <EpaSrScatter rows={rows} title={`EPA vs Success% (${season})`} />
    </main>
  );
}

