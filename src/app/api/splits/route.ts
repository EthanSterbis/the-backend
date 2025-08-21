import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const season = Number(url.searchParams.get("season") ?? 2024);

  // temporary sample data (we'll replace with SQLite soon)
  const data = [
    { posteam: "BUF", season, epa: 0.12, epa_pass: 0.20, epa_rush: 0.05, success_rate: 0.49, plays: 1001 },
    { posteam: "BAL", season, epa: 0.21, epa_pass: 0.24, epa_rush: 0.17, success_rate: 0.51, plays: 1000 },
    { posteam: "DET", season, epa: 0.15, epa_pass: 0.19, epa_rush: 0.09, success_rate: 0.50, plays: 951 },
  ];

  const res = NextResponse.json({ data });
  res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  return res;
}
