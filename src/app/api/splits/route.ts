export const runtime = "nodejs";

import path from "node:path";
import Database from "better-sqlite3";
import { NextResponse } from "next/server";

const dbPath = path.join(process.cwd(), "data", "backend.sqlite");
const db = new Database(dbPath, { readonly: true });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const season = Number(url.searchParams.get("season") ?? 2024);
  const team = (url.searchParams.get("team") ?? "").trim().toUpperCase();

  if (!Number.isInteger(season) || season < 1999 || season > 2100) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  const stmt = db.prepare(`
    SELECT posteam, season, epa, epa_pass, epa_rush, success_rate, plays
    FROM team_offense
    WHERE season = ?
      AND (? = '' OR posteam = ?)
    ORDER BY epa DESC
  `);

  const rows = stmt.all(season, team, team);

  const res = NextResponse.json({ data: rows });
  res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res;
}
