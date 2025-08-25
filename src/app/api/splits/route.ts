// src/app/api/splits/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

/** Find the SQLite file in serverless (Netlify) and local dev. */
function resolveDbPath(): string {
  const candidates = [
    // Netlify/AWS Lambda root where included_files are copied
    path.join(process.env.LAMBDA_TASK_ROOT ?? "", "data", "backend.sqlite"),
    // Local dev path
    path.join(process.cwd(), "data", "backend.sqlite"),
  ];
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {
      // ignore and try next
    }
  }
  // Fall back to first candidate; opening with fileMustExist will throw if not present
  return candidates[0];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const season = Number(url.searchParams.get("season") ?? "2024");
  const team = url.searchParams.get("team") ?? undefined;

  const dbFile = resolveDbPath();

  try {
    // readonly + fileMustExist prevents accidentally creating an empty DB
    const db = new Database(dbFile, { readonly: true, fileMustExist: true });

    const sql = `
      SELECT posteam, season, epa, epa_pass, epa_rush, success_rate, plays
      FROM team_offense
      WHERE season = ? ${team ? "AND posteam = ?" : ""}
      ORDER BY posteam ASC
    `;
    const stmt = db.prepare(sql);
    const rows = team ? stmt.all(season, team) : stmt.all(season);
    db.close();

    const res = NextResponse.json({ data: rows });
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
    return res;
  } catch (err) {
    // This goes to Netlify Functions logs (Logs → Functions → Next.js Server Handler)
    console.error("API /api/splits error", {
      message: (err as any)?.message,
      dbFile,
      cwd: process.cwd(),
      lambdaRoot: process.env.LAMBDA_TASK_ROOT,
    });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
