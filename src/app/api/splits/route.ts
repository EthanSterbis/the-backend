// src/app/api/splits/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "node:path";
import { existsSync } from "node:fs";

/** Resolve the bundled SQLite file both locally and in Netlify functions */
function resolveDbPath(): string {
  const roots = [
    process.cwd(),
    __dirname,
    process.env.LAMBDA_TASK_ROOT || "",
    "/var/task",
  ].filter(Boolean);

  const candidates = new Set<string>();
  for (const r of roots) {
    candidates.add(path.join(r, "data", "backend.sqlite"));
    candidates.add(path.join(r, "backend.sqlite")); // extra fallback
    candidates.add(path.join(r, ".netlify", "functions-internal", "data", "backend.sqlite"));
  }

  for (const p of candidates) if (existsSync(p)) return p;
  throw new Error("backend.sqlite not found. Tried: " + [...candidates].join(" | "));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const season = Number(url.searchParams.get("season") ?? "2024");
    const team = url.searchParams.get("team") ?? undefined;

    const db = new Database(resolveDbPath(), { readonly: true });
    try {
      const sql = `
        SELECT posteam, season, epa, epa_pass, epa_rush, success_rate, plays
        FROM team_offense
        WHERE season = ? ${team ? "AND posteam = ?" : ""}
        ORDER BY epa DESC
      `;
      const stmt = db.prepare(sql.trim());
      const rows = team ? stmt.all(season, team) : stmt.all(season);

      const res = NextResponse.json({ data: rows });
      res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
      return res;
    } finally {
      db.close();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("API /api/splits error:", message);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
