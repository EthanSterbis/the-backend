import LeaderboardTable, { TeamRow } from "@/components/LeaderboardTable";
import EpaSrScatter from "@/components/EpaSrScatter";
import { siteUrl } from "@/lib/site";

async function getData(season: number): Promise<TeamRow[]> {
  const res = await fetch(`${siteUrl}/api/splits?season=${season}`, { next: { revalidate: 300 } });
  const json = await res.json();
  return json.data as TeamRow[];
}

export default async function Home() {
  const season = 2024;
  const rows = await getData(season);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Team Offense — {season}</h1>
      <p className="text-sm text-neutral-500">Sortable leaderboard and EPA vs Success% (sample data).</p>
      <LeaderboardTable rows={rows} />
      <EpaSrScatter rows={rows} title={`EPA vs Success% (${season})`} />
    </main>
  );
}
